import { z } from 'zod';

export const RiskQuestionnaireSchema = z.object({
  age_band: z.enum(['18-29', '30-44', '45-59', '60+']),
  horizon: z.enum(['less_than_1_year', '1_to_3_years', '3_to_7_years', '7_plus_years']),
  goal_type: z.enum(['capital_preservation', 'income', 'balanced_growth', 'aggressive_growth']),
  income_stability: z.enum(['unstable', 'somewhat_stable', 'stable_salary', 'highly_secure']),
  emergency_savings: z.enum(['less_than_1', '1_to_3', '3_to_6', '6_plus']),
  existing_debt: z.enum(['high_interest_debt', 'moderate_debt', 'low_or_mortgage_only', 'no_debt']),
  investment_experience: z.enum(['none', 'beginner_cash_deposits', 'moderate_mutual_funds_etfs', 'extensive_stocks_derivatives']),
  reaction_to_drop: z.enum(['sell_all', 'sell_some', 'hold', 'buy_more']),
  loss_tolerance: z.enum(['cannot_tolerate_any_loss', 'max_5_percent', 'max_15_percent', 'max_30_percent_plus']),
  liquidity_needs: z.enum(['high_immediate', 'within_1_year', '2_to_5_years', 'none_locked_in'])
});

export type RiskAnswers = z.infer<typeof RiskQuestionnaireSchema>;

export interface RiskProfile {
  user_id: string;
  level: number; // 1 to 5
  label: 'Conservative' | 'Moderately Conservative' | 'Balanced' | 'Growth' | 'Aggressive';
  capacity: number; // 1 to 5
  tolerance: number; // 1 to 5
  contradictions: string[];
  explanation_facts: string[];
  answered_at: string;
  expires_at: string;
  answers: RiskAnswers;
}

export const RISK_QUESTIONS = [
  {
    id: 'age_band',
    question: 'What is your age bracket?',
    options: [
      { value: '18-29', label: '18–29 years old', points: 4 },
      { value: '30-44', label: '30–44 years old', points: 3 },
      { value: '45-59', label: '45–59 years old', points: 2 },
      { value: '60+', label: '60 years or older', points: 1 }
    ]
  },
  {
    id: 'horizon',
    question: 'What is your expected investment horizon for this goal?',
    options: [
      { value: 'less_than_1_year', label: 'Under 1 year', points: 1 },
      { value: '1_to_3_years', label: '1 to 3 years', points: 2 },
      { value: '3_to_7_years', label: '3 to 7 years', points: 3 },
      { value: '7_plus_years', label: 'Over 7 years', points: 4 }
    ]
  },
  {
    id: 'goal_type',
    question: 'What is your primary financial investment objective?',
    options: [
      { value: 'capital_preservation', label: 'Preserve initial capital with minimal risk', points: 1 },
      { value: 'income', label: 'Generate steady recurring income', points: 2 },
      { value: 'balanced_growth', label: 'Balanced wealth accumulation over medium term', points: 3 },
      { value: 'aggressive_growth', label: 'Maximize long-term capital appreciation', points: 4 }
    ]
  },
  {
    id: 'income_stability',
    question: 'How predictable and secure is your current income source?',
    options: [
      { value: 'unstable', label: 'Irregular or unpredictable freelance/contract', points: 1 },
      { value: 'somewhat_stable', label: 'Moderately steady with occasional fluctuations', points: 2 },
      { value: 'stable_salary', label: 'Reliable fixed salary or established employment', points: 3 },
      { value: 'highly_secure', label: 'Highly secure tenure / government / multi-stream', points: 4 }
    ]
  },
  {
    id: 'emergency_savings',
    question: 'How many months of basic living expenses do you hold in cash/savings?',
    options: [
      { value: 'less_than_1', label: 'Fewer than 1 month', points: 1 },
      { value: '1_to_3', label: '1 to 3 months', points: 2 },
      { value: '3_to_6', label: '3 to 6 months', points: 3 },
      { value: '6_plus', label: '6 months or more', points: 4 }
    ]
  },
  {
    id: 'existing_debt',
    question: 'What is the state of your current personal debt obligations?',
    options: [
      { value: 'high_interest_debt', label: 'Significant high-interest debt (e.g. credit card)', points: 1 },
      { value: 'moderate_debt', label: 'Moderate personal or student loan balances', points: 2 },
      { value: 'low_or_mortgage_only', label: 'Low manageable debt or mortgage only', points: 3 },
      { value: 'no_debt', label: 'Completely debt-free', points: 4 }
    ]
  },
  {
    id: 'investment_experience',
    question: 'What is your prior experience with financial investment markets?',
    options: [
      { value: 'none', label: 'No prior investing experience', points: 1 },
      { value: 'beginner_cash_deposits', label: 'Bank deposits and certificates only', points: 2 },
      { value: 'moderate_mutual_funds_etfs', label: 'Broad mutual funds, index ETFs, or pension funds', points: 3 },
      { value: 'extensive_stocks_derivatives', label: 'Active equities, options, or volatile assets', points: 4 }
    ]
  },
  {
    id: 'reaction_to_drop',
    question: 'If your investment portfolio drops 20% in a month due to market volatility, you would:',
    options: [
      { value: 'sell_all', label: 'Sell everything immediately to stop further losses', points: 1 },
      { value: 'sell_some', label: 'Sell a portion to reduce risk exposure', points: 2 },
      { value: 'hold', label: 'Hold steady and wait for market recovery', points: 3 },
      { value: 'buy_more', label: 'Treat it as a discount buying opportunity and buy more', points: 4 }
    ]
  },
  {
    id: 'loss_tolerance',
    question: 'What is the maximum temporary drawdown you can accept in a 1-year period?',
    options: [
      { value: 'cannot_tolerate_any_loss', label: '0% — cannot afford to lose any principal', points: 1 },
      { value: 'max_5_percent', label: 'Up to 5% temporary loss', points: 2 },
      { value: 'max_15_percent', label: 'Up to 15% temporary loss', points: 3 },
      { value: 'max_30_percent_plus', label: '30% or greater drawdown acceptable for high return', points: 4 }
    ]
  },
  {
    id: 'liquidity_needs',
    question: 'When might you need to withdraw a substantial portion of these funds?',
    options: [
      { value: 'high_immediate', label: 'Immediately or within weeks', points: 1 },
      { value: 'within_1_year', label: 'Within the next 12 months', points: 2 },
      { value: '2_to_5_years', label: 'In 2 to 5 years', points: 3 },
      { value: 'none_locked_in', label: 'Not for at least 5 to 7+ years', points: 4 }
    ]
  }
];

export const RISK_LABELS: Record<number, 'Conservative' | 'Moderately Conservative' | 'Balanced' | 'Growth' | 'Aggressive'> = {
  1: 'Conservative',
  2: 'Moderately Conservative',
  3: 'Balanced',
  4: 'Growth',
  5: 'Aggressive'
};

export function scoreRiskQuestionnaire(userId: string, answers: RiskAnswers, answeredDate = new Date()): RiskProfile {
  // Validate schema
  const validAnswers = RiskQuestionnaireSchema.parse(answers);

  // 1. CAPACITY (Objective financial ability to bear loss)
  // Factors: age_band, horizon, income_stability, emergency_savings, existing_debt, liquidity_needs
  const capacityWeights: Record<string, Record<string, number>> = {
    age_band: { '18-29': 4, '30-44': 3, '45-59': 2, '60+': 1 },
    horizon: { less_than_1_year: 1, '1_to_3_years': 2, '3_to_7_years': 3, '7_plus_years': 4 },
    income_stability: { unstable: 1, somewhat_stable: 2, stable_salary: 3, highly_secure: 4 },
    emergency_savings: { less_than_1: 1, '1_to_3': 2, '3_to_6': 3, '6_plus': 4 },
    existing_debt: { high_interest_debt: 1, moderate_debt: 2, low_or_mortgage_only: 3, no_debt: 4 },
    liquidity_needs: { high_immediate: 1, within_1_year: 2, '2_to_5_years': 3, none_locked_in: 4 }
  };

  const capacityPoints =
    capacityWeights.age_band[validAnswers.age_band] +
    capacityWeights.horizon[validAnswers.horizon] +
    capacityWeights.income_stability[validAnswers.income_stability] +
    capacityWeights.emergency_savings[validAnswers.emergency_savings] +
    capacityWeights.existing_debt[validAnswers.existing_debt] +
    capacityWeights.liquidity_needs[validAnswers.liquidity_needs];
  // capacityPoints range: 6 to 24

  let capacity = 1;
  if (capacityPoints <= 9) capacity = 1;
  else if (capacityPoints <= 13) capacity = 2;
  else if (capacityPoints <= 17) capacity = 3;
  else if (capacityPoints <= 21) capacity = 4;
  else capacity = 5;

  // 2. TOLERANCE (Subjective willingness and psychological attitude toward risk)
  // Factors: goal_type, investment_experience, reaction_to_drop, loss_tolerance
  const toleranceWeights: Record<string, Record<string, number>> = {
    goal_type: { capital_preservation: 1, income: 2, balanced_growth: 3, aggressive_growth: 4 },
    investment_experience: { none: 1, beginner_cash_deposits: 2, moderate_mutual_funds_etfs: 3, extensive_stocks_derivatives: 4 },
    reaction_to_drop: { sell_all: 1, sell_some: 2, hold: 3, buy_more: 4 },
    loss_tolerance: { cannot_tolerate_any_loss: 1, max_5_percent: 2, max_15_percent: 3, max_30_percent_plus: 4 }
  };

  const tolerancePoints =
    toleranceWeights.goal_type[validAnswers.goal_type] +
    toleranceWeights.investment_experience[validAnswers.investment_experience] +
    toleranceWeights.reaction_to_drop[validAnswers.reaction_to_drop] +
    toleranceWeights.loss_tolerance[validAnswers.loss_tolerance];
  // tolerancePoints range: 4 to 16

  let tolerance = 1;
  if (tolerancePoints <= 6) tolerance = 1;
  else if (tolerancePoints <= 9) tolerance = 2;
  else if (tolerancePoints <= 12) tolerance = 3;
  else if (tolerancePoints <= 14) tolerance = 4;
  else tolerance = 5;

  // Standard regulatory suitability rule:
  // Final risk level 1-5 = min(capacity, tolerance).
  // An investor's risk level must NEVER exceed their objective capacity to bear losses,
  // even if their psychological risk appetite is high. Similarly, if an investor cannot
  // stomach market swings emotionally, they should not take high risk even if they have substantial financial capacity.
  const level = Math.min(capacity, tolerance);
  const label = RISK_LABELS[level];

  // 3. CONTRADICTION DETECTION
  const contradictions: string[] = [];

  if (validAnswers.reaction_to_drop === 'buy_more' && validAnswers.loss_tolerance === 'cannot_tolerate_any_loss') {
    contradictions.push("Contradiction: Client stated they would 'buy more in a 20% drop' yet selected 'cannot tolerate any loss'.");
  }

  if (validAnswers.goal_type === 'aggressive_growth' && validAnswers.loss_tolerance === 'cannot_tolerate_any_loss') {
    contradictions.push("Contradiction: Desires aggressive growth while demanding zero capital loss.");
  }

  if (validAnswers.horizon === 'less_than_1_year' && (validAnswers.reaction_to_drop === 'buy_more' || validAnswers.goal_type === 'aggressive_growth')) {
    contradictions.push("Contradiction: Ultra short-term horizon (<1 year) paired with aggressive long-term growth attitude.");
  }

  if (validAnswers.emergency_savings === 'less_than_1' && (validAnswers.loss_tolerance === 'max_30_percent_plus' || validAnswers.goal_type === 'aggressive_growth')) {
    contradictions.push("Contradiction: Low emergency reserves (<1 month) paired with high risk tolerance.");
  }

  // 4. EXPLANATION FACTS FOR LLM (deterministic ground truth)
  const explanation_facts: string[] = [
    `Assigned risk level ${level}/5 (${label}) based on conservative suitability gate: min(capacity: ${capacity}, tolerance: ${tolerance}).`,
    `Financial capacity evaluated at ${capacity}/5 reflecting ${validAnswers.horizon.replace(/_/g, ' ')} horizon and ${validAnswers.emergency_savings.replace(/_/g, ' ')} months emergency savings.`,
    `Psychological risk tolerance evaluated at ${tolerance}/5 with reaction to market drawdown: '${validAnswers.reaction_to_drop.replace(/_/g, ' ')}'.`,
    `Emergency cash reserves: ${validAnswers.emergency_savings.replace(/_/g, ' ')} months of living expenses.`
  ];

  if (capacity < tolerance) {
    explanation_facts.push(`Risk level capped by financial capacity (${capacity}) despite higher tolerance (${tolerance}) for prudential investor protection.`);
  }

  const answered_at = answeredDate.toISOString();
  const expiresDate = new Date(answeredDate);
  expiresDate.setFullYear(expiresDate.getFullYear() + 1); // 12 months expiration
  const expires_at = expiresDate.toISOString();

  return {
    user_id: userId,
    level,
    label,
    capacity,
    tolerance,
    contradictions,
    explanation_facts,
    answered_at,
    expires_at,
    answers: validAnswers
  };
}
