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
      <div className="flex items-center justify-center h-64 text-[#838282] font-mono text-xs">
        Loading risk questionnaire framework...
      </div>
    );
  }

  // Profile Result View
  if (existingProfile && !isEditing) {
    const p = existingProfile;

    return (
      <div className="max-w-4xl mx-auto space-y-6 font-sans">
        <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-[#1e1e1e]/10">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-[#838282] font-bold">Verified Risk Assessment</span>
                <span className="text-[11px] font-mono bg-[#f2f2f2] text-[#111111] border border-[#1e1e1e]/15 px-2.5 py-0.5 rounded-full font-bold">
                  Valid until {new Date(p.expires_at).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-clash font-bold text-[#111111]">Investor Risk Profile: {p.label}</h2>
              <p className="text-xs text-[#838282] mt-1 font-satoshi font-medium">
                MiFID II Suitability Gate: Final level is the lower of objective capacity and psychological tolerance.
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-xs font-semibold bg-white hover:bg-[#111111] hover:text-[#f2f2f2] text-[#111111] border border-[#1e1e1e]/15 rounded-full transition flex items-center gap-1.5 shadow-sm font-satoshi"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Assessment
            </button>
          </div>

          {/* Level Gauge & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            <div className="p-6 bg-[#f2f2f2] border border-[#1e1e1e]/10 rounded-sm flex flex-col items-center justify-center text-center">
              <span className="text-xs text-[#838282] font-semibold mb-3 uppercase tracking-wider font-mono">Approved Risk Level</span>

              {/* Sleek Radial Risk Meter */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="33"
                    fill="transparent"
                    stroke="#e5e5e5"
                    strokeWidth="5"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="33"
                    fill="transparent"
                    stroke="#111111"
                    strokeWidth="5"
                    strokeDasharray={2 * Math.PI * 33}
                    strokeDashoffset={2 * Math.PI * 33 * (1 - p.level / 5)}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-clash font-bold text-[#111111] leading-none">{p.level}</span>
                  <span className="text-[10px] font-mono text-[#838282] mt-0.5">OF 5</span>
                </div>
              </div>

              {/* 5-Level Stepped Pip Indicator */}
              <div className="flex items-center gap-1.5 mt-3">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      lvl <= p.level
                        ? 'w-4 bg-[#111111]'
                        : 'w-2 bg-[#d1d1d1]'
                    }`}
                  />
                ))}
              </div>

              <span className="text-base font-clash font-bold text-[#111111] mt-3">{p.label}</span>
              <span className="text-[10px] text-[#838282] font-mono bg-white border border-[#1e1e1e]/10 px-2.5 py-0.5 rounded-full mt-1.5">
                min(Capacity, Tolerance)
              </span>
            </div>

            <div className="md:col-span-2 p-6 bg-[#f2f2f2] border border-[#1e1e1e]/10 rounded-sm space-y-5 justify-center flex flex-col">
              {/* Capacity Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[#111111] font-semibold font-sans">Objective Capacity:</span>
                  <span className="text-[#111111] font-bold">{p.capacity} / 5</span>
                </div>
                <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#1e1e1e]/10">
                  <div
                    className="h-full bg-[#111111] rounded-full transition-all duration-700"
                    style={{ width: `${(p.capacity / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#838282] mt-1.5 block font-satoshi">
                  Based on horizon, income security, debt, and emergency reserves cushion.
                </span>
              </div>

              {/* Tolerance Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[#111111] font-semibold font-sans">Psychological Tolerance:</span>
                  <span className="text-[#111111] font-bold">{p.tolerance} / 5</span>
                </div>
                <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#1e1e1e]/10">
                  <div
                    className="h-full bg-[#838282] rounded-full transition-all duration-700"
                    style={{ width: `${(p.tolerance / 5) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#838282] mt-1.5 block font-satoshi">
                  Based on reaction to 20% drops, loss tolerance, and experience.
                </span>
              </div>
            </div>
          </div>

          {/* Contradiction Warning Banner */}
          {p.contradictions && p.contradictions.length > 0 && (
            <div className="p-4 bg-[#f2f2f2] border border-[#1e1e1e]/15 rounded-sm mb-6 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-clash font-bold text-[#111111]">Contradictions Detected</h4>
                <ul className="text-xs text-[#838282] list-disc list-inside mt-1 space-y-0.5 font-satoshi font-medium">
                  {p.contradictions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Explanation Facts */}
          <div>
            <h4 className="text-xs uppercase font-mono tracking-wider text-[#838282] font-bold mb-3">
              Audited Suitability Facts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {p.explanation_facts.map((fact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#f2f2f2] border border-[#1e1e1e]/10 rounded-sm text-xs text-[#111111] flex items-start gap-2.5 font-satoshi font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
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
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 sm:p-8 shadow-sm">
        {/* Header & Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-[#838282] mb-2 font-mono">
            <span className="text-[#111111] font-bold">QUESTION {currentStep + 1} OF {questions.length}</span>
            <span className="text-[#838282]">{Math.round(progress)}% COMPLETED</span>
          </div>
          <div className="w-full bg-[#f2f2f2] h-2 rounded-full overflow-hidden border border-[#1e1e1e]/10">
            <div
              className="h-full bg-[#111111] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Title */}
        <div className="mb-6">
          <h2 className="text-lg font-clash font-bold text-[#111111] leading-snug">{currentQ.question}</h2>
          <p className="text-xs text-[#838282] mt-1 font-satoshi font-medium">Select the option that most accurately represents your profile.</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt) => {
            const isSelected = answers[currentQ.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(currentQ.id, opt.value)}
                className={`w-full p-4 rounded-sm text-left border transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#111111] text-[#f2f2f2] font-semibold shadow-sm border-[#111111]'
                    : 'bg-[#f2f2f2] hover:bg-white text-[#111111] border-[#1e1e1e]/15'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-white bg-white' : 'border-[#838282]'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#111111]" />}
                  </div>
                  <span className="text-xs font-satoshi font-medium">{opt.label}</span>
                </div>
                <span className={`text-xs font-mono ${isSelected ? 'text-zinc-300' : 'text-[#838282]'}`}>{opt.points} pts</span>
              </button>
            );
          })}
        </div>

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-[#1e1e1e]/10">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#838282] hover:text-[#111111] disabled:opacity-30 flex items-center gap-1.5 transition font-satoshi"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>

          {currentStep < questions.length - 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#111111] hover:bg-black text-[#f2f2f2] shadow-sm flex items-center gap-1.5 transition font-satoshi"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#111111] hover:bg-black text-[#f2f2f2] shadow-sm flex items-center gap-1.5 transition disabled:opacity-50 font-satoshi"
            >
              <Award className="w-3.5 h-3.5" />
              {submitting ? 'Scoring...' : 'Complete Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
