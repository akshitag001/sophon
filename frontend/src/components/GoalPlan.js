import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Compass, Target, Sparkles, TrendingUp } from 'lucide-react';
export const GoalPlan = ({ userId, userProfile, onNavigateToProfile }) => {
    const [targetAmount, setTargetAmount] = useState(30000);
    const [years, setYears] = useState(6);
    const [initialAmount, setInitialAmount] = useState(5000);
    const [monthlyContribution, setMonthlyContribution] = useState(300);
    const [plan, setPlan] = useState(null);
    const [simulation, setSimulation] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (userProfile) {
            handleBuildAndSimulate();
        }
    }, [userProfile]);
    const handleBuildAndSimulate = async () => {
        if (!userProfile)
            return;
        setLoading(true);
        try {
            const generatedPlan = await api.buildPlan(userId, {
                name: 'Home Deposit',
                targetAmount,
                years
            });
            setPlan(generatedPlan);
            const sim = await api.simulateGoal(generatedPlan, initialAmount, monthlyContribution, years, targetAmount, 42);
            setSimulation(sim);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    if (!userProfile) {
        return (_jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-2xl space-y-4", children: [_jsx(Compass, { className: "w-12 h-12 text-brand-cyan mx-auto" }), _jsx("h3", { className: "text-xl font-bold text-white", children: "Risk Profile Required" }), _jsx("p", { className: "text-xs text-slate-400", children: "Under strict suitability compliance, the agent cannot build an investment plan without an active, verified risk assessment." }), _jsx("button", { onClick: onNavigateToProfile, className: "px-5 py-2.5 bg-brand-cyan text-navy-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition shadow-lg shadow-brand-cyan/20", children: "Start Risk Questionnaire" })] }));
    }
    const ASSET_COLORS = {
        equity: '#00D4FF',
        bonds: '#2563EB',
        cash: '#10B981',
        real_assets: '#F59E0B',
        balanced: '#8B5CF6'
    };
    const donutData = plan
        ? plan.allocations.map((a) => ({
            name: `${a.assetClass.toUpperCase()}: ${a.productName}`,
            value: Math.round(a.weight * 100),
            color: ASSET_COLORS[a.assetClass] || '#64748B'
        }))
        : [];
    const chartData = simulation
        ? simulation.yearlyPercentiles.map((p) => ({
            year: `Yr ${p.year}`,
            P10: p.p10,
            P50: p.p50,
            P90: p.p90,
            Target: p.targetLine
        }))
        : [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-navy-900 border border-navy-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Target, { className: "w-5 h-5 text-brand-cyan" }), _jsx("h2", { className: "text-xl font-bold text-white", children: "Goal Asset Allocation & Monte Carlo Simulation" })] }), _jsx("p", { className: "text-xs text-slate-400", children: "Demo Persona: Priya (24) \u2014 First-time home deposit goal. 5,000 seeded paths under Geometric Brownian Motion." })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-400 block mb-0.5", children: "Target ($)" }), _jsx("input", { type: "number", value: targetAmount, onChange: (e) => setTargetAmount(Number(e.target.value)), className: "w-24 bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-400 block mb-0.5", children: "Horizon (Yrs)" }), _jsx("input", { type: "number", value: years, onChange: (e) => setYears(Number(e.target.value)), className: "w-16 bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-400 block mb-0.5", children: "Initial ($)" }), _jsx("input", { type: "number", value: initialAmount, onChange: (e) => setInitialAmount(Number(e.target.value)), className: "w-20 bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white" })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-400 block mb-0.5", children: "Monthly ($)" }), _jsx("input", { type: "number", value: monthlyContribution, onChange: (e) => setMonthlyContribution(Number(e.target.value)), className: "w-20 bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white" })] }), _jsxs("button", { onClick: handleBuildAndSimulate, disabled: loading, className: "mt-3.5 px-4 py-1.5 bg-brand-cyan text-navy-950 font-bold text-xs rounded-lg hover:bg-cyan-300 transition flex items-center gap-1 shadow-md shadow-brand-cyan/20", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5" }), loading ? 'Simulating...' : 'Recalculate'] })] })] }), simulation && (_jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-navy-900 border border-navy-800 p-4 rounded-xl shadow-lg", children: [_jsx("span", { className: "text-[11px] text-slate-400 font-medium block", children: "Probability of Success" }), _jsxs("span", { className: `text-2xl font-black mt-1 block ${simulation.probabilityOfSuccess >= 75
                                    ? 'text-emerald-400'
                                    : simulation.probabilityOfSuccess >= 50
                                        ? 'text-amber-300'
                                        : 'text-rose-400'}`, children: [simulation.probabilityOfSuccess, "%"] }), _jsx("span", { className: "text-[10px] text-slate-400 mt-1 block", children: "5,000 Monte Carlo Paths" })] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 p-4 rounded-xl shadow-lg", children: [_jsx("span", { className: "text-[11px] text-slate-400 font-medium block", children: "Monthly Needed for 75%" }), _jsxs("span", { className: "text-2xl font-black text-brand-cyan mt-1 block font-mono", children: ["$", simulation.monthlyNeededFor75Pct, _jsx("span", { className: "text-xs text-slate-400 font-normal", children: "/mo" })] }), _jsx("span", { className: "text-[10px] text-slate-400 mt-1 block", children: "Solved via Bisection Search" })] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 p-4 rounded-xl shadow-lg", children: [_jsx("span", { className: "text-[11px] text-slate-400 font-medium block", children: "Median Final Wealth (P50)" }), _jsxs("span", { className: "text-2xl font-black text-white mt-1 block font-mono", children: ["$", simulation.terminalValues.p50.toLocaleString()] }), _jsxs("span", { className: "text-[10px] text-emerald-400 mt-1 block", children: ["+$", (simulation.terminalValues.p50 - targetAmount).toLocaleString(), " above target"] })] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 p-4 rounded-xl shadow-lg", children: [_jsx("span", { className: "text-[11px] text-slate-400 font-medium block", children: "Conservative Floor (P10)" }), _jsxs("span", { className: "text-2xl font-black text-slate-300 mt-1 block font-mono", children: ["$", simulation.terminalValues.p10.toLocaleString()] }), _jsx("span", { className: "text-[10px] text-slate-400 mt-1 block", children: "10th Percentile Pessimistic" })] })] })), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [_jsxs("div", { className: "lg:col-span-8 bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-brand-cyan" }), "Monte Carlo Projection Fan Chart (P10 / P50 / P90)"] }), _jsxs("p", { className: "text-[11px] text-slate-400", children: ["Correlated geometric random walk with $", (plan?.expectedReturn ? plan.expectedReturn * 100 : 7.5).toFixed(1), "% portfolio expected return."] })] }), _jsx("span", { className: "text-xs font-mono text-slate-400", children: "Seed: 42" })] }), _jsx("div", { className: "h-72 w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: chartData, margin: { top: 10, right: 20, left: 10, bottom: 0 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "p90Grad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#00D4FF", stopOpacity: 0.25 }), _jsx("stop", { offset: "95%", stopColor: "#00D4FF", stopOpacity: 0.0 })] }), _jsxs("linearGradient", { id: "p50Grad", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#2563EB", stopOpacity: 0.4 }), _jsx("stop", { offset: "95%", stopColor: "#2563EB", stopOpacity: 0.05 })] })] }), _jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#1E293B" }), _jsx(XAxis, { dataKey: "year", stroke: "#64748B", fontSize: 11 }), _jsx(YAxis, { stroke: "#64748B", fontSize: 11, tickFormatter: (val) => `$${val / 1000}k` }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#0B1528', borderColor: '#1E293B', borderRadius: 8, fontSize: 12 }, formatter: (value) => [`$${Number(value).toLocaleString()}`, ''] }), _jsx(Legend, { wrapperStyle: { fontSize: 11, paddingTop: 10 } }), _jsx(Area, { type: "monotone", dataKey: "P90", stroke: "#00D4FF", fill: "url(#p90Grad)", name: "Optimistic (P90)" }), _jsx(Area, { type: "monotone", dataKey: "P50", stroke: "#60A5FA", fill: "url(#p50Grad)", strokeWidth: 2, name: "Median (P50)" }), _jsx(Line, { type: "monotone", dataKey: "P10", stroke: "#94A3B8", strokeDasharray: "4 4", strokeWidth: 1.5, name: "Conservative (P10)" }), _jsx(Line, { type: "monotone", dataKey: "Target", stroke: "#F43F5E", strokeWidth: 2, strokeDasharray: "6 4", name: "Target Goal" })] }) }) })] }), _jsxs("div", { className: "lg:col-span-4 bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between", children: [_jsxs("div", { className: "mb-2", children: [_jsxs("h3", { className: "text-sm font-bold text-white flex items-center gap-2", children: [_jsx(Compass, { className: "w-4 h-4 text-brand-cyan" }), "Target Allocation (Risk ", userProfile.level, " / ", userProfile.label, ")"] }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Lowest-cost suitable fund selected per asset bucket." })] }), _jsx("div", { className: "h-44 w-full relative", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: donutData, cx: "50%", cy: "50%", innerRadius: 50, outerRadius: 70, paddingAngle: 3, dataKey: "value", children: donutData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { backgroundColor: '#0B1528', borderColor: '#1E293B', borderRadius: 8, fontSize: 11 }, formatter: (value) => [`${value}%`, 'Target Weight'] })] }) }) }), _jsx("div", { className: "space-y-2 text-xs pt-2 border-t border-navy-800", children: plan?.allocations.map((a, i) => (_jsxs("div", { className: "flex items-center justify-between py-1 border-b border-navy-850/60", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: ASSET_COLORS[a.assetClass] || '#64748B' } }), _jsx("span", { className: "text-slate-300 font-medium truncate max-w-[170px]", children: a.productName })] }), _jsxs("span", { className: "font-bold text-white font-mono", children: [(a.weight * 100).toFixed(0), "%"] })] }, i))) })] })] })] }));
};
