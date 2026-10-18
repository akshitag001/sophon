import React, { useState, useEffect } from 'react';
import { api, ProposalRecord, AuditRecord } from '../api/client';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileKey
} from 'lucide-react';

interface ApprovalsViewProps {
  userId: string;
  onOrderExecuted: () => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ userId, onOrderExecuted }) => {
  const [proposals, setProposals] = useState<any[]>([]);
  const [typedAmounts, setTypedAmounts] = useState<Record<string, string>>({});
  const [pins, setPins] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [statusMessages, setStatusMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});

  useEffect(() => {
    loadProposals();
  }, [userId]);

  const loadProposals = async () => {
    try {
      // Find audit events that resulted in NEEDS_APPROVAL with proposals
      const res = await api.getAuditEvents(userId, 100);
      const pendingProps: any[] = [];
      const seen = new Set<string>();

      for (const e of res.events) {
        if (e.decision === 'NEEDS_APPROVAL' && e.payload?.proposalId) {
          const propId = e.payload.proposalId;
          if (!seen.has(propId)) {
            seen.add(propId);
            pendingProps.push({
              id: propId,
              action: e.action,
              amount: e.payload.orderAmount || 10000,
              reasons: e.payload.reasons || [],
              timestamp: e.ts
            });
          }
        }
      }
      setProposals(pendingProps);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleApprove = async (proposalId: string, expectedAmount: number) => {
    const typed = parseFloat(typedAmounts[proposalId] || '0');
    const pin = pins[proposalId] || '';

    if (!pin) {
      alert('Please enter your 6-digit confirmation PIN (Demo PIN: 123456).');
      return;
    }

    setLoading(true);
    try {
      const res = await api.approveProposal(proposalId, typed, pin);
      setStatusMessages((prev) => ({
        ...prev,
        [proposalId]: { type: 'success', text: res.message || 'Proposal authorized and executed.' }
      }));
      onOrderExecuted();
      loadProposals();
    } catch (err: any) {
      setStatusMessages((prev) => ({
        ...prev,
        [proposalId]: { type: 'error', text: err.message || 'Authorization rejected.' }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-navy-900 border border-navy-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">Tier L3: Human Authorization Queue</h2>
        </div>
        <p className="text-xs text-slate-400">
          The agent cannot autonomously execute trades exceeding your investment mandate limits or major portfolio liquidations.
          Human authorization requires typing the exact amount and entering your secure 6-digit PIN.
        </p>
      </div>

      {!proposals.length ? (
        <div className="bg-navy-900 border border-navy-800 p-12 rounded-2xl text-center space-y-3 shadow-xl">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">No Pending Proposals</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All current agent operations are fully inside your Tier L2 mandate limits. To trigger a proposal, request an order above $2,000 in chat.
          </p>
        </div>
      ) : (
        proposals.map((prop) => {
          const status = statusMessages[prop.id];
          return (
            <div
              key={prop.id}
              className="bg-navy-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
                    PENDING HUMAN APPROVAL
                  </span>
                  <span className="text-xs font-mono text-slate-400">{prop.id}</span>
                </div>
                <span className="text-[11px] text-slate-400">{new Date(prop.timestamp).toLocaleTimeString()}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Proposed Order: ${prop.amount.toLocaleString()} in Simulated Balanced 60/40 Fund
                </h3>
                {prop.reasons && prop.reasons.length > 0 && (
                  <p className="text-xs text-amber-300/90 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    {prop.reasons.join(' ')}
                  </p>
                )}
              </div>

              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 font-mono text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <FileKey className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Cryptographic Single-Use Proposal Binding</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Any alteration of order parameters in transit invalidates the SHA-256 hash and blocks execution.
                </p>
              </div>

              {/* Confirmation Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    Type Exact Amount to Confirm ($):
                  </label>
                  <input
                    type="number"
                    placeholder={`e.g. ${prop.amount}`}
                    value={typedAmounts[prop.id] || ''}
                    onChange={(e) =>
                      setTypedAmounts((prev) => ({ ...prev, [prop.id]: e.target.value }))
                    }
                    className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-medium block mb-1">
                    6-Digit Confirmation PIN (Demo: 123456):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={pins[prop.id] || ''}
                    onChange={(e) =>
                      setPins((prev) => ({ ...prev, [prop.id]: e.target.value }))
                    }
                    className="w-full bg-navy-950 border border-navy-700 text-white rounded-xl px-3.5 py-2 text-xs font-mono tracking-widest focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">Expires 10 minutes from creation</span>
                <button
                  onClick={() => handleApprove(prop.id, prop.amount)}
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition shadow-lg shadow-amber-400/20"
                >
                  {loading ? 'Verifying...' : 'Authorize & Execute Order'}
                </button>
              </div>

              {status && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    status.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                  <span>{status.text}</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
