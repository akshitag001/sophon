import { InvestmentPlan } from './allocation';

export interface YearlyPercentile {
  year: number;
  p10: number; // 10th percentile (bearish / conservative)
  p50: number; // 50th percentile (median)
  p90: number; // 90th percentile (bullish)
  targetLine: number;
}

export interface SimulationResult {
  seed: number;
  totalPaths: number;
  years: number;
  initialAmount: number;
  monthlyContribution: number;
  targetAmount: number;
  probabilityOfSuccess: number; // percentage 0 to 100
  monthlyNeededFor75Pct: number;
  yearlyPercentiles: YearlyPercentile[];
  terminalValues: {
    min: number;
    p10: number;
    p50: number;
    p90: number;
    max: number;
  };
  assumptions: string[];
}

/**
 * Seeded Pseudo-Random Number Generator (Linear Congruential Generator)
 * Guarantees 100% deterministic reproducibility across platforms and runs.
 */
export class SeededPRNG {
  private state: number;

  constructor(seed = 42) {
    this.state = Math.abs(seed) % 2147483647;
    if (this.state === 0) this.state = 1;
  }

  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }

  // Box-Muller transform to generate standard normal random variable ~ N(0, 1)
  nextNormal(): number {
    let u1 = this.next();
    let u2 = this.next();
    while (u1 <= 1e-15) u1 = this.next();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }
}

/**
 * Run 5,000 Monte Carlo paths for goal simulation
 */
export function simulateGoal(
  plan: InvestmentPlan,
  initial: number,
  monthlyContribution: number,
  years: number,
  target: number,
  seed = 42,
  numPaths = 5000
): SimulationResult {
  const prng = new SeededPRNG(seed);
  const months = Math.round(years * 12);
  const dt = 1 / 12;

  const mu = plan.expectedReturn;
  const sigma = plan.portfolioVolatility;

  // Monthly drift and volatility
  const drift = (mu - 0.5 * Math.pow(sigma, 2)) * dt;
  const vol = sigma * Math.sqrt(dt);

  // Array to store trajectory percentiles per year
  const yearlyWealths: number[][] = Array.from({ length: years }, () => []);
  const finalWealths: number[] = [];
  let successCount = 0;

  for (let p = 0; p < numPaths; p++) {
    let wealth = initial;

    for (let m = 1; m <= months; m++) {
      wealth += monthlyContribution;
      const z = prng.nextNormal();
      const returnFactor = Math.exp(drift + vol * z);
      wealth = wealth * returnFactor;

      if (m % 12 === 0) {
        const yearIndex = m / 12 - 1;
        yearlyWealths[yearIndex].push(wealth);
      }
    }

    finalWealths.push(wealth);
    if (wealth >= target) {
      successCount++;
    }
  }

  // Calculate percentiles per year
  const yearlyPercentiles: YearlyPercentile[] = [];
  for (let y = 0; y < years; y++) {
    const sorted = yearlyWealths[y].sort((a, b) => a - b);
    const p10 = Math.round(sorted[Math.floor(numPaths * 0.1)]);
    const p50 = Math.round(sorted[Math.floor(numPaths * 0.5)]);
    const p90 = Math.round(sorted[Math.floor(numPaths * 0.9)]);
    yearlyPercentiles.push({
      year: y + 1,
      p10,
      p50,
      p90,
      targetLine: target
    });
  }

  finalWealths.sort((a, b) => a - b);
  const probabilityOfSuccess = Math.round((successCount / numPaths) * 1000) / 10;

  // Find monthly contribution needed for 75% probability of success using bisection search
  const monthlyNeededFor75Pct = solveMonthlyForProbability(plan, initial, years, target, 0.75, seed);

  return {
    seed,
    totalPaths: numPaths,
    years,
    initialAmount: initial,
    monthlyContribution,
    targetAmount: target,
    probabilityOfSuccess,
    monthlyNeededFor75Pct,
    yearlyPercentiles,
    terminalValues: {
      min: Math.round(finalWealths[0]),
      p10: Math.round(finalWealths[Math.floor(numPaths * 0.1)]),
      p50: Math.round(finalWealths[Math.floor(numPaths * 0.5)]),
      p90: Math.round(finalWealths[Math.floor(numPaths * 0.9)]),
      max: Math.round(finalWealths[numPaths - 1])
    },
    assumptions: [
      `Geometric Brownian Motion with log-normal monthly returns.`,
      `Portfolio annual expected return: ${(mu * 100).toFixed(2)}%, volatility: ${(sigma * 100).toFixed(2)}%.`,
      `Asset class correlation matrix assumed with 0.25 equity-bond cross-asset correlation.`,
      `Monthly compounding with start-of-month contribution.`
    ]
  };
}

/**
 * Solve for monthly contribution needed to reach target probability (e.g. 75%)
 * using bisection search (converges in 12 iterations).
 */
export function solveMonthlyForProbability(
  plan: InvestmentPlan,
  initial: number,
  years: number,
  target: number,
  targetProb = 0.75,
  seed = 42
): number {
  let low = 0;
  let high = Math.max(500, (target - initial) / (years * 12) * 2.5);
  const months = Math.round(years * 12);
  const dt = 1 / 12;
  const mu = plan.expectedReturn;
  const sigma = plan.portfolioVolatility;
  const drift = (mu - 0.5 * Math.pow(sigma, 2)) * dt;
  const vol = sigma * Math.sqrt(dt);

  // Pre-generate normal shocks for 1,000 paths for fast bisection evaluation
  const fastPaths = 1000;
  const prng = new SeededPRNG(seed + 101);
  const shocks: number[][] = [];
  for (let p = 0; p < fastPaths; p++) {
    const pathShocks: number[] = [];
    for (let m = 0; m < months; m++) {
      pathShocks.push(prng.nextNormal());
    }
    shocks.push(pathShocks);
  }

  const evalProbability = (contrib: number): number => {
    let success = 0;
    for (let p = 0; p < fastPaths; p++) {
      let w = initial;
      for (let m = 0; m < months; m++) {
        w = (w + contrib) * Math.exp(drift + vol * shocks[p][m]);
      }
      if (w >= target) success++;
    }
    return success / fastPaths;
  };

  for (let iter = 0; iter < 12; iter++) {
    const mid = (low + high) / 2;
    const prob = evalProbability(mid);
    if (prob < targetProb) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Math.round((low + high) / 2);
}
