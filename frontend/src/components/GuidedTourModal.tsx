import React, { useState, useEffect } from 'react';
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  CheckCircle2,
  ShieldCheck,
  User,
  Layers,
  TrendingDown,
  TrendingUp,
  Terminal,
  KeyRound,
  ExternalLink
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, persona?: 'priya' | 'chen') => void;
  onTriggerScenario?: (scenario: 'normal' | 'crash' | 'rally') => void;
  onAdvanceClock?: (days: number) => void;
}

interface TourStep {
  step: number;
  timeMark: string;
  title: string;
  tab: string;
  persona?: 'priya' | 'chen';
  summary: string;
  talkingPoint: string;
  actionLabel: string;
  action?: () => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onTriggerScenario,
  onAdvanceClock
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      step: 1,
      timeMark: '0:00 - 0:30',
      title: 'Retail Persona & The Capital Sandbox',
      tab: 'chat',
      persona: 'priya',
      summary: 'Meet Priya: A 24-year-old retail investor with $20,000 cash starting her simulated investment journey.',
      talkingPoint: '"Most AI financial tools act as basic chat bots. XyraFin is built as an active, audited financial participant governed by deterministic code."',
      actionLabel: 'Switch to Priya & Open Chat',
      action: () => onNavigate('chat', 'priya')
    },
    {
      step: 2,
      timeMark: '0:30 - 1:00',
      title: 'Deterministic Risk Profiling (Rule Min(C, T))',
      tab: 'profile',
      persona: 'priya',
      summary: '10-question assessment balancing Risk Capacity (financial ability) against Risk Tolerance (psychological willingness).',
      talkingPoint: '"The LLM never guesses client risk. Code computes Level = min(Capacity, Tolerance). Contradictions trigger mandatory clarification warnings."',
      actionLabel: 'Inspect Risk Questionnaire',
      action: () => onNavigate('profile', 'priya')
    },
    {
      step: 3,
      timeMark: '1:00 - 1:45',
      title: 'Product Catalog & Hard Suitability Gate (S1–S7)',
      tab: 'products',
      persona: 'priya',
      summary: '12 curated mutual funds and ETFs. Rule S1 locks Leveraged-3X fund from retail personas.',
      talkingPoint: '"Regulatory investor protection (MiFID II / FINRA) is enforced in TypeScript, not in prompt tokens. Leveraged Fund is strictly locked for Priya."',
      actionLabel: 'View Products & Suitability Locks',
      action: () => onNavigate('products', 'priya')
    },
    {
      step: 4,
      timeMark: '1:45 - 2:30',
      title: 'Asset Allocation & 5,000-Path Monte Carlo',
      tab: 'plan',
      persona: 'priya',
      summary: '5,000-path Box-Muller simulation with P10/P50/P90 fan chart and bisection savings solver for 75% target confidence.',
      talkingPoint: '"Every number the AI explains is mathematically grounded in our Box-Muller Monte Carlo engine. Financial hallucination is structurally impossible."',
      actionLabel: 'Open Monte Carlo Fan Chart',
      action: () => onNavigate('plan', 'priya')
    },
    {
      step: 5,
      timeMark: '2:30 - 3:00',
      title: 'L0–L3 Permission Tiers & 4-Digit Human PIN',
      tab: 'approvals',
      persona: 'priya',
      summary: 'L0 Read, L1 Advise, L2 Act within mandate, L3 Human PIN approval for high-value orders.',
      talkingPoint: '"Orders exceeding the client mandate generate cryptographic proposals. Execution requires typing the exact amount and entering PIN 123456."',
      actionLabel: 'Inspect L3 Approval Queue',
      action: () => onNavigate('approvals', 'priya')
    },
    {
      step: 6,
      timeMark: '3:00 - 3:30',
      title: 'Brokerage Sandbox & Market Shock Testing',
      tab: 'portfolio',
      persona: 'priya',
      summary: 'Simulated clock with T+1 settlement and market stress testing (-25% Flash Crash & +15% Rally).',
      talkingPoint: '"We test portfolio resilience under real market volatility by triggering macro shock scenarios in our sandbox broker."',
      actionLabel: 'Open Portfolio Sandbox',
      action: () => onNavigate('portfolio', 'priya')
    },
    {
      step: 7,
      timeMark: '3:30 - 3:50',
      title: 'Portfolio Drift & Autonomous Rebalancing (Chen)',
      tab: 'portfolio',
      persona: 'chen',
      summary: 'Meet Chen: A user with an active portfolio drifted from 60/40 target due to equity market movements.',
      talkingPoint: '"XyraFin detects asset drift exceeding the mandate threshold (5%) and generates optimal buy/sell rebalancing orders."',
      actionLabel: 'Switch to Chen & View Drift',
      action: () => onNavigate('portfolio', 'chen')
    },
    {
      step: 8,
      timeMark: '3:50 - 4:15',
      title: 'Append-Only SHA-256 Audit Chain & 10 Red-Team Tests',
      tab: 'security',
      persona: 'priya',
      summary: 'Hash-chained audit log with SQLite immutability triggers and 10/10 adversarial security attacks passing.',
      talkingPoint: '"Every single agent action is hashed into an append-only chain. Judges can trigger all 10 adversarial attacks with 1 click to verify live defense."',
      actionLabel: 'Launch Red-Team Security Suite',
      action: () => onNavigate('security', 'priya')
    }
  ];

  const current = steps[currentStep];

  const handleExecuteAction = () => {
    if (current.action) {
      current.action();
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      const nextStep = steps[currentStep + 1];
      if (nextStep.action) {
        nextStep.action();
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevStep = steps[currentStep - 1];
      if (prevStep.action) {
        prevStep.action();
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-navy-900 border border-navy-750 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-navy-800 bg-navy-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Interactive 4-Minute Hackathon Demo Tour
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  Topic B Script
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click "Next" to auto-navigate the full system lifecycle live for judges.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-5 pt-4 pb-2 bg-navy-900 flex items-center justify-between gap-1 overflow-x-auto">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => {
                setCurrentStep(idx);
                if (s.action) s.action();
              }}
              className={`flex-1 min-w-[32px] h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-gradient-to-r from-blue-500 to-brand-cyan'
                  : idx < currentStep
                  ? 'bg-blue-600/40'
                  : 'bg-navy-800'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-navy-950 border border-navy-800 text-xs font-mono font-bold text-brand-cyan">
                Step {current.step} of {steps.length}
              </span>
              <span className="text-xs font-mono text-slate-400">{current.timeMark}</span>
            </div>

            {current.persona && (
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Active: {current.persona === 'priya' ? 'Priya (Retail)' : 'Chen (Drift)'}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-lg font-extrabold text-white">{current.title}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{current.summary}</p>
          </div>

          {/* Presenter Pitch Quote */}
          <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-1">
            <span className="text-[10px] font-mono uppercase text-brand-cyan font-bold tracking-wider block">
              Suggested Presenter Narration:
            </span>
            <p className="text-xs italic text-slate-200 leading-relaxed font-sans">
              {current.talkingPoint}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="pt-2">
            <button
              onClick={handleExecuteAction}
              className="w-full py-2.5 px-4 bg-navy-800 hover:bg-navy-750 text-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-navy-700 hover:border-brand-cyan/50 transition shadow-md"
            >
              <ExternalLink className="w-4 h-4 text-brand-cyan" />
              <span>{current.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-navy-950/80 border-t border-navy-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-navy-850 hover:bg-navy-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-navy-800 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-brand-cyan hover:from-blue-500 hover:to-brand-cyan text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-cyan/20 disabled:opacity-40 transition"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
