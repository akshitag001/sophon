import { getDb, DB } from '../db';
import { getProduct } from '../domain/catalog';
import { getClockState, getCurrentPrice } from './clock';
import { logAuditEvent } from '../security/audit';

export interface HoldingView {
  productId: string;
  productName: string;
  assetClass: string;
  riskLevel: number;
  units: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: string;
}

export interface PortfolioView {
  userId: string;
  cash: number;
  holdings: HoldingView[];
  totalHoldingsValue: number;
  totalPortfolioValue: number;
  currentDay: number;
  marketScenario: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  side: 'BUY' | 'SELL';
  amount: number;
  units: number;
  price: number;
  fee: number;
  status: 'pending_approval' | 'queued' | 'settled' | 'rejected' | 'cancelled';
  idempotencyKey?: string;
  executionDay: number;
  settlementDay: number;
  proposalHash?: string;
  reasons: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderInput {
  userId: string;
  productId: string;
  side: 'BUY' | 'SELL';
  amount: number;
  idempotencyKey?: string;
  proposalHash?: string;
  status?: 'pending_approval' | 'queued';
  customDb?: DB;
}

export function ensureUserAccount(userId: string, initialCash = 20000, customDb?: DB): void {
  const db = customDb || getDb();
  const existing = db.prepare('SELECT user_id FROM accounts WHERE user_id = ?').get(userId);
  if (!existing) {
    db.prepare(`
      INSERT INTO accounts (user_id, cash_balance, created_at, updated_at)
      VALUES (?, ?, datetime('now'), datetime('now'))
    `).run(userId, initialCash);
  }
}

export function getAccountBalance(userId: string, customDb?: DB): number {
  const db = customDb || getDb();
  ensureUserAccount(userId, 20000, db);
  const row = db.prepare('SELECT cash_balance FROM accounts WHERE user_id = ?').get(userId) as any;
  return row ? row.cash_balance : 0;
}

export function getPortfolioView(userId: string, customDb?: DB): PortfolioView {
  const db = customDb || getDb();
  settleEligibleOrders(db);
  ensureUserAccount(userId, 20000, db);

  const clock = getClockState(db);
  const cash = getAccountBalance(userId, db);

  const holdingRows = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND units > 0').all(userId) as any[];
  const holdings: HoldingView[] = [];
  let totalHoldingsValue = 0;

  for (const h of holdingRows) {
    const product = getProduct(h.product_id);
    const price = getCurrentPrice(h.product_id, db);
    const marketValue = Math.round(h.units * price * 100) / 100;
    const costBasis = h.units * h.avg_cost;
    const pnl = Math.round((marketValue - costBasis) * 100) / 100;
    const pnlPct = costBasis > 0 ? `${((pnl / costBasis) * 100).toFixed(2)}%` : '0.00%';

    holdings.push({
      productId: h.product_id,
      productName: product?.name || h.product_id,
      assetClass: product?.asset_class || 'other',
      riskLevel: product?.risk_level || 1,
      units: Math.round(h.units * 10000) / 10000,
      avgCost: Math.round(h.avg_cost * 100) / 100,
      currentPrice: price,
      marketValue,
      unrealizedPnL: pnl,
      unrealizedPnLPct: pnlPct
    });

    totalHoldingsValue += marketValue;
  }

  return {
    userId,
    cash: Math.round(cash * 100) / 100,
    holdings,
    totalHoldingsValue: Math.round(totalHoldingsValue * 100) / 100,
    totalPortfolioValue: Math.round((cash + totalHoldingsValue) * 100) / 100,
    currentDay: clock.currentDay,
    marketScenario: clock.marketScenario
  };
}

export function placeOrder(input: PlaceOrderInput): OrderRecord {
  const db = input.customDb || getDb();
  ensureUserAccount(input.userId, 20000, db);
  const clock = getClockState(db);

  // 1. Idempotency Check
  if (input.idempotencyKey) {
    const existing = db.prepare('SELECT * FROM orders WHERE idempotency_key = ?').get(input.idempotencyKey) as any;
    if (existing) {
      return mapOrderRow(existing);
    }
  }

  const product = getProduct(input.productId);
  if (!product) {
    throw new Error(`Product ${input.productId} not found in catalog.`);
  }

  const currentPrice = getCurrentPrice(input.productId, db);
  const orderId = 'ord_' + Math.random().toString(36).substring(2, 10);
  const executionDay = clock.currentDay;
  const settlementDay = clock.currentDay + 1; // Settle T+1

  // Validation
  const cash = getAccountBalance(input.userId, db);
  const entryFee = product.entry_fee ? Math.round(input.amount * product.entry_fee * 100) / 100 : 0;

  if (input.side === 'BUY') {
    if (input.amount < product.min_investment) {
      throw new Error(`Order amount $${input.amount} is below product minimum of $${product.min_investment}`);
    }
    if (cash < input.amount) {
      throw new Error(`Insufficient simulated cash: required $${input.amount}, available $${cash.toFixed(2)}`);
    }

    // Deduct cash immediately upon queueing to lock funds
    db.prepare("UPDATE accounts SET cash_balance = cash_balance - ?, updated_at = datetime('now') WHERE user_id = ?").run(
      input.amount,
      input.userId
    );
  } else {
    // SELL: check holdings
    const holding = db.prepare('SELECT units FROM holdings WHERE user_id = ? AND product_id = ?').get(input.userId, input.productId) as any;
    const requiredUnits = input.amount / currentPrice;
    if (!holding || holding.units < requiredUnits) {
      throw new Error(`Insufficient holdings to sell: requested ${requiredUnits.toFixed(4)} units, available ${holding ? holding.units : 0}`);
    }

    // Lock units
    db.prepare("UPDATE holdings SET units = units - ?, updated_at = datetime('now') WHERE user_id = ? AND product_id = ?").run(
      requiredUnits,
      input.userId,
      input.productId
    );
  }

  const netInvested = input.side === 'BUY' ? input.amount - entryFee : input.amount;
  const units = netInvested / currentPrice;
  const status = input.status || 'queued';

  db.prepare(`
    INSERT INTO orders (
      id, user_id, product_id, side, amount, units, price, fee,
      status, idempotency_key, execution_day, settlement_day, proposal_hash,
      reasons_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).run(
    orderId,
    input.userId,
    input.productId,
    input.side,
    input.amount,
    units,
    currentPrice,
    entryFee,
    status,
    input.idempotencyKey || null,
    executionDay,
    settlementDay,
    input.proposalHash || null,
    JSON.stringify([])
  );

  logAuditEvent({
    actor: 'agent',
    action: 'ORDER_QUEUED',
    tier: 'L2',
    decision: 'EXECUTED',
    rule_ids: ['ORDER_QUEUE_T1'],
    payload: {
      orderId,
      userId: input.userId,
      productId: input.productId,
      side: input.side,
      amount: input.amount,
      units,
      price: currentPrice,
      fee: entryFee,
      settlementDay
    },
    customDb: db
  });

  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  return mapOrderRow(row);
}

export function settleEligibleOrders(customDb?: DB): number {
  const db = customDb || getDb();
  const clock = getClockState(db);

  const eligibleOrders = db.prepare(`
    SELECT * FROM orders 
    WHERE status = 'queued' AND settlement_day <= ?
  `).all(clock.currentDay) as any[];

  for (const order of eligibleOrders) {
    if (order.side === 'BUY') {
      // Credit holding
      const existing = db.prepare('SELECT * FROM holdings WHERE user_id = ? AND product_id = ?').get(order.user_id, order.product_id) as any;
      if (existing) {
        const totalUnits = existing.units + order.units;
        const totalCost = (existing.units * existing.avg_cost) + (order.units * order.price);
        const newAvgCost = totalCost / totalUnits;
        db.prepare("UPDATE holdings SET units = ?, avg_cost = ?, updated_at = datetime('now') WHERE id = ?").run(
          totalUnits,
          newAvgCost,
          existing.id
        );
      } else {
        const holdingId = 'hld_' + Math.random().toString(36).substring(2, 10);
        db.prepare(`
          INSERT INTO holdings (id, user_id, product_id, units, avg_cost, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `).run(holdingId, order.user_id, order.product_id, order.units, order.price);
      }
    } else {
      // SELL: credit cash
      db.prepare("UPDATE accounts SET cash_balance = cash_balance + ?, updated_at = datetime('now') WHERE user_id = ?").run(
        order.amount,
        order.user_id
      );
    }

    db.prepare("UPDATE orders SET status = 'settled', updated_at = datetime('now') WHERE id = ?").run(order.id);

    logAuditEvent({
      actor: 'system',
      action: 'ORDER_SETTLED',
      tier: 'L2',
      decision: 'EXECUTED',
      rule_ids: ['SETTLEMENT_T1_COMPLETE'],
      payload: {
        orderId: order.id,
        userId: order.user_id,
        productId: order.product_id,
        settledDay: clock.currentDay
      },
      customDb: db
    });
  }

  return eligibleOrders.length;
}

export function getUserOrders(userId: string, customDb?: DB): OrderRecord[] {
  const db = customDb || getDb();
  const rows = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  return rows.map(mapOrderRow);
}

function mapOrderRow(row: any): OrderRecord {
  const product = getProduct(row.product_id);
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productName: product?.name || row.product_id,
    side: row.side,
    amount: row.amount,
    units: row.units,
    price: row.price,
    fee: row.fee,
    status: row.status,
    idempotencyKey: row.idempotency_key,
    executionDay: row.execution_day,
    settlementDay: row.settlement_day,
    proposalHash: row.proposal_hash,
    reasons: JSON.parse(row.reasons_json || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
