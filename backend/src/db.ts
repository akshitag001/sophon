import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from './config';

export type DB = Database.Database;

let dbInstance: DB | null = null;

export function getDb(customPath?: string): DB {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbPath = customPath || config.DB_PATH;

  if (dbPath !== ':memory:') {
    const dir = path.dirname(path.resolve(dbPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  initSchema(db);

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export function initSchema(db: DB): void {
  db.exec(`
    -- Clock & Simulation State
    CREATE TABLE IF NOT EXISTS simulated_clock (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      current_day INTEGER NOT NULL DEFAULT 0,
      market_scenario TEXT NOT NULL DEFAULT 'normal',
      updated_at TEXT NOT NULL
    );

    INSERT OR IGNORE INTO simulated_clock (id, current_day, market_scenario, updated_at)
    VALUES (1, 0, 'normal', datetime('now'));

    -- User Risk Profiles
    CREATE TABLE IF NOT EXISTS risk_profiles (
      user_id TEXT PRIMARY KEY,
      level INTEGER NOT NULL,
      label TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      tolerance INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      contradictions_json TEXT NOT NULL,
      explanation_facts_json TEXT NOT NULL,
      answered_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    -- Cash Accounts
    CREATE TABLE IF NOT EXISTS accounts (
      user_id TEXT PRIMARY KEY,
      cash_balance REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Portfolio Holdings
    CREATE TABLE IF NOT EXISTS holdings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      units REAL NOT NULL,
      avg_cost REAL NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, product_id)
    );

    -- Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      side TEXT NOT NULL CHECK(side IN ('BUY', 'SELL')),
      amount REAL NOT NULL,
      units REAL NOT NULL,
      price REAL NOT NULL,
      fee REAL NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending_approval', 'queued', 'settled', 'rejected', 'cancelled')),
      idempotency_key TEXT UNIQUE,
      execution_day INTEGER NOT NULL,
      settlement_day INTEGER NOT NULL,
      proposal_hash TEXT,
      reasons_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Mandates (Signed parameters)
    CREATE TABLE IF NOT EXISTS mandates (
      user_id TEXT PRIMARY KEY,
      max_per_order REAL NOT NULL,
      max_per_month REAL NOT NULL,
      allowed_products_json TEXT NOT NULL,
      auto_rebalance INTEGER NOT NULL DEFAULT 0,
      drift_threshold REAL NOT NULL DEFAULT 0.05,
      quiet_hours_start INTEGER NOT NULL DEFAULT 22,
      quiet_hours_end INTEGER NOT NULL DEFAULT 7,
      signed_hash TEXT NOT NULL,
      signed_at TEXT NOT NULL
    );

    -- Proposals & L3 Human Approvals
    CREATE TABLE IF NOT EXISTS proposals_approvals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action TEXT NOT NULL,
      proposal_json TEXT NOT NULL,
      proposal_hash TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Hash-chained Append-Only Audit Log
    CREATE TABLE IF NOT EXISTS audit_events (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,
      actor TEXT NOT NULL CHECK(actor IN ('user', 'agent', 'system')),
      action TEXT NOT NULL,
      tier TEXT NOT NULL CHECK(tier IN ('L0', 'L1', 'L2', 'L3')),
      decision TEXT NOT NULL CHECK(decision IN ('ALLOW', 'NEEDS_APPROVAL', 'DENIED', 'EXECUTED', 'BLOCKED')),
      rule_ids_json TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      prev_hash TEXT NOT NULL,
      hash TEXT NOT NULL
    );

    -- Triggers enforcing immutability of audit log
    DROP TRIGGER IF EXISTS audit_no_update;
    CREATE TRIGGER audit_no_update
    BEFORE UPDATE ON audit_events
    BEGIN
      SELECT RAISE(FAIL, 'Audit log is strictly append-only: UPDATE prohibited');
    END;

    DROP TRIGGER IF EXISTS audit_no_delete;
    CREATE TRIGGER audit_no_delete
    BEFORE DELETE ON audit_events
    BEGIN
      SELECT RAISE(FAIL, 'Audit log is strictly append-only: DELETE prohibited');
    END;
  `);
}
