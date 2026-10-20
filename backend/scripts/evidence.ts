import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { getDb, closeDb } from '../src/db';
import { scoreRiskQuestionnaire, RiskAnswers } from '../src/domain/risk';
import { getProduct, compareProducts } from '../src/domain/catalog';
import { checkSuitability } from '../src/domain/suitability';
import { buildPlan } from '../src/domain/allocation';
import { simulateGoal } from '../src/domain/projection';
import { signMandate } from '../src/security/mandate';
import { authorize, approveProposal } from '../src/security/permissions';
import {
  ensureUserAccount,
  placeOrder,
  getPortfolioView,
  settleEligibleOrders
} from '../src/sandbox/broker';
import { advanceClock, setMarketScenario, resetClock } from '../src/sandbox/clock';
import { scanForInjection } from '../src/security/injection';
import { logAuditEvent, verifyChain, exportAuditLog, getAuditEvents } from '../src/security/audit';

export async function runEvidence(): Promise<void> {
  console.log('⚡ Running End-to-End Execution Evidence Generator...');
  const evidenceDir = path.resolve(__dirname, '../../evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  // Reset demo state by resetting database for clean evidence chain
  const dbPath = path.resolve(process.env.DB_PATH || './data/xyrafin.db');
  closeDb();
  if (fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
    } catch (e) {
      // ignore
    }
  }

  const db = getDb();
  resetClock(db);

  try {
    db.prepare("DELETE FROM risk_profiles WHERE user_id = 'priya'").run();
    db.prepare("DELETE FROM mandate_envelopes WHERE user_id = 'priya'").run();
    db.prepare("DELETE FROM pending_proposals WHERE user_id = 'priya'").run();
    db.prepare("DELETE FROM orders WHERE user_id = 'priya'").run();
    db.prepare("DELETE FROM holdings WHERE user_id = 'priya'").run();
    db.prepare("DELETE FROM accounts WHERE user_id = 'priya'").run();
  } catch (e) {
    // ignore
  }

  ensureUserAccount('priya', 20000, db);

  console.log('\n[Step 1/8] Priya completes risk questionnaire...');
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

  const profile = scoreRiskQuestionnaire('priya', priyaAnswers);
  if (profile.level !== 3) {
    throw new Error(`Expected Priya profile level 3, got ${profile.level}`);
  }

  db.prepare(`
    INSERT OR REPLACE INTO risk_profiles (
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

  logAuditEvent({
    actor: 'user',
    action: 'SUBMIT_RISK_PROFILE',
    tier: 'L3',
    decision: 'ALLOW',
    rule_ids: ['PROFILE_ASSESSED'],
    payload: { userId: 'priya', level: profile.level, label: profile.label, capacity: profile.capacity, tolerance: profile.tolerance },
    customDb: db
  });
  console.log(`✓ Profile created: Level ${profile.level} (${profile.label})`);

  console.log('\n[Step 2/8] Agent compares 3 funds; inquiries about Leveraged Fund (Risk 5)...');
  const comp = compareProducts(['fund-balanced-05', 'eq-global-06', 'lev-3x-12']);
  logAuditEvent({
    actor: 'agent',
    action: 'COMPARE_PRODUCTS',
    tier: 'L1',
    decision: 'ALLOW',
    rule_ids: ['CATALOG_COMPARISON'],
    payload: { comparedIds: ['fund-balanced-05', 'eq-global-06', 'lev-3x-12'] },
    customDb: db
  });

  const leveragedProduct = getProduct('lev-3x-12')!;
  const suitabilityRes = checkSuitability(profile, leveragedProduct, 5000);
  if (suitabilityRes.allowed || !suitabilityRes.rule_ids.includes('S1')) {
    throw new Error('Expected Leveraged Fund to be blocked by Rule S1');
  }

  logAuditEvent({
    actor: 'agent',
    action: 'SUITABILITY_GATE_BLOCK',
    tier: 'L2',
    decision: 'DENIED',
    rule_ids: suitabilityRes.rule_ids,
    payload: { userId: 'priya', productId: 'lev-3x-12', reasons: suitabilityRes.reasons },
    customDb: db
  });
  console.log(`✓ Leveraged Fund strictly BLOCKED by Rule S1: ${suitabilityRes.reasons[0]}`);

  console.log('\n[Step 3/8] Building plan and simulating 6-year $30,000 home deposit goal...');
  const goal = { name: 'Home Deposit', targetAmount: 30000, years: 6 };
  const plan = buildPlan(profile, goal);
  const simulation = simulateGoal(plan, 5000, 300, 6, 30000, 42);

  logAuditEvent({
    actor: 'agent',
    action: 'BUILD_PLAN_AND_SIMULATE',
    tier: 'L1',
    decision: 'ALLOW',
    rule_ids: ['MONTE_CARLO_PROJECTION'],
    payload: {
      expectedReturn: plan.expectedReturn,
      volatility: plan.portfolioVolatility,
      probabilityOfSuccess: simulation.probabilityOfSuccess,
      monthlyNeededFor75Pct: simulation.monthlyNeededFor75Pct
    },
    customDb: db
  });
  console.log(`✓ Plan built. Monte Carlo: ${simulation.probabilityOfSuccess}% success probability; $${simulation.monthlyNeededFor75Pct}/mo needed for 75%`);

  console.log('\n[Step 4/8] Priya signs investment mandate (max $2,000/order, $3,000/month)...');
  const mandate = signMandate({
    userId: 'priya',
    maxPerOrder: 2000,
    maxPerMonth: 3000,
    allowedProducts: ['fund-balanced-05', 'bond-govt-03', 'mmf-cash-01', 'eq-global-06'],
    autoRebalance: true,
    driftThreshold: 0.05
  }, db);

  logAuditEvent({
    actor: 'user',
    action: 'SIGN_MANDATE',
    tier: 'L3',
    decision: 'ALLOW',
    rule_ids: ['MANDATE_CRYPTOGRAPHICALLY_SIGNED'],
    payload: { userId: 'priya', maxPerOrder: 2000, maxPerMonth: 3000, mandateHash: mandate.signedHash },
    customDb: db
  });
  console.log(`✓ Mandate signed. Hash: ${mandate.signedHash.slice(0, 16)}...`);

  console.log('\n[Step 5/8] Agent invests $2,000 within mandate (L2), proposes $10,000 more (L3)...');
  // 5a: L2 order within mandate
  const auth1 = authorize('place_order', { productId: 'fund-balanced-05', side: 'BUY', amount: 2000 }, 'priya', 'agent', db);
  if (auth1.decision !== 'ALLOW' || auth1.tier !== 'L2') {
    throw new Error('Expected $2,000 order to be allowed under L2 mandate');
  }
  const order1 = placeOrder({ userId: 'priya', productId: 'fund-balanced-05', side: 'BUY', amount: 2000, customDb: db });
  console.log(`✓ L2 Order 1 placed: $2,000 in Balanced Fund (Status: ${order1.status})`);

  // 5b: L3 proposal exceeding mandate
  const auth2 = authorize('place_order', { productId: 'fund-balanced-05', side: 'BUY', amount: 10000 }, 'priya', 'agent', db);
  if (auth2.decision !== 'NEEDS_APPROVAL' || !auth2.proposal) {
    throw new Error('Expected $10,000 order to trigger L3 NEEDS_APPROVAL');
  }
  console.log(`✓ L3 Proposal created: ${auth2.proposal.id}. Reason: ${auth2.reason}`);

  // Priya approves proposal with PIN '123456'
  const appRes = approveProposal(auth2.proposal.id, 10000, '123456', undefined, db);
  if (!appRes.success) {
    throw new Error('Expected human proposal approval to succeed');
  }
  const order2 = placeOrder({
    userId: 'priya',
    productId: 'fund-balanced-05',
    side: 'BUY',
    amount: 10000,
    proposalHash: auth2.proposal.proposalHash,
    customDb: db
  });
  console.log(`✓ Human Approval granted with PIN: Order queued for $10,000 (Status: ${order2.status})`);

  console.log('\n[Step 6/8] Scanning malicious factsheet for adversarial injection...');
  const factsheetPath = path.resolve(__dirname, '../src/data/demo/malicious_factsheet.txt');
  const factsheetText = fs.readFileSync(factsheetPath, 'utf-8');
  const scan = scanForInjection(factsheetText, 'priya', db);
  if (!scan.detected) {
    throw new Error('Expected malicious factsheet to trigger injection detector');
  }
  console.log(`✓ Malicious factsheet quarantined: Matched patterns: ${scan.patternIds.join(', ')}`);

  console.log('\n[Step 7/8] Advancing clock 90 days with -25% market crash and rebalancing...');
  advanceClock(90, db);
  setMarketScenario('crash', db);
  settleEligibleOrders(db);

  // Propose rebalance after crash
  const portfolioAfterCrash = getPortfolioView('priya', db);
  console.log(`✓ Portfolio valuation post-crash: $${portfolioAfterCrash.totalPortfolioValue.toLocaleString()} (Cash: $${portfolioAfterCrash.cash.toLocaleString()})`);

  const rebalOrderAuth = authorize('place_order', { productId: 'fund-balanced-05', side: 'BUY', amount: 1000 }, 'priya', 'agent', db);
  if (rebalOrderAuth.decision === 'ALLOW') {
    placeOrder({ userId: 'priya', productId: 'fund-balanced-05', side: 'BUY', amount: 1000, customDb: db });
    console.log(`✓ Auto-rebalance buy executed within mandate parameters.`);
  }

  console.log('\n[Step 8/8] Verifying cryptographic hash chain...');
  const verification = verifyChain(db);
  if (!verification.valid) {
    throw new Error(`Audit chain verification failed at seq ${verification.brokenAt}: ${verification.reason}`);
  }
  console.log(`✓ Audit chain verified 100% valid across all ${verification.totalEvents} events.`);

  // Write Evidence Artifacts
  const jsonLines = exportAuditLog(db);
  fs.writeFileSync(path.join(evidenceDir, 'operation_log.jsonl'), jsonLines, 'utf-8');

  const verifyReport = `================================================================================
XYRAFIN ADVISOR: AUDIT LOG CRYPTOGRAPHIC VERIFICATION REPORT
================================================================================
Generated: ${new Date().toISOString()}
Verification Status: VALID (PASSED)
Total Hash-Chained Events: ${verification.totalEvents}
Broken Links / Tampering Detected: 0
Root Genesis Hash: 0000000000000000000000000000000000000000000000000000000000000000
Final Chain Head Hash: ${getAuditEvents(undefined, 1, db)[0].hash}
Hashing Algorithm: SHA-256 (Canonical JSON Event Encoding)
Database Triggers: UPDATE/DELETE strictly blocked on audit_events
================================================================================
`;
  fs.writeFileSync(path.join(evidenceDir, 'chain_verify.txt'), verifyReport, 'utf-8');

  // Generate summary.md
  const allEvents = getAuditEvents(undefined, 500, db).reverse();
  let summaryMd = `# XyraFin Execution Evidence: Sandbox Audit Trail

**Competition:** 2026 Shenzhen FinTechathon — Topic B: AI Wealth Assistant  
**Theme:** "AI as a Financial Participant"  
**Audit Verification:** **PASSED (100% Intact SHA-256 Chain)**  
**Total Audit Events:** ${allEvents.length}  

---

## Step-by-Step Execution Verification Table

| Seq | Timestamp (UTC) | Actor | Tier | Action | Decision | Rules | Hash (First 16 chars) |
|---|---|---|---|---|---|---|---|
`;

  for (const e of allEvents) {
    const rules = e.rule_ids.join(', ') || '-';
    summaryMd += `| **${e.seq}** | \`${e.ts.slice(11, 19)}\` | **${e.actor}** | \`${e.tier}\` | \`${e.action}\` | **${e.decision}** | ${rules} | \`${e.hash.slice(0, 16)}...\` |\n`;
  }

  summaryMd += `\n---

## Detailed Audit Payload Timeline

`;

  for (const e of allEvents) {
    summaryMd += `### Event #${e.seq}: \`${e.action}\` (${e.decision})
- **Timestamp:** ${e.ts}
- **Actor:** ${e.actor} | **Tier:** ${e.tier}
- **Rules Triggered:** ${e.rule_ids.join(', ') || 'None'}
- **Previous Hash:** \`${e.prev_hash}\`
- **Computed Event Hash:** \`${e.hash}\`
- **Canonical Payload:**
\`\`\`json
${JSON.stringify(e.payload, null, 2)}
\`\`\`

`;
  }

  fs.writeFileSync(path.join(evidenceDir, 'summary.md'), summaryMd, 'utf-8');

  console.log('\n🎉 Execution evidence successfully written to evidence/:');
  console.log('   - evidence/operation_log.jsonl');
  console.log('   - evidence/chain_verify.txt');
  console.log('   - evidence/summary.md');
}

if (process.env.NODE_ENV !== 'test') {
  runEvidence().catch((err) => {
    console.error('Evidence generation failed:', err);
    process.exit(1);
  });
}
