import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { getDb } from './db';

import { profileRouter } from './routes/profile';
import { productsRouter } from './routes/products';
import { planRouter } from './routes/plan';
import { portfolioRouter } from './routes/portfolio';
import { agentRouter } from './routes/agent';
import { auditRouter } from './routes/audit';

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

// Mount Domain and Feature Routes
app.use('/profile', profileRouter);
app.use('/products', productsRouter);
app.use('/plan', planRouter);
app.use('/portfolio', portfolioRouter);
app.use('/agent', agentRouter);
app.use('/audit', auditRouter);
app.use('/', portfolioRouter); // mount sandbox routes directly at /sandbox/advance etc.

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
