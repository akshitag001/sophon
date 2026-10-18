import { config } from '../config';
import { handleOfflineMessage, AgentChatResponse } from './offline';
import { SYSTEM_PROMPT } from './systemPrompt';
import { AGENT_TOOLS, executeToolCall, ToolExecutionResponse } from './tools';
import { applyOutputGuard } from './guard';
import { scanForInjection } from '../security/injection';
import { getDb, DB } from '../db';
import { logAuditEvent } from '../security/audit';

export async function chatWithAgent(
  userId: string,
  sessionId: string,
  message: string,
  customDb?: DB
): Promise<AgentChatResponse> {
  const db = customDb || getDb();

  // If in offline mode, route directly to offline deterministic agent
  if (config.isOfflineMode) {
    return handleOfflineMessage(userId, message, db);
  }

  // Pre-scan for injection
  const injection = scanForInjection(message, userId, db);
  let userMessageContent = message;
  if (injection.detected) {
    userMessageContent = injection.quarantinedText;
  }

  // LLM API Call with OpenAI-compatible endpoint
  const url = `${config.LLM_BASE_URL.replace(/\/+$/, '')}/chat/completions`;
  const toolCallsExecuted: ToolExecutionResponse[] = [];
  const pendingApprovals: any[] = [];
  const blockedProductIds: string[] = [];

  const toolsForOpenAI = AGENT_TOOLS.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }
  }));

  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessageContent }
  ];

  try {
    let retries = 2;
    let completionData: any = null;

    while (retries >= 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.LLM_API_KEY}`
          },
          body: JSON.stringify({
            model: config.LLM_MODEL,
            messages,
            tools: toolsForOpenAI,
            tool_choice: 'auto'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!resp.ok) {
          throw new Error(`LLM API responded with ${resp.status}: ${await resp.text()}`);
        }

        completionData = await resp.json();
        break;
      } catch (err: any) {
        if (retries === 0) throw err;
        retries--;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    const choice = completionData.choices?.[0];
    const assistantMessage = choice?.message;

    // Check if tool calls were requested
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      messages.push(assistantMessage);

      for (const tc of assistantMessage.tool_calls) {
        const funcName = tc.function.name;
        let args: Record<string, any> = {};
        try {
          args = JSON.parse(tc.function.arguments);
        } catch (e) {
          args = {};
        }

        const toolRes = await executeToolCall(funcName, args, userId, db);
        toolCallsExecuted.push(toolRes);

        if (toolRes.auth.decision === 'NEEDS_APPROVAL') {
          pendingApprovals.push(toolRes.auth.proposal);
        }
        if (toolRes.auth.decision === 'DENIED' && args.productId) {
          blockedProductIds.push(args.productId);
        }

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          content: JSON.stringify(toolRes.result)
        });
      }

      // Second turn: LLM generates explanation from tool outputs
      const secondResp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: config.LLM_MODEL,
          messages
        })
      });

      const secondData = await secondResp.json();
      const finalReply = secondData.choices?.[0]?.message?.content || 'Action executed successfully.';

      // Apply Output Guard
      const guard = applyOutputGuard(
        finalReply,
        toolCallsExecuted.map((t) => t.result),
        blockedProductIds,
        userId,
        db
      );

      return {
        reply: guard.cleanText,
        toolCalls: toolCallsExecuted,
        pendingApprovals,
        mode: 'llm'
      };
    }

    const rawReply = assistantMessage?.content || 'No response generated.';
    const guard = applyOutputGuard(rawReply, [], blockedProductIds, userId, db);

    return {
      reply: guard.cleanText,
      toolCalls: toolCallsExecuted,
      pendingApprovals,
      mode: 'llm'
    };
  } catch (err: any) {
    console.warn('LLM API error, switching to deterministic offline fallback:', err.message);
    return handleOfflineMessage(userId, message, db);
  }
}
