import { getDb, DB } from '../db';
import { getProduct, loadProducts } from '../domain/catalog';
import { SeededPRNG } from '../domain/projection';

export type MarketScenario = 'normal' | 'crash' | 'rally';

export interface ClockState {
  currentDay: number;
  marketScenario: MarketScenario;
  updatedAt: string;
}

export function getClockState(customDb?: DB): ClockState {
  const db = customDb || getDb();
  const row = db.prepare('SELECT current_day, market_scenario, updated_at FROM simulated_clock WHERE id = 1').get() as any;

  if (!row) {
    db.prepare("INSERT INTO simulated_clock (id, current_day, market_scenario, updated_at) VALUES (1, 0, 'normal', datetime('now'))").run();
    return { currentDay: 0, marketScenario: 'normal', updatedAt: new Date().toISOString() };
  }

  return {
    currentDay: row.current_day,
    marketScenario: row.market_scenario as MarketScenario,
    updatedAt: row.updated_at
  };
}

export function advanceClock(days: number, customDb?: DB): ClockState {
  const db = customDb || getDb();
  if (days < 0) throw new Error('Days must be non-negative');

  db.prepare(`
    UPDATE simulated_clock 
    SET current_day = current_day + ?, updated_at = datetime('now')
    WHERE id = 1
  `).run(days);

  return getClockState(db);
}

export function setMarketScenario(scenario: MarketScenario, customDb?: DB): ClockState {
  const db = customDb || getDb();
  db.prepare(`
    UPDATE simulated_clock 
    SET market_scenario = ?, updated_at = datetime('now')
    WHERE id = 1
  `).run(scenario);

  return getClockState(db);
}

export function resetClock(customDb?: DB): ClockState {
  const db = customDb || getDb();
  db.prepare(`
    UPDATE simulated_clock 
    SET current_day = 0, market_scenario = 'normal', updated_at = datetime('now')
    WHERE id = 1
  `).run();

  return getClockState(db);
}

/**
 * Calculates current price of a simulated product based on current day and scenario.
 * Baseline price at Day 0 is 100.00.
 * Prices evolve via deterministic seeded geometric random walk.
 */
export function getCurrentPrice(productId: string, customDb?: DB): number {
  const clock = getClockState(customDb);
  const product = getProduct(productId);
  if (!product) return 100.0;

  const basePrice = 100.0;
  if (clock.currentDay === 0) {
    return basePrice;
  }

  // Seeded deterministic price path per product
  const hashSeed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000);
  const prng = new SeededPRNG(hashSeed);

  let price = basePrice;
  const dt = 1 / 365;
  const dailyDrift = (product.expected_return - 0.5 * Math.pow(product.volatility, 2)) * dt;
  const dailyVol = product.volatility * Math.sqrt(dt);

  for (let d = 1; d <= clock.currentDay; d++) {
    const shock = prng.nextNormal();
    price = price * Math.exp(dailyDrift + dailyVol * shock);
  }

  // Apply scenario shocks:
  if (clock.marketScenario === 'crash') {
    // Equities, real assets drop by 25%; bonds rise by 3% (flight to safety)
    if (product.asset_class === 'equity' || product.asset_class === 'real_assets') {
      price *= 0.75;
    } else if (product.asset_class === 'bonds') {
      price *= 1.03;
    }
  } else if (clock.marketScenario === 'rally') {
    // Equities rally by 15%
    if (product.asset_class === 'equity' || product.asset_class === 'real_assets') {
      price *= 1.15;
    }
  }

  return Math.max(1.0, Math.round(price * 100) / 100);
}
