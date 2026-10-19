import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Layers, Lock, CheckSquare, Square, Scale, X, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
export const ProductCatalog = ({ userProfile }) => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comparing, setComparing] = useState(false);
    // Suitability Matrix View state
    const [showMatrix, setShowMatrix] = useState(false);
    const [matrixData, setMatrixData] = useState([]);
    const [loadingMatrix, setLoadingMatrix] = useState(false);
    useEffect(() => {
        loadProducts();
    }, []);
    const loadProducts = async () => {
        setLoading(true);
        try {
            const res = await api.getProducts();
            setProducts(res.products);
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleToggleMatrix = async () => {
        const nextState = !showMatrix;
        setShowMatrix(nextState);
        if (nextState && matrixData.length === 0) {
            setLoadingMatrix(true);
            try {
                const res = await api.getSuitabilityMatrix(userProfile?.user_id || 'priya');
                setMatrixData(res.matrix);
            }
            catch (e) {
                console.error(e);
            }
            finally {
                setLoadingMatrix(false);
            }
        }
    };
    const handleToggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((item) => item !== id));
        }
        else {
            if (selectedIds.length >= 3) {
                alert('You can select a maximum of 3 products to compare side-by-side.');
                return;
            }
            setSelectedIds([...selectedIds, id]);
        }
    };
    const handleCompare = async () => {
        if (selectedIds.length === 0)
            return;
        setComparing(true);
        try {
            const res = await api.compareProducts(selectedIds);
            setComparison(res.comparison);
        }
        catch (err) {
            alert(`Comparison failed: ${err.message}`);
        }
        finally {
            setComparing(false);
        }
    };
    const filteredProducts = products.filter((p) => {
        if (selectedCategory === 'all')
            return true;
        if (selectedCategory === 'cash')
            return p.asset_class === 'cash';
        if (selectedCategory === 'bonds')
            return p.asset_class === 'bonds';
        if (selectedCategory === 'equity')
            return p.asset_class === 'equity';
        if (selectedCategory === 'real_assets')
            return p.asset_class === 'real_assets';
        if (selectedCategory === 'balanced')
            return p.asset_class === 'balanced';
        return true;
    });
    const userMaxRisk = userProfile ? userProfile.level : 5;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-bold text-white flex items-center gap-2", children: [_jsx(Layers, { className: "w-5 h-5 text-brand-cyan" }), "Simulated Investment Product Catalog"] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Institutional mutual funds, sovereign bond ETFs, and equity indexes with deterministic fee & Sharpe metrics." })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("button", { onClick: handleToggleMatrix, className: `px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${showMatrix
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                                    : 'bg-navy-950 border-navy-800 text-brand-cyan hover:border-brand-cyan/40'}`, children: [_jsx(ShieldCheck, { className: "w-4 h-4" }), _jsx("span", { children: showMatrix ? 'Show Standard Catalog' : 'View S1–S7 Suitability Matrix' })] }), !showMatrix && (_jsx("div", { className: "flex flex-wrap gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800", children: ['all', 'cash', 'bonds', 'balanced', 'equity', 'real_assets'].map((cat) => (_jsx("button", { onClick: () => setSelectedCategory(cat), className: `px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${selectedCategory === cat
                                        ? 'bg-brand-cyan text-navy-950 shadow-md shadow-brand-cyan/20'
                                        : 'text-slate-400 hover:text-slate-200'}`, children: cat.replace('_', ' ') }, cat))) }))] })] }), showMatrix && (_jsxs("div", { className: "bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsxs("h3", { className: "text-base font-bold text-white flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-400" }), "Active Regulatory Suitability Matrix (Rules S1\u2013S7)"] }), _jsxs("p", { className: "text-xs text-slate-400 mt-0.5", children: ["Evaluated for client ", userProfile ? `${userProfile.user_id.toUpperCase()} (Risk Level ${userProfile.level}/5)` : 'Retail Investor', ". Guaranteed in code prior to any broker order submission."] })] }) }), loadingMatrix ? (_jsx("div", { className: "p-8 text-center text-slate-400 text-xs", children: "Loading suitability evaluations..." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-xs", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-navy-800 bg-navy-950/60 text-[11px] font-mono uppercase text-slate-400", children: [_jsx("th", { className: "p-3", children: "Product Name" }), _jsx("th", { className: "p-3", children: "Asset Class" }), _jsx("th", { className: "p-3", children: "Risk Level" }), _jsx("th", { className: "p-3", children: "S1: Risk Ceiling" }), _jsx("th", { className: "p-3", children: "S2: KYC Expiry" }), _jsx("th", { className: "p-3", children: "S3: Contradiction" }), _jsx("th", { className: "p-3", children: "S4: Emergency Res." }), _jsx("th", { className: "p-3", children: "S5: 40% Conc." }), _jsx("th", { className: "p-3", children: "S6: Liquidity" }), _jsx("th", { className: "p-3", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-navy-800/60", children: matrixData.map((row) => (_jsxs("tr", { className: `hover:bg-navy-850/50 transition ${!row.overallAllowed ? 'bg-rose-950/10' : ''}`, children: [_jsxs("td", { className: "p-3 font-semibold text-white", children: [row.name, _jsx("span", { className: "block text-[10px] font-mono text-slate-500", children: row.id })] }), _jsx("td", { className: "p-3 font-mono text-slate-300 capitalize", children: row.assetClass }), _jsx("td", { className: "p-3", children: _jsxs("span", { className: `px-2 py-0.5 rounded text-[10px] font-mono font-bold ${row.riskLevel <= (userProfile?.level || 2)
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`, children: ["L", row.riskLevel, "/5"] }) }), _jsx("td", { className: "p-3", children: row.rules.S1.allowed ? (_jsxs("span", { className: "text-emerald-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " Pass"] })) : (_jsxs("span", { className: "text-rose-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(XCircle, { className: "w-3.5 h-3.5" }), " Block"] })) }), _jsx("td", { className: "p-3", children: row.rules.S2.allowed ? (_jsxs("span", { className: "text-emerald-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " Pass"] })) : (_jsxs("span", { className: "text-rose-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(XCircle, { className: "w-3.5 h-3.5" }), " Expired"] })) }), _jsx("td", { className: "p-3", children: row.rules.S3.allowed ? (_jsxs("span", { className: "text-emerald-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " Clear"] })) : (_jsxs("span", { className: "text-amber-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(AlertCircle, { className: "w-3.5 h-3.5" }), " Flag"] })) }), _jsx("td", { className: "p-3", children: row.rules.S4.allowed ? (_jsxs("span", { className: "text-emerald-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " OK"] })) : (_jsxs("span", { className: "text-rose-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(XCircle, { className: "w-3.5 h-3.5" }), " Block"] })) }), _jsx("td", { className: "p-3", children: row.rules.S5.allowed ? (_jsxs("span", { className: "text-emerald-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " OK"] })) : (_jsxs("span", { className: "text-rose-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(XCircle, { className: "w-3.5 h-3.5" }), " Cap"] })) }), _jsx("td", { className: "p-3", children: row.rules.S6.allowed ? (_jsxs("span", { className: "text-emerald-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " ", row.rules.S6.note] })) : (_jsxs("span", { className: "text-amber-400 flex items-center gap-1 font-mono text-[11px]", children: [_jsx(AlertCircle, { className: "w-3.5 h-3.5" }), " Warn"] })) }), _jsx("td", { className: "p-3", children: _jsx("span", { className: `px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 w-max ${row.overallAllowed
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`, children: row.overallAllowed ? 'SUITABLE' : 'BLOCKED' }) })] }, row.id))) })] }) }))] })), selectedIds.length > 0 && !showMatrix && (_jsxs("div", { className: "fixed bottom-6 right-6 z-40 bg-navy-900 border border-brand-cyan/40 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300", children: [_jsxs("div", { className: "text-xs text-slate-300", children: [_jsx("span", { className: "font-bold text-brand-cyan", children: selectedIds.length }), " / 3 products selected for comparison"] }), _jsxs("button", { onClick: handleCompare, disabled: comparing, className: "px-4 py-2 bg-gradient-to-r from-brand-cyan to-blue-500 text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition shadow-lg shadow-brand-cyan/20 flex items-center gap-1.5", children: [_jsx(Scale, { className: "w-4 h-4" }), " Compare Side-by-Side"] }), _jsx("button", { onClick: () => setSelectedIds([]), className: "text-slate-400 hover:text-white p-1", children: _jsx(X, { className: "w-4 h-4" }) })] })), !showMatrix && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", children: filteredProducts.map((p) => {
                    const isBlocked = p.risk_level > userMaxRisk;
                    const isSelected = selectedIds.includes(p.id);
                    return (_jsxs("div", { className: `p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${isBlocked
                            ? 'bg-navy-950/60 border-rose-900/40 opacity-70 hover:opacity-100'
                            : isSelected
                                ? 'bg-navy-850 border-brand-cyan shadow-xl shadow-brand-cyan/10'
                                : 'bg-navy-900 hover:bg-navy-850/80 border-navy-800'}`, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800", children: p.asset_class.replace('_', ' ') }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: `text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${isBlocked
                                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                                            : p.risk_level <= 2
                                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`, children: [isBlocked && _jsx(Lock, { className: "w-2.5 h-2.5" }), "Risk ", p.risk_level, "/5"] }), _jsx("button", { onClick: () => handleToggleSelect(p.id), className: "text-slate-400 hover:text-brand-cyan transition", children: isSelected ? (_jsx(CheckSquare, { className: "w-4 h-4 text-brand-cyan" })) : (_jsx(Square, { className: "w-4 h-4 text-slate-500" })) })] })] }), _jsx("h3", { className: "text-base font-bold text-white mb-1.5 leading-snug", children: p.name }), _jsx("p", { className: "text-xs text-slate-400 mb-4 line-clamp-2", children: p.description })] }), _jsxs("div", { children: [_jsxs("div", { className: "grid grid-cols-3 gap-2 py-3 border-y border-navy-800/80 my-2 text-center", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-400 block", children: "Exp. Return" }), _jsxs("span", { className: "text-xs font-bold text-emerald-400", children: ["+", (p.expected_return * 100).toFixed(1), "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-400 block", children: "Volatility" }), _jsxs("span", { className: "text-xs font-bold text-amber-300", children: [(p.volatility * 100).toFixed(1), "%"] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-[10px] text-slate-400 block", children: "Expense Ratio" }), _jsxs("span", { className: "text-xs font-bold text-slate-300", children: [(p.expense_ratio * 100).toFixed(2), "%"] })] })] }), isBlocked && (_jsxs("div", { className: "mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-300 flex items-center gap-1.5", children: [_jsx(Lock, { className: "w-3.5 h-3.5 shrink-0" }), _jsxs("span", { children: ["Suitability Block (S1): Exceeds your Level ", userMaxRisk, " profile."] })] }))] })] }, p.id));
                }) })), comparison && (_jsx("div", { className: "fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-navy-900 border border-navy-750 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative", children: [_jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-navy-800 mb-6", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Scale, { className: "w-5 h-5 text-brand-cyan" }), _jsx("h3", { className: "text-lg font-bold text-white", children: "Side-by-Side Product Comparison" })] }), _jsx("button", { onClick: () => setComparison(null), className: "text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: comparison.map((c) => (_jsxs("div", { className: "bg-navy-850 border border-navy-800 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "border-b border-navy-800 pb-2", children: [_jsx("span", { className: "text-[10px] font-mono text-slate-400 uppercase", children: c.asset_class }), _jsx("h4", { className: "text-sm font-bold text-white leading-tight", children: c.name }), _jsxs("span", { className: "text-xs font-bold text-amber-300 mt-1 inline-block", children: ["Risk Level ", c.risk_level, "/5"] })] }), _jsxs("div", { className: "space-y-2 text-xs", children: [_jsxs("div", { className: "flex justify-between py-1 border-b border-navy-800/60", children: [_jsx("span", { className: "text-slate-400", children: "10-Yr Cost of Fees ($10k):" }), _jsxs("span", { className: "font-bold text-brand-cyan font-mono", children: ["$", c.fee_cost_10y_on_10k] })] }), _jsxs("div", { className: "flex justify-between py-1 border-b border-navy-800/60", children: [_jsx("span", { className: "text-slate-400", children: "Sharpe-like Ratio:" }), _jsx("span", { className: "font-bold text-emerald-400 font-mono", children: c.sharpe_ratio })] }), _jsxs("div", { className: "flex justify-between py-1 border-b border-navy-800/60", children: [_jsx("span", { className: "text-slate-400", children: "Expected Annual Return:" }), _jsx("span", { className: "font-bold text-slate-200", children: c.expected_return_pct })] }), _jsxs("div", { className: "flex justify-between py-1 border-b border-navy-800/60", children: [_jsx("span", { className: "text-slate-400", children: "Annual Volatility:" }), _jsx("span", { className: "font-bold text-slate-200", children: c.volatility_pct })] }), _jsxs("div", { className: "flex justify-between py-1 border-b border-navy-800/60", children: [_jsx("span", { className: "text-slate-400", children: "Best 1-Yr Historical:" }), _jsx("span", { className: "font-bold text-emerald-400 font-mono", children: c.best_year_pct })] }), _jsxs("div", { className: "flex justify-between py-1 border-b border-navy-800/60", children: [_jsx("span", { className: "text-slate-400", children: "Worst 1-Yr Historical:" }), _jsx("span", { className: "font-bold text-rose-400 font-mono", children: c.worst_year_pct })] }), _jsxs("div", { className: "flex justify-between py-1", children: [_jsx("span", { className: "text-slate-400", children: "Min. Investment:" }), _jsxs("span", { className: "font-bold text-slate-200", children: ["$", c.min_investment] })] })] })] }, c.id))) })] }) }))] }));
};
