import { describe, it, expect, beforeEach } from 'vitest';
import { scoreRiskQuestionnaire, RiskAnswers } from '../src/domain/risk';
import { getDb, closeDb } from '../src/db';

describe('Domain: Risk Profiling Engine', () => {
  // Priya: 24, first job, saving for home deposit in 6 years, moderate emergency savings
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

  it("should score Priya's profile as Level 3 (Balanced)", () => {
    const profile = scoreRiskQuestionnaire('priya', priyaAnswers);
    expect(profile.level).toBe(3);
    expect(profile.label).toBe('Balanced');
    expect(profile.contradictions).toHaveLength(0);
    expect(profile.explanation_facts.length).toBeGreaterThan(0);
  });

  it('should score Very Conservative persona as Level 1', () => {
    const conservativeAnswers: RiskAnswers = {
      age_band: '60+',
      horizon: 'less_than_1_year',
      goal_type: 'capital_preservation',
      income_stability: 'unstable',
      emergency_savings: 'less_than_1',
      existing_debt: 'high_interest_debt',
      investment_experience: 'none',
      reaction_to_drop: 'sell_all',
      loss_tolerance: 'cannot_tolerate_any_loss',
      liquidity_needs: 'high_immediate'
    };
    const profile = scoreRiskQuestionnaire('user_c1', conservativeAnswers);
    expect(profile.level).toBe(1);
    expect(profile.label).toBe('Conservative');
  });

  it('should score Moderately Conservative persona as Level 2', () => {
    const modConservativeAnswers: RiskAnswers = {
      age_band: '45-59',
      horizon: '1_to_3_years',
      goal_type: 'income',
      income_stability: 'somewhat_stable',
      emergency_savings: '1_to_3',
      existing_debt: 'moderate_debt',
      investment_experience: 'beginner_cash_deposits',
      reaction_to_drop: 'sell_some',
      loss_tolerance: 'max_5_percent',
      liquidity_needs: 'within_1_year'
    };
    const profile = scoreRiskQuestionnaire('user_c2', modConservativeAnswers);
    expect(profile.level).toBe(2);
    expect(profile.label).toBe('Moderately Conservative');
  });

  it('should score Growth persona as Level 4', () => {
    const growthAnswers: RiskAnswers = {
      age_band: '30-44',
      horizon: '7_plus_years',
      goal_type: 'aggressive_growth',
      income_stability: 'stable_salary',
      emergency_savings: '3_to_6',
      existing_debt: 'no_debt',
      investment_experience: 'moderate_mutual_funds_etfs',
      reaction_to_drop: 'hold',
      loss_tolerance: 'max_15_percent',
      liquidity_needs: 'none_locked_in'
    };
    const profile = scoreRiskQuestionnaire('user_c4', growthAnswers);
    expect(profile.level).toBe(4);
    expect(profile.label).toBe('Growth');
  });

  it('should score Aggressive persona as Level 5', () => {
    const aggressiveAnswers: RiskAnswers = {
      age_band: '18-29',
      horizon: '7_plus_years',
      goal_type: 'aggressive_growth',
      income_stability: 'highly_secure',
      emergency_savings: '6_plus',
      existing_debt: 'no_debt',
      investment_experience: 'extensive_stocks_derivatives',
      reaction_to_drop: 'buy_more',
      loss_tolerance: 'max_30_percent_plus',
      liquidity_needs: 'none_locked_in'
    };
    const profile = scoreRiskQuestionnaire('user_c5', aggressiveAnswers);
    expect(profile.level).toBe(5);
    expect(profile.label).toBe('Aggressive');
  });

  it('should cap overall level by Capacity when Tolerance is higher', () => {
    // High subjective appetite but low objective capacity
    const answers: RiskAnswers = {
      age_band: '60+',
      horizon: 'less_than_1_year', // Capacity drag
      goal_type: 'aggressive_growth',
      income_stability: 'unstable', // Capacity drag
      emergency_savings: 'less_than_1', // Capacity drag
      existing_debt: 'high_interest_debt', // Capacity drag
      investment_experience: 'extensive_stocks_derivatives', // Tolerance high
      reaction_to_drop: 'buy_more', // Tolerance high
      loss_tolerance: 'max_30_percent_plus', // Tolerance high
      liquidity_needs: 'high_immediate'
    };
    const profile = scoreRiskQuestionnaire('user_gap', answers);
    expect(profile.capacity).toBe(1);
    expect(profile.tolerance).toBeGreaterThanOrEqual(4);
    expect(profile.level).toBe(1); // Capped by capacity
  });

  it('should detect contradictions between behavior and loss tolerance', () => {
    const contradictoryAnswers: RiskAnswers = {
      ...priyaAnswers,
      reaction_to_drop: 'buy_more',
      loss_tolerance: 'cannot_tolerate_any_loss'
    };
    const profile = scoreRiskQuestionnaire('user_contra', contradictoryAnswers);
    expect(profile.contradictions.length).toBeGreaterThan(0);
    expect(profile.contradictions[0]).toContain('buy more in a 20% drop');
  });

  it('should calculate 12-month expiration date', () => {
    const now = new Date('2026-10-19T00:00:00Z');
    const profile = scoreRiskQuestionnaire('priya', priyaAnswers, now);
    expect(profile.answered_at).toBe('2026-10-19T00:00:00.000Z');
    expect(profile.expires_at).toBe('2027-10-19T00:00:00.000Z');
  });
});
