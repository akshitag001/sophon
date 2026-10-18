import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { RiskProfile } from '../domain/risk';
import { buildPlan, Goal } from '../domain/allocation';
import { simulateGoal } from '../domain/projection';

export const planRouter = Router();

// POST /plan
planRouter.post('/', (req: Request, res: Response) => {
  const { userId, goal } = req.body;

  if (!userId || !goal) {
    return res.status(400).json({ error: 'Missing userId or goal in request body' });
  }

  const db = getDb();
  const row = db.prepare('SELECT * FROM risk_profiles WHERE user_id = ?').get(userId) as any;

  if (!row) {
    return res.status(404).json({
      error: 'User has no completed risk profile. Risk questionnaire must be completed before building an asset plan.',
      code: 'PROFILE_REQUIRED'
    });
  }

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

  const plan = buildPlan(profile, goal as Goal);
  res.json(plan);
});

// POST /plan/simulate
planRouter.post('/simulate', (req: Request, res: Response) => {
  const { plan, initial, monthlyContribution, years, target, seed } = req.body;

  if (!plan || initial === undefined || years === undefined || target === undefined) {
    return res.status(400).json({ error: 'Missing required parameters: plan, initial, years, target' });
  }

  const simulation = simulateGoal(
    plan,
    Number(initial),
    Number(monthlyContribution || 0),
    Number(years),
    Number(target),
    seed !== undefined ? Number(seed) : 42
  );

  res.json(simulation);
});
