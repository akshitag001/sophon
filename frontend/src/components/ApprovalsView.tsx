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
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      <div className="bg-white border border-[#1e1e1e]/10 p-6 rounded-sm shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <KeyRound className="w-4 h-4 text-[#111111]" />
          <h2 className="text-sm font-clash font-bold text-[#111111]">
            Tier L3: Human Authorization Queue
          </h2>
        </div>
        <p className="text-xs text-[#838282] font-satoshi font-medium leading-relaxed">
          The agent cannot autonomously execute trades exceeding your investment mandate limits or major portfolio liquidations.
          Human authorization requires typing the exact amount and entering your secure 6-digit PIN.
        </p>
      </div>

      {!proposals.length ? (
        <div className="bg-white border border-[#1e1e1e]/10 p-12 rounded-sm text-center space-y-3 shadow-sm">
          <ShieldCheck className="w-10 h-10 text-[#111111] mx-auto" />
          <h3 className="text-sm font-clash font-bold text-[#111111]">No Pending Proposals</h3>
          <p className="text-xs text-[#838282] max-w-sm mx-auto font-satoshi font-medium">
            All current agent operations are fully inside your Tier L2 mandate limits. To trigger a proposal, request an order above $2,000 in chat.
          </p>
        </div>
      ) : (
        proposals.map((prop) => {
          const status = statusMessages[prop.id];
          return (
            <div
              key={prop.id}
              className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#1e1e1e]/10 pb-3">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[10px] bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] px-2.5 py-0.5 rounded-full font-bold">
                    PENDING APPROVAL
                  </span>
                  <span className="text-xs text-[#838282]">{prop.id}</span>
                </div>
                <span className="text-[11px] font-mono text-[#838282]">{new Date(prop.timestamp).toLocaleTimeString()}</span>
              </div>

              <div>
                <h3 className="text-sm font-clash font-bold text-[#111111] mb-1">
                  Proposed Order: ${prop.amount.toLocaleString()} in Simulated Balanced 60/40 Fund
                </h3>
                {prop.reasons && prop.reasons.length > 0 && (
                  <p className="text-xs text-[#111111] bg-[#f2f2f2] p-3 rounded-sm border border-[#1e1e1e]/10 font-mono">
                    {prop.reasons.join(' ')}
                  </p>
                )}
              </div>

              <div className="p-3.5 bg-[#f2f2f2] rounded-sm border border-[#1e1e1e]/10 text-xs text-[#838282] space-y-1 font-mono">
                <div className="flex items-center gap-1.5 text-[#111111] font-semibold">
                  <FileKey className="w-3.5 h-3.5 text-[#111111]" />
                  <span>Cryptographic Single-Use Proposal Binding</span>
                </div>
                <p className="text-[11px] text-[#838282] font-satoshi">
                  Any alteration of order parameters in transit invalidates the SHA-256 hash and blocks execution.
                </p>
              </div>

              {/* Confirmation Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-xs text-[#111111] font-semibold block mb-1">
                    Type Exact Amount ($):
                  </label>
                  <input
                    type="number"
                    placeholder={`e.g. ${prop.amount}`}
                    value={typedAmounts[prop.id] || ''}
                    onChange={(e) =>
                      setTypedAmounts((prev) => ({ ...prev, [prop.id]: e.target.value }))
                    }
                    className="w-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] rounded-sm px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#111111] font-semibold block mb-1">
                    6-Digit PIN (Demo: 123456):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={pins[prop.id] || ''}
                    onChange={(e) =>
                      setPins((prev) => ({ ...prev, [prop.id]: e.target.value }))
                    }
                    className="w-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] rounded-sm px-3.5 py-2 text-xs font-mono tracking-widest focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#838282] font-mono">Expires 10 minutes from creation</span>
                <button
                  onClick={() => handleApprove(prop.id, prop.amount)}
                  disabled={loading}
                  className="px-5 py-2 bg-[#111111] hover:bg-black text-[#f2f2f2] font-semibold text-xs rounded-full transition shadow-sm disabled:opacity-50 font-satoshi"
                >
                  {loading ? 'Verifying...' : 'Authorize & Execute'}
                </button>
              </div>

              {status && (
                <div className="p-3 rounded-sm text-xs font-mono flex items-center gap-2.5 bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111]">
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#111111]" /> : <XCircle className="w-4 h-4 shrink-0 text-red-500" />}
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
