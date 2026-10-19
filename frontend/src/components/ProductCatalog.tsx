import React, { useState, useEffect } from 'react';
import { api, Product, ProductComparison, RiskProfile, SuitabilityMatrixRow } from '../api/client';
import {
  Layers,
  Lock,
  ArrowUpDown,
  CheckSquare,
  Square,
  Scale,
  X,
  TrendingUp,
  Percent,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface ProductCatalogProps {
  userProfile: RiskProfile | null;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ userProfile }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ProductComparison[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  // Suitability Matrix View state
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [matrixData, setMatrixData] = useState<SuitabilityMatrixRow[]>([]);
  const [loadingMatrix, setLoadingMatrix] = useState<boolean>(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts();
      setProducts(res.products);
    } catch (err: any) {
      console.error(err);
    } finally {
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingMatrix(false);
      }
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert('You can select a maximum of 3 products to compare side-by-side.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCompare = async () => {
    if (selectedIds.length === 0) return;
    setComparing(true);
    try {
      const res = await api.compareProducts(selectedIds);
      setComparison(res.comparison);
    } catch (err: any) {
      alert(`Comparison failed: ${err.message}`);
    } finally {
      setComparing(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'cash') return p.asset_class === 'cash';
    if (selectedCategory === 'bonds') return p.asset_class === 'bonds';
    if (selectedCategory === 'equity') return p.asset_class === 'equity';
    if (selectedCategory === 'real_assets') return p.asset_class === 'real_assets';
    if (selectedCategory === 'balanced') return p.asset_class === 'balanced';
    return true;
  });

  const userMaxRisk = userProfile ? userProfile.level : 5;

  return (
    <div className="space-y-6">
      {/* Header and Category Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-cyan" />
            Simulated Investment Product Catalog
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Institutional mutual funds, sovereign bond ETFs, and equity indexes with deterministic fee & Sharpe metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Suitability Matrix View */}
          <button
            onClick={handleToggleMatrix}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
              showMatrix
                ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                : 'bg-navy-950 border-navy-800 text-brand-cyan hover:border-brand-cyan/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{showMatrix ? 'Show Standard Catalog' : 'View S1–S7 Suitability Matrix'}</span>
          </button>

          {/* Categories */}
          {!showMatrix && (
            <div className="flex flex-wrap gap-1 bg-navy-950 p-1 rounded-xl border border-navy-800">
              {['all', 'cash', 'bonds', 'balanced', 'equity', 'real_assets'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                    selectedCategory === cat
                      ? 'bg-brand-cyan text-navy-950 shadow-md shadow-brand-cyan/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* S1-S7 Matrix View */}
      {showMatrix && (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Active Regulatory Suitability Matrix (Rules S1–S7)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluated for client {userProfile ? `${userProfile.user_id.toUpperCase()} (Risk Level ${userProfile.level}/5)` : 'Retail Investor'}.
                Guaranteed in code prior to any broker order submission.
              </p>
            </div>
          </div>

          {loadingMatrix ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading suitability evaluations...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-navy-800 bg-navy-950/60 text-[11px] font-mono uppercase text-slate-400">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Asset Class</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">S1: Risk Ceiling</th>
                    <th className="p-3">S2: KYC Expiry</th>
                    <th className="p-3">S3: Contradiction</th>
                    <th className="p-3">S4: Emergency Res.</th>
                    <th className="p-3">S5: 40% Conc.</th>
                    <th className="p-3">S6: Liquidity</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60">
                  {matrixData.map((row) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-navy-850/50 transition ${
                        !row.overallAllowed ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="p-3 font-semibold text-white">
                        {row.name}
                        <span className="block text-[10px] font-mono text-slate-500">{row.id}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-300 capitalize">{row.assetClass}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            row.riskLevel <= (userProfile?.level || 2)
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          L{row.riskLevel}/5
                        </span>
                      </td>

                      {/* S1 to S6 Rule Badges */}
                      <td className="p-3">
                        {row.rules.S1.allowed ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Block
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S2.allowed ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Expired
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S3.allowed ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Clear
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Flag
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S4.allowed ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Block
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S5.allowed ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> OK
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Cap
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S6.allowed ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {row.rules.S6.note}
                          </span>
                        ) : (
                          <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Warn
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 w-max ${
                            row.overallAllowed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {row.overallAllowed ? 'SUITABLE' : 'BLOCKED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Floating Compare Action Bar if items selected */}
      {selectedIds.length > 0 && !showMatrix && (
        <div className="fixed bottom-6 right-6 z-40 bg-navy-900 border border-brand-cyan/40 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="text-xs text-slate-300">
            <span className="font-bold text-brand-cyan">{selectedIds.length}</span> / 3 products selected for comparison
          </div>
          <button
            onClick={handleCompare}
            disabled={comparing}
            className="px-4 py-2 bg-gradient-to-r from-brand-cyan to-blue-500 text-navy-950 font-bold text-xs rounded-xl hover:opacity-90 transition shadow-lg shadow-brand-cyan/20 flex items-center gap-1.5"
          >
            <Scale className="w-4 h-4" /> Compare Side-by-Side
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Standard Products Grid */}
      {!showMatrix && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isBlocked = p.risk_level > userMaxRisk;
            const isSelected = selectedIds.includes(p.id);

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isBlocked
                    ? 'bg-navy-950/60 border-rose-900/40 opacity-70 hover:opacity-100'
                    : isSelected
                    ? 'bg-navy-850 border-brand-cyan shadow-xl shadow-brand-cyan/10'
                    : 'bg-navy-900 hover:bg-navy-850/80 border-navy-800'
                }`}
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">
                      {p.asset_class.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                          isBlocked
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : p.risk_level <= 2
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isBlocked && <Lock className="w-2.5 h-2.5" />}
                        Risk {p.risk_level}/5
                      </span>

                      <button
                        onClick={() => handleToggleSelect(p.id)}
                        className="text-slate-400 hover:text-brand-cyan transition"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-brand-cyan" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 leading-snug">{p.name}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{p.description}</p>
                </div>

                {/* Metrics Pill Matrix */}
                <div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-navy-800/80 my-2 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Exp. Return</span>
                      <span className="text-xs font-bold text-emerald-400">
                        +{(p.expected_return * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Volatility</span>
                      <span className="text-xs font-bold text-amber-300">
                        {(p.volatility * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Expense Ratio</span>
                      <span className="text-xs font-bold text-slate-300">
                        {(p.expense_ratio * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {isBlocked && (
                    <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[11px] text-rose-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Suitability Block (S1): Exceeds your Level {userMaxRisk} profile.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Comparison Modal */}
      {comparison && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-navy-800 mb-6">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-lg font-bold text-white">Side-by-Side Product Comparison</h3>
              </div>
              <button
                onClick={() => setComparison(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparison.map((c) => (
                <div key={c.id} className="bg-navy-850 border border-navy-800 rounded-xl p-4 space-y-3">
                  <div className="border-b border-navy-800 pb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{c.asset_class}</span>
                    <h4 className="text-sm font-bold text-white leading-tight">{c.name}</h4>
                    <span className="text-xs font-bold text-amber-300 mt-1 inline-block">
                      Risk Level {c.risk_level}/5
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-navy-800/60">
                      <span className="text-slate-400">10-Yr Cost of Fees ($10k):</span>
                      <span className="font-bold text-brand-cyan font-mono">${c.fee_cost_10y_on_10k}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-navy-800/60">
                      <span className="text-slate-400">Sharpe-like Ratio:</span>
                      <span className="font-bold text-emerald-400 font-mono">{c.sharpe_ratio}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-navy-800/60">
                      <span className="text-slate-400">Expected Annual Return:</span>
                      <span className="font-bold text-slate-200">{c.expected_return_pct}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-navy-800/60">
                      <span className="text-slate-400">Annual Volatility:</span>
                      <span className="font-bold text-slate-200">{c.volatility_pct}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-navy-800/60">
                      <span className="text-slate-400">Best 1-Yr Historical:</span>
                      <span className="font-bold text-emerald-400 font-mono">{c.best_year_pct}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-navy-800/60">
                      <span className="text-slate-400">Worst 1-Yr Historical:</span>
                      <span className="font-bold text-rose-400 font-mono">{c.worst_year_pct}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Min. Investment:</span>
                      <span className="font-bold text-slate-200">${c.min_investment}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
