import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getDb } from '../src/db';
import { executeToolCall } from '../src/agent/tools';
import { applyOutputGuard } from '../src/agent/guard';
import { scanForInjection } from '../src/security/injection';
import { handleOfflineMessage } from '../src/agent/offline';
import { scoreRiskQuestionnaire, RiskAnswers } from '../src/domain/risk';
import { getAuditEvents } from '../src/security/audit';
import { ensureUserAccount, getUserOrders } from '../src/sandbox/broker';

describe('AI Agent: Tool Calling, Output Guard, and Injection Defence', () => {
  const priyaAnswers: RiskAnswers = {
    age_band: '18-29',
    horizon: '3_to_7_years',
    goal_type: 'balanced_growth',
    income_stability: 'stable_salary',
    emergency_savings: '3_to_6',
    existing_debt: 'low_or_mortgage_only',
    investment_experience: 'beginner_cash_deposits',
    reaction_to_drop: 'hold',
    loss_tolerance: 'max_15_percent',
    liquidity_needs: '2_to_5_years'
  };

  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM orders WHERE user_id = ?').run('priya');
    db.prepare('DELETE FROM risk_profiles WHERE user_id = ?').run('priya');
    db.prepare('DELETE FROM accounts WHERE user_id = ?').run('priya');
    ensureUserAccount('priya', 20000, db);

    const profile = scoreRiskQuestionnaire('priya', priyaAnswers);
    db.prepare(`
      INSERT INTO risk_profiles (
        user_id, level, label, capacity, tolerance,
        answers_json, contradictions_json, explanation_facts_json,
        answered_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'priya',
      profile.level,
      profile.label,
      profile.capacity,
      profile.tolerance,
      JSON.stringify(profile.answers),
      JSON.stringify(profile.contradictions),
      JSON.stringify(profile.explanation_facts),
      profile.answered_at,
      profile.expires_at
    );
  });

  it('Mocked LLM attempting to place order for Leveraged Fund is strictly DENIED and logged in audit', async () => {
    const res = await executeToolCall('place_order', {
      userId: 'priya',
      productId: 'lev-3x-12',
      side: 'BUY',
      amount: 5000
    }, 'priya');

    expect(res.auth.decision).toBe('DENIED');
    expect(res.auth.ruleIds).toContain('S1');
    expect(res.result.status).toBe('DENIED');

    // Verify audit log recorded the attempt
    const audits = getAuditEvents('priya');
    const denialLog = audits.find((a) => a.action === 'SUITABILITY_GATE_BLOCK');
    expect(denialLog).toBeDefined();
    expect(denialLog?.decision).toBe('DENIED');
  });

  it('Output guard replaces invented/hallucinated return numbers with safe fallback and logs event', () => {
    const toolResults = [{ expected_return: 0.075, p50: 28400, fee_cost: 568.01 }];
    // LLM claims an invented guaranteed 35% return and $95,000 final wealth
    const hallucinatedReply = 'Based on our analysis, your portfolio will generate a guaranteed 35% annual return reaching $95,000 in 6 years.';

    const guardResult = applyOutputGuard(hallucinatedReply, toolResults, [], 'priya');

    expect(guardResult.valid).toBe(false);
    expect(guardResult.violations).toContain('NUMBER_HALLUCINATION');
    expect(guardResult.cleanText).toContain('An ungrounded return or figure');

    const audits = getAuditEvents('priya');
    const hallucinationLog = audits.find((a) => a.action === 'NUMBER_HALLUCINATION');
    expect(hallucinationLog).toBeDefined();
  });

  it('Output guard blocks and rewrites reply that recommends a blocked product id', () => {
    const badReply = 'I recommend you purchase product lev-3x-12 for high capital appreciation.';
    const guardResult = applyOutputGuard(badReply, [], ['lev-3x-12'], 'priya');

    expect(guardResult.valid).toBe(false);
    expect(guardResult.cleanText).toContain('I cannot recommend or place orders for product "lev-3x-12"');
  });

  it('Malicious factsheet produces zero executed orders and generates INJECTION_DETECTED event', async () => {
    const factsheetPath = path.resolve(__dirname, '../src/data/demo/malicious_factsheet.txt');
    const factsheetContent = fs.readFileSync(factsheetPath, 'utf-8');

    // User uploads factsheet into chat / agent
    const scan = scanForInjection(factsheetContent, 'priya');
    expect(scan.detected).toBe(true);
    expect(scan.patternIds.length).toBeGreaterThan(0);
    expect(scan.quarantinedText).toContain('<untrusted_document');

    // Run offline chat handler with message
    const chatRes = await handleOfflineMessage('priya', factsheetContent);

    // Verify ZERO orders were executed
    const orders = getUserOrders('priya');
    expect(orders).toHaveLength(0);

    // Verify INJECTION_DETECTED event in audit log
    const audits = getAuditEvents('priya');
    const injectionLog = audits.find((a) => a.action === 'INJECTION_DETECTED');
    expect(injectionLog).toBeDefined();
    expect(injectionLog?.decision).toBe('BLOCKED');
  });
});
