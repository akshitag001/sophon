import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config';
import { getDb } from './db';

import { profileRouter } from './routes/profile';
import { productsRouter } from './routes/products';
import { planRouter } from './routes/plan';
import { portfolioRouter } from './routes/portfolio';
import { agentRouter } from './routes/agent';
import { auditRouter } from './routes/audit';
import { securityRouter } from './routes/security';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    product: 'Sophon Advisor',
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
app.use('/security', securityRouter);
app.use('/', portfolioRouter); // mount sandbox routes directly at /sandbox/advance etc.

// Static frontend serving for single container deployment
const candidateDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist')
];

for (const distPath of candidateDistPaths) {
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/profile') || req.path.startsWith('/products') || req.path.startsWith('/portfolio') || req.path.startsWith('/plan') || req.path.startsWith('/agent') || req.path.startsWith('/audit') || req.path.startsWith('/sandbox') || req.path.startsWith('/security')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
    break;
  }
}

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
    console.log(`🚀 Sophon Advisor server listening on port ${config.PORT}`);
    console.log(`🔒 Operating mode: ${config.isOfflineMode ? 'OFFLINE (Deterministic Fallback)' : `LLM (${config.LLM_MODEL})`}`);
  });
}
