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
    <div className="space-y-6">
      {/* Header and Verification Action */}
      <div className="bg-navy-900 border border-navy-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-5 h-5 text-brand-cyan" />
            <h2 className="text-xl font-bold text-white">Append-Only Cryptographic Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-400">
            Immutable SHA-256 hash-chained log. SQLite triggers strictly prevent UPDATE or DELETE operations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            {verifying ? 'Recomputing Hashes...' : 'Verify Chain Integrity'}
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-brand-cyan" />
            Export JSON Lines
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            verification.valid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3 text-xs">
            {verification.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-bold text-sm block">
                {verification.valid ? 'Cryptographic Chain Verified Intact' : 'Cryptographic Integrity Failure!'}
              </span>
              <span>
                {verification.valid
                  ? `All ${verification.totalEvents} sequential SHA-256 hashes recomputed successfully. 0 broken links or database modifications detected.`
                  : `Hash chain broken at sequence #${verification.brokenAt}: ${verification.reason}`}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-navy-950 px-3 py-1 rounded-lg border border-navy-800">
            {verification.valid ? '100% VALID' : 'TAMPERED'}
          </span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-navy-900 border border-navy-800 p-4 rounded-xl text-xs">
        {/* Actor Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Actor:</span>
          {['all', 'user', 'agent', 'system'].map((a) => (
            <button
              key={a}
              onClick={() => setActorFilter(a)}
              className={`px-2.5 py-1 rounded-lg capitalize font-mono transition ${
                actorFilter === a
                  ? 'bg-brand-cyan text-navy-950 font-bold'
                  : 'text-slate-400 hover:text-white bg-navy-950 border border-navy-800'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Decision Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Decision:</span>
          {['all', 'ALLOW', 'NEEDS_APPROVAL', 'DENIED', 'EXECUTED', 'BLOCKED'].map((d) => (
            <button
              key={d}
              onClick={() => setDecisionFilter(d)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
                decisionFilter === d
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-navy-950 border border-navy-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Events Timeline Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950 text-slate-400 border-b border-navy-800 font-mono uppercase text-[11px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">Seq</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor</th>
                <th className="py-3 px-3">Tier</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-3">Decision</th>
                <th className="py-3 px-3">Rules</th>
                <th className="py-3 px-3 font-mono">Hash Preview</th>
                <th className="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {filteredEvents.map((e) => {
                const isAllow = e.decision === 'ALLOW' || e.decision === 'EXECUTED';
                const isNeedsApproval = e.decision === 'NEEDS_APPROVAL';
                const isDenied = e.decision === 'DENIED' || e.decision === 'BLOCKED';
                const isExpanded = expandedSeq === e.seq;

                return (
                  <React.Fragment key={e.seq}>
                    <tr
                      onClick={() => setExpandedSeq(isExpanded ? null : e.seq)}
                      className="hover:bg-navy-850/50 cursor-pointer transition"
                    >
                      <td className="py-3 px-3 text-center font-bold text-slate-300">{e.seq}</td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">{e.ts.slice(11, 19)}</td>
                      <td className="py-3 px-3">
                        <span className="font-sans font-bold text-slate-300 capitalize">{e.actor}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-navy-950 border border-navy-800 text-slate-400 text-[10px]">
                          {e.tier}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white font-sans">{e.action}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAllow
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isNeedsApproval
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {e.decision}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-brand-cyan text-[11px]">
                        {e.rule_ids.join(', ') || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]" title={`Full SHA-256: ${e.hash}`}>
                        {e.hash.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-2 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                    </tr>

                    {/* Expandable Payload */}
                    {isExpanded && (
                      <tr className="bg-navy-950/80">
                        <td colSpan={9} className="p-4 text-xs">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span>Previous Hash: {e.prev_hash}</span>
                              <span>Full SHA-256: {e.hash}</span>
                            </div>
                            <pre className="p-3 bg-navy-900 border border-navy-800 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto">
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
