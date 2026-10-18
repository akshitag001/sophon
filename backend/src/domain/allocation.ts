import { RiskProfile } from './risk';
import { Product, listProducts, AssetClass } from './catalog';
import { checkSuitability } from './suitability';

export interface Goal {
  name: string;
  targetAmount: number;
  years: number;
  initialDeposit?: number;
  monthlyDeposit?: number;
}

export interface PlanAllocationItem {
  assetClass: AssetClass;
  productId: string;
  productName: string;
  riskLevel: number;
  weight: number;
  expenseRatio: number;
  expectedReturn: number;
  volatility: number;
  reason: string;
}

export interface InvestmentPlan {
  userId: string;
  riskLevel: number;
  riskLabel: string;
  goal: Goal;
  allocations: PlanAllocationItem[];
  targetWeights: Record<string, number>;
  expectedReturn: number;
  portfolioVolatility: number;
  glidePathApplied: boolean;
  notes: string[];
}

export interface RebalanceOrder {
  productId: string;
  productName: string;
  side: 'BUY' | 'SELL';
  amount: number;
  units: number;
  estimatedPrice: number;
  driftBefore: number;
  driftAfter: number;
}

export interface RebalanceResult {
  rebalanceNeeded: boolean;
  maxDrift: number;
  driftThreshold: number;
  totalPortfolioValue: number;
  orders: RebalanceOrder[];
}

// Baseline asset class allocations per risk level (1 to 5)
export const MODEL_PORTFOLIOS: Record<number, Record<AssetClass, number>> = {
  1: { cash: 0.30, bonds: 0.55, equity: 0.10, real_assets: 0.05, balanced: 0.0 },
  2: { cash: 0.15, bonds: 0.50, equity: 0.25, real_assets: 0.10, balanced: 0.0 },
  3: { cash: 0.10, bonds: 0.35, equity: 0.45, real_assets: 0.10, balanced: 0.0 },
  4: { cash: 0.05, bonds: 0.20, equity: 0.65, real_assets: 0.10, balanced: 0.0 },
  5: { cash: 0.05, bonds: 0.10, equity: 0.75, real_assets: 0.10, balanced: 0.0 }
};

export function buildPlan(profile: RiskProfile, goal: Goal): InvestmentPlan {
  const level = profile.level;
  const baseWeights = { ...MODEL_PORTFOLIOS[level] };
  const notes: string[] = [];

  // Glide path logic:
  // If horizon is short (<= 3 years remaining), shift equity into cash and short bonds to protect capital
  let glidePathApplied = false;
  if (goal.years <= 3) {
    glidePathApplied = true;
    const equityReduction = (4 - goal.years) * 0.08;
    const actualReduction = Math.min(baseWeights.equity, equityReduction);
    baseWeights.equity -= actualReduction;
    baseWeights.cash += actualReduction * 0.6;
    baseWeights.bonds += actualReduction * 0.4;
    notes.push(
      `Glide path activated: Goal horizon is ${goal.years} year(s). Shifted ${(actualReduction * 100).toFixed(0)}% from equity into cash/bonds to protect upcoming capital withdrawal.`
    );
  }

  // Pick lowest-cost suitable product per asset class bucket
  const allocations: PlanAllocationItem[] = [];
  const targetWeights: Record<string, number> = {};

  const assetClasses: AssetClass[] = ['cash', 'bonds', 'equity', 'real_assets'];

  for (const ac of assetClasses) {
    const weight = baseWeights[ac];
    if (weight <= 0) continue;

    // Filter suitable products for this user
    const candidates = listProducts({ asset_class: ac }).filter((prod) => {
      const res = checkSuitability(profile, prod, 500);
      return res.allowed;
    });

    if (candidates.length === 0) {
      // Fallback to cash MMF if no candidate in class
      const cashFallback = listProducts({ asset_class: 'cash' })[0];
      candidates.push(cashFallback);
    }

    // Sort by lowest fee cost (expense_ratio + entry_fee)
    candidates.sort((a, b) => a.expense_ratio + a.entry_fee - (b.expense_ratio + b.entry_fee));
    const selected = candidates[0];

    allocations.push({
      assetClass: ac,
      productId: selected.id,
      productName: selected.name,
      riskLevel: selected.risk_level,
      weight: Math.round(weight * 1000) / 1000,
      expenseRatio: selected.expense_ratio,
      expectedReturn: selected.expected_return,
      volatility: selected.volatility,
      reason: `Lowest-cost suitable product in ${ac} asset class (${(selected.expense_ratio * 100).toFixed(2)}% expense ratio).`
    });

    targetWeights[selected.id] = (targetWeights[selected.id] || 0) + weight;
  }

  // Normalize target weights to ensure exact sum = 1.000
  const totalWeight = Object.values(targetWeights).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(targetWeights)) {
    targetWeights[k] = Math.round((targetWeights[k] / totalWeight) * 1000) / 1000;
  }

  // Compute portfolio expected return and volatility
  let expectedReturn = 0;
  let varianceSum = 0;
  for (const item of allocations) {
    expectedReturn += item.weight * item.expectedReturn;
    varianceSum += Math.pow(item.weight * item.volatility, 2);
  }
  // Approximate portfolio standard deviation assuming moderate correlation (0.25)
  const portfolioVolatility = Math.sqrt(varianceSum * 1.25);

  return {
    userId: profile.user_id,
    riskLevel: profile.level,
    riskLabel: profile.label,
    goal,
    allocations,
    targetWeights,
    expectedReturn: Math.round(expectedReturn * 10000) / 10000,
    portfolioVolatility: Math.round(portfolioVolatility * 10000) / 10000,
    glidePathApplied,
    notes
  };
}

/**
 * Rebalancing algorithm:
 * Determines trades needed to restore current portfolio holdings to target weights
 * if any position drifts beyond driftThreshold (default 5%).
 */
export function rebalanceOrders(
  currentHoldings: Record<string, { units: number; price: number; name?: string }>,
  targetWeights: Record<string, number>,
  currentCash: number,
  driftThreshold = 0.05
): RebalanceResult {
  let holdingsValue = 0;
  for (const h of Object.values(currentHoldings)) {
    holdingsValue += h.units * h.price;
  }
  const totalPortfolioValue = currentCash + holdingsValue;

  if (totalPortfolioValue <= 0) {
    return {
      rebalanceNeeded: false,
      maxDrift: 0,
      driftThreshold,
      totalPortfolioValue: 0,
      orders: []
    };
  }

  const allProductIds = Array.from(
    new Set([...Object.keys(currentHoldings), ...Object.keys(targetWeights)])
  );

  let maxDrift = 0;
  const drifts: Record<string, { currentWeight: number; targetWeight: number; drift: number }> = {};

  for (const pid of allProductIds) {
    const currentVal = (currentHoldings[pid]?.units || 0) * (currentHoldings[pid]?.price || 1);
    const currentWeight = currentVal / totalPortfolioValue;
    const targetWeight = targetWeights[pid] || 0;
    const drift = Math.abs(currentWeight - targetWeight);

    drifts[pid] = { currentWeight, targetWeight, drift };
    if (drift > maxDrift) {
      maxDrift = drift;
    }
  }

  if (maxDrift < driftThreshold) {
    return {
      rebalanceNeeded: false,
      maxDrift: Math.round(maxDrift * 1000) / 1000,
      driftThreshold,
      totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
      orders: []
    };
  }

  // Generate rebalance orders: SELL first to free cash, then BUY
  const sellOrders: RebalanceOrder[] = [];
  const buyOrders: RebalanceOrder[] = [];

  for (const pid of allProductIds) {
    const targetVal = (targetWeights[pid] || 0) * totalPortfolioValue;
    const currentUnits = currentHoldings[pid]?.units || 0;
    const price = currentHoldings[pid]?.price || 100;
    const currentVal = currentUnits * price;
    const deltaVal = targetVal - currentVal;

    const driftBefore = drifts[pid].drift;
    const driftAfter = 0;

    if (deltaVal < -10) {
      // SELL
      const sellAmount = Math.abs(deltaVal);
      const unitsToSell = Math.min(currentUnits, sellAmount / price);
      sellOrders.push({
        productId: pid,
        productName: currentHoldings[pid]?.name || pid,
        side: 'SELL',
        amount: Math.round(sellAmount * 100) / 100,
        units: Math.round(unitsToSell * 10000) / 10000,
        estimatedPrice: price,
        driftBefore: Math.round(driftBefore * 1000) / 1000,
        driftAfter
      });
    } else if (deltaVal > 10) {
      // BUY
      const buyAmount = deltaVal;
      const unitsToBuy = buyAmount / price;
      buyOrders.push({
        productId: pid,
        productName: currentHoldings[pid]?.name || pid,
        side: 'BUY',
        amount: Math.round(buyAmount * 100) / 100,
        units: Math.round(unitsToBuy * 10000) / 10000,
        estimatedPrice: price,
        driftBefore: Math.round(driftBefore * 1000) / 1000,
        driftAfter
      });
    }
  }

  return {
    rebalanceNeeded: true,
    maxDrift: Math.round(maxDrift * 1000) / 1000,
    driftThreshold,
    totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
    orders: [...sellOrders, ...buyOrders]
  };
}
