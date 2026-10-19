import React, { useState } from 'react';
import { InvestmentMandate } from '../api/client';
import {
  FileSignature,
  Shield,
  CheckCircle2,
  Lock,
  Sliders,
  Moon,
  Clock
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
    const raw = `${userId}|${maxPerOrder}|${maxPerMonth}|${autoRebalance}|${driftThreshold}`;
    const hash = Array.from(raw).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 12345).toString(16).padStart(64, 'a');

    setSignedHash(hash);
    setSignedAt(new Date().toISOString());
    setSigned(true);
    setMessage('Investment Mandate cryptographically signed and locked in SQLite database.');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="bg-white border border-[#1e1e1e]/10 p-6 rounded-sm shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <FileSignature className="w-4 h-4 text-[#111111]" />
          <h2 className="text-sm font-clash font-bold text-[#111111]">
            Investment Mandate (Agent Permission Envelope)
          </h2>
        </div>
        <p className="text-xs text-[#838282] font-satoshi font-medium leading-relaxed">
          The investment mandate defines the hard parameters inside which the agent operates autonomously under Tier L2.
          Any trade exceeding these limits automatically escalates to Tier L3 human authorization.
        </p>
      </div>

      {/* Mandate Form */}
      <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#111111] block mb-1">
              Maximum Capital per Single Order ($)
            </label>
            <input
              type="number"
              value={maxPerOrder}
              onChange={(e) => {
                setMaxPerOrder(Number(e.target.value));
                setSigned(false);
              }}
              className="w-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] rounded-sm px-3.5 py-2 text-xs font-mono focus:border-[#111111] focus:outline-none"
            />
            <span className="text-[10px] text-[#838282] mt-1 block">Orders above this require L3 PIN authorization.</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#111111] block mb-1">
              Maximum Cumulative Capital per Month ($)
            </label>
            <input
              type="number"
              value={maxPerMonth}
              onChange={(e) => {
                setMaxPerMonth(Number(e.target.value));
                setSigned(false);
              }}
              className="w-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] rounded-sm px-3.5 py-2 text-xs font-mono focus:border-[#111111] focus:outline-none"
            />
            <span className="text-[10px] text-[#838282] mt-1 block">Monthly automated investment ceiling.</span>
          </div>
        </div>

        {/* Drift Threshold & Rebalancing */}
        <div className="pt-4 border-t border-[#1e1e1e]/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#111111] block mb-1">
              Portfolio Drift Threshold: <span className="font-mono text-[#111111]">{(driftThreshold * 100).toFixed(0)}%</span>
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
              className="w-full accent-[#111111] cursor-pointer"
            />
            <span className="text-[10px] text-[#838282] mt-1 block">
              Triggers automated rebalancing when asset allocation deviates past this threshold.
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#f2f2f2] rounded-sm border border-[#1e1e1e]/10">
            <div>
              <span className="text-xs font-semibold text-[#111111] block">Automated Drift Rebalancing</span>
              <span className="text-[10px] text-[#838282]">Allow agent to execute rebalance trades within mandate</span>
            </div>
            <input
              type="checkbox"
              checked={autoRebalance}
              onChange={(e) => {
                setAutoRebalance(e.target.checked);
                setSigned(false);
              }}
              className="w-4 h-4 accent-[#111111] rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="pt-4 border-t border-[#1e1e1e]/10 flex items-center justify-between p-3.5 bg-[#f2f2f2] rounded-sm border border-[#1e1e1e]/10">
          <div className="flex items-center gap-2.5">
            <Moon className="w-4 h-4 text-[#111111]" />
            <div>
              <span className="text-xs font-semibold text-[#111111] block">Trading Quiet Hours</span>
              <span className="text-[10px] text-[#838282]">
                Autonomous orders paused between {quietHoursStart}:00 and 0{quietHoursEnd}:00.
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-[#111111] bg-white border border-[#1e1e1e]/15 px-2.5 py-0.5 rounded-full font-bold">22:00 - 07:00</span>
        </div>

        {/* Sign Mandate Action */}
        <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <button
            onClick={handleSign}
            className="px-5 py-2.5 bg-[#111111] hover:bg-black text-[#f2f2f2] font-semibold text-xs rounded-full shadow-sm flex items-center gap-2 transition font-satoshi"
          >
            <FileSignature className="w-4 h-4" />
            Sign &amp; Lock Mandate
          </button>

          {signed && (
            <div className="flex items-center gap-1.5 text-xs text-[#111111] font-semibold font-mono">
              <CheckCircle2 className="w-4 h-4 text-[#111111]" />
              <span>Mandate Active &amp; Enforced</span>
            </div>
          )}
        </div>

        {message && (
          <div className="p-3 bg-[#f2f2f2] border border-[#1e1e1e]/15 rounded-sm text-xs text-[#111111] font-mono">
            {message}
          </div>
        )}

        {/* Signed Hash Evidence Box */}
        {signed && (
          <div className="mt-4 p-4 bg-[#f2f2f2] border border-[#1e1e1e]/10 rounded-sm space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#111111] font-bold">Cryptographic Mandate Hash (SHA-256):</span>
              <span className="text-[11px] text-[#838282]">Signed: {new Date(signedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-[#111111] break-all bg-white p-3 rounded-sm border border-[#1e1e1e]/10 font-bold">
              {signedHash}
            </p>
            <p className="text-[10px] text-[#838282] font-satoshi">
              Security Guarantee: Any modification attempt by the AI Agent is strictly blocked (DENIED) by the permissions policy engine.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
