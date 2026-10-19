export interface RiskQuestionOption {
  value: string;
  label: string;
  points: number;
}

export interface RiskQuestion {
  id: string;
  question: string;
  options: RiskQuestionOption[];
}

export interface RiskProfile {
  user_id: string;
  level: number;
  label: string;
  capacity: number;
  tolerance: number;
  contradictions: string[];
  explanation_facts: string[];
  answered_at: string;
  expires_at: string;
  answers: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  asset_class: 'cash' | 'bonds' | 'equity' | 'balanced' | 'real_assets';
  risk_level: number;
  expense_ratio: number;
  entry_fee: number;
  min_investment: number;
  expected_return: number;
  volatility: number;
  liquidity_days: number;
  historical_yearly_returns: number[];
  description: string;
}

export interface ProductComparison {
  id: string;
  name: string;
  asset_class: string;
  risk_level: number;
  expense_ratio_pct: string;
  entry_fee_pct: string;
  min_investment: number;
  expected_return_pct: string;
  volatility_pct: string;
  liquidity_days: number;
  description: string;
  fee_cost_10y_on_10k: number;
  sharpe_ratio: number;
  best_year_pct: string;
  worst_year_pct: string;
}

export interface PlanAllocation {
  assetClass: string;
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
  goal: { name: string; targetAmount: number; years: number };
  allocations: PlanAllocation[];
  targetWeights: Record<string, number>;
  expectedReturn: number;
  portfolioVolatility: number;
  glidePathApplied: boolean;
  notes: string[];
}

export interface YearlyPercentile {
  year: number;
  p10: number;
  p50: number;
  p90: number;
  targetLine: number;
}

export interface SimulationResult {
  seed: number;
  totalPaths: number;
  years: number;
  initialAmount: number;
  monthlyContribution: number;
  targetAmount: number;
  probabilityOfSuccess: number;
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

export interface HoldingView {
  productId: string;
  productName: string;
  assetClass: string;
  riskLevel: number;
  units: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: string;
}

export interface PortfolioView {
  userId: string;
  cash: number;
  holdings: HoldingView[];
  totalHoldingsValue: number;
  totalPortfolioValue: number;
  currentDay: number;
  marketScenario: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  productId: string;
  productName?: string;
  side: 'BUY' | 'SELL';
  amount: number;
  units: number;
  price: number;
  fee: number;
  status: 'pending_approval' | 'queued' | 'settled' | 'rejected' | 'cancelled';
  executionDay: number;
  settlementDay: number;
  createdAt: string;
}

export interface InvestmentMandate {
  userId: string;
  maxPerOrder: number;
  maxPerMonth: number;
  allowedProducts: string[];
  autoRebalance: boolean;
  driftThreshold: number;
  quietHoursStart: number;
  quietHoursEnd: number;
  signedHash: string;
  signedAt: string;
}

export interface ProposalRecord {
  id: string;
  userId: string;
  action: string;
  proposalData: Record<string, any>;
  proposalHash: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  expiresAt: number;
}

export interface AuditRecord {
  seq: number;
  ts: string;
  actor: 'user' | 'agent' | 'system';
  action: string;
  tier: 'L0' | 'L1' | 'L2' | 'L3';
  decision: 'ALLOW' | 'NEEDS_APPROVAL' | 'DENIED' | 'EXECUTED' | 'BLOCKED';
  rule_ids: string[];
  payload: Record<string, any>;
  prev_hash: string;
  hash: string;
}

export interface AgentChatResponse {
  reply: string;
  toolCalls: Array<{
    name: string;
    auth: { decision: string; tier: string; ruleIds: string[]; reason: string };
    result: any;
  }>;
  pendingApprovals: ProposalRecord[];
  mode: 'llm' | 'offline';
}

const API_BASE = '';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    }
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errObj = await res.json();
      errMsg = errObj.error || errMsg;
    } catch (e) {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Health
  getHealth: () => fetchJson<{ status: string; mode: string; model: string }>('/health'),

  // Risk & Profile
  getQuestions: () => fetchJson<{ questions: RiskQuestion[] }>('/profile/questions'),
  getProfile: (userId: string) => fetchJson<RiskProfile>(`/profile/${userId}`),
  submitProfile: (userId: string, answers: Record<string, string>) =>
    fetchJson<RiskProfile>('/profile', {
      method: 'POST',
      body: JSON.stringify({ userId, answers })
    }),

  // Products
  getProducts: (params?: { asset_class?: string; max_risk_level?: number }) => {
    const query = new URLSearchParams();
    if (params?.asset_class) query.set('asset_class', params.asset_class);
    if (params?.max_risk_level) query.set('max_risk_level', String(params.max_risk_level));
    return fetchJson<{ products: Product[]; count: number }>(`/products?${query.toString()}`);
  },
  getProduct: (id: string) => fetchJson<Product>(`/products/${id}`),
  compareProducts: (ids: string[]) =>
    fetchJson<{ comparison: ProductComparison[] }>('/products/compare', {
      method: 'POST',
      body: JSON.stringify({ ids })
    }),

  // Planning & Simulation
  buildPlan: (userId: string, goal: { name: string; targetAmount: number; years: number }) =>
    fetchJson<InvestmentPlan>('/plan', {
      method: 'POST',
      body: JSON.stringify({ userId, goal })
    }),
  simulateGoal: (
    plan: InvestmentPlan,
    initial: number,
    monthlyContribution: number,
    years: number,
    target: number,
    seed = 42
  ) =>
    fetchJson<SimulationResult>('/plan/simulate', {
      method: 'POST',
      body: JSON.stringify({ plan, initial, monthlyContribution, years, target, seed })
    }),

  // Portfolio & Sandbox
  getPortfolio: (userId: string) => fetchJson<PortfolioView>(`/portfolio/${userId}`),
  getOrders: (userId: string) => fetchJson<{ orders: OrderRecord[] }>(`/orders/${userId}`),
  advanceClock: (days: number) =>
    fetchJson<{ clock: { currentDay: number; marketScenario: string }; settledCount: number }>(
      '/sandbox/advance',
      {
        method: 'POST',
        body: JSON.stringify({ days })
      }
    ),
  setScenario: (scenario: 'normal' | 'crash' | 'rally') =>
    fetchJson<{ clock: { currentDay: number; marketScenario: string } }>('/sandbox/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario })
    }),
  resetSandbox: () =>
    fetchJson<{ status: string; message: string }>('/sandbox/reset', {
      method: 'POST',
      body: JSON.stringify({})
    }),

  // Mandate
  getMandate: async (userId: string): Promise<InvestmentMandate | null> => {
    try {
      // Mandates can be retrieved or simulated
      const res = await fetchJson<InvestmentMandate>(`/mandates/${userId}`).catch(() => null);
      return res;
    } catch {
      return null;
    }
  },

  // Agent Chat & Approvals
  chat: (userId: string, sessionId: string, message: string) =>
    fetchJson<AgentChatResponse>('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ userId, sessionId, message })
    }),
  uploadFactsheet: (userId: string, text: string, filename?: string) =>
    fetchJson<{ filename: string; detected: boolean; patterns: string[]; analysis: string }>(
      '/agent/factsheet',
      {
        method: 'POST',
        body: JSON.stringify({ userId, text, filename })
      }
    ),
  approveProposal: (proposalId: string, typedAmount: number, pin: string) =>
    fetchJson<{ success: boolean; message: string; order?: OrderRecord }>('/agent/approve', {
      method: 'POST',
      body: JSON.stringify({ proposalId, typedAmount, pin })
    }),

  // Security & Red Team Suite
  getRedTeamCases: () =>
    fetchJson<{ cases: RedTeamCase[]; total: number; coverage: string }>('/security/redteam'),
  runRedTeamCase: (testId?: number, runAll = false) =>
    fetchJson<{
      allPassed?: boolean;
      passedCount?: number;
      totalCount?: number;
      results?: Array<RedTeamCase & { passed: boolean; durationMs: number; interceptedRule: string; details: string }>;
      passed?: boolean;
      durationMs?: number;
      interceptedRule?: string;
      details?: string;
    }>('/security/redteam/run', {
      method: 'POST',
      body: JSON.stringify({ testId, runAll })
    }),
  getSuitabilityMatrix: (userId: string) =>
    fetchJson<{ userId: string; userRiskLevel: number | null; matrix: SuitabilityMatrixRow[] }>(
      `/security/matrix/${userId}`
    ),
  scanSecurityPayload: (text: string, userId?: string) =>
    fetchJson<{ detected: boolean; patternIds: string[]; quarantinedText: string }>('/security/scan', {
      method: 'POST',
      body: JSON.stringify({ text, userId })
    }),

  // Audit
  getAuditEvents: (userId?: string, limit = 200) => {
    const url = userId ? `/audit/${userId}?limit=${limit}` : `/audit?limit=${limit}`;
    return fetchJson<{ events: AuditRecord[]; count: number }>(url);
  },
  verifyAuditChain: () =>
    fetchJson<{ valid: boolean; totalEvents: number; brokenAt?: number; reason?: string }>('/audit/verify'),
  exportAuditUrl: () => `${API_BASE}/audit/export`
};

export interface RedTeamCase {
  id: number;
  title: string;
  category: string;
  stride: string;
  description: string;
  expectedDefense: string;
  targetRule: string;
  passed?: boolean;
  durationMs?: number;
  interceptedRule?: string;
  details?: string;
}

export interface SuitabilityMatrixRow {
  id: string;
  name: string;
  assetClass: string;
  riskLevel: number;
  minInvestment: number;
  terBps: number;
  overallAllowed: boolean;
  reasons: string[];
  warnings: string[];
  rules: {
    S1: { name: string; allowed: boolean; note: string };
    S2: { name: string; allowed: boolean; note: string };
    S3: { name: string; allowed: boolean; note: string };
    S4: { name: string; allowed: boolean; note: string };
    S5: { name: string; allowed: boolean; note: string };
    S6: { name: string; allowed: boolean; note: string };
    S7: { name: string; allowed: boolean; note: string };
  };
}

