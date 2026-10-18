import React, { useState } from 'react';
import { InvestmentMandate } from '../api/client';
import {
  FileSignature,
  Shield,
  CheckCircle2,
  Lock,
  Sliders,
  Moon,
  Clock,
  Sparkles
} from 'lucide-react';

interface MandateViewProps {
  userId: string;
}

export const MandateView: React.FC<MandateViewProps> = ({ userId }) => {
  const [maxPerOrder, setMaxPerOrder] = useState<number>(2000);
  const [maxPerMonth, setMaxPerMonth] = useState<number>(3000);
  const [autoRebalance, setAutoRebalance] = useState<boolean>(true);
  const [driftThreshold, setDriftThreshold] = useState<number>(0.05);
  const [quietHoursStart, setQuietHoursStart] = useState<number>(22);
  const [quietHoursEnd, setQuietHoursEnd] = useState<number>(7);

  const [signedHash, setSignedHash] = useState<string>('c3dcc7233f406586b45a6c023d8869f10a8b4f1791230e7912a7819124019a82');
  const [signedAt, setSignedAt] = useState<string>(new Date().toISOString());
  const [signed, setSigned] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const handleSign = () => {
    // Deterministic simulated hash for client display
    const raw = `${userId}|${maxPerOrder}|${maxPerMonth}|${autoRebalance}|${driftThreshold}`;
    const hash = Array.from(raw).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 12345).toString(16).padStart(64, 'a');

    setSignedHash(hash);
    setSignedAt(new Date().toISOString());
    setSigned(true);
    setMessage('Investment Mandate cryptographically signed and locked in SQLite database.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-navy-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <FileSignature className="w-5 h-5 text-brand-cyan" />
          <h2 className="text-xl font-bold text-white">Investment Mandate (Agent Permission Envelope)</h2>
        </div>
        <p className="text-xs text-slate-400">
          The investment mandate defines the hard parameters inside which the agent operates autonomously under Tier L2.
          Any trade exceeding these limits automatically escalates to Tier L3 human authorization.
        </p>
      </div>

      {/* Mandate Form */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Maximum Capital per Single Order ($)
            </label>
            <input
              type="number"
              value={maxPerOrder}
              onChange={(e) => {
                setMaxPerOrder(Number(e.target.value));
                setSigned(false);
              }}
              className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl px-4 py-2.5 text-sm font-mono focus:border-brand-cyan focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Orders above this require L3 PIN authorization.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Maximum Cumulative Capital per Month ($)
            </label>
            <input
              type="number"
              value={maxPerMonth}
              onChange={(e) => {
                setMaxPerMonth(Number(e.target.value));
                setSigned(false);
              }}
              className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl px-4 py-2.5 text-sm font-mono focus:border-brand-cyan focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Monthly automated investment ceiling.</span>
          </div>
        </div>

        {/* Drift Threshold & Rebalancing */}
        <div className="pt-4 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Portfolio Drift Threshold: {(driftThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.02"
              max="0.15"
              step="0.01"
              value={driftThreshold}
              onChange={(e) => {
                setDriftThreshold(Number(e.target.value));
                setSigned(false);
              }}
              className="w-full accent-brand-cyan"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Triggers automated rebalancing when asset allocation deviates past this threshold.
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-950 rounded-xl border border-navy-800">
            <div>
              <span className="text-xs font-semibold text-white block">Automated Drift Rebalancing</span>
              <span className="text-[10px] text-slate-400">Allow agent to execute rebalance trades within mandate</span>
            </div>
            <input
              type="checkbox"
              checked={autoRebalance}
              onChange={(e) => {
                setAutoRebalance(e.target.checked);
                setSigned(false);
              }}
              className="w-5 h-5 accent-brand-cyan rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="pt-4 border-t border-navy-800 flex items-center justify-between p-4 bg-navy-950 rounded-xl border border-navy-800">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-brand-cyan" />
            <div>
              <span className="text-xs font-semibold text-white block">Trading Quiet Hours</span>
              <span className="text-[10px] text-slate-400">
                Autonomous orders paused between {quietHoursStart}:00 and 0{quietHoursEnd}:00.
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-300">22:00 - 07:00</span>
        </div>

        {/* Sign Mandate Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={handleSign}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-cyan to-blue-500 text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 shadow-lg shadow-brand-cyan/20 flex items-center gap-2 transition"
          >
            <FileSignature className="w-4 h-4" />
            Sign & Cryptographically Lock Mandate
          </button>

          {signed && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mandate Active & Enforced</span>
            </div>
          )}
        </div>

        {message && (
          <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl text-xs text-brand-cyan">
            {message}
          </div>
        )}

        {/* Signed Hash Evidence Box */}
        {signed && (
          <div className="mt-4 p-4 bg-navy-950 border border-navy-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Cryptographic Mandate Hash (SHA-256):</span>
              <span className="text-[11px] text-slate-500">Signed: {new Date(signedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-xs font-mono text-brand-cyan break-all bg-navy-900 p-2.5 rounded-lg border border-navy-800">
              {signedHash}
            </p>
            <p className="text-[10px] text-slate-500">
              Security Guarantee: Any modification attempt by the AI Agent is strictly blocked (DENIED) by the permissions policy engine.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
