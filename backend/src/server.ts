import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { getDb } from './db';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    product: 'XyraFin Advisor',
    version: '1.0.0',
    mode: config.isOfflineMode ? 'offline' : 'llm',
    model: config.isOfflineMode ? 'deterministic-fallback' : config.LLM_MODEL,
    time: new Date().toISOString()
  });
});

// Central Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

if (process.env.NODE_ENV !== 'test') {
  getDb();
  app.listen(config.PORT, () => {
    console.log(`🚀 XyraFin Advisor server listening on port ${config.PORT}`);
    console.log(`🔒 Operating mode: ${config.isOfflineMode ? 'OFFLINE (Deterministic Fallback)' : `LLM (${config.LLM_MODEL})`}`);
  });
}
