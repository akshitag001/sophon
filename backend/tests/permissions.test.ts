import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../src/db';
import { signMandate, getMandate } from '../src/security/mandate';
import {
  authorize,
  createProposal,
  approveProposal,
  getProposal
} from '../src/security/permissions';
import { scoreRiskQuestionnaire, RiskAnswers } from '../src/domain/risk';
import { ensureUserAccount } from '../src/sandbox/broker';

describe('Security: Permission Tiers, Investment Mandate & Policy Engine', () => {
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
    db.prepare('DELETE FROM mandates WHERE user_id = ?').run('test_user');
    db.prepare('DELETE FROM risk_profiles WHERE user_id = ?').run('test_user');
    db.prepare('DELETE FROM proposals_approvals WHERE user_id = ?').run('test_user');
    db.prepare('DELETE FROM orders WHERE user_id = ?').run('test_user');
    db.prepare('DELETE FROM holdings WHERE user_id = ?').run('test_user');
    db.prepare('DELETE FROM accounts WHERE user_id = ?').run('test_user');

    ensureUserAccount('test_user', 20000, db);

    // Save Priya profile for test_user
    const profile = scoreRiskQuestionnaire('test_user', priyaAnswers);
    db.prepare(`
      INSERT INTO risk_profiles (
        user_id, level, label, capacity, tolerance,
        answers_json, contradictions_json, explanation_facts_json,
        answered_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'test_user',
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

    // Sign mandate: max $2,000/order, $3,000/month
    signMandate({
      userId: 'test_user',
      maxPerOrder: 2000,
      maxPerMonth: 3000,
      allowedProducts: ['fund-balanced-05', 'bond-govt-03', 'mmf-cash-01']
    }, db);
  });

  it('L2 order inside mandate limits is ALLOWED without human confirmation', () => {
    const auth = authorize('place_order', {
      productId: 'fund-balanced-05',
      side: 'BUY',
      amount: 1500 // <= $2,000 maxPerOrder
    }, 'test_user');

    expect(auth.decision).toBe('ALLOW');
    expect(auth.tier).toBe('L2');
    expect(auth.ruleIds).toContain('L2_MANDATE_PASSED');
  });

  it('Order exceeding mandate per-order limit triggers NEEDS_APPROVAL with bound proposal', () => {
    const auth = authorize('place_order', {
      productId: 'fund-balanced-05',
      side: 'BUY',
      amount: 5000 // > $2,000 maxPerOrder
    }, 'test_user');

    expect(auth.decision).toBe('NEEDS_APPROVAL');
    expect(auth.tier).toBe('L3');
    expect(auth.ruleIds).toContain('MANDATE_ORDER_LIMIT_EXCEEDED');
    expect(auth.proposal).toBeDefined();
    expect(auth.proposal?.proposalHash).toBeDefined();
  });

  it('Agent trying to modify investment mandate is strictly DENIED', () => {
    const auth = authorize('update_mandate', {
      maxPerOrder: 50000
    }, 'test_user', 'agent');

    expect(auth.decision).toBe('DENIED');
    expect(auth.tier).toBe('L3');
    expect(auth.ruleIds).toContain('L3_MANDATE_HUMAN_ONLY');
    expect(auth.reason).toContain('AI Agent is strictly prohibited from modifying investment mandates');
  });

  it('Tampered approval (amount altered in transit) is rejected with security alert', () => {
    const proposal = createProposal('test_user', 'place_order', {
      productId: 'fund-balanced-05',
      side: 'BUY',
      amount: 5000
    });

    // Attacker alters proposalData amount to $10,000 while attempting to use proposal
    const tamperedData = {
      productId: 'fund-balanced-05',
      side: 'BUY',
      amount: 10000
    };

    const res = approveProposal(proposal.id, 10000, '123456', tamperedData);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Proposal parameters have been altered');
  });

  it('Replayed approval is rejected (single-use guarantee)', () => {
    const proposal = createProposal('test_user', 'place_order', {
      productId: 'fund-balanced-05',
      side: 'BUY',
      amount: 2500
    });

    // First legitimate approval
    const firstApproval = approveProposal(proposal.id, 2500, '123456');
    expect(firstApproval.success).toBe(true);

    // Replay attempt of the exact same proposal ID
    const replayAttempt = approveProposal(proposal.id, 2500, '123456');
    expect(replayAttempt.success).toBe(false);
    expect(replayAttempt.error).toContain('already been consumed or processed');
  });
});
