import React, { useState } from 'react';
import { api } from '../api/client';
import { Clock, AlertTriangle, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface DemoControlsProps {
  currentDay: number;
  currentScenario: string;
  onRefresh: () => void;
}

export const DemoControls: React.FC<DemoControlsProps> = ({ currentDay, currentScenario, onRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAdvance = async (days: number) => {
    setLoading(true);
    try {
      const res = await api.advanceClock(days);
      setMessage(`Clock advanced ${days} days (Day ${res.clock.currentDay}). ${res.settledCount} orders settled.`);
      onRefresh();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScenario = async (sc: 'normal' | 'crash' | 'rally') => {
    setLoading(true);
    try {
      await api.setScenario(sc);
      setMessage(`Market scenario switched to: ${sc.toUpperCase()}`);
      onRefresh();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset sandbox environment to default demo state?')) return;
    setLoading(true);
    try {
      await api.resetSandbox();
      setMessage('Sandbox reset to fresh demo state.');
      onRefresh();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#1e1e1e]/10 rounded-sm overflow-hidden shadow-sm transition-all font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 flex items-center justify-between text-xs font-semibold text-[#111111] hover:bg-[#f2f2f2] transition"
      >
        <span className="flex items-center gap-2 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-[#111111]" />
          <span>SIMULATION CONTROLLER (DAY {currentDay} • {currentScenario.toUpperCase()} REGIME)</span>
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-[#838282]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#838282]" />}
      </button>

      {isOpen && (
        <div className="p-5 border-t border-[#1e1e1e]/10 bg-[#f2f2f2] space-y-4 animate-fade-in text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] text-[#838282] uppercase tracking-wider font-bold">
              Clock:
            </span>
            <button
              onClick={() => handleAdvance(1)}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-white hover:bg-[#111111] text-[#111111] hover:text-[#f2f2f2] rounded-full border border-[#1e1e1e]/15 transition shadow-sm font-semibold"
            >
              +1 Day (T+1 Settle)
            </button>
            <button
              onClick={() => handleAdvance(30)}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-white hover:bg-[#111111] text-[#111111] hover:text-[#f2f2f2] rounded-full border border-[#1e1e1e]/15 transition shadow-sm font-semibold"
            >
              +30 Days (Monthly)
            </button>
            <button
              onClick={() => handleAdvance(90)}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-white hover:bg-[#111111] text-[#111111] hover:text-[#f2f2f2] rounded-full border border-[#1e1e1e]/15 transition shadow-sm font-semibold"
            >
              +90 Days (Quarterly)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#1e1e1e]/10">
            <span className="text-[11px] text-[#838282] uppercase tracking-wider font-bold">
              Macro Shock Simulator:
            </span>
            <button
              onClick={() => handleScenario('normal')}
              disabled={loading}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                currentScenario === 'normal'
                  ? 'bg-[#111111] text-[#f2f2f2] border-[#111111] font-bold shadow-sm'
                  : 'bg-white text-[#111111] border-[#1e1e1e]/15 hover:bg-[#111111] hover:text-[#f2f2f2]'
              }`}
            >
              Normal Market
            </button>
            <button
              onClick={() => handleScenario('crash')}
              disabled={loading}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 rounded-full border transition ${
                currentScenario === 'crash'
                  ? 'bg-[#111111] text-[#f2f2f2] border-[#111111] font-bold shadow-sm'
                  : 'bg-white text-[#111111] border-[#1e1e1e]/15 hover:bg-[#111111] hover:text-[#f2f2f2]'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Flash Crash (-25%)
            </button>
            <button
              onClick={() => handleScenario('rally')}
              disabled={loading}
              className={`px-3 py-1.5 text-xs flex items-center gap-1.5 rounded-full border transition ${
                currentScenario === 'rally'
                  ? 'bg-[#111111] text-[#f2f2f2] border-[#111111] font-bold shadow-sm'
                  : 'bg-white text-[#111111] border-[#1e1e1e]/15 hover:bg-[#111111] hover:text-[#f2f2f2]'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              Bull Rally (+15%)
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="ml-auto px-3.5 py-1.5 text-xs bg-white hover:bg-[#111111] text-[#838282] hover:text-[#f2f2f2] rounded-full border border-[#1e1e1e]/15 flex items-center gap-1.5 transition font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Demo State
            </button>
          </div>

          {message && (
            <div className="text-xs text-[#111111] bg-white border border-[#1e1e1e]/15 px-4 py-2 rounded-sm font-mono shadow-sm">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
