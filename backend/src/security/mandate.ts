import crypto from 'crypto';
import { getDb, DB } from '../db';
import { canonicalJson } from './audit';

export interface InvestmentMandate {
  userId: string;
  maxPerOrder: number;
  maxPerMonth: number;
  allowedProducts: string[];
  autoRebalance: boolean;
  driftThreshold: number;
  quietHoursStart: number;
  quietHoursEnd: number;
  signedHash: string;
  signedAt: string;
}

export interface MandateParams {
  userId: string;
  maxPerOrder: number;
  maxPerMonth: number;
  allowedProducts: string[];
  autoRebalance?: boolean;
  driftThreshold?: number;
  quietHoursStart?: number;
  quietHoursEnd?: number;
}

export function computeMandateHash(params: Omit<InvestmentMandate, 'signedHash' | 'signedAt'>): string {
  const normalized = {
    userId: params.userId,
    maxPerOrder: params.maxPerOrder,
    maxPerMonth: params.maxPerMonth,
    allowedProducts: [...params.allowedProducts].sort(),
    autoRebalance: Boolean(params.autoRebalance),
    driftThreshold: params.driftThreshold,
    quietHoursStart: params.quietHoursStart,
    quietHoursEnd: params.quietHoursEnd
  };
  return crypto.createHash('sha256').update(canonicalJson(normalized), 'utf8').digest('hex');
}

export function getMandate(userId: string, customDb?: DB): InvestmentMandate | null {
  const db = customDb || getDb();
  const row = db.prepare('SELECT * FROM mandates WHERE user_id = ?').get(userId) as any;

  if (!row) return null;

  return {
    userId: row.user_id,
    maxPerOrder: row.max_per_order,
    maxPerMonth: row.max_per_month,
    allowedProducts: JSON.parse(row.allowed_products_json),
    autoRebalance: Boolean(row.auto_rebalance),
    driftThreshold: row.drift_threshold,
    quietHoursStart: row.quiet_hours_start,
    quietHoursEnd: row.quiet_hours_end,
    signedHash: row.signed_hash,
    signedAt: row.signed_at
  };
}

export function signMandate(params: MandateParams, customDb?: DB): InvestmentMandate {
  const db = customDb || getDb();

  const dataToHash = {
    userId: params.userId,
    maxPerOrder: params.maxPerOrder,
    maxPerMonth: params.maxPerMonth,
    allowedProducts: params.allowedProducts,
    autoRebalance: params.autoRebalance ?? false,
    driftThreshold: params.driftThreshold ?? 0.05,
    quietHoursStart: params.quietHoursStart ?? 22,
    quietHoursEnd: params.quietHoursEnd ?? 7
  };

  const signedHash = computeMandateHash(dataToHash);
  const signedAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO mandates (
      user_id, max_per_order, max_per_month, allowed_products_json,
      auto_rebalance, drift_threshold, quiet_hours_start, quiet_hours_end,
      signed_hash, signed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      max_per_order=excluded.max_per_order,
      max_per_month=excluded.max_per_month,
      allowed_products_json=excluded.allowed_products_json,
      auto_rebalance=excluded.auto_rebalance,
      drift_threshold=excluded.drift_threshold,
      quiet_hours_start=excluded.quiet_hours_start,
      quiet_hours_end=excluded.quiet_hours_end,
      signed_hash=excluded.signed_hash,
      signed_at=excluded.signed_at
  `).run(
    params.userId,
    params.maxPerOrder,
    params.maxPerMonth,
    JSON.stringify(params.allowedProducts),
    params.autoRebalance ? 1 : 0,
    params.driftThreshold ?? 0.05,
    params.quietHoursStart ?? 22,
    params.quietHoursEnd ?? 7,
    signedHash,
    signedAt
  );

  return {
    ...dataToHash,
    signedHash,
    signedAt
  };
}

export function getMonthlyInvestedAmount(userId: string, customDb?: DB): number {
  const db = customDb || getDb();
  // Sum of executed BUY orders in the last 30 days
  const row = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as totalMonthly
    FROM orders 
    WHERE user_id = ? AND side = 'BUY' AND status IN ('queued', 'settled')
  `).get(userId) as any;

  return row ? Number(row.totalMonthly) : 0;
}
