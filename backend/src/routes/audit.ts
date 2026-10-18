import { Router, Request, Response } from 'express';
import { getAuditEvents, verifyChain, exportAuditLog } from '../security/audit';

export const auditRouter = Router();

// GET /audit/verify
auditRouter.get('/verify', (req: Request, res: Response) => {
  try {
    const verification = verifyChain();
    res.json(verification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /audit/export
auditRouter.get('/export', (req: Request, res: Response) => {
  try {
    const jsonLines = exportAuditLog();
    res.setHeader('Content-Type', 'application/x-jsonlines');
    res.setHeader('Content-Disposition', 'attachment; filename="xyrafin_audit_log.jsonl"');
    res.send(jsonLines);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /audit/:userId
auditRouter.get('/:userId', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 200;
    const events = getAuditEvents(req.params.userId, limit);
    res.json({ events, count: events.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /audit (all events)
auditRouter.get('/', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 200;
    const events = getAuditEvents(undefined, limit);
    res.json({ events, count: events.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
