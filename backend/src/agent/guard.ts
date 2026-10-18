import { logAuditEvent } from '../security/audit';
import { DB } from '../db';

export interface GuardResult {
  valid: boolean;
  cleanText: string;
  violations: string[];
}

export function extractNumbersFromObject(obj: any, set: Set<number>): void {
  if (obj === null || obj === undefined) return;
  if (typeof obj === 'number') {
    if (!isNaN(obj) && isFinite(obj)) {
      set.add(Math.round(obj * 100) / 100);
      set.add(Math.round(obj));
      set.add(Math.round(obj * 10000) / 100); // e.g. 0.088 -> 8.8%
    }
    return;
  }
  if (typeof obj === 'string') {
    const num = parseFloat(obj.replace(/[$,%]/g, ''));
    if (!isNaN(num) && isFinite(num)) {
      set.add(Math.round(num * 100) / 100);
      set.add(Math.round(num));
    }
    return;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      extractNumbersFromObject(item, set);
    }
    return;
  }
  if (typeof obj === 'object') {
    for (const k of Object.keys(obj)) {
      extractNumbersFromObject(obj[k], set);
    }
  }
}

export function extractNumbersFromText(text: string): number[] {
  // Regex to match numbers with optional commas, decimals, percentages, or dollar signs
  const matches = text.match(/(?:\$|%)?([0-9]+(?:,[0-9]{3})*(?:\.[0-9]+)?)/g) || [];
  const numbers: number[] = [];

  for (const m of matches) {
    const clean = m.replace(/[$,]/g, '');
    const val = parseFloat(clean);
    if (!isNaN(val) && isFinite(val)) {
      // Ignore trivial numbers like 0, 1, 2, 3, 4, 5, 10, or current year 2026
      if ([0, 1, 2, 3, 4, 5, 10, 2026].includes(val)) continue;
      numbers.push(Math.round(val * 100) / 100);
    }
  }

  return numbers;
}

export function applyOutputGuard(
  replyText: string,
  toolResults: any[],
  blockedProductIds: string[] = [],
  userId = 'user',
  customDb?: DB
): GuardResult {
  const violations: string[] = [];

  // 1. Check if model recommended any blocked product
  for (const pid of blockedProductIds) {
    const pattern = new RegExp(`\\b${pid}\\b|leveraged|3x leveraged`, 'i');
    if (pattern.test(replyText) && (replyText.toLowerCase().includes('recommend') || replyText.toLowerCase().includes('should buy') || replyText.toLowerCase().includes('placed order for'))) {
      violations.push(`RECOMMENDED_BLOCKED_PRODUCT_${pid}`);
      logAuditEvent({
        actor: 'system',
        action: 'OUTPUT_GUARD_BLOCKED_PRODUCT',
        tier: 'L2',
        decision: 'BLOCKED',
        rule_ids: ['GUARD_UNSUITABLE_RECOMMENDATION'],
        payload: { userId, blockedProductId: pid, replySnippet: replyText.slice(0, 150) },
        customDb
      });

      return {
        valid: false,
        cleanText: `I cannot recommend or place orders for product "${pid}". As evaluated by our deterministic suitability gate, this product violates your approved risk level and regulatory suitability rules.`,
        violations
      };
    }
  }

  // 2. Extract allowed numbers from tool outputs
  const allowedNumbers = new Set<number>();
  for (const res of toolResults) {
    extractNumbersFromObject(res, allowedNumbers);
  }

  // 3. Extract numbers from model reply
  const replyNumbers = extractNumbersFromText(replyText);
  let hasHallucination = false;
  let hallucinatedValue: number | null = null;

  for (const n of replyNumbers) {
    let matchFound = false;
    for (const allowed of allowedNumbers) {
      if (Math.abs(n - allowed) <= 0.05 || Math.abs(n - allowed) / Math.max(1, allowed) < 0.02) {
        matchFound = true;
        break;
      }
    }
    if (!matchFound) {
      hasHallucination = true;
      hallucinatedValue = n;
      break;
    }
  }

  if (hasHallucination && allowedNumbers.size > 0) {
    violations.push('NUMBER_HALLUCINATION');
    logAuditEvent({
      actor: 'system',
      action: 'NUMBER_HALLUCINATION',
      tier: 'L1',
      decision: 'BLOCKED',
      rule_ids: ['GUARD_NUMBER_HALLUCINATION'],
      payload: { userId, ungroundedNumber: hallucinatedValue, snippet: replyText.slice(0, 150) },
      customDb
    });

    return {
      valid: false,
      cleanText: `[Output Guard: An ungrounded return or figure (${hallucinatedValue}) was detected that did not originate from verified deterministic tool outputs. All figures have been resynchronized strictly with audited calculations.]\n\nPlease refer to the verified metrics in your plan and portfolio cards.`,
      violations
    };
  }

  return {
    valid: true,
    cleanText: replyText,
    violations: []
  };
}
