import { getDb, DB } from '../db';
import { RISK_QUESTIONS, RiskProfile } from '../domain/risk';
import { listProducts, getProduct, compareProducts, Product } from '../domain/catalog';
import { checkSuitability } from '../domain/suitability';
import { buildPlan, rebalanceOrders, Goal } from '../domain/allocation';
import { simulateGoal } from '../domain/projection';
import { getPortfolioView, placeOrder, getUserOrders } from '../sandbox/broker';
import { getClockState } from '../sandbox/clock';
import { authorize, AuthorizeResult } from '../security/permissions';
import { logAuditEvent } from '../security/audit';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    name: 'get_profile',
    description: 'Retrieve the user risk profile, assigned risk level (1-5), capacity, tolerance, and suitability facts.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User identifier' }
      },
      required: ['userId']
    }
  },
  {
    name: 'start_risk_questionnaire',
    description: 'Retrieve the 10-question risk questionnaire for user profiling.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_portfolio',
    description: 'Retrieve the current simulated cash balance, asset holdings, market valuations, and unrealized P&L.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User identifier' }
      },
      required: ['userId']
    }
  },
  {
    name: 'list_products',
    description: 'List all available simulated investment products with filters for asset class and maximum risk level.',
    parameters: {
      type: 'object',
      properties: {
        assetClass: { type: 'string', enum: ['cash', 'bonds', 'equity', 'balanced', 'real_assets'] },
        maxRiskLevel: { type: 'number', minimum: 1, maximum: 5 }
      }
    }
  },
  {
    name: 'compare_products',
    description: 'Compute side-by-side comparison of 2 or 3 products, including 10-year fee drag on $10k, Sharpe ratio, and best/worst years.',
    parameters: {
      type: 'object',
      properties: {
        productIds: { type: 'array', items: { type: 'string' }, description: 'Array of product IDs to compare' }
      },
      required: ['productIds']
    }
  },
  {
    name: 'check_suitability',
    description: 'Evaluate suitability gate rules S1-S7 for a proposed product and amount against client profile.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        productId: { type: 'string' },
        amount: { type: 'number' }
      },
      required: ['userId', 'productId', 'amount']
    }
  },
  {
    name: 'build_plan',
    description: 'Generate an optimal asset allocation plan and glide path matching the user risk level and investment goal.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        goalName: { type: 'string' },
        targetAmount: { type: 'number' },
        years: { type: 'number' }
      },
      required: ['userId', 'targetAmount', 'years']
    }
  },
  {
    name: 'simulate_goal',
    description: 'Run 5,000 Monte Carlo paths to project goal achievement probability, percentile wealth paths (P10/P50/P90), and required monthly savings.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        initialAmount: { type: 'number' },
        monthlyContribution: { type: 'number' },
        years: { type: 'number' },
        targetAmount: { type: 'number' }
      },
      required: ['userId', 'initialAmount', 'years', 'targetAmount']
    }
  },
  {
    name: 'propose_rebalance',
    description: 'Analyze current portfolio drift against model target weights and calculate orders to rebalance.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        driftThreshold: { type: 'number', default: 0.05 }
      },
      required: ['userId']
    }
  },
  {
    name: 'place_order',
    description: 'Place a simulated order (BUY or SELL). Automatically authorized if within L2 mandate; queues L3 proposal if limits are exceeded.',
    parameters: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        productId: { type: 'string' },
        side: { type: 'string', enum: ['BUY', 'SELL'] },
        amount: { type: 'number' },
        idempotencyKey: { type: 'string' }
      },
      required: ['userId', 'productId', 'side', 'amount']
    }
  },
  {
    name: 'explain_decision',
    description: 'Provide an audit explanation of any policy gate decision, rule ID, or suitability evaluation.',
    parameters: {
      type: 'object',
      properties: {
        ruleId: { type: 'string' }
      },
      required: ['ruleId']
    }
  }
];

export interface ToolExecutionResponse {
  name: string;
  auth: AuthorizeResult;
  result: Record<string, any>;
}

export async function executeToolCall(
  name: string,
  args: Record<string, any>,
  userId: string,
  customDb?: DB
): Promise<ToolExecutionResponse> {
  const db = customDb || getDb();

  // 1. ALL TOOL EXECUTIONS MUST PASS POLICY AUTHORIZE()
  const auth = authorize(name, args, userId, 'agent', db);

  logAuditEvent({
    actor: 'agent',
    action: `TOOL_CALL_${name.toUpperCase()}`,
    tier: auth.tier,
    decision: auth.decision,
    rule_ids: auth.ruleIds,
    payload: { tool: name, args, authReason: auth.reason },
    customDb: db
  });

  if (auth.decision === 'DENIED') {
    return {
      name,
      auth,
      result: {
        status: 'DENIED',
        tier: auth.tier,
        reason: auth.reason,
        ruleIds: auth.ruleIds
      }
    };
  }

  if (auth.decision === 'NEEDS_APPROVAL') {
    return {
      name,
      auth,
      result: {
        status: 'NEEDS_APPROVAL',
        tier: auth.tier,
        reason: auth.reason,
        proposal: auth.proposal,
        instruction: 'This action exceeds automated mandate limits. The user must approve it in the Approvals interface with their 6-digit PIN.'
      }
    };
  }

  // ALLOWED EXECUTION
  switch (name) {
    case 'get_profile': {
      const row = db.prepare('SELECT * FROM risk_profiles WHERE user_id = ?').get(userId) as any;
      if (!row) {
        return { name, auth, result: { error: 'No profile found for user' } };
      }
      return {
        name,
        auth,
        result: {
          userId: row.user_id,
          level: row.level,
          label: row.label,
          capacity: row.capacity,
          tolerance: row.tolerance,
          explanationFacts: JSON.parse(row.explanation_facts_json),
          contradictions: JSON.parse(row.contradictions_json)
        }
      };
    }

    case 'start_risk_questionnaire': {
      return { name, auth, result: { questions: RISK_QUESTIONS } };
    }

    case 'get_portfolio': {
      const portfolio = getPortfolioView(userId, db);
      return { name, auth, result: portfolio };
    }

    case 'list_products': {
      const products = listProducts({
        asset_class: args.assetClass,
        max_risk_level: args.maxRiskLevel
      });
      return { name, auth, result: { products: products.map((p) => ({ id: p.id, name: p.name, asset_class: p.asset_class, risk_level: p.risk_level, expected_return: p.expected_return, expense_ratio: p.expense_ratio })) } };
    }

    case 'compare_products': {
      const comparison = compareProducts(args.productIds || []);
      return { name, auth, result: { comparison } };
    }

    case 'check_suitability': {
      const product = getProduct(args.productId);
      if (!product) return { name, auth, result: { error: 'Product not found' } };
      const row = db.prepare('SELECT * FROM risk_profiles WHERE user_id = ?').get(userId) as any;
      const profile = row
        ? {
            user_id: row.user_id,
            level: row.level,
            label: row.label,
            capacity: row.capacity,
            tolerance: row.tolerance,
            contradictions: JSON.parse(row.contradictions_json),
            explanation_facts: JSON.parse(row.explanation_facts_json),
            answered_at: row.answered_at,
            expires_at: row.expires_at,
            answers: JSON.parse(row.answers_json)
          }
        : null;

      const portfolio = getPortfolioView(userId, db);
      const res = checkSuitability(profile, product, args.amount, {
        cash: portfolio.cash,
        totalHoldingsValue: portfolio.totalHoldingsValue
      });
      return { name, auth, result: res };
    }

    case 'build_plan': {
      const row = db.prepare('SELECT * FROM risk_profiles WHERE user_id = ?').get(userId) as any;
      if (!row) return { name, auth, result: { error: 'Profile required to build plan' } };
      const profile: RiskProfile = {
        user_id: row.user_id,
        level: row.level,
        label: row.label,
        capacity: row.capacity,
        tolerance: row.tolerance,
        contradictions: JSON.parse(row.contradictions_json),
        explanation_facts: JSON.parse(row.explanation_facts_json),
        answered_at: row.answered_at,
        expires_at: row.expires_at,
        answers: JSON.parse(row.answers_json)
      };
      const plan = buildPlan(profile, {
        name: args.goalName || 'Wealth Goal',
        targetAmount: args.targetAmount,
        years: args.years
      });
      return { name, auth, result: plan };
    }

    case 'simulate_goal': {
      // Build baseline plan first
      const row = db.prepare('SELECT * FROM risk_profiles WHERE user_id = ?').get(userId) as any;
      if (!row) return { name, auth, result: { error: 'Profile required for simulation' } };
      const profile: RiskProfile = {
        user_id: row.user_id,
        level: row.level,
        label: row.label,
        capacity: row.capacity,
        tolerance: row.tolerance,
        contradictions: JSON.parse(row.contradictions_json),
        explanation_facts: JSON.parse(row.explanation_facts_json),
        answered_at: row.answered_at,
        expires_at: row.expires_at,
        answers: JSON.parse(row.answers_json)
      };
      const plan = buildPlan(profile, {
        name: 'Goal Simulation',
        targetAmount: args.targetAmount,
        years: args.years
      });
      const sim = simulateGoal(
        plan,
        args.initialAmount,
        args.monthlyContribution || 0,
        args.years,
        args.targetAmount,
        42
      );
      return { name, auth, result: sim };
    }

    case 'propose_rebalance': {
      const portfolio = getPortfolioView(userId, db);
      const holdings: Record<string, { units: number; price: number; name?: string }> = {};
      for (const h of portfolio.holdings) {
        holdings[h.productId] = { units: h.units, price: h.currentPrice, name: h.productName };
      }
      // Use standard model target weights
      const row = db.prepare('SELECT level FROM risk_profiles WHERE user_id = ?').get(userId) as any;
      const level = row ? row.level : 3;
      const targetWeights: Record<string, number> = {
        'eq-global-06': level >= 3 ? 0.45 : 0.25,
        'bond-govt-03': level >= 3 ? 0.35 : 0.50,
        'mmf-cash-01': 0.10,
        'gold-etf-09': 0.10
      };
      const rebal = rebalanceOrders(holdings, targetWeights, portfolio.cash, args.driftThreshold || 0.05);
      return { name, auth, result: rebal };
    }

    case 'place_order': {
      const order = placeOrder({
        userId,
        productId: args.productId,
        side: args.side,
        amount: args.amount,
        idempotencyKey: args.idempotencyKey,
        customDb: db
      });
      return { name, auth, result: order };
    }

    case 'explain_decision': {
      const explanationMap: Record<string, string> = {
        S1: 'Rule S1 (Risk Mismatch): Regulatory suitability mandates that retail investors cannot be recommended products with risk metrics higher than their assessed risk profile.',
        S2: 'Rule S2 (Profile Currency): Risk profiles expire after 12 months or when financial circumstances change significantly.',
        S3: 'Rule S3 (Contradiction Gate): When client answers exhibit logical conflict, automated trading is halted until user clarification is recorded.',
        S4: 'Rule S4 (Emergency Reserve): Prudent wealth planning requires keeping at least 3 months living expenses in liquid cash before investing in risky assets.',
        S5: 'Rule S5 (Concentration Cap): Single-asset exposure cannot exceed 40% of net worth unless invested in a broad diversified index fund.',
        S6: 'Rule S6 (Liquidity Notice): The investment settlement timeframe exceeds the stated short-term liquidity horizon.',
        S7: 'Rule S7 (Minimum Investment): Order size is below the institutional fund requirement.'
      };
      const expl = explanationMap[args.ruleId] || `Policy rule ${args.ruleId}: Enforced under Sophon deterministic compliance framework.`;
      return { name, auth, result: { ruleId: args.ruleId, explanation: expl } };
    }

    default:
      return { name, auth, result: { error: `Unknown tool: ${name}` } };
  }
}
