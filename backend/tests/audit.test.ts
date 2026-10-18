import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initSchema, DB } from '../src/db';
import {
  logAuditEvent,
  verifyChain,
  getAuditEvents,
  exportAuditLog
} from '../src/security/audit';

describe('Security: Hash-Chained Audit Log & Immutability', () => {
  let testDb: DB;

  beforeEach(() => {
    testDb = new Database(':memory:');
    testDb.pragma('foreign_keys = ON');
    initSchema(testDb);
  });

  it('should append events and maintain a valid cryptographic SHA-256 chain', () => {
    const e1 = logAuditEvent({
      actor: 'user',
      action: 'RISK_QUESTIONNAIRE_START',
      tier: 'L0',
      decision: 'ALLOW',
      rule_ids: ['INIT_QUESTIONS'],
      payload: { userId: 'priya' },
      customDb: testDb
    });

    const e2 = logAuditEvent({
      actor: 'agent',
      action: 'PRODUCT_COMPARISON',
      tier: 'L1',
      decision: 'ALLOW',
      rule_ids: ['CATALOG_COMPARE'],
      payload: { comparedIds: ['fund-balanced-05', 'eq-global-06'] },
      customDb: testDb
    });

    const e3 = logAuditEvent({
      actor: 'agent',
      action: 'ORDER_QUEUED',
      tier: 'L2',
      decision: 'EXECUTED',
      rule_ids: ['ORDER_QUEUE_T1'],
      payload: { userId: 'priya', amount: 2000 },
      customDb: testDb
    });

    expect(e2.prev_hash).toBe(e1.hash);
    expect(e3.prev_hash).toBe(e2.hash);

    const verification = verifyChain(testDb);
    expect(verification.valid).toBe(true);
    expect(verification.totalEvents).toBe(3);
  });

  it('should block direct SQL UPDATE and DELETE on audit_events via SQLite triggers', () => {
    logAuditEvent({
      actor: 'system',
      action: 'SYSTEM_START',
      tier: 'L0',
      decision: 'EXECUTED',
      rule_ids: ['BOOT'],
      payload: { status: 'OK' },
      customDb: testDb
    });

    // Attempt direct SQL UPDATE
    expect(() => {
      testDb.prepare("UPDATE audit_events SET decision = 'DENIED' WHERE seq = 1").run();
    }).toThrow(/Audit log is strictly append-only: UPDATE prohibited/);

    // Attempt direct SQL DELETE
    expect(() => {
      testDb.prepare('DELETE FROM audit_events WHERE seq = 1').run();
    }).toThrow(/Audit log is strictly append-only: DELETE prohibited/);
  });

  it('should detect database tampering if a row is modified out-of-band and report exact brokenAt seq', () => {
    for (let i = 1; i <= 5; i++) {
      logAuditEvent({
        actor: 'user',
        action: `EVENT_${i}`,
        tier: 'L1',
        decision: 'ALLOW',
        rule_ids: [`RULE_${i}`],
        payload: { step: i },
        customDb: testDb
      });
    }

    // Verify initial chain is valid
    expect(verifyChain(testDb).valid).toBe(true);

    // Simulate an offline DB compromise by dropping trigger and altering row 3 payload
    testDb.exec('DROP TRIGGER IF EXISTS audit_no_update;');
    testDb.prepare(`
      UPDATE audit_events 
      SET payload_json = '{"step": 999, "tampered": true}'
      WHERE seq = 3
    `).run();

    const verification = verifyChain(testDb);
    expect(verification.valid).toBe(false);
    expect(verification.brokenAt).toBe(3);
    expect(verification.reason).toContain('Hash integrity failure at sequence 3');
  });

  it('should export audit log in valid JSON Lines format', () => {
    logAuditEvent({
      actor: 'user',
      action: 'LOGIN',
      tier: 'L0',
      decision: 'ALLOW',
      rule_ids: ['AUTH'],
      payload: { user: 'priya' },
      customDb: testDb
    });

    const exportText = exportAuditLog(testDb);
    const lines = exportText.trim().split('\n');
    expect(lines.length).toBe(1);

    const parsed = JSON.parse(lines[0]);
    expect(parsed.action).toBe('LOGIN');
    expect(parsed.hash).toBeDefined();
    expect(parsed.prev_hash).toBeDefined();
  });
});
