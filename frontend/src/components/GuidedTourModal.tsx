import React, { useState, useEffect } from 'react';
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  User,
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
      talkingPoint: '"Most AI financial tools act as basic chat bots. Sophon is built as an active, audited financial participant governed by deterministic code."',
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
      title: 'Tier L2 vs Tier L3 Human Authorization (Mandate Enforcement)',
      tab: 'approvals',
      persona: 'priya',
      summary: 'Automatic escalation to human PIN approval when orders exceed the signed $2,000 mandate threshold.',
      talkingPoint: '"When an order exceeds the client-signed mandate limit, the agent cannot execute alone. It generates a single-use proposal requiring PIN authorization."',
      actionLabel: 'Inspect Tier L3 Approval Queue',
      action: () => onNavigate('approvals', 'priya')
    },
    {
      step: 6,
      timeMark: '3:00 - 3:30',
      title: 'Brokerage Sandbox, Macro Stress, & 5% Drift Rebalance',
      tab: 'portfolio',
      persona: 'chen',
      summary: 'Chen: Experienced persona with a drifted portfolio. Test T+1 settlement and -25% Flash Crash stress test.',
      talkingPoint: '"Let us switch to Chen. We advance the T+1 settlement clock, simulate a -25% market shock, detect 5% asset drift, and execute rebalancing."',
      actionLabel: 'Inspect Chen Portfolio & Drift',
      action: () => onNavigate('portfolio', 'chen')
    },
    {
      step: 7,
      timeMark: '3:30 - 4:00',
      title: 'Red-Team Security & SHA-256 Append-Only Audit Chain',
      tab: 'security',
      persona: 'priya',
      summary: 'Run 10 automated adversarial attacks against prompt injection and verify the immutable cryptographic hash chain.',
      talkingPoint: '"To conclude: our 10-attack red-team suite proves adversarial robustness, and every state mutation is mathematically linked in an immutable SHA-256 chain."',
      actionLabel: 'Run 10 Red-Team Attacks',
      action: () => onNavigate('security', 'priya')
    }
  ];

  const current = steps[currentStep];

  const handleExecuteAction = () => {
    if (current.action) {
      current.action();
      onClose();
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#1e1e1e]/15 w-full max-w-xl rounded-sm shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#1e1e1e]/10 bg-[#f2f2f2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#111111] text-[#f2f2f2] rounded-sm">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-clash font-bold text-[#111111] flex items-center gap-2">
                Interactive 4-Minute Demo Pitch
                <span className="text-[10px] font-mono bg-white text-[#111111] px-2 py-0.5 rounded-full border border-[#1e1e1e]/15 font-bold">
                  Topic B Script
                </span>
              </h3>
              <p className="text-[11px] text-[#838282] font-satoshi font-medium">
                Auto-navigate the full system lifecycle live for judges.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#838282] hover:text-[#111111] rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 pt-4 pb-2 bg-white flex items-center justify-between gap-1.5 overflow-x-auto">
          {steps.map((s, idx) => (
            <button
              key={s.step}
              onClick={() => {
                setCurrentStep(idx);
                if (s.action) s.action();
              }}
              className={`flex-1 min-w-[32px] h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'bg-[#111111]'
                  : idx < currentStep
                  ? 'bg-[#838282]'
                  : 'bg-[#e5e5e5]'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2.5 py-0.5 rounded-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-xs font-bold text-[#111111]">
                Step {current.step} / {steps.length}
              </span>
              <span className="text-xs text-[#838282]">{current.timeMark}</span>
            </div>

            {current.persona && (
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] flex items-center gap-1.5 font-bold">
                <User className="w-3 h-3 text-[#111111]" />
                Persona: {current.persona === 'priya' ? 'Priya' : 'Chen'}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-base font-clash font-bold text-[#111111]">{current.title}</h4>
            <p className="text-xs text-[#838282] mt-1.5 leading-relaxed font-satoshi font-medium">{current.summary}</p>
          </div>

          {/* Presenter Pitch Quote */}
          <div className="bg-[#f2f2f2] p-4 rounded-sm border border-[#1e1e1e]/10 space-y-1.5">
            <span className="text-[10px] uppercase text-[#838282] font-mono font-bold tracking-wider block">
              Suggested Presenter Narration:
            </span>
            <p className="text-xs italic text-[#111111] leading-relaxed font-serif">
              {current.talkingPoint}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="pt-2">
            <button
              onClick={handleExecuteAction}
              className="w-full py-2.5 px-4 bg-[#111111] hover:bg-black text-[#f2f2f2] rounded-full text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm font-satoshi"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{current.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#f2f2f2] border-t border-[#1e1e1e]/10 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-white hover:bg-[#111111] hover:text-[#f2f2f2] text-[#111111] rounded-full text-xs font-semibold flex items-center gap-1 border border-[#1e1e1e]/15 disabled:opacity-30 transition font-satoshi"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="px-5 py-2 bg-[#111111] hover:bg-black text-[#f2f2f2] font-semibold rounded-full text-xs flex items-center gap-1 shadow-sm disabled:opacity-30 transition font-satoshi"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
