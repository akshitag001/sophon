import React, { useState, useEffect } from 'react';
import { api, AuditRecord } from '../api/client';
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCode,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AuditView: React.FC = () => {
  const [events, setEvents] = useState<AuditRecord[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditRecord[]>([]);
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');
  const [verification, setVerification] = useState<{
    valid: boolean;
    totalEvents: number;
    brokenAt?: number;
    reason?: string;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSeq, setExpandedSeq] = useState<number | null>(null);

  useEffect(() => {
    loadAuditEvents();
  }, []);

  const loadAuditEvents = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditEvents(undefined, 300);
      setEvents(res.events);
      setFilteredEvents(res.events);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = events;
    if (actorFilter !== 'all') {
      result = result.filter((e) => e.actor === actorFilter);
    }
    if (decisionFilter !== 'all') {
      result = result.filter((e) => e.decision === decisionFilter);
    }
    setFilteredEvents(result);
  }, [actorFilter, decisionFilter, events]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.verifyAuditChain();
      setVerification(res);
    } catch (err: any) {
      alert(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const handleExport = () => {
    window.open(api.exportAuditUrl(), '_blank');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Verification Action */}
      <div className="bg-white border border-[#1e1e1e]/10 p-6 rounded-sm shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-4 h-4 text-[#111111]" />
            <h2 className="text-sm font-clash font-bold text-[#111111]">
              Append-Only Cryptographic Audit Trail
            </h2>
          </div>
          <p className="text-xs text-[#838282] font-satoshi font-medium">
            Immutable SHA-256 hash-chained log. SQLite triggers strictly prevent UPDATE or DELETE operations.
          </p>
        </div>

        <div className="flex items-center gap-3 font-satoshi">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="px-5 py-2 bg-[#111111] hover:bg-black text-[#f2f2f2] font-semibold text-xs rounded-full transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{verifying ? 'Recomputing...' : 'Verify Chain Integrity'}</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white hover:bg-[#111111] hover:text-[#f2f2f2] text-[#111111] border border-[#1e1e1e]/15 font-semibold text-xs rounded-full transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSONL</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verification && (
        <div className="p-4 rounded-sm border bg-[#f2f2f2] border-[#1e1e1e]/15 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3 text-xs">
            {verification.valid ? (
              <CheckCircle2 className="w-5 h-5 text-[#111111] shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <div>
              <span className="font-bold text-xs block text-[#111111] font-sans">
                {verification.valid ? 'Cryptographic Chain Verified Intact' : 'Integrity Failure!'}
              </span>
              <span className="font-sans text-[11px] text-[#838282]">
                {verification.valid
                  ? `All ${verification.totalEvents} sequential SHA-256 hashes recomputed successfully. 0 broken links detected.`
                  : `Chain broken at #${verification.brokenAt}: ${verification.reason}`}
              </span>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-white rounded-full border border-[#1e1e1e]/15 text-[#111111]">
            {verification.valid ? '100% VALID' : 'TAMPERED'}
          </span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#1e1e1e]/10 p-4 rounded-sm text-xs font-mono shadow-sm">
        {/* Actor Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[#838282] font-semibold font-sans">Actor:</span>
          {['all', 'user', 'agent', 'system'].map((a) => (
            <button
              key={a}
              onClick={() => setActorFilter(a)}
              className={`px-3 py-1 rounded-full capitalize transition font-mono ${
                actorFilter === a
                  ? 'bg-[#111111] text-[#f2f2f2] font-semibold shadow-sm'
                  : 'text-[#838282] hover:text-[#111111] bg-[#f2f2f2] border border-[#1e1e1e]/10'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Decision Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[#838282] font-semibold font-sans">Decision:</span>
          {['all', 'ALLOW', 'NEEDS_APPROVAL', 'DENIED', 'EXECUTED', 'BLOCKED'].map((d) => (
            <button
              key={d}
              onClick={() => setDecisionFilter(d)}
              className={`px-3 py-1 rounded-full text-[11px] font-mono transition ${
                decisionFilter === d
                  ? 'bg-[#111111] text-[#f2f2f2] font-semibold shadow-sm'
                  : 'text-[#838282] hover:text-[#111111] bg-[#f2f2f2] border border-[#1e1e1e]/10'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Events Timeline Table */}
      <div className="bg-white border border-[#1e1e1e]/10 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#f2f2f2] text-[#838282] border-b border-[#1e1e1e]/10 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">Seq</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-3">Decision</th>
                <th className="py-3 px-3">Rules</th>
                <th className="py-3 px-3">Hash Preview</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]/10">
              {filteredEvents.map((e) => {
                const isAllow = e.decision === 'ALLOW' || e.decision === 'EXECUTED';
                const isNeedsApproval = e.decision === 'NEEDS_APPROVAL';
                const isExpanded = expandedSeq === e.seq;

                return (
                  <React.Fragment key={e.seq}>
                    <tr
                      onClick={() => setExpandedSeq(isExpanded ? null : e.seq)}
                      className="hover:bg-[#f2f2f2]/60 cursor-pointer transition"
                    >
                      <td className="py-3 px-3 text-center text-[#838282] font-mono">#{e.seq}</td>
                      <td className="py-3 px-3 text-[#838282] text-[11px]">{e.ts.slice(11, 19)}</td>
                      <td className="py-3 px-3">
                        <span className="text-[#111111] capitalize font-sans font-semibold">{e.actor}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] text-[10px] font-bold">
                          {e.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#111111] font-sans">{e.action}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isAllow ? 'bg-[#111111] text-[#f2f2f2]' : 'bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111]'
                        }`}>
                          {e.decision}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-[#838282] text-[11px]">
                        {e.rule_ids.join(', ') || '-'}
                      </td>
                      <td className="py-3 px-3 text-[#838282] text-[11px]" title={`Full SHA-256: ${e.hash}`}>
                        {e.hash.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-2 text-[#838282]">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#111111]" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </td>
                    </tr>

                    {/* Expandable Payload */}
                    {isExpanded && (
                      <tr className="bg-[#f2f2f2]/50">
                        <td colSpan={9} className="p-4 text-xs">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[#838282] text-[11px]">
                              <span>Previous Hash: <span className="font-mono text-[#111111]">{e.prev_hash}</span></span>
                              <span>Full SHA-256: <span className="font-mono text-[#111111] font-bold">{e.hash}</span></span>
                            </div>
                            <pre className="p-4 bg-white border border-[#1e1e1e]/15 rounded-sm text-[#111111] font-mono text-[11px] overflow-x-auto">
                              {JSON.stringify(e.payload, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
