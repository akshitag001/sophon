import fs from 'fs';
import path from 'path';

export type AssetClass = 'cash' | 'bonds' | 'equity' | 'balanced' | 'real_assets';

export interface Product {
  id: string;
  name: string;
  asset_class: AssetClass;
  risk_level: number; // 1 to 5
  expense_ratio: number; // annual percentage as decimal (e.g. 0.002 = 0.2%)
  entry_fee: number; // upfront fee as decimal (e.g. 0.001 = 0.1%)
  min_investment: number; // in USD
  expected_return: number; // annualized e.g. 0.08 = 8%
  volatility: number; // annualized standard deviation e.g. 0.15 = 15%
  liquidity_days: number; // settlement/redemption days
  historical_yearly_returns: number[]; // 10 years of returns
  description: string;
}

export interface ProductFilter {
  asset_class?: AssetClass;
  max_risk_level?: number;
  min_risk_level?: number;
  max_min_investment?: number;
}

export interface ProductComparisonMetric {
  id: string;
  name: string;
  asset_class: AssetClass;
  risk_level: number;
  expense_ratio: number;
  expense_ratio_pct: string;
  entry_fee: number;
  entry_fee_pct: string;
  min_investment: number;
  expected_return: number;
  expected_return_pct: string;
  volatility: number;
  volatility_pct: string;
  liquidity_days: number;
  description: string;
  // Computed Deterministic Metrics:
  fee_cost_10y_on_10k: number;
  sharpe_ratio: number;
  best_year: number;
  best_year_pct: string;
  worst_year: number;
  worst_year_pct: string;
}

let cachedProducts: Product[] | null = null;

export function loadProducts(): Product[] {
  if (cachedProducts) {
    return cachedProducts;
  }

  // Load from data/products.json
  const filePath = path.resolve(__dirname, '../data/products.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  cachedProducts = JSON.parse(raw) as Product[];
  return cachedProducts;
}

export function listProducts(filter?: ProductFilter): Product[] {
  let products = loadProducts();

  if (!filter) return products;

  return products.filter((p) => {
    if (filter.asset_class && p.asset_class !== filter.asset_class) return false;
    if (filter.max_risk_level !== undefined && p.risk_level > filter.max_risk_level) return false;
    if (filter.min_risk_level !== undefined && p.risk_level < filter.min_risk_level) return false;
    if (filter.max_min_investment !== undefined && p.min_investment > filter.max_min_investment) return false;
    return true;
  });
}

export function getProduct(id: string): Product | undefined {
  const products = loadProducts();
  return products.find((p) => p.id === id);
}

/**
 * Calculates the exact 10-year cumulative cost of fees (entry fee + expense ratio drag)
 * on an initial $10,000 investment.
 *
 * Gross Value: 10,000 * (1 + r)^10
 * Net Starting Capital: 10,000 * (1 - entry_fee)
 * Net Value: Net Starting Capital * (1 + (r - expense_ratio))^10
 * Total Fee Cost: Gross Value - Net Value
 */
export function calculateFeeCost10Y(product: Product, principal = 10000): number {
  const years = 10;
  const grossEnd = principal * Math.pow(1 + product.expected_return, years);
  const netStart = principal * (1 - product.entry_fee);
  const netAnnualReturn = product.expected_return - product.expense_ratio;
  const netEnd = netStart * Math.pow(1 + netAnnualReturn, years);
  const feeCost = grossEnd - netEnd;
  return Math.round(feeCost * 100) / 100;
}

/**
 * Calculates the Sharpe-like ratio: (Expected Return - Risk Free Rate) / Volatility
 * Assumes a baseline risk-free cash rate of 3.5% (0.035).
 */
export function calculateSharpe(product: Product, riskFreeRate = 0.035): number {
  if (product.volatility <= 0) return 0;
  const sharpe = (product.expected_return - riskFreeRate) / product.volatility;
  return Math.round(sharpe * 100) / 100;
}

export function compareProducts(productIds: string[]): ProductComparisonMetric[] {
  const products = productIds
    .map((id) => getProduct(id))
    .filter((p): p is Product => p !== undefined);

  return products.map((p) => {
    const fee_cost_10y_on_10k = calculateFeeCost10Y(p, 10000);
    const sharpe_ratio = calculateSharpe(p);
    const best_year = Math.max(...p.historical_yearly_returns);
    const worst_year = Math.min(...p.historical_yearly_returns);

    return {
      id: p.id,
      name: p.name,
      asset_class: p.asset_class,
      risk_level: p.risk_level,
      expense_ratio: p.expense_ratio,
      expense_ratio_pct: `${(p.expense_ratio * 100).toFixed(2)}%`,
      entry_fee: p.entry_fee,
      entry_fee_pct: `${(p.entry_fee * 100).toFixed(2)}%`,
      min_investment: p.min_investment,
      expected_return: p.expected_return,
      expected_return_pct: `${(p.expected_return * 100).toFixed(1)}%`,
      volatility: p.volatility,
      volatility_pct: `${(p.volatility * 100).toFixed(1)}%`,
      liquidity_days: p.liquidity_days,
      description: p.description,
      fee_cost_10y_on_10k,
      sharpe_ratio,
      best_year,
      best_year_pct: `${best_year >= 0 ? '+' : ''}${(best_year * 100).toFixed(1)}%`,
      worst_year,
      worst_year_pct: `${worst_year >= 0 ? '+' : ''}${(worst_year * 100).toFixed(1)}%`
    };
  });
}
