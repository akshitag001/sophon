import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Wallet, History, RefreshCw, ArrowUpRight, ArrowDownRight, CheckCircle2, Scale } from 'lucide-react';
export const PortfolioView = ({ userId, onNavigateToChat }) => {
    const [portfolio, setPortfolio] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rebalancing, setRebalancing] = useState(false);
    const [rebalanceSuccessMsg, setRebalanceSuccessMsg] = useState(null);
    useEffect(() => {
        loadPortfolioData();
    }, [userId]);
    const loadPortfolioData = async () => {
        setLoading(true);
        try {
            const port = await api.getPortfolio(userId);
            setPortfolio(port);
            const ords = await api.getOrders(userId);
            setOrders(ords.orders);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRebalance = async () => {
        setRebalancing(true);
        setRebalanceSuccessMsg(null);
        try {
            const res = await api.chat(userId, 'session_main', 'Detect drift and rebalance portfolio');
            setRebalanceSuccessMsg(res.reply);
            await loadPortfolioData();
        }
        catch (err) {
            alert(`Rebalancing failed: ${err.message}`);
        }
        finally {
            setRebalancing(false);
        }
    };
    if (loading && !portfolio) {
        return _jsx("div", { className: "p-8 text-center text-slate-400", children: "Loading simulated portfolio & holdings..." });
    }
    const totalValue = portfolio?.totalPortfolioValue || 0;
    const cash = portfolio?.cash || 0;
    const holdingsValue = portfolio?.totalHoldingsValue || 0;
    // Compute equity vs fixed income vs cash weights
    let equityValue = 0;
    let bondValue = 0;
    portfolio?.holdings.forEach((h) => {
        if (h.assetClass === 'equity')
            equityValue += h.marketValue;
        else if (h.assetClass === 'bonds')
            bondValue += h.marketValue;
    });
    const equityWeight = totalValue > 0 ? (equityValue / totalValue) * 100 : 0;
    const bondWeight = totalValue > 0 ? (bondValue / totalValue) * 100 : 0;
    const cashWeight = totalValue > 0 ? (cash / totalValue) * 100 : 100;
    // Target for Level 2 (Chen): 35% Equity, 50% Bonds, 15% Cash
    const targetEquity = 35;
    const targetBond = 50;
    const equityDrift = equityWeight - targetEquity;
    const hasSignificantDrift = Math.abs(equityDrift) > 5;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium block", children: "Total Simulated Net Worth" }), _jsxs("span", { className: "text-3xl font-black text-white mt-1.5 block font-mono", children: ["$", totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsxs("div", { className: "flex items-center gap-2 mt-2 text-xs text-slate-400", children: [_jsxs("span", { children: ["Clock Day: ", portfolio?.currentDay] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "capitalize text-brand-cyan", children: [portfolio?.marketScenario, " Market"] })] })] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium block", children: "Simulated Cash Available" }), _jsxs("span", { className: "text-3xl font-black text-emerald-400 mt-1.5 block font-mono", children: ["$", cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsx("span", { className: "text-xs text-slate-400 mt-2 block", children: totalValue > 0 ? `${((cash / totalValue) * 100).toFixed(1)}% of total portfolio` : '100%' })] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium block", children: "Invested Holdings Market Value" }), _jsxs("span", { className: "text-3xl font-black text-brand-cyan mt-1.5 block font-mono", children: ["$", holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsxs("span", { className: "text-xs text-slate-400 mt-2 block", children: [portfolio?.holdings.length || 0, " active asset positions"] })] })] }), portfolio && portfolio.holdings.length > 0 && (_jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(Scale, { className: "w-5 h-5 text-brand-cyan" }), "Asset Allocation & Portfolio Drift Monitor"] }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: "Target Weights vs Current Market Weights. Mandate tolerance band is \u00B15%." })] }), _jsxs("button", { onClick: handleRebalance, disabled: rebalancing, className: "px-4 py-2 bg-gradient-to-r from-blue-600 to-brand-cyan hover:from-blue-500 hover:to-brand-cyan text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-brand-cyan/20 disabled:opacity-50", children: [_jsx(RefreshCw, { className: `w-3.5 h-3.5 ${rebalancing ? 'animate-spin' : ''}` }), _jsx("span", { children: rebalancing ? 'Evaluating Rebalance Orders...' : 'Generate Auto-Rebalance Orders' })] })] }), rebalanceSuccessMsg && (_jsxs("div", { className: "p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-400 shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("strong", { className: "block font-bold", children: "Autonomous Advisor Rebalance Triggered:" }), _jsx("p", { className: "mt-0.5 opacity-90", children: rebalanceSuccessMsg })] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-2", children: [_jsxs("div", { className: "bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-400 font-semibold", children: "Equities" }), _jsxs("span", { className: "font-mono text-white font-bold", children: [equityWeight.toFixed(1), "%"] })] }), _jsx("div", { className: "w-full bg-navy-850 h-2 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-brand-cyan h-full rounded-full", style: { width: `${Math.min(equityWeight, 100)}%` } }) }), _jsxs("div", { className: "flex justify-between text-[11px] font-mono text-slate-500", children: [_jsxs("span", { children: ["Target: ", targetEquity, "%"] }), _jsxs("span", { className: equityDrift > 5 ? 'text-amber-400 font-bold' : 'text-emerald-400', children: ["Drift: ", equityDrift > 0 ? '+' : '', equityDrift.toFixed(1), "%"] })] })] }), _jsxs("div", { className: "bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-400 font-semibold", children: "Fixed Income / Bonds" }), _jsxs("span", { className: "font-mono text-white font-bold", children: [bondWeight.toFixed(1), "%"] })] }), _jsx("div", { className: "w-full bg-navy-850 h-2 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-blue-500 h-full rounded-full", style: { width: `${Math.min(bondWeight, 100)}%` } }) }), _jsxs("div", { className: "flex justify-between text-[11px] font-mono text-slate-500", children: [_jsxs("span", { children: ["Target: ", targetBond, "%"] }), _jsxs("span", { className: "text-slate-400", children: ["Drift: ", (bondWeight - targetBond).toFixed(1), "%"] })] })] }), _jsxs("div", { className: "bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs", children: [_jsx("span", { className: "text-slate-400 font-semibold", children: "Liquid Cash" }), _jsxs("span", { className: "font-mono text-white font-bold", children: [cashWeight.toFixed(1), "%"] })] }), _jsx("div", { className: "w-full bg-navy-850 h-2 rounded-full overflow-hidden", children: _jsx("div", { className: "bg-emerald-400 h-full rounded-full", style: { width: `${Math.min(cashWeight, 100)}%` } }) }), _jsxs("div", { className: "flex justify-between text-[11px] font-mono text-slate-500", children: [_jsx("span", { children: "Target: 15%" }), _jsx("span", { className: "text-slate-400", children: "Buffer Active" })] })] })] })] })), _jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl", children: [_jsx("div", { className: "flex items-center justify-between mb-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "w-5 h-5 text-brand-cyan" }), _jsx("h3", { className: "text-base font-bold text-white", children: "Current Asset Holdings" })] }) }), !portfolio?.holdings.length ? (_jsxs("div", { className: "p-8 text-center text-slate-400 border border-dashed border-navy-800 rounded-xl", children: [_jsx("p", { className: "text-sm", children: "No asset holdings currently settled." }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Ask the advisor to invest your cash or advance the simulation clock to settle queued orders." })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-navy-950/80 text-slate-400 border-b border-navy-800 font-mono uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Product" }), _jsx("th", { className: "py-3 px-4", children: "Asset Class" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Units" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Avg Cost" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Current Price" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Market Value" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Unrealized P&L" })] }) }), _jsx("tbody", { className: "divide-y divide-navy-800/60", children: portfolio.holdings.map((h) => {
                                        const isPositive = h.unrealizedPnL >= 0;
                                        return (_jsxs("tr", { className: "hover:bg-navy-850/50 transition", children: [_jsx("td", { className: "py-3.5 px-4 font-bold text-white", children: h.productName }), _jsx("td", { className: "py-3.5 px-4 text-slate-400 uppercase font-mono", children: h.assetClass }), _jsx("td", { className: "py-3.5 px-4 text-right font-mono text-slate-300", children: h.units }), _jsxs("td", { className: "py-3.5 px-4 text-right font-mono text-slate-300", children: ["$", h.avgCost.toFixed(2)] }), _jsxs("td", { className: "py-3.5 px-4 text-right font-mono text-white font-semibold", children: ["$", h.currentPrice.toFixed(2)] }), _jsxs("td", { className: "py-3.5 px-4 text-right font-mono font-bold text-slate-100", children: ["$", h.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })] }), _jsxs("td", { className: `py-3.5 px-4 text-right font-mono font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`, children: [isPositive ? _jsx(ArrowUpRight, { className: "w-3.5 h-3.5" }) : _jsx(ArrowDownRight, { className: "w-3.5 h-3.5" }), isPositive ? '+' : '', "$", h.unrealizedPnL.toFixed(2), " (", h.unrealizedPnLPct, ")"] })] }, h.productId));
                                    }) })] }) }))] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(History, { className: "w-5 h-5 text-brand-cyan" }), _jsx("h3", { className: "text-base font-bold text-white", children: "Simulated Brokerage Orders (T+1 Settlement)" })] }), !orders.length ? (_jsx("div", { className: "p-6 text-center text-slate-400 text-xs", children: "No orders recorded in sandbox yet." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-navy-950/80 text-slate-400 border-b border-navy-800 font-mono uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "py-2.5 px-3", children: "Order ID" }), _jsx("th", { className: "py-2.5 px-3", children: "Side" }), _jsx("th", { className: "py-2.5 px-3", children: "Product" }), _jsx("th", { className: "py-2.5 px-3 text-right", children: "Amount" }), _jsx("th", { className: "py-2.5 px-3 text-right", children: "Fee" }), _jsx("th", { className: "py-2.5 px-3", children: "Exec Day" }), _jsx("th", { className: "py-2.5 px-3", children: "Settle Day" }), _jsx("th", { className: "py-2.5 px-3", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-navy-800/60 font-mono", children: orders.map((o) => (_jsxs("tr", { className: "hover:bg-navy-850/50 transition", children: [_jsx("td", { className: "py-2.5 px-3 text-slate-400", children: o.id }), _jsx("td", { className: "py-2.5 px-3 font-bold", children: _jsx("span", { className: o.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400', children: o.side }) }), _jsx("td", { className: "py-2.5 px-3 font-sans text-slate-200", children: o.productName }), _jsxs("td", { className: "py-2.5 px-3 text-right text-white font-bold", children: ["$", o.amount.toLocaleString()] }), _jsxs("td", { className: "py-2.5 px-3 text-right text-slate-400", children: ["$", o.fee.toFixed(2)] }), _jsxs("td", { className: "py-2.5 px-3 text-slate-400", children: ["Day ", o.executionDay] }), _jsxs("td", { className: "py-2.5 px-3 text-slate-400", children: ["Day ", o.settlementDay] }), _jsx("td", { className: "py-2.5 px-3 font-sans", children: _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === 'settled'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                        : o.status === 'queued'
                                                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`, children: o.status.toUpperCase() }) })] }, o.id))) })] }) }))] })] }));
};
