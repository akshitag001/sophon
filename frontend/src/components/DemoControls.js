import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../api/client';
import { Clock, AlertTriangle, TrendingUp, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
export const DemoControls = ({ currentDay, currentScenario, onRefresh }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const handleAdvance = async (days) => {
        setLoading(true);
        try {
            const res = await api.advanceClock(days);
            setMessage(`Clock advanced ${days} days (Day ${res.clock.currentDay}). ${res.settledCount} orders settled.`);
            onRefresh();
        }
        catch (err) {
            setMessage(`Error: ${err.message}`);
        }
        finally {
            setLoading(false);
        }
    };
    const handleScenario = async (sc) => {
        setLoading(true);
        try {
            await api.setScenario(sc);
            setMessage(`Market scenario switched to: ${sc.toUpperCase()}`);
            onRefresh();
        }
        catch (err) {
            setMessage(`Error: ${err.message}`);
        }
        finally {
            setLoading(false);
        }
    };
    const handleReset = async () => {
        if (!window.confirm('Reset sandbox environment to default demo state?'))
            return;
        setLoading(true);
        try {
            await api.resetSandbox();
            setMessage('Sandbox reset to fresh demo state.');
            onRefresh();
        }
        catch (err) {
            setMessage(`Error: ${err.message}`);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "bg-navy-900 border border-navy-700/80 rounded-xl overflow-hidden shadow-lg transition-all", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold tracking-wider text-brand-cyan hover:bg-navy-850 transition-colors", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-brand-cyan animate-pulse" }), "SIMULATION CONTROLS (DAY ", currentDay, " \u2022 ", currentScenario.toUpperCase(), ")"] }), isOpen ? _jsx(ChevronUp, { className: "w-4 h-4 text-slate-400" }) : _jsx(ChevronDown, { className: "w-4 h-4 text-slate-400" })] }), isOpen && (_jsxs("div", { className: "p-4 border-t border-navy-800 bg-navy-950/70 space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium", children: "Advance Clock:" }), _jsx("button", { onClick: () => handleAdvance(1), disabled: loading, className: "px-2.5 py-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-200 rounded border border-navy-700 transition", children: "+1 Day (T+1 Settle)" }), _jsx("button", { onClick: () => handleAdvance(30), disabled: loading, className: "px-2.5 py-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-200 rounded border border-navy-700 transition", children: "+30 Days" }), _jsx("button", { onClick: () => handleAdvance(90), disabled: loading, className: "px-2.5 py-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-200 rounded border border-navy-700 transition", children: "+90 Days" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium", children: "Scenario Trigger:" }), _jsx("button", { onClick: () => handleScenario('normal'), disabled: loading, className: `px-2.5 py-1 text-xs rounded border transition ${currentScenario === 'normal'
                                    ? 'bg-blue-600/30 text-blue-400 border-blue-500'
                                    : 'bg-navy-800 text-slate-300 border-navy-700 hover:bg-navy-700'}`, children: "Normal Market" }), _jsxs("button", { onClick: () => handleScenario('crash'), disabled: loading, className: `px-2.5 py-1 text-xs flex items-center gap-1 rounded border transition ${currentScenario === 'crash'
                                    ? 'bg-rose-600/30 text-rose-400 border-rose-500'
                                    : 'bg-navy-800 text-rose-300 border-navy-700 hover:bg-navy-700'}`, children: [_jsx(AlertTriangle, { className: "w-3 h-3 text-rose-400" }), "Crash (-25%)"] }), _jsxs("button", { onClick: () => handleScenario('rally'), disabled: loading, className: `px-2.5 py-1 text-xs flex items-center gap-1 rounded border transition ${currentScenario === 'rally'
                                    ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500'
                                    : 'bg-navy-800 text-emerald-300 border-navy-700 hover:bg-navy-700'}`, children: [_jsx(TrendingUp, { className: "w-3 h-3 text-emerald-400" }), "Rally (+15%)"] }), _jsxs("button", { onClick: handleReset, disabled: loading, className: "ml-auto px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 rounded border border-amber-500/40 flex items-center gap-1 transition", children: [_jsx(RefreshCw, { className: "w-3 h-3" }), "Reset Demo"] })] }), message && _jsx("div", { className: "text-xs text-brand-cyan bg-brand-cyan/10 px-3 py-1.5 rounded", children: message })] }))] }));
};
