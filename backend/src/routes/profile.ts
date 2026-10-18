import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import {
  RISK_QUESTIONS,
  RiskQuestionnaireSchema,
  scoreRiskQuestionnaire,
  RiskProfile
} from '../domain/risk';
import { logAuditEvent } from '../security/audit';

export const profileRouter = Router();

// GET /profile/questions
profileRouter.get('/questions', (req: Request, res: Response) => {
  res.json({ questions: RISK_QUESTIONS });
});

// GET /profile/:userId
profileRouter.get('/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const db = getDb();
  const row = db.prepare('SELECT * FROM risk_profiles WHERE user_id = ?').get(userId) as any;

  if (!row) {
    return res.status(404).json({ error: 'Profile not found', user_id: userId });
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

  res.json(profile);
});

// POST /profile
profileRouter.post('/', (req: Request, res: Response) => {
  const { userId, answers } = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid userId' });
  }

  const parseResult = RiskQuestionnaireSchema.safeParse(answers);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid questionnaire answers',
      details: parseResult.error.format()
    });
  }

  const profile = scoreRiskQuestionnaire(userId, parseResult.data);
  const db = getDb();

  const stmt = db.prepare(`
    INSERT INTO risk_profiles (
      user_id, level, label, capacity, tolerance,
      answers_json, contradictions_json, explanation_facts_json,
      answered_at, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      level=excluded.level,
      label=excluded.label,
      capacity=excluded.capacity,
      tolerance=excluded.tolerance,
      answers_json=excluded.answers_json,
      contradictions_json=excluded.contradictions_json,
      explanation_facts_json=excluded.explanation_facts_json,
      answered_at=excluded.answered_at,
      expires_at=excluded.expires_at
  `);

  stmt.run(
    profile.user_id,
    profile.level,
    profile.label,
    profile.capacity,
    profile.tolerance,
    JSON.stringify(profile.answers),
    JSON.stringify(profile.contradictions),
    JSON.stringify(profile.explanation_facts),
    profile.answered_at,
    profile.expires_at
  );

  // Audit log event
  logAuditEvent({
    actor: 'user',
    action: 'SUBMIT_RISK_PROFILE',
    tier: 'L3',
    decision: 'ALLOW',
    rule_ids: ['PROFILE_SCORED'],
    payload: {
      userId,
      level: profile.level,
      label: profile.label,
      capacity: profile.capacity,
      tolerance: profile.tolerance,
      contradictionsCount: profile.contradictions.length
    }
  });

  res.status(201).json(profile);
});
