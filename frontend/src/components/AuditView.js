import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { ShieldCheck, ShieldAlert, Download, CheckCircle2, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
export const AuditView = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [actorFilter, setActorFilter] = useState('all');
    const [decisionFilter, setDecisionFilter] = useState('all');
    const [verification, setVerification] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedSeq, setExpandedSeq] = useState(null);
    useEffect(() => {
        loadAuditEvents();
    }, []);
    const loadAuditEvents = async () => {
        setLoading(true);
        try {
            const res = await api.getAuditEvents(undefined, 300);
            setEvents(res.events);
            setFilteredEvents(res.events);
        }
        catch (err) {
            console.error(err);
        }
        finally {
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
        }
        catch (err) {
            alert(`Verification error: ${err.message}`);
        }
        finally {
            setVerifying(false);
        }
    };
    const handleExport = () => {
        window.open(api.exportAuditUrl(), '_blank');
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-navy-900 border border-navy-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Terminal, { className: "w-5 h-5 text-brand-cyan" }), _jsx("h2", { className: "text-xl font-bold text-white", children: "Append-Only Cryptographic Audit Trail" })] }), _jsx("p", { className: "text-xs text-slate-400", children: "Immutable SHA-256 hash-chained log. SQLite triggers strictly prevent UPDATE or DELETE operations." })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: handleVerify, disabled: verifying, className: "px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5", children: [_jsx(ShieldCheck, { className: "w-4 h-4" }), verifying ? 'Recomputing Hashes...' : 'Verify Chain Integrity'] }), _jsxs("button", { onClick: handleExport, className: "px-4 py-2.5 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-semibold text-xs rounded-xl transition flex items-center gap-1.5", children: [_jsx(Download, { className: "w-4 h-4 text-brand-cyan" }), "Export JSON Lines"] })] })] }), verification && (_jsxs("div", { className: `p-4 rounded-xl border flex items-center justify-between ${verification.valid
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`, children: [_jsxs("div", { className: "flex items-center gap-3 text-xs", children: [verification.valid ? (_jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-400 shrink-0" })) : (_jsx(ShieldAlert, { className: "w-5 h-5 text-rose-400 shrink-0" })), _jsxs("div", { children: [_jsx("span", { className: "font-bold text-sm block", children: verification.valid ? 'Cryptographic Chain Verified Intact' : 'Cryptographic Integrity Failure!' }), _jsx("span", { children: verification.valid
                                            ? `All ${verification.totalEvents} sequential SHA-256 hashes recomputed successfully. 0 broken links or database modifications detected.`
                                            : `Hash chain broken at sequence #${verification.brokenAt}: ${verification.reason}` })] })] }), _jsx("span", { className: "text-xs font-mono font-bold bg-navy-950 px-3 py-1 rounded-lg border border-navy-800", children: verification.valid ? '100% VALID' : 'TAMPERED' })] })), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 bg-navy-900 border border-navy-800 p-4 rounded-xl text-xs", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-slate-400 font-medium", children: "Actor:" }), ['all', 'user', 'agent', 'system'].map((a) => (_jsx("button", { onClick: () => setActorFilter(a), className: `px-2.5 py-1 rounded-lg capitalize font-mono transition ${actorFilter === a
                                    ? 'bg-brand-cyan text-navy-950 font-bold'
                                    : 'text-slate-400 hover:text-white bg-navy-950 border border-navy-800'}`, children: a }, a)))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-slate-400 font-medium", children: "Decision:" }), ['all', 'ALLOW', 'NEEDS_APPROVAL', 'DENIED', 'EXECUTED', 'BLOCKED'].map((d) => (_jsx("button", { onClick: () => setDecisionFilter(d), className: `px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${decisionFilter === d
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'text-slate-400 hover:text-white bg-navy-950 border border-navy-800'}`, children: d }, d)))] })] }), _jsx("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-navy-950 text-slate-400 border-b border-navy-800 font-mono uppercase text-[11px]", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-3 w-12 text-center", children: "Seq" }), _jsx("th", { className: "py-3 px-3", children: "Timestamp" }), _jsx("th", { className: "py-3 px-3", children: "Actor" }), _jsx("th", { className: "py-3 px-3", children: "Tier" }), _jsx("th", { className: "py-3 px-4", children: "Action" }), _jsx("th", { className: "py-3 px-3", children: "Decision" }), _jsx("th", { className: "py-3 px-3", children: "Rules" }), _jsx("th", { className: "py-3 px-3 font-mono", children: "Hash Preview" }), _jsx("th", { className: "py-3 px-2" })] }) }), _jsx("tbody", { className: "divide-y divide-navy-800/60 font-mono", children: filteredEvents.map((e) => {
                                    const isAllow = e.decision === 'ALLOW' || e.decision === 'EXECUTED';
                                    const isNeedsApproval = e.decision === 'NEEDS_APPROVAL';
                                    const isDenied = e.decision === 'DENIED' || e.decision === 'BLOCKED';
                                    const isExpanded = expandedSeq === e.seq;
                                    return (_jsxs(React.Fragment, { children: [_jsxs("tr", { onClick: () => setExpandedSeq(isExpanded ? null : e.seq), className: "hover:bg-navy-850/50 cursor-pointer transition", children: [_jsx("td", { className: "py-3 px-3 text-center font-bold text-slate-300", children: e.seq }), _jsx("td", { className: "py-3 px-3 text-slate-400 text-[11px]", children: e.ts.slice(11, 19) }), _jsx("td", { className: "py-3 px-3", children: _jsx("span", { className: "font-sans font-bold text-slate-300 capitalize", children: e.actor }) }), _jsx("td", { className: "py-3 px-3", children: _jsx("span", { className: "px-1.5 py-0.5 rounded bg-navy-950 border border-navy-800 text-slate-400 text-[10px]", children: e.tier }) }), _jsx("td", { className: "py-3 px-4 font-bold text-white font-sans", children: e.action }), _jsx("td", { className: "py-3 px-3", children: _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${isAllow
                                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                                : isNeedsApproval
                                                                    ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`, children: e.decision }) }), _jsx("td", { className: "py-3 px-3 text-brand-cyan text-[11px]", children: e.rule_ids.join(', ') || '-' }), _jsxs("td", { className: "py-3 px-3 text-slate-400 text-[11px]", title: `Full SHA-256: ${e.hash}`, children: [e.hash.slice(0, 12), "..."] }), _jsx("td", { className: "py-3 px-2 text-slate-400", children: isExpanded ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" }) })] }), isExpanded && (_jsx("tr", { className: "bg-navy-950/80", children: _jsx("td", { colSpan: 9, className: "p-4 text-xs", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-400 text-[11px]", children: [_jsxs("span", { children: ["Previous Hash: ", e.prev_hash] }), _jsxs("span", { children: ["Full SHA-256: ", e.hash] })] }), _jsx("pre", { className: "p-3 bg-navy-900 border border-navy-800 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto", children: JSON.stringify(e.payload, null, 2) })] }) }) }))] }, e.seq));
                                }) })] }) }) })] }));
};
