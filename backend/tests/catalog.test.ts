import { describe, it, expect } from 'vitest';
import {
  loadProducts,
  listProducts,
  getProduct,
  calculateFeeCost10Y,
  calculateSharpe,
  compareProducts
} from '../src/domain/catalog';

describe('Domain: Product Catalog and Deterministic Metrics', () => {
  it('should load 12 simulated products', () => {
    const products = loadProducts();
    expect(products.length).toBe(12);
  });

  it('should filter products by risk level and asset class', () => {
    const safeCash = listProducts({ asset_class: 'cash', max_risk_level: 1 });
    expect(safeCash.length).toBeGreaterThan(0);
    expect(safeCash.every((p) => p.asset_class === 'cash' && p.risk_level <= 1)).toBe(true);

    const equities = listProducts({ asset_class: 'equity' });
    expect(equities.length).toBeGreaterThanOrEqual(4);
  });

  it('should retrieve a specific product by ID', () => {
    const p = getProduct('fund-balanced-05');
    expect(p).toBeDefined();
    expect(p?.name).toContain('Balanced 60/40');
    expect(p?.risk_level).toBe(3);
  });

  it('should compute exact 10-year fee cost on $10,000 investment', () => {
    const p = getProduct('fund-balanced-05')!;
    // Balanced: expected_return 0.075, expense_ratio 0.0030, entry_fee 0.0
    // Gross: 10000 * (1 + 0.075)^10 = 10000 * 2.061031562... = 20610.32
    // Net: 10000 * (1 + 0.072)^10 = 10000 * 2.004231379... = 20042.31
    // Difference: ~568.01
    const cost = calculateFeeCost10Y(p, 10000);
    expect(cost).toBeCloseTo(568.01, 1);

    // Product with entry fee: bond-corp-04 (entry_fee 0.001 = $10)
    const corpBond = getProduct('bond-corp-04')!;
    const corpCost = calculateFeeCost10Y(corpBond, 10000);
    expect(corpCost).toBeGreaterThan(0);
  });

  it('should compute Sharpe ratio deterministically', () => {
    const p = getProduct('eq-domestic-07')!;
    // return = 0.092, rf = 0.035, vol = 0.155 => (0.092 - 0.035) / 0.155 = 0.057 / 0.155 = 0.3677 => 0.37
    const sharpe = calculateSharpe(p, 0.035);
    expect(sharpe).toBe(0.37);
  });

  it('should return identical comparison metrics for the same inputs', () => {
    const ids = ['fund-balanced-05', 'eq-global-06', 'lev-3x-12'];
    const comp1 = compareProducts(ids);
    const comp2 = compareProducts(ids);

    expect(comp1).toEqual(comp2);
    expect(comp1).toHaveLength(3);
    expect(comp1[0].fee_cost_10y_on_10k).toBeGreaterThan(0);
    expect(comp1[2].risk_level).toBe(5); // Leveraged fund
  });
});
