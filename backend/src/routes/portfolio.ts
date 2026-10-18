import { Router, Request, Response } from 'express';
import { getPortfolioView, getUserOrders, placeOrder, settleEligibleOrders } from '../sandbox/broker';
import { advanceClock, setMarketScenario, resetClock, MarketScenario } from '../sandbox/clock';
import { getDb } from '../db';
import { logAuditEvent } from '../security/audit';

export const portfolioRouter = Router();

// GET /portfolio/:userId
portfolioRouter.get('/portfolio/:userId', (req: Request, res: Response) => {
  try {
    const portfolio = getPortfolioView(req.params.userId);
    res.json(portfolio);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /orders/:userId
portfolioRouter.get('/orders/:userId', (req: Request, res: Response) => {
  try {
    const orders = getUserOrders(req.params.userId);
    res.json({ orders, count: orders.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /sandbox/advance { days }
portfolioRouter.post('/sandbox/advance', (req: Request, res: Response) => {
  try {
    const { days } = req.body;
    const numDays = days ? Number(days) : 1;
    const clock = advanceClock(numDays);
    const settledCount = settleEligibleOrders();

    logAuditEvent({
      actor: 'user',
      action: 'ADVANCE_SIMULATION_CLOCK',
      tier: 'L0',
      decision: 'EXECUTED',
      rule_ids: ['CLOCK_ADVANCE'],
      payload: { advancedDays: numDays, newDay: clock.currentDay, settledCount }
    });

    res.json({ clock, settledCount });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /sandbox/scenario { scenario: 'normal' | 'crash' | 'rally' }
portfolioRouter.post('/sandbox/scenario', (req: Request, res: Response) => {
  try {
    const { scenario } = req.body;
    if (!['normal', 'crash', 'rally'].includes(scenario)) {
      return res.status(400).json({ error: 'Scenario must be normal, crash, or rally' });
    }

    const clock = setMarketScenario(scenario as MarketScenario);

    logAuditEvent({
      actor: 'user',
      action: 'TRIGGER_MARKET_SCENARIO',
      tier: 'L0',
      decision: 'EXECUTED',
      rule_ids: ['SCENARIO_SWITCH'],
      payload: { scenario }
    });

    res.json({ clock });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// POST /sandbox/reset
portfolioRouter.post('/sandbox/reset', (req: Request, res: Response) => {
  try {
    const db = getDb();
    resetClock(db);

    // Reset Priya to fresh state
    db.prepare('DELETE FROM risk_profiles WHERE user_id = ?').run('priya');
    db.prepare('DELETE FROM holdings WHERE user_id = ?').run('priya');
    db.prepare('DELETE FROM orders WHERE user_id = ?').run('priya');
    db.prepare('DELETE FROM mandates WHERE user_id = ?').run('priya');
    db.prepare('DELETE FROM proposals_approvals WHERE user_id = ?').run('priya');

    db.prepare(`
      INSERT INTO accounts (user_id, cash_balance, created_at, updated_at)
      VALUES (?, 20000, datetime('now'), datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET cash_balance = 20000, updated_at = datetime('now')
    `).run('priya');

    // Reset Chen (pre-profiled level 2 with existing drifted portfolio for quick rebalancing demo)
    db.prepare('DELETE FROM risk_profiles WHERE user_id = ?').run('chen');
    db.prepare('DELETE FROM holdings WHERE user_id = ?').run('chen');
    db.prepare('DELETE FROM orders WHERE user_id = ?').run('chen');
    db.prepare('DELETE FROM mandates WHERE user_id = ?').run('chen');

    db.prepare(`
      INSERT INTO accounts (user_id, cash_balance, created_at, updated_at)
      VALUES (?, 3000, datetime('now'), datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET cash_balance = 3000, updated_at = datetime('now')
    `).run('chen');

    // Chen holdings: drifted portfolio
    db.prepare(`
      INSERT INTO holdings (id, user_id, product_id, units, avg_cost, created_at, updated_at)
      VALUES ('hld_chen_1', 'chen', 'eq-global-06', 140, 100, datetime('now'), datetime('now')),
             ('hld_chen_2', 'chen', 'bond-govt-03', 40, 100, datetime('now'), datetime('now'))
    `).run();

    logAuditEvent({
      actor: 'system',
      action: 'SANDBOX_RESET',
      tier: 'L3',
      decision: 'EXECUTED',
      rule_ids: ['DEMO_RESET'],
      payload: { resetUsers: ['priya', 'chen'] }
    });

    res.json({ status: 'OK', message: 'Sandbox environment successfully reset.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
