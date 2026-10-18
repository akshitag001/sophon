import { Router, Request, Response } from 'express';
import { chatWithAgent } from '../agent/client';
import { scanForInjection, extractFactsheetText } from '../security/injection';
import { approveProposal, getProposal } from '../security/permissions';
import { placeOrder } from '../sandbox/broker';
import { getDb } from '../db';
import { logAuditEvent } from '../security/audit';

export const agentRouter = Router();

// POST /agent/chat
agentRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { userId, sessionId, message } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }

    const response = await chatWithAgent(userId, sessionId || 'default_session', message);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /agent/factsheet (text or base64 upload)
agentRouter.post('/factsheet', async (req: Request, res: Response) => {
  try {
    const { userId, text, filename } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing factsheet text' });
    }

    const scan = scanForInjection(text, userId || 'user');

    res.json({
      filename: filename || 'factsheet.txt',
      detected: scan.detected,
      patterns: scan.patternIds,
      quarantinedText: scan.quarantinedText,
      analysis: scan.detected
        ? 'Security Alert: Prompt injection pattern detected in factsheet footer. Quarantined as inert untrusted document.'
        : 'Factsheet analyzed: No adversarial prompt-injection payloads detected. Fund statistics verified.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /agent/approve (L3 human approval with typed amount and PIN)
agentRouter.post('/approve', (req: Request, res: Response) => {
  try {
    const { proposalId, typedAmount, pin } = req.body;
    if (!proposalId || typedAmount === undefined || !pin) {
      return res.status(400).json({ error: 'Missing proposalId, typedAmount, or pin' });
    }

    const proposal = getProposal(proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const approvalResult = approveProposal(proposalId, Number(typedAmount), pin);
    if (!approvalResult.success) {
      return res.status(400).json({ error: approvalResult.error });
    }

    // Execute the approved proposal order
    if (proposal.action === 'place_order') {
      const order = placeOrder({
        userId: proposal.userId,
        productId: proposal.proposalData.productId,
        side: proposal.proposalData.side,
        amount: proposal.proposalData.amount,
        proposalHash: proposal.proposalHash
      });

      return res.json({
        success: true,
        message: 'Proposal successfully approved and order queued for settlement.',
        order
      });
    }

    res.json({ success: true, message: 'Proposal approved.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
