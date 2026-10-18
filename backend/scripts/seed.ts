import { getDb } from '../src/db';
import { resetClock } from '../src/sandbox/clock';
import { scoreRiskQuestionnaire } from '../src/domain/risk';
import { signMandate } from '../src/security/mandate';
import { logAuditEvent } from '../src/security/audit';

export function runSeed(): void {
  console.log('🌱 Seeding XyraFin database with demo personas...');
  const db = getDb();

  // Reset clock
  resetClock(db);

  // Clear demo tables
  db.prepare('DELETE FROM risk_profiles').run();
  db.prepare('DELETE FROM accounts').run();
  db.prepare('DELETE FROM holdings').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM mandates').run();
  db.prepare('DELETE FROM proposals_approvals').run();

  // 1. Priya: 24, first-time investor, saving for home deposit in 6 years
  // Starts with 20,000 cash, no profile yet, but pre-configured mandate limits
  db.prepare(`
    INSERT INTO accounts (user_id, cash_balance, created_at, updated_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `).run('priya', 20000);

  signMandate({
    userId: 'priya',
    maxPerOrder: 2000,
    maxPerMonth: 3000,
    allowedProducts: ['fund-balanced-05', 'bond-govt-03', 'mmf-cash-01', 'eq-global-06'],
    autoRebalance: true,
    driftThreshold: 0.05
  }, db);

  // 2. Chen: Profiled Level 2 (Moderately Conservative), has drifted portfolio for rebalance demo
  const chenProfile = scoreRiskQuestionnaire('chen', {
    age_band: '45-59',
    horizon: '1_to_3_years',
    goal_type: 'income',
    income_stability: 'somewhat_stable',
    emergency_savings: '3_to_6',
    existing_debt: 'low_or_mortgage_only',
    investment_experience: 'beginner_cash_deposits',
    reaction_to_drop: 'sell_some',
    loss_tolerance: 'max_5_percent',
    liquidity_needs: 'within_1_year'
  });

  db.prepare(`
    INSERT INTO risk_profiles (
      user_id, level, label, capacity, tolerance,
      answers_json, contradictions_json, explanation_facts_json,
      answered_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'chen',
    chenProfile.level,
    chenProfile.label,
    chenProfile.capacity,
    chenProfile.tolerance,
    JSON.stringify(chenProfile.answers),
    JSON.stringify(chenProfile.contradictions),
    JSON.stringify(chenProfile.explanation_facts),
    chenProfile.answered_at,
    chenProfile.expires_at
  );

  db.prepare(`
    INSERT INTO accounts (user_id, cash_balance, created_at, updated_at)
    VALUES (?, ?, datetime('now'), datetime('now'))
  `).run('chen', 3000);

  signMandate({
    userId: 'chen',
    maxPerOrder: 5000,
    maxPerMonth: 10000,
    allowedProducts: ['bond-govt-03', 'bond-corp-04', 'mmf-cash-01', 'eq-global-06'],
    autoRebalance: true,
    driftThreshold: 0.05
  }, db);

  // Chen holdings: Drifted portfolio (heavily over-allocated to equities after rally)
  db.prepare(`
    INSERT INTO holdings (id, user_id, product_id, units, avg_cost, created_at, updated_at)
    VALUES ('hld_chen_1', 'chen', 'eq-global-06', 140, 100, datetime('now'), datetime('now')),
           ('hld_chen_2', 'chen', 'bond-govt-03', 40, 100, datetime('now'), datetime('now'))
  `).run();

  logAuditEvent({
    actor: 'system',
    action: 'DATABASE_SEEDED',
    tier: 'L3',
    decision: 'EXECUTED',
    rule_ids: ['INIT_SEED_DATA'],
    payload: { personas: ['priya', 'chen'], timestamp: new Date().toISOString() },
    customDb: db
  });

  console.log('✅ Seeding complete:');
  console.log('   - User "priya": $20,000 cash, ready for risk profiling.');
  console.log('   - User "chen": Level 2 profile, $3,000 cash, drifted holdings ready for rebalance demo.');
}

if (process.env.NODE_ENV !== 'test') {
  runSeed();
}
