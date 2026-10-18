import React, { useState, useEffect } from 'react';
import { api, RiskQuestion, RiskProfile } from '../api/client';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Lock,
  Award
} from 'lucide-react';

interface RiskQuestionnaireProps {
  userId: string;
  onProfileUpdated?: (profile: RiskProfile) => void;
}

export const RiskQuestionnaire: React.FC<RiskQuestionnaireProps> = ({ userId, onProfileUpdated }) => {
  const [questions, setQuestions] = useState<RiskQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    // Defaults matching Priya for convenient testing
    age_band: '18-29',
    horizon: '3_to_7_years',
    goal_type: 'balanced_growth',
    income_stability: 'stable_salary',
    emergency_savings: '3_to_6',
    existing_debt: 'low_or_mortgage_only',
    investment_experience: 'beginner_cash_deposits',
    reaction_to_drop: 'hold',
    loss_tolerance: 'max_15_percent',
    liquidity_needs: '2_to_5_years'
  });
  const [existingProfile, setExistingProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const qRes = await api.getQuestions();
      setQuestions(qRes.questions);

      const profile = await api.getProfile(userId).catch(() => null);
      if (profile) {
        setExistingProfile(profile);
        setAnswers(profile.answers);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const profile = await api.submitProfile(userId, answers);
      setExistingProfile(profile);
      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated(profile);
    } catch (err: any) {
      alert(`Error submitting profile: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Loading risk questionnaire framework...
      </div>
    );
  }

  // Profile Result View
  if (existingProfile && !isEditing) {
    const p = existingProfile;
    const levelColors: Record<number, string> = {
      1: 'from-blue-500 to-indigo-600',
      2: 'from-teal-400 to-cyan-600',
      3: 'from-brand-cyan to-blue-500',
      4: 'from-amber-400 to-orange-500',
      5: 'from-rose-500 to-red-600'
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-navy-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-mono tracking-wider text-brand-cyan">Verified Risk Assessment</span>
                <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Valid until {new Date(p.expires_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">Investor Risk Profile: {p.label}</h2>
              <p className="text-xs text-slate-400 mt-1">
                MiFID II Suitability Gate: Final level is the lower of objective capacity and psychological tolerance.
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 rounded-xl transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Questionnaire
            </button>
          </div>

          {/* Level Gauge & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            <div className="p-5 bg-navy-850 border border-navy-800 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-400 font-medium mb-2">Final Approved Risk Level</span>
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${levelColors[p.level]} flex items-center justify-center text-3xl font-black text-navy-950 shadow-xl`}>
                {p.level} / 5
              </div>
              <span className="text-sm font-bold text-white mt-2">{p.label}</span>
              <span className="text-[11px] text-slate-400 mt-0.5">min(Capacity, Tolerance)</span>
            </div>

            <div className="md:col-span-2 p-5 bg-navy-850 border border-navy-800 rounded-xl space-y-4 justify-center flex flex-col">
              {/* Capacity Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Objective Financial Capacity:</span>
                  <span className="font-bold text-brand-cyan">{p.capacity} / 5</span>
                </div>
                <div className="w-full bg-navy-950 h-3 rounded-full overflow-hidden border border-navy-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-brand-cyan to-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${(p.capacity / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Based on horizon, income security, debt, and emergency savings cushion.
                </span>
              </div>

              {/* Tolerance Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300 font-medium">Psychological Risk Tolerance:</span>
                  <span className="font-bold text-teal-400">{p.tolerance} / 5</span>
                </div>
                <div className="w-full bg-navy-950 h-3 rounded-full overflow-hidden border border-navy-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${(p.tolerance / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Based on reaction to 20% drops, loss tolerance, and experience.
                </span>
              </div>
            </div>
          </div>

          {/* Contradiction Warning Banner */}
          {p.contradictions && p.contradictions.length > 0 && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-300">Contradictions Detected</h4>
                <ul className="text-xs text-amber-200/90 list-disc list-inside mt-1 space-y-0.5">
                  {p.contradictions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Explanation Facts for LLM */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-2">
              Audited Suitability Facts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {p.explanation_facts.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-navy-950/60 border border-navy-800 rounded-xl text-xs text-slate-300 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-brand-cyan shrink-0 mt-0.5" />
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stepper Questionnaire View
  const currentQ = questions[currentStep] || questions[0];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl">
        {/* Header & Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>QUESTION {currentStep + 1} OF {questions.length}</span>
            <span>{Math.round(progress)}% COMPLETED</span>
          </div>
          <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-navy-800">
            <div
              className="h-full bg-gradient-to-r from-brand-cyan to-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Title */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white leading-snug">{currentQ.question}</h2>
          <p className="text-xs text-slate-400 mt-1">Select the option that most accurately represents your situation.</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {currentQ.options.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(currentQ.id, opt.value)}
                className={`w-full p-4 rounded-xl text-left border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-600/20 border-brand-cyan text-white shadow-lg shadow-brand-cyan/10'
                    : 'bg-navy-850 hover:bg-navy-800 border-navy-700/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-brand-cyan bg-brand-cyan' : 'border-slate-500'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-navy-950" />}
                  </div>
                  <span className="text-sm font-medium">{opt.label}</span>
                </div>
                <span className="text-xs font-mono text-slate-400">{opt.points} pts</span>
              </button>
            );
          })}
        </div>

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-navy-800">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentStep < questions.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-cyan text-navy-950 hover:bg-cyan-300 shadow-lg shadow-brand-cyan/20 flex items-center gap-1.5 transition"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-cyan to-blue-500 text-navy-950 hover:opacity-90 shadow-xl shadow-brand-cyan/30 flex items-center gap-1.5 transition"
            >
              <Award className="w-4 h-4" />
              {submitting ? 'Scoring Profile...' : 'Complete & Generate Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
