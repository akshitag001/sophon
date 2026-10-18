import crypto from 'crypto';
import { getDb, DB } from '../db';
import { RiskProfile } from '../domain/risk';
import { getProduct } from '../domain/catalog';
import { checkSuitability } from '../domain/suitability';
import { getMandate, getMonthlyInvestedAmount, InvestmentMandate } from './mandate';
import { getPortfolioView } from '../sandbox/broker';
import { canonicalJson, logAuditEvent } from './audit';

export type PermissionTier = 'L0' | 'L1' | 'L2' | 'L3';
export type PolicyDecision = 'ALLOW' | 'NEEDS_APPROVAL' | 'DENIED';

export interface AuthorizeResult {
  decision: PolicyDecision;
  tier: PermissionTier;
  ruleIds: string[];
  reason: string;
  proposal?: ProposalRecord;
}

export interface ProposalRecord {
  id: string;
  userId: string;
  action: string;
  proposalData: Record<string, any>;
  proposalHash: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  expiresAt: number;
  used: boolean;
  createdAt: string;
}

export function computeProposalHash(proposalData: Record<string, any>): string {
  return crypto.createHash('sha256').update(canonicalJson(proposalData), 'utf8').digest('hex');
}

export function createProposal(userId: string, action: string, proposalData: Record<string, any>, customDb?: DB): ProposalRecord {
  const db = customDb || getDb();
  const id = 'prop_' + Math.random().toString(36).substring(2, 10);
  const proposalHash = computeProposalHash({ userId, action, ...proposalData });
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO proposals_approvals (
      id, user_id, action, proposal_json, proposal_hash, status, expires_at, used, created_at
    ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, 0, ?)
  `).run(
    id,
    userId,
    action,
    JSON.stringify(proposalData),
    proposalHash,
    expiresAt,
    createdAt
  );

  return {
    id,
    userId,
    action,
    proposalData,
    proposalHash,
    status: 'PENDING',
    expiresAt,
    used: false,
    createdAt
  };
}

export function getProposal(id: string, customDb?: DB): ProposalRecord | null {
  const db = customDb || getDb();
  const row = db.prepare('SELECT * FROM proposals_approvals WHERE id = ?').get(id) as any;
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    action: row.action,
    proposalData: JSON.parse(row.proposal_json),
    proposalHash: row.proposal_hash,
    status: row.status,
    expiresAt: row.expires_at,
    used: Boolean(row.used),
    createdAt: row.created_at
  };
}

export function approveProposal(
  proposalId: string,
  typedAmount: number,
  pin: string,
  tamperedData?: Record<string, any>,
  customDb?: DB
): { success: boolean; error?: string; orderId?: string } {
  const db = customDb || getDb();
  const proposal = getProposal(proposalId, db);

  if (!proposal) {
    return { success: false, error: 'Proposal not found' };
  }

  // 1. Replay protection (single-use)
  if (proposal.used || proposal.status !== 'PENDING') {
    return { success: false, error: 'Proposal has already been consumed or processed (single-use violation).' };
  }

  // 2. Expiration check
  if (Date.now() > proposal.expiresAt) {
    db.prepare("UPDATE proposals_approvals SET status = 'EXPIRED' WHERE id = ?").run(proposalId);
    return { success: false, error: 'Proposal has expired (valid for 10 minutes).' };
  }

  // 3. Cryptographic Tamper Binding check
  const dataToVerify = tamperedData || proposal.proposalData;
  const computed = computeProposalHash({ userId: proposal.userId, action: proposal.action, ...dataToVerify });
  if (computed !== proposal.proposalHash) {
    logAuditEvent({
      actor: 'user',
      action: 'APPROVAL_TAMPER_DETECTED',
      tier: 'L3',
      decision: 'DENIED',
      rule_ids: ['TAMPER_HASH_MISMATCH'],
      payload: { proposalId, expectedHash: proposal.proposalHash, calculatedHash: computed },
      customDb: db
    });
    return { success: false, error: 'Security Alert: Proposal parameters have been altered! Approval hash mismatch.' };
  }

  // 4. Amount confirmation check
  if (Math.abs(Number(typedAmount) - Number(proposal.proposalData.amount)) > 0.01) {
    return {
      success: false,
      error: `Typed confirmation amount ($${typedAmount}) does not match proposed amount ($${proposal.proposalData.amount}).`
    };
  }

  // 5. PIN check (Standard demo pin is 123456)
  if (pin !== '123456') {
    return { success: false, error: 'Invalid 6-digit confirmation PIN.' };
  }

  // Mark as consumed
  db.prepare("UPDATE proposals_approvals SET status = 'APPROVED', used = 1 WHERE id = ?").run(proposalId);

  logAuditEvent({
    actor: 'user',
    action: 'PROPOSAL_APPROVED',
    tier: 'L3',
    decision: 'ALLOW',
    rule_ids: ['HUMAN_L3_PIN_VERIFIED'],
    payload: {
      proposalId,
      userId: proposal.userId,
      amount: typedAmount,
      productId: proposal.proposalData.productId
    },
    customDb: db
  });

  return { success: true };
}

/**
 * The Central Policy Engine:
 * Authorizes or gates any agent or user action before execution.
 */
export function authorize(
  action: string,
  params: Record<string, any>,
  userId: string,
  actor: 'agent' | 'user' = 'agent',
  customDb?: DB
): AuthorizeResult {
  const db = customDb || getDb();

  // Tier L0: READ ONLY -> Always ALLOW
  const L0_ACTIONS = ['get_profile', 'get_portfolio', 'list_products', 'get_product', 'get_prices', 'get_questions', 'get_orders'];
  if (L0_ACTIONS.includes(action)) {
    return {
      decision: 'ALLOW',
      tier: 'L0',
      ruleIds: ['L0_READ'],
      reason: 'Read-only inquiry permitted under Tier L0.'
    };
  }

  // Tier L1: ADVISORY ONLY -> Always ALLOW
  const L1_ACTIONS = ['compare_products', 'build_plan', 'simulate_goal', 'propose_rebalance', 'explain_decision'];
  if (L1_ACTIONS.includes(action)) {
    return {
      decision: 'ALLOW',
      tier: 'L1',
      ruleIds: ['L1_ADVISE'],
      reason: 'Advisory analysis permitted under Tier L1.'
    };
  }

  // Tier L3: HUMAN ONLY ACTIONS
  // If agent tries to change mandate -> Strict DENY!
  if (action === 'update_mandate' || action === 'sign_mandate') {
    if (actor === 'agent') {
      logAuditEvent({
        actor: 'agent',
        action: 'AGENT_MANDATE_ESCALATION_ATTEMPT',
        tier: 'L3',
        decision: 'DENIED',
        rule_ids: ['L3_MANDATE_HUMAN_ONLY'],
        payload: { userId, attemptedAction: action, params },
        customDb: db
      });
      return {
        decision: 'DENIED',
        tier: 'L3',
        ruleIds: ['L3_MANDATE_HUMAN_ONLY'],
        reason: 'Privilege Escalation Blocked: AI Agent is strictly prohibited from modifying investment mandates. Mandates require explicit Human-Only execution.'
      };
    }
    return {
      decision: 'ALLOW',
      tier: 'L3',
      ruleIds: ['L3_HUMAN_CONFIRMED'],
      reason: 'Human user authorized to configure investment mandate.'
    };
  }

  if (action === 'update_risk_profile') {
    if (actor === 'agent') {
      return {
        decision: 'DENIED',
        tier: 'L3',
        ruleIds: ['L3_PROFILE_HUMAN_ONLY'],
        reason: 'AI Agent cannot alter risk questionnaire responses directly; must be completed by client.'
      };
    }
  }

  // Tier L2 / L3: ORDER EXECUTION
  if (action === 'place_order') {
    const { productId, side, amount } = params;
    const numAmount = Number(amount);

    // 1. HARD SUITABILITY GATE (Cannot be bypassed)
    const profileRow = db.prepare('SELECT * FROM risk_profiles WHERE user_id = ?').get(userId) as any;
    const profile: RiskProfile | null = profileRow
      ? {
          user_id: profileRow.user_id,
          level: profileRow.level,
          label: profileRow.label,
          capacity: profileRow.capacity,
          tolerance: profileRow.tolerance,
          contradictions: JSON.parse(profileRow.contradictions_json),
          explanation_facts: JSON.parse(profileRow.explanation_facts_json),
          answered_at: profileRow.answered_at,
          expires_at: profileRow.expires_at,
          answers: JSON.parse(profileRow.answers_json)
        }
      : null;

    const product = getProduct(productId);
    if (!product) {
      return {
        decision: 'DENIED',
        tier: 'L2',
        ruleIds: ['PRODUCT_NOT_FOUND'],
        reason: `Product ${productId} does not exist in catalog.`
      };
    }

    const portfolio = getPortfolioView(userId, db);
    const productHoldingsValue: Record<string, number> = {};
    for (const h of portfolio.holdings) {
      productHoldingsValue[h.productId] = h.marketValue;
    }

    const suitability = checkSuitability(profile, product, numAmount, {
      cash: portfolio.cash,
      totalHoldingsValue: portfolio.totalHoldingsValue,
      productHoldingsValue
    });

    if (!suitability.allowed) {
      logAuditEvent({
        actor: 'agent',
        action: 'SUITABILITY_GATE_BLOCK',
        tier: 'L2',
        decision: 'DENIED',
        rule_ids: suitability.rule_ids,
        payload: { userId, productId, amount: numAmount, reasons: suitability.reasons },
        customDb: db
      });
      return {
        decision: 'DENIED',
        tier: 'L2',
        ruleIds: suitability.rule_ids,
        reason: suitability.reasons.join(' ')
      };
    }

    // 2. Large SELL check (> 25% of total portfolio requires human approval)
    if (side === 'SELL' && portfolio.totalPortfolioValue > 0) {
      const sellRatio = numAmount / portfolio.totalPortfolioValue;
      if (sellRatio > 0.25) {
        const proposal = createProposal(userId, action, params, db);
        return {
          decision: 'NEEDS_APPROVAL',
          tier: 'L3',
          ruleIds: ['L3_LARGE_LIQUIDATION'],
          reason: `Sell amount ($${numAmount.toLocaleString()}) represents ${(sellRatio * 100).toFixed(1)}% of your total portfolio, exceeding the 25% safety threshold. Human approval required.`,
          proposal
        };
      }
    }

    // 3. MANDATE LIMIT CHECK
    const mandate = getMandate(userId, db);
    if (!mandate) {
      const proposal = createProposal(userId, action, params, db);
      return {
        decision: 'NEEDS_APPROVAL',
        tier: 'L3',
        ruleIds: ['L3_NO_MANDATE'],
        reason: 'No active investment mandate signed. Orders require explicit human confirmation.',
        proposal
      };
    }

    const monthlySpent = getMonthlyInvestedAmount(userId, db);
    const reasonsNeedingApproval: string[] = [];
    const ruleIdsNeedingApproval: string[] = [];

    if (numAmount > mandate.maxPerOrder) {
      ruleIdsNeedingApproval.push('MANDATE_ORDER_LIMIT_EXCEEDED');
      reasonsNeedingApproval.push(
        `Order amount ($${numAmount.toLocaleString()}) exceeds your mandate per-order limit of $${mandate.maxPerOrder.toLocaleString()}.`
      );
    }

    if (monthlySpent + numAmount > mandate.maxPerMonth) {
      ruleIdsNeedingApproval.push('MANDATE_MONTHLY_LIMIT_EXCEEDED');
      reasonsNeedingApproval.push(
        `Order would bring monthly investment to $${(monthlySpent + numAmount).toLocaleString()}, exceeding monthly limit of $${mandate.maxPerMonth.toLocaleString()}.`
      );
    }

    if (mandate.allowedProducts.length > 0 && !mandate.allowedProducts.includes(productId)) {
      ruleIdsNeedingApproval.push('MANDATE_PRODUCT_NOT_WHITELISTED');
      reasonsNeedingApproval.push(
        `Product ${product.name} is not in your mandate's pre-approved whitelist.`
      );
    }

    if (reasonsNeedingApproval.length > 0) {
      const proposal = createProposal(userId, action, params, db);
      logAuditEvent({
        actor: 'agent',
        action: 'MANDATE_APPROVAL_TRIGGERED',
        tier: 'L3',
        decision: 'NEEDS_APPROVAL',
        rule_ids: ruleIdsNeedingApproval,
        payload: { userId, orderAmount: numAmount, reasons: reasonsNeedingApproval, proposalId: proposal.id },
        customDb: db
      });
      return {
        decision: 'NEEDS_APPROVAL',
        tier: 'L3',
        ruleIds: ruleIdsNeedingApproval,
        reason: reasonsNeedingApproval.join(' '),
        proposal
      };
    }

    // All mandate limits passed! Tier L2 execution authorized.
    return {
      decision: 'ALLOW',
      tier: 'L2',
      ruleIds: ['L2_MANDATE_PASSED'],
      reason: 'Order passes all suitability gates and investment mandate limits. Automated execution authorized.'
    };
  }

  return {
    decision: 'ALLOW',
    tier: 'L0',
    ruleIds: ['DEFAULT_ALLOW'],
    reason: 'Action authorized.'
  };
}
