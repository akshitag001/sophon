import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../src/db';
import {
  ensureUserAccount,
  getAccountBalance,
  placeOrder,
  settleEligibleOrders,
  getPortfolioView
} from '../src/sandbox/broker';
import { advanceClock, resetClock, getCurrentPrice } from '../src/sandbox/clock';
import { getProduct } from '../src/domain/catalog';

describe('Domain: Simulated Brokerage Sandbox', () => {
  beforeEach(() => {
    const db = getDb();
    resetClock(db);
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM holdings WHERE user_id = ?').run('test_user');
    db.prepare('DELETE FROM accounts WHERE user_id = ?').run('test_user');
    ensureUserAccount('test_user', 10000, db);
  });

  it('should initialize user account with expected cash balance', () => {
    const bal = getAccountBalance('test_user');
    expect(bal).toBe(10000);
  });

  it('should reject order if cash is insufficient', () => {
    expect(() => {
      placeOrder({
        userId: 'test_user',
        productId: 'fund-balanced-05',
        side: 'BUY',
        amount: 25000 // exceeds $10,000 cash
      });
    }).toThrow(/Insufficient simulated cash/);
  });

  it('should deduct fees and queue order for T+1 settlement', () => {
    // bond-corp-04 has entry_fee = 0.001 (0.1%)
    // Order $1,000 => fee is $1.00, net invested is $999.00
    const order = placeOrder({
      userId: 'test_user',
      productId: 'bond-corp-04',
      side: 'BUY',
      amount: 1000
    });

    expect(order.status).toBe('queued');
    expect(order.fee).toBe(1.0);
    expect(order.executionDay).toBe(0);
    expect(order.settlementDay).toBe(1);

    // Cash immediately locked
    const balAfter = getAccountBalance('test_user');
    expect(balAfter).toBe(9000);

    // Before clock advance: holding is not yet settled
    const portfolioBefore = getPortfolioView('test_user');
    expect(portfolioBefore.holdings).toHaveLength(0);

    // Advance clock 1 day
    advanceClock(1);
    const settledCount = settleEligibleOrders();
    expect(settledCount).toBe(1);

    // After advance: holding is now settled in portfolio
    const portfolioAfter = getPortfolioView('test_user');
    expect(portfolioAfter.holdings).toHaveLength(1);
    expect(portfolioAfter.holdings[0].productId).toBe('bond-corp-04');
    expect(portfolioAfter.holdings[0].units).toBeGreaterThan(0);
  });

  it('should enforce idempotency: same idempotency key never executes twice', () => {
    const key = 'idem_key_unique_123';
    const order1 = placeOrder({
      userId: 'test_user',
      productId: 'fund-balanced-05',
      side: 'BUY',
      amount: 2000,
      idempotencyKey: key
    });

    const balAfterOrder1 = getAccountBalance('test_user');
    expect(balAfterOrder1).toBe(8000);

    // Repeat identical order with same key
    const order2 = placeOrder({
      userId: 'test_user',
      productId: 'fund-balanced-05',
      side: 'BUY',
      amount: 2000,
      idempotencyKey: key
    });

    expect(order2.id).toBe(order1.id);
    const balAfterOrder2 = getAccountBalance('test_user');
    // Cash must not be deducted a second time
    expect(balAfterOrder2).toBe(8000);
  });
});
