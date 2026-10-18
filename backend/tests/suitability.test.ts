import { describe, it, expect } from 'vitest';
import { checkSuitability } from '../src/domain/suitability';
import { scoreRiskQuestionnaire, RiskAnswers } from '../src/domain/risk';
import { getProduct } from '../src/domain/catalog';

describe('Domain: Suitability Gate Rules (S1 - S7)', () => {
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

  it('S1: should BLOCK if product risk level exceeds client risk level', () => {
    // Priya is Level 3 (Balanced)
    // Product lev-3x-12 has risk level 5
    const leveragedFund = getProduct('lev-3x-12')!;
    const res = checkSuitability(priyaProfile, leveragedFund, 3000);

    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S1');
    expect(res.reasons[0]).toContain('exceeds client\'s approved risk level');
  });

  it('S2: should BLOCK if profile is missing', () => {
    const balancedFund = getProduct('fund-balanced-05')!;
    const res = checkSuitability(null, balancedFund, 1000);

    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S2');
    expect(res.reasons[0]).toContain('User risk profile is missing');
  });

  it('S2: should BLOCK if profile has expired (>12 months)', () => {
    const balancedFund = getProduct('fund-balanced-05')!;
    // Evaluate 2 years into the future
    const futureDate = new Date('2028-05-01');
    const res = checkSuitability(priyaProfile, balancedFund, 1000, undefined, futureDate);

    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S2');
    expect(res.reasons[0]).toContain('expired');
  });

  it('S3: should BLOCK if profile has unresolved contradictions', () => {
    const contradictoryAnswers: RiskAnswers = {
      ...priyaAnswers,
      reaction_to_drop: 'buy_more',
      loss_tolerance: 'cannot_tolerate_any_loss'
    };
    const contraProfile = scoreRiskQuestionnaire('contra_user', contradictoryAnswers);
    const balancedFund = getProduct('fund-balanced-05')!;

    const res = checkSuitability(contraProfile, balancedFund, 1000);
    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S3');
    expect(res.reasons[0]).toContain('Unresolved contradictions');
  });

  it('S4: should BLOCK if emergency savings is insufficient (<3 months)', () => {
    const lowSavingsAnswers: RiskAnswers = {
      ...priyaAnswers,
      emergency_savings: 'less_than_1'
    };
    const lowSavingsProfile = scoreRiskQuestionnaire('low_savings', lowSavingsAnswers);
    const mmf = getProduct('mmf-cash-01')!;

    const res = checkSuitability(lowSavingsProfile, mmf, 500);
    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S4');
    expect(res.reasons[0]).toContain('less than 1 months of emergency savings');
  });

  it('S4: should BLOCK if trade leaves less than 3 months expense buffer in portfolio cash', () => {
    const balancedFund = getProduct('fund-balanced-05')!;
    const portfolio = {
      cash: 5000,
      totalHoldingsValue: 0,
      monthlyExpenses: 1500 // 3 months = $4500
    };
    // Attempting to invest $1000 leaves $4000 cash, below $4500 required buffer
    const res = checkSuitability(priyaProfile, balancedFund, 1000, portfolio);
    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S4');
    expect(res.reasons[0]).toContain('mandatory 3-month expense reserve');
  });

  it('S5: should BLOCK if concentrated asset exceeds 40% of portfolio', () => {
    // eq-tech-11 is a concentrated sector tech fund (non-diversified index)
    const techFund = getProduct('eq-tech-11')!;
    const portfolio = {
      cash: 10000,
      totalHoldingsValue: 0,
      productHoldingsValue: {}
    };
    // $5,000 in tech fund = 50% of $10,000 portfolio -> > 40%
    // Note Priya is Level 3 and Tech fund is Level 4 so test with a Level 4 user for S5 test
    const growthAnswers: RiskAnswers = {
      ...priyaAnswers,
      horizon: '7_plus_years',
      goal_type: 'aggressive_growth',
      reaction_to_drop: 'hold',
      investment_experience: 'moderate_mutual_funds_etfs'
    };
    const growthProfile = scoreRiskQuestionnaire('growth_user', growthAnswers);
    expect(growthProfile.level).toBe(4);

    const res = checkSuitability(growthProfile, techFund, 5000, portfolio);
    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S5');
    expect(res.reasons[0]).toContain('violating the 40% concentration ceiling');
  });

  it('S5: should ALLOW diversified index/balanced funds to exceed 40%', () => {
    const balancedFund = getProduct('fund-balanced-05')!;
    const portfolio = {
      cash: 10000,
      totalHoldingsValue: 0,
      productHoldingsValue: {}
    };
    // $8,000 in balanced fund = 80% of portfolio, but permitted because it is a diversified fund
    const res = checkSuitability(priyaProfile, balancedFund, 8000, portfolio);
    expect(res.allowed).toBe(true);
  });

  it('S6: should emit a WARNING if liquidity days exceeds stated liquidity need', () => {
    // Client wants high immediate liquidity (1 day)
    const immediateAnswers: RiskAnswers = {
      ...priyaAnswers,
      liquidity_needs: 'high_immediate'
    };
    const immediateProfile = scoreRiskQuestionnaire('immediate_user', immediateAnswers);
    // reit-global-08 has liquidity_days: 3 (> 1 day)
    const reitFund = getProduct('reit-global-08')!;

    const res = checkSuitability(immediateProfile, reitFund, 500);
    expect(res.warnings.length).toBeGreaterThan(0);
    expect(res.rule_ids).toContain('S6');
    expect(res.warnings[0]).toContain('settlement (3 days)');
  });

  it('S7: should BLOCK if order amount is below minimum investment', () => {
    const balancedFund = getProduct('fund-balanced-05')!; // min investment is $500
    const res = checkSuitability(priyaProfile, balancedFund, 200);

    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S7');
    expect(res.reasons[0]).toContain('below the minimum required investment');
  });

  it('CRITICAL: Leveraged Fund (Risk 5) is strictly BLOCKED for Priya under all circumstances', () => {
    const leveragedFund = getProduct('lev-3x-12')!;
    const res = checkSuitability(priyaProfile, leveragedFund, 5000);
    expect(res.allowed).toBe(false);
    expect(res.rule_ids).toContain('S1');
  });
});
