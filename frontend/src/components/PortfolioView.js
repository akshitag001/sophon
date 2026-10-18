import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Wallet, History, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
export const PortfolioView = ({ userId, onNavigateToChat }) => {
    const [portfolio, setPortfolio] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rebalancing, setRebalancing] = useState(false);
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
        try {
            await api.chat(userId, 'session_main', 'Detect drift and rebalance portfolio');
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium block", children: "Total Simulated Net Worth" }), _jsxs("span", { className: "text-3xl font-black text-white mt-1.5 block font-mono", children: ["$", totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsxs("div", { className: "flex items-center gap-2 mt-2 text-xs text-slate-400", children: [_jsxs("span", { children: ["Clock Day: ", portfolio?.currentDay] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { className: "capitalize text-brand-cyan", children: [portfolio?.marketScenario, " Market"] })] })] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium block", children: "Simulated Cash Available" }), _jsxs("span", { className: "text-3xl font-black text-emerald-400 mt-1.5 block font-mono", children: ["$", cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsx("span", { className: "text-xs text-slate-400 mt-2 block", children: totalValue > 0 ? `${((cash / totalValue) * 100).toFixed(1)}% of total portfolio` : '100%' })] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl", children: [_jsx("span", { className: "text-xs text-slate-400 font-medium block", children: "Invested Holdings Market Value" }), _jsxs("span", { className: "text-3xl font-black text-brand-cyan mt-1.5 block font-mono", children: ["$", holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })] }), _jsxs("span", { className: "text-xs text-slate-400 mt-2 block", children: [portfolio?.holdings.length || 0, " active asset positions"] })] })] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "w-5 h-5 text-brand-cyan" }), _jsx("h3", { className: "text-base font-bold text-white", children: "Current Asset Holdings" })] }), _jsxs("button", { onClick: handleRebalance, disabled: rebalancing || !portfolio?.holdings.length, className: "px-3.5 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5", children: [_jsx(RefreshCw, { className: `w-3.5 h-3.5 ${rebalancing ? 'animate-spin text-brand-cyan' : ''}` }), "Check Drift & Auto-Rebalance"] })] }), !portfolio?.holdings.length ? (_jsxs("div", { className: "p-8 text-center text-slate-400 border border-dashed border-navy-800 rounded-xl", children: [_jsx("p", { className: "text-sm", children: "No asset holdings currently settled." }), _jsx("p", { className: "text-xs text-slate-500 mt-1", children: "Ask the advisor to invest your cash or advance the simulation clock to settle queued orders." })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-navy-950/80 text-slate-400 border-b border-navy-800 font-mono uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3 px-4", children: "Product" }), _jsx("th", { className: "py-3 px-4", children: "Asset Class" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Units" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Avg Cost" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Current Price" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Market Value" }), _jsx("th", { className: "py-3 px-4 text-right", children: "Unrealized P&L" })] }) }), _jsx("tbody", { className: "divide-y divide-navy-800/60", children: portfolio.holdings.map((h) => {
                                        const isPositive = h.unrealizedPnL >= 0;
                                        return (_jsxs("tr", { className: "hover:bg-navy-850/50 transition", children: [_jsx("td", { className: "py-3.5 px-4 font-bold text-white", children: h.productName }), _jsx("td", { className: "py-3.5 px-4 text-slate-400 uppercase font-mono", children: h.assetClass }), _jsx("td", { className: "py-3.5 px-4 text-right font-mono text-slate-300", children: h.units }), _jsxs("td", { className: "py-3.5 px-4 text-right font-mono text-slate-300", children: ["$", h.avgCost.toFixed(2)] }), _jsxs("td", { className: "py-3.5 px-4 text-right font-mono text-white font-semibold", children: ["$", h.currentPrice.toFixed(2)] }), _jsxs("td", { className: "py-3.5 px-4 text-right font-mono font-bold text-slate-100", children: ["$", h.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })] }), _jsxs("td", { className: `py-3.5 px-4 text-right font-mono font-bold flex items-center justify-end gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`, children: [isPositive ? _jsx(ArrowUpRight, { className: "w-3.5 h-3.5" }) : _jsx(ArrowDownRight, { className: "w-3.5 h-3.5" }), isPositive ? '+' : '', "$", h.unrealizedPnL.toFixed(2), " (", h.unrealizedPnLPct, ")"] })] }, h.productId));
                                    }) })] }) }))] }), _jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl", children: [_jsxs("div", { className: "flex items-center gap-2 mb-4", children: [_jsx(History, { className: "w-5 h-5 text-brand-cyan" }), _jsx("h3", { className: "text-base font-bold text-white", children: "Simulated Brokerage Orders" })] }), !orders.length ? (_jsx("div", { className: "p-6 text-center text-slate-400 text-xs", children: "No orders recorded in sandbox yet." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { className: "bg-navy-950/80 text-slate-400 border-b border-navy-800 font-mono uppercase", children: _jsxs("tr", { children: [_jsx("th", { className: "py-2.5 px-3", children: "Order ID" }), _jsx("th", { className: "py-2.5 px-3", children: "Side" }), _jsx("th", { className: "py-2.5 px-3", children: "Product" }), _jsx("th", { className: "py-2.5 px-3 text-right", children: "Amount" }), _jsx("th", { className: "py-2.5 px-3 text-right", children: "Fee" }), _jsx("th", { className: "py-2.5 px-3", children: "Exec Day" }), _jsx("th", { className: "py-2.5 px-3", children: "Settle Day" }), _jsx("th", { className: "py-2.5 px-3", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-navy-800/60 font-mono", children: orders.map((o) => (_jsxs("tr", { className: "hover:bg-navy-850/50 transition", children: [_jsx("td", { className: "py-2.5 px-3 text-slate-400", children: o.id }), _jsx("td", { className: "py-2.5 px-3 font-bold", children: _jsx("span", { className: o.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400', children: o.side }) }), _jsx("td", { className: "py-2.5 px-3 font-sans text-slate-200", children: o.productName }), _jsxs("td", { className: "py-2.5 px-3 text-right text-white font-bold", children: ["$", o.amount.toLocaleString()] }), _jsxs("td", { className: "py-2.5 px-3 text-right text-slate-400", children: ["$", o.fee.toFixed(2)] }), _jsxs("td", { className: "py-2.5 px-3 text-slate-400", children: ["Day ", o.executionDay] }), _jsxs("td", { className: "py-2.5 px-3 text-slate-400", children: ["Day ", o.settlementDay] }), _jsx("td", { className: "py-2.5 px-3 font-sans", children: _jsx("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded-full ${o.status === 'settled'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                        : o.status === 'queued'
                                                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`, children: o.status.toUpperCase() }) })] }, o.id))) })] }) }))] })] }));
};
