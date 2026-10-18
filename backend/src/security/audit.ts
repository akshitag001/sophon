import crypto from 'crypto';
import { getDb, DB } from '../db';

export interface AuditEventInput {
  actor: 'user' | 'agent' | 'system';
  action: string;
  tier: 'L0' | 'L1' | 'L2' | 'L3';
  decision: 'ALLOW' | 'NEEDS_APPROVAL' | 'DENIED' | 'EXECUTED' | 'BLOCKED';
  rule_ids: string[];
  payload: Record<string, any>;
  customDb?: DB;
}

export interface AuditRecord {
  seq: number;
  ts: string;
  actor: 'user' | 'agent' | 'system';
  action: string;
  tier: 'L0' | 'L1' | 'L2' | 'L3';
  decision: 'ALLOW' | 'NEEDS_APPROVAL' | 'DENIED' | 'EXECUTED' | 'BLOCKED';
  rule_ids: string[];
  payload: Record<string, any>;
  prev_hash: string;
  hash: string;
}

const GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

export function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}

export function computeHash(prevHash: string, eventData: Record<string, any>): string {
  const content = prevHash + canonicalJson(eventData);
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function logAuditEvent(input: AuditEventInput): AuditRecord {
  const db = input.customDb || getDb();
  const ts = new Date().toISOString();

  // Find latest record's hash
  const lastRow = db.prepare('SELECT seq, hash FROM audit_events ORDER BY seq DESC LIMIT 1').get() as { seq: number; hash: string } | undefined;
  const prev_hash = lastRow ? lastRow.hash : GENESIS_HASH;

  const eventContent = {
    ts,
    actor: input.actor,
    action: input.action,
    tier: input.tier,
    decision: input.decision,
    rule_ids: input.rule_ids,
    payload: input.payload
  };

  const hash = computeHash(prev_hash, eventContent);

  const stmt = db.prepare(`
    INSERT INTO audit_events (
      ts, actor, action, tier, decision, rule_ids_json, payload_json, prev_hash, hash
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    ts,
    input.actor,
    input.action,
    input.tier,
    input.decision,
    JSON.stringify(input.rule_ids),
    JSON.stringify(input.payload),
    prev_hash,
    hash
  );

  return {
    seq: Number(result.lastInsertRowid),
    ts,
    actor: input.actor,
    action: input.action,
    tier: input.tier,
    decision: input.decision,
    rule_ids: input.rule_ids,
    payload: input.payload,
    prev_hash,
    hash
  };
}

export function verifyChain(customDb?: DB): { valid: boolean; totalEvents: number; brokenAt?: number; reason?: string } {
  const db = customDb || getDb();
  const rows = db.prepare('SELECT * FROM audit_events ORDER BY seq ASC').all() as any[];

  if (rows.length === 0) {
    return { valid: true, totalEvents: 0 };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.prev_hash !== expectedPrevHash) {
      return {
        valid: false,
        totalEvents: rows.length,
        brokenAt: row.seq,
        reason: `Previous hash mismatch at sequence ${row.seq}: expected ${expectedPrevHash}, found ${row.prev_hash}`
      };
    }

    const eventContent = {
      ts: row.ts,
      actor: row.actor,
      action: row.action,
      tier: row.tier,
      decision: row.decision,
      rule_ids: JSON.parse(row.rule_ids_json),
      payload: JSON.parse(row.payload_json)
    };

    const calculatedHash = computeHash(expectedPrevHash, eventContent);
    if (calculatedHash !== row.hash) {
      return {
        valid: false,
        totalEvents: rows.length,
        brokenAt: row.seq,
        reason: `Hash integrity failure at sequence ${row.seq}: expected ${calculatedHash}, found ${row.hash}`
      };
    }

    expectedPrevHash = row.hash;
  }

  return { valid: true, totalEvents: rows.length };
}

export function getAuditEvents(userId?: string, limit = 200, customDb?: DB): AuditRecord[] {
  const db = customDb || getDb();
  let query = 'SELECT * FROM audit_events ORDER BY seq DESC LIMIT ?';
  let rows: any[];

  if (userId) {
    // Check if payload contains userId or if action applies to user
    query = `SELECT * FROM audit_events 
             WHERE json_extract(payload_json, '$.userId') = ? 
                OR json_extract(payload_json, '$.user_id') = ?
             ORDER BY seq DESC LIMIT ?`;
    rows = db.prepare(query).all(userId, userId, limit) as any[];
  } else {
    rows = db.prepare(query).all(limit) as any[];
  }

  return rows.map((row) => ({
    seq: row.seq,
    ts: row.ts,
    actor: row.actor,
    action: row.action,
    tier: row.tier,
    decision: row.decision,
    rule_ids: JSON.parse(row.rule_ids_json),
    payload: JSON.parse(row.payload_json),
    prev_hash: row.prev_hash,
    hash: row.hash
  }));
}

export function exportAuditLog(customDb?: DB): string {
  const db = customDb || getDb();
  const rows = db.prepare('SELECT * FROM audit_events ORDER BY seq ASC').all() as any[];
  return rows.map((r) => JSON.stringify({
    seq: r.seq,
    ts: r.ts,
    actor: r.actor,
    action: r.action,
    tier: r.tier,
    decision: r.decision,
    rule_ids: JSON.parse(r.rule_ids_json),
    payload: JSON.parse(r.payload_json),
    prev_hash: r.prev_hash,
    hash: r.hash
  })).join('\n');
}
