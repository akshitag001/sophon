import { describe, it, expect } from 'vitest';
import { scoreRiskQuestionnaire, RiskAnswers } from '../src/domain/risk';
import { buildPlan, rebalanceOrders } from '../src/domain/allocation';
import { simulateGoal } from '../src/domain/projection';

describe('Domain: Asset Allocation, Projection, and Rebalancing', () => {
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

  const priyaProfile = scoreRiskQuestionnaire('priya', priyaAnswers);

  it('should build a plan where target weights sum to 1.0', () => {
    const goal = { name: 'Home Deposit', targetAmount: 30000, years: 6 };
    const plan = buildPlan(priyaProfile, goal);

    const sumWeights = Object.values(plan.targetWeights).reduce((a, b) => a + b, 0);
    expect(sumWeights).toBeCloseTo(1.0, 2);
    expect(plan.allocations.length).toBeGreaterThanOrEqual(3);
    expect(plan.allocations.every((a) => a.riskLevel <= 3)).toBe(true);
  });

  it('should activate glide path when years to goal <= 3', () => {
    const shortGoal = { name: 'Car Purchase', targetAmount: 15000, years: 2 };
    const plan = buildPlan(priyaProfile, shortGoal);

    expect(plan.glidePathApplied).toBe(true);
    expect(plan.notes.some((n) => n.includes('Glide path'))).toBe(true);
  });

  it('should produce identical Monte Carlo simulation results with the same seed', () => {
    const goal = { name: 'Home Deposit', targetAmount: 30000, years: 6 };
    const plan = buildPlan(priyaProfile, goal);

    const sim1 = simulateGoal(plan, 5000, 300, 6, 30000, 12345, 1000);
    const sim2 = simulateGoal(plan, 5000, 300, 6, 30000, 12345, 1000);

    expect(sim1.probabilityOfSuccess).toBe(sim2.probabilityOfSuccess);
    expect(sim1.yearlyPercentiles).toEqual(sim2.yearlyPercentiles);
    expect(sim1.monthlyNeededFor75Pct).toBe(sim2.monthlyNeededFor75Pct);
  });

  it('should calculate monthly savings required for 75% success probability', () => {
    const goal = { name: 'Home Deposit', targetAmount: 30000, years: 6 };
    const plan = buildPlan(priyaProfile, goal);

    const sim = simulateGoal(plan, 5000, 200, 6, 30000, 42, 1000);
    expect(sim.monthlyNeededFor75Pct).toBeGreaterThan(100);
    expect(sim.monthlyNeededFor75Pct).toBeLessThan(1000);
  });

  it('should detect drift and generate rebalancing orders bringing weights within threshold', () => {
    // Current portfolio heavily drifted into equities after a rally:
    // Total portfolio value: $20,000
    // Target: 45% equity ($9,000), 35% bonds ($7,000), 10% cash ($2,000), 10% real assets ($2,000)
    // Actual: $14,000 equity (70% -> +25% drift!), $4,000 bonds (20%), $2,000 cash
    const targetWeights = {
      'eq-global-06': 0.45,
      'bond-govt-03': 0.35,
      'mmf-cash-01': 0.10,
      'gold-etf-09': 0.10
    };

    const currentHoldings = {
      'eq-global-06': { units: 140, price: 100, name: 'World Equity' }, // $14,000
      'bond-govt-03': { units: 40, price: 100, name: 'Govt Bonds' } // $4,000
    };
    const currentCash = 2000; // $2,000 cash -> Total $20,000

    const result = rebalanceOrders(currentHoldings, targetWeights, currentCash, 0.05);

    expect(result.rebalanceNeeded).toBe(true);
    expect(result.maxDrift).toBeGreaterThan(0.05);
    expect(result.orders.length).toBeGreaterThan(0);

    // Should sell equity ($14,000 - $9,000 = $5,000 sell)
    const sellEq = result.orders.find((o) => o.productId === 'eq-global-06' && o.side === 'SELL');
    expect(sellEq).toBeDefined();
    expect(sellEq?.amount).toBeCloseTo(5000, 1);

    // Should buy bonds ($7,000 - $4,000 = $3,000 buy)
    const buyBonds = result.orders.find((o) => o.productId === 'bond-govt-03' && o.side === 'BUY');
    expect(buyBonds).toBeDefined();
    expect(buyBonds?.amount).toBeCloseTo(3000, 1);
  });
});
