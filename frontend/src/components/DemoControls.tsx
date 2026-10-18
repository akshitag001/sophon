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
    <div className="bg-navy-900 border border-navy-700/80 rounded-xl overflow-hidden shadow-lg transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold tracking-wider text-brand-cyan hover:bg-navy-850 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
          SIMULATION CONTROLS (DAY {currentDay} • {currentScenario.toUpperCase()})
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-navy-800 bg-navy-950/70 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Advance Clock:</span>
            <button
              onClick={() => handleAdvance(1)}
              disabled={loading}
              className="px-2.5 py-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-200 rounded border border-navy-700 transition"
            >
              +1 Day (T+1 Settle)
            </button>
            <button
              onClick={() => handleAdvance(30)}
              disabled={loading}
              className="px-2.5 py-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-200 rounded border border-navy-700 transition"
            >
              +30 Days
            </button>
            <button
              onClick={() => handleAdvance(90)}
              disabled={loading}
              className="px-2.5 py-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-200 rounded border border-navy-700 transition"
            >
              +90 Days
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Scenario Trigger:</span>
            <button
              onClick={() => handleScenario('normal')}
              disabled={loading}
              className={`px-2.5 py-1 text-xs rounded border transition ${
                currentScenario === 'normal'
                  ? 'bg-blue-600/30 text-blue-400 border-blue-500'
                  : 'bg-navy-800 text-slate-300 border-navy-700 hover:bg-navy-700'
              }`}
            >
              Normal Market
            </button>
            <button
              onClick={() => handleScenario('crash')}
              disabled={loading}
              className={`px-2.5 py-1 text-xs flex items-center gap-1 rounded border transition ${
                currentScenario === 'crash'
                  ? 'bg-rose-600/30 text-rose-400 border-rose-500'
                  : 'bg-navy-800 text-rose-300 border-navy-700 hover:bg-navy-700'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              Crash (-25%)
            </button>
            <button
              onClick={() => handleScenario('rally')}
              disabled={loading}
              className={`px-2.5 py-1 text-xs flex items-center gap-1 rounded border transition ${
                currentScenario === 'rally'
                  ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500'
                  : 'bg-navy-800 text-emerald-300 border-navy-700 hover:bg-navy-700'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Rally (+15%)
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="ml-auto px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-amber-500/40 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Demo
            </button>
          </div>

          {message && <div className="text-xs text-brand-cyan bg-brand-cyan/10 px-3 py-1.5 rounded">{message}</div>}
        </div>
      )}
    </div>
  );
};
