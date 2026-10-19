import { executeToolCall, ToolExecutionResponse } from './tools';
import { getDb, DB } from '../db';
import { applyOutputGuard } from './guard';
import { scanForInjection } from '../security/injection';

export interface AgentChatResponse {
  reply: string;
  toolCalls: ToolExecutionResponse[];
  pendingApprovals: any[];
  mode: 'llm' | 'offline';
}

export async function handleOfflineMessage(
  userId: string,
  message: string,
  customDb?: DB
): Promise<AgentChatResponse> {
  const db = customDb || getDb();
  const lower = message.toLowerCase();
  const toolCalls: ToolExecutionResponse[] = [];
  const pendingApprovals: any[] = [];
  let blockedProductIds: string[] = [];

  // Check injection
  const injection = scanForInjection(message, userId, db);
  if (injection.detected) {
    return {
      reply: `[Security Alert: Untrusted document or injection signature detected: ${injection.patternIds.join(', ')}]. Autonomous trading actions have been suspended. Any policy modifications remain strictly human-only.`,
      toolCalls: [],
      pendingApprovals: [],
      mode: 'offline'
    };
  }

  let rawReply = '';

  // 1. Profile / Risk Questionnaire Intent
  if (lower.includes('questionnaire') || lower.includes('profile') || lower.includes('start profiling') || lower.includes('risk')) {
    const res = await executeToolCall('get_profile', { userId }, userId, db);
    toolCalls.push(res);

    if (res.result.error) {
      const qRes = await executeToolCall('start_risk_questionnaire', {}, userId, db);
      toolCalls.push(qRes);
      rawReply = `Welcome to Sophon Advisor. (Disclaimer: I am an AI financial assistant operating in a simulation sandbox, not a licensed human adviser.)\n\nYou do not have an active risk profile yet. Let's begin the 10-question suitability questionnaire to assess your financial capacity and psychological risk tolerance.`;
    } else {
      rawReply = `Here is your current assessed risk profile:\n- Level: ${res.result.level}/5 (${res.result.label})\n- Financial Capacity: ${res.result.capacity}/5\n- Risk Tolerance: ${res.result.tolerance}/5\n\nFacts: ${res.result.explanationFacts.join(' ')}`;
    }
  }

  // 2. Buy Leveraged Fund / S1 Block Intent
  else if (lower.includes('leveraged') || lower.includes('lev-3x') || lower.includes('high risk')) {
    blockedProductIds.push('lev-3x-12');
    const suitabilityRes = await executeToolCall('check_suitability', {
      userId,
      productId: 'lev-3x-12',
      amount: 5000
    }, userId, db);
    toolCalls.push(suitabilityRes);

    const explainRes = await executeToolCall('explain_decision', { ruleId: 'S1' }, userId, db);
    toolCalls.push(explainRes);

    rawReply = `Regulatory Suitability Block: You inquired about the Simulated Ultra 3x Leveraged Equity Daily Growth Fund (lev-3x-12). This product has a risk level of 5/5, which strictly exceeds your assessed risk profile.\n\nSuitability Rule S1 Explanation: ${explainRes.result.explanation}\n\nSophon's deterministic code prevents any automated order placement for unsuitable products.`;
  }

  // 3. Fund Comparison Intent
  else if (lower.includes('compare') || lower.includes('funds') || lower.includes('products')) {
    const compRes = await executeToolCall('compare_products', {
      productIds: ['fund-balanced-05', 'eq-global-06', 'lev-3x-12']
    }, userId, db);
    toolCalls.push(compRes);

    const c = compRes.result.comparison;
    rawReply = `I have compared 3 funds side-by-side using our deterministic finance engine:\n\n1. ${c[0].name} (Risk ${c[0].risk_level}/5): 10-Year Fee Cost on $10k is $${c[0].fee_cost_10y_on_10k}, Sharpe Ratio ${c[0].sharpe_ratio}, Best Year ${c[0].best_year_pct}, Worst Year ${c[0].worst_year_pct}.\n2. ${c[1].name} (Risk ${c[1].risk_level}/5): 10-Year Fee Cost on $10k is $${c[1].fee_cost_10y_on_10k}, Sharpe Ratio ${c[1].sharpe_ratio}, Best Year ${c[1].best_year_pct}, Worst Year ${c[1].worst_year_pct}.\n3. ${c[2].name} (Risk ${c[2].risk_level}/5): 10-Year Fee Cost on $10k is $${c[2].fee_cost_10y_on_10k}, Sharpe Ratio ${c[2].sharpe_ratio}, Best Year ${c[2].best_year_pct}, Worst Year ${c[2].worst_year_pct}. (Note: Unsuitable for Level 3 investors).`;
  }

  // 4. Goal Projection / Monte Carlo Simulation Intent
  else if (lower.includes('simulate') || lower.includes('projection') || lower.includes('monte carlo') || lower.includes('probability')) {
    const simRes = await executeToolCall('simulate_goal', {
      userId,
      initialAmount: 5000,
      monthlyContribution: 300,
      years: 6,
      targetAmount: 30000
    }, userId, db);
    toolCalls.push(simRes);

    rawReply = `We completed a 5,000-path Monte Carlo projection for your 6-year $30,000 goal with $5,000 initial and $300/month contributions:\n- Probability of Reaching Target: ${simRes.result.probabilityOfSuccess}%\n- Median Outcome (P50): $${simRes.result.terminalValues.p50.toLocaleString()}\n- Conservative Outcome (P10): $${simRes.result.terminalValues.p10.toLocaleString()}\n- Monthly Savings Needed for 75% Probability: $${simRes.result.monthlyNeededFor75Pct}/month.`;
  }

  // 5. Build Asset Allocation Plan Intent
  else if (lower.includes('plan') || lower.includes('allocate') || lower.includes('deposit')) {
    const planRes = await executeToolCall('build_plan', {
      userId,
      goalName: 'Home Deposit',
      targetAmount: 30000,
      years: 6
    }, userId, db);
    toolCalls.push(planRes);

    const allocs = planRes.result.allocations.map((a: any) => `${a.assetClass.toUpperCase()}: ${(a.weight * 100).toFixed(0)}% (${a.productName})`).join('; ');
    rawReply = `I have generated your optimal asset allocation plan:\n- Portfolio Target Weights: ${allocs}\n- Portfolio Expected Return: ${(planRes.result.expectedReturn * 100).toFixed(2)}%\n- Portfolio Volatility: ${(planRes.result.portfolioVolatility * 100).toFixed(2)}%\n\nEvery product chosen is the lowest-cost suitable option in its asset class.`;
  }

  // 6. Invest / Order Placement Intent
  else if (lower.includes('invest') || lower.includes('buy') || lower.includes('order')) {
    // If user asks for larger sum e.g. 10000, triggers L3
    const amount = lower.includes('10000') || lower.includes('10,000') ? 10000 : 2000;
    const orderRes = await executeToolCall('place_order', {
      userId,
      productId: 'fund-balanced-05',
      side: 'BUY',
      amount
    }, userId, db);
    toolCalls.push(orderRes);

    if (orderRes.auth.decision === 'ALLOW') {
      rawReply = `Tier L2 Automated Order Placed: Successfully queued a BUY order for $${amount.toLocaleString()} in Simulated Global Balanced 60/40 Fund. This transaction passed all suitability gates and complies with your signed investment mandate. Settle T+1.`;
    } else if (orderRes.auth.decision === 'NEEDS_APPROVAL') {
      pendingApprovals.push(orderRes.auth.proposal);
      rawReply = `Tier L3 Human Authorization Required: An order for $${amount.toLocaleString()} in Simulated Global Balanced 60/40 Fund exceeds your automated mandate limits (${orderRes.auth.reason}).\n\nA secure proposal has been prepared. Please review and approve it in the Approvals panel by entering your 6-digit confirmation PIN.`;
    } else {
      rawReply = `Order Blocked: ${orderRes.auth.reason}`;
    }
  }

  // 7. Rebalance / Crash Scenario Intent
  else if (lower.includes('rebalance') || lower.includes('crash') || lower.includes('drift')) {
    const rebalRes = await executeToolCall('propose_rebalance', { userId }, userId, db);
    toolCalls.push(rebalRes);

    if (rebalRes.result.rebalanceNeeded) {
      // Execute each rebalance order within mandate
      for (const ord of rebalRes.result.orders) {
        const execRes = await executeToolCall('place_order', {
          userId,
          productId: ord.productId,
          side: ord.side,
          amount: ord.amount
        }, userId, db);
        toolCalls.push(execRes);
      }
      rawReply = `Portfolio drift of ${(rebalRes.result.maxDrift * 100).toFixed(1)}% was detected (exceeding 5% threshold). Under your mandate's auto-rebalance permission, the agent executed rebalancing orders to restore your target allocation.`;
    } else {
      rawReply = `Your portfolio is currently aligned with target weights (drift is below the 5% threshold). No rebalancing trades needed.`;
    }
  }

  // 8. Portfolio Inquiry Intent
  else if (lower.includes('portfolio') || lower.includes('balance') || lower.includes('holdings')) {
    const portRes = await executeToolCall('get_portfolio', { userId }, userId, db);
    toolCalls.push(portRes);

    rawReply = `Your simulated portfolio currently holds $${portRes.result.cash.toLocaleString()} in cash, $${portRes.result.totalHoldingsValue.toLocaleString()} in assets, for a total portfolio valuation of $${portRes.result.totalPortfolioValue.toLocaleString()}.`;
  }

  // Default guided fallback
  else {
    rawReply = `Hello! I am Sophon Advisor (Offline Mode). I can assist you with:\n1. Completing your 10-question Risk Profile\n2. Comparing simulated funds and calculating fee drag\n3. Building an optimal asset allocation plan\n4. Running 5,000-path Monte Carlo goal projections\n5. Placing automated trades within your mandate or preparing L3 approvals\n6. Detecting portfolio drift and rebalancing.\n\nWhat would you like to explore?`;
  }

  // Apply Output Guard to sanitize and verify numbers
  const guard = applyOutputGuard(rawReply, toolCalls.map((t) => t.result), blockedProductIds, userId, db);

  return {
    reply: guard.cleanText,
    toolCalls,
    pendingApprovals,
    mode: 'offline'
  };
}
