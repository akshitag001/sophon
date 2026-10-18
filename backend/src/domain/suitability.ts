import { RiskProfile } from './risk';
import { Product } from './catalog';

export interface PortfolioContext {
  cash: number;
  totalHoldingsValue: number;
  productHoldingsValue?: Record<string, number>; // productId -> current market value
  monthlyExpenses?: number;
}

export interface SuitabilityResult {
  allowed: boolean;
  reasons: string[];
  rule_ids: string[];
  warnings: string[];
}

// Products considered broad diversified index or balanced funds that are exempt from the 40% single-asset cap
export const DIVERSIFIED_FUNDS = new Set([
  'fund-balanced-05',
  'eq-global-06',
  'eq-domestic-07',
  'bond-govt-03',
  'bond-short-02',
  'mmf-cash-01'
]);

/**
 * Deterministic Suitability Gate.
 * Enforces MiFID II / FINRA / SFC investor protection rules in code.
 * Cannot be bypassed by the LLM or agent tool layer.
 */
export function checkSuitability(
  profile: RiskProfile | null | undefined,
  product: Product,
  amount: number,
  portfolio?: PortfolioContext,
  currentDate = new Date()
): SuitabilityResult {
  const reasons: string[] = [];
  const rule_ids: string[] = [];
  const warnings: string[] = [];

  // S2: Profile missing or expired
  if (!profile) {
    return {
      allowed: false,
      rule_ids: ['S2'],
      reasons: ['Suitability check failed (S2): User risk profile is missing. Client must complete the risk assessment.'],
      warnings: []
    };
  }

  const expirationDate = new Date(profile.expires_at);
  if (currentDate > expirationDate) {
    return {
      allowed: false,
      rule_ids: ['S2'],
      reasons: [
        `Suitability check failed (S2): Risk profile expired on ${expirationDate.toISOString().slice(0, 10)}. Re-profiling required before placing orders.`
      ],
      warnings: []
    };
  }

  // S3: Profile has unresolved contradictions
  if (profile.contradictions && profile.contradictions.length > 0) {
    rule_ids.push('S3');
    reasons.push(
      `Suitability check blocked (S3): Unresolved contradictions detected in client risk profile: "${profile.contradictions.join('; ')}". Must clarify with user before investing.`
    );
  }

  // S1: Product risk level exceeds user risk profile level
  if (product.risk_level > profile.level) {
    rule_ids.push('S1');
    reasons.push(
      `Suitability check blocked (S1): Product "${product.name}" has risk level ${product.risk_level}/5, which exceeds client's approved risk level of ${profile.level}/5 (${profile.label}).`
    );
  }

  // S7: Amount below minimum investment
  if (amount < product.min_investment) {
    rule_ids.push('S7');
    reasons.push(
      `Suitability check blocked (S7): Order amount $${amount.toLocaleString()} is below the minimum required investment of $${product.min_investment.toLocaleString()} for ${product.name}.`
    );
  }

  // S4: Emergency savings check
  // If emergency savings is less than 3 months, block investing until safety cushion is established
  if (profile.answers.emergency_savings === 'less_than_1' || profile.answers.emergency_savings === '1_to_3') {
    rule_ids.push('S4');
    reasons.push(
      `Suitability check blocked (S4): Client has only ${profile.answers.emergency_savings.replace(/_/g, ' ')} months of emergency savings. Prudent suitability rules require maintaining at least 3 months of emergency reserves before investing in capital market instruments.`
    );
  } else if (portfolio && portfolio.monthlyExpenses && portfolio.monthlyExpenses > 0) {
    const requiredBuffer = 3 * portfolio.monthlyExpenses;
    const remainingCash = portfolio.cash - amount;
    if (remainingCash < requiredBuffer) {
      rule_ids.push('S4');
      reasons.push(
        `Suitability check blocked (S4): Investment of $${amount.toLocaleString()} would leave $${remainingCash.toLocaleString()} in cash, which is below the mandatory 3-month expense reserve ($${requiredBuffer.toLocaleString()}).`
      );
    }
  }

  // S5: Single product concentration exceeds 40% of portfolio
  if (portfolio) {
    const totalCurrentPortfolio = portfolio.cash + portfolio.totalHoldingsValue;
    const isDiversified = DIVERSIFIED_FUNDS.has(product.id) || product.asset_class === 'balanced';

    if (!isDiversified && totalCurrentPortfolio > 0) {
      const currentHoldingValue = portfolio.productHoldingsValue?.[product.id] || 0;
      const newHoldingValue = currentHoldingValue + amount;
      const postTradeTotal = totalCurrentPortfolio; // cash converted to asset
      const concentration = postTradeTotal > 0 ? newHoldingValue / postTradeTotal : 1;

      if (concentration > 0.40) {
        rule_ids.push('S5');
        reasons.push(
          `Suitability check blocked (S5): Holding ${product.name} would constitute ${(concentration * 100).toFixed(1)}% of your portfolio, violating the 40% concentration ceiling for non-broad index assets.`
        );
      }
    }
  }

  // S6: Liquidity horizon mismatch (WARN)
  const liquidityDaysMap: Record<string, number> = {
    high_immediate: 1,
    within_1_year: 2,
    '2_to_5_years': 5,
    none_locked_in: 30
  };
  const maxAcceptedLiquidityDays = liquidityDaysMap[profile.answers.liquidity_needs] || 2;
  if (product.liquidity_days > maxAcceptedLiquidityDays) {
    rule_ids.push('S6');
    warnings.push(
      `Suitability warning (S6): Product liquidity settlement (${product.liquidity_days} days) may be slower than client stated short-term liquidity preference.`
    );
  }

  const allowed = reasons.length === 0;

  return {
    allowed,
    reasons,
    rule_ids,
    warnings
  };
}
