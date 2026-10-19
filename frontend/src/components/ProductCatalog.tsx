import React, { useState, useEffect } from 'react';
import { api, Product, RiskProfile } from '../api/client';
import {
  Layers,
  Scale,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  CheckSquare,
  Square,
  X
} from 'lucide-react';

interface ProductCatalogProps {
  userProfile: RiskProfile | null;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ userProfile }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<any[] | null>(null);
  const [comparing, setComparing] = useState<boolean>(false);
  const [showMatrix, setShowMatrix] = useState<boolean>(false);
  const [matrixData, setMatrixData] = useState<any[]>([]);
  const [loadingMatrix, setLoadingMatrix] = useState<boolean>(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.getProducts();
      setProducts(res.products);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMatrix = async () => {
    if (!showMatrix) {
      setLoadingMatrix(true);
      try {
        const uId = userProfile ? userProfile.user_id : 'priya';
        const res = await api.getSuitabilityMatrix(uId);
        setMatrixData(res.matrix);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMatrix(false);
      }
    }
    setShowMatrix(!showMatrix);
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
    <div className="space-y-6 font-sans">
      {/* Header and Category Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-[#1e1e1e]/10 p-6 rounded-sm shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#111111]" />
            <h2 className="text-sm font-clash font-bold text-[#111111]">Investment Catalog &amp; Suitability Matrix</h2>
          </div>
          <p className="text-xs text-[#838282] mt-1 font-satoshi font-medium">
            Institutional mutual funds, sovereign bond ETFs, and equity indexes with deterministic fee &amp; Sharpe metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle Suitability Matrix View */}
          <button
            onClick={handleToggleMatrix}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border ${
              showMatrix
                ? 'bg-[#111111] text-[#f2f2f2] border-[#111111] shadow-sm'
                : 'bg-white border-[#1e1e1e]/15 text-[#111111] hover:bg-[#111111] hover:text-[#f2f2f2]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{showMatrix ? 'Standard Catalog' : 'View S1–S7 Suitability Matrix'}</span>
          </button>

          {/* Categories */}
          {!showMatrix && (
            <div className="flex flex-wrap gap-1 bg-[#f2f2f2] p-1 rounded-full border border-[#1e1e1e]/10">
              {['all', 'cash', 'bonds', 'balanced', 'equity', 'real_assets'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition ${
                    selectedCategory === cat
                      ? 'bg-[#111111] text-[#f2f2f2] font-semibold shadow-sm'
                      : 'text-[#838282] hover:text-[#111111]'
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
        <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e1e1e]/10">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#111111]" />
                <h3 className="text-sm font-clash font-bold text-[#111111]">Active Regulatory Suitability Matrix (Rules S1–S7)</h3>
              </div>
              <p className="text-xs text-[#838282] mt-0.5 font-mono">
                Evaluated for client {userProfile ? `${userProfile.user_id.toUpperCase()} (Risk Level ${userProfile.level}/5)` : 'Retail Investor'}.
                Guaranteed in code prior to any broker order submission.
              </p>
            </div>
          </div>

          {loadingMatrix ? (
            <div className="p-12 text-center text-[#838282] font-mono text-xs">Loading suitability evaluations...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1e1e1e]/10 bg-[#f2f2f2] text-[10px] uppercase text-[#838282]">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Asset Class</th>
                    <th className="p-3">Risk Level</th>
                    <th className="p-3">S1: Ceiling</th>
                    <th className="p-3">S2: KYC</th>
                    <th className="p-3">S3: Contradiction</th>
                    <th className="p-3">S4: Reserve</th>
                    <th className="p-3">S5: 40% Cap</th>
                    <th className="p-3">S6: Liquidity</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e1e]/10">
                  {matrixData.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-[#f2f2f2]/60 transition"
                    >
                      <td className="p-3 font-semibold text-[#111111] font-sans">
                        {row.name}
                        <span className="block text-[10px] text-[#838282] font-mono">{row.id}</span>
                      </td>
                      <td className="p-3 text-[#111111] capitalize">{row.assetClass}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] font-bold text-[10px]">
                          L{row.riskLevel}/5
                        </span>
                      </td>

                      <td className="p-3">
                        {row.rules.S1.allowed ? (
                          <span className="text-[#111111] flex items-center gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" /> Pass
                          </span>
                        ) : (
                          <span className="text-[#838282] flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Block
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S2.allowed ? (
                          <span className="text-[#111111] flex items-center gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" /> Pass
                          </span>
                        ) : (
                          <span className="text-[#838282] flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Expired
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S3.allowed ? (
                          <span className="text-[#111111] flex items-center gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" /> Clear
                          </span>
                        ) : (
                          <span className="text-[#838282] flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Flag
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S4.allowed ? (
                          <span className="text-[#111111] flex items-center gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" /> OK
                          </span>
                        ) : (
                          <span className="text-[#838282] flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Block
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S5.allowed ? (
                          <span className="text-[#111111] flex items-center gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" /> OK
                          </span>
                        ) : (
                          <span className="text-[#838282] flex items-center gap-1 text-[11px]">
                            <XCircle className="w-3.5 h-3.5" /> Cap
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {row.rules.S6.allowed ? (
                          <span className="text-[#111111] flex items-center gap-1 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" /> {row.rules.S6.note}
                          </span>
                        ) : (
                          <span className="text-[#838282] flex items-center gap-1 text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Warn
                          </span>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-max ${
                            row.overallAllowed
                              ? 'bg-[#111111] text-[#f2f2f2]'
                              : 'bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#838282]'
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
        <div className="fixed bottom-6 right-6 z-40 bg-white border border-[#111111] p-4 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className="text-xs text-[#111111] font-mono">
            <span className="font-bold text-[#111111]">{selectedIds.length}</span> / 3 selected
          </div>
          <button
            onClick={handleCompare}
            disabled={comparing}
            className="px-4 py-2 bg-[#111111] text-[#f2f2f2] font-semibold text-xs rounded-full hover:bg-black transition flex items-center gap-1.5 shadow-sm"
          >
            <Scale className="w-3.5 h-3.5" /> Compare Side-by-Side
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-[#838282] hover:text-[#111111] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Standard Products Grid */}
      {!showMatrix && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isBlocked = p.risk_level > userMaxRisk;
            const isSelected = selectedIds.includes(p.id);

            return (
              <div
                key={p.id}
                className={`p-6 rounded-sm border transition-all duration-300 relative overflow-hidden flex flex-col justify-between card-hover-swiss ${
                  isBlocked
                    ? 'bg-white/70 border-[#1e1e1e]/10 opacity-70 hover:opacity-100'
                    : isSelected
                    ? 'bg-white border-[#111111] shadow-md'
                    : 'bg-white border-[#1e1e1e]/10'
                }`}
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#838282] bg-[#f2f2f2] px-2.5 py-1 rounded">
                      {p.asset_class.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isBlocked
                            ? 'bg-[#f2f2f2] border border-[#1e1e1e]/10 text-[#838282]'
                            : 'bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] font-semibold'
                        }`}
                      >
                        {isBlocked && <Lock className="w-2.5 h-2.5" />}
                        Risk {p.risk_level}/5
                      </span>

                      <button
                        onClick={() => handleToggleSelect(p.id)}
                        className="text-[#838282] hover:text-[#111111] transition"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#111111]" />
                        ) : (
                          <Square className="w-4 h-4 text-[#838282]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-clash font-bold text-[#111111] mb-1.5 leading-snug">{p.name}</h3>
                  <p className="text-xs text-[#838282] mb-5 font-satoshi font-medium line-clamp-2 leading-relaxed">{p.description}</p>
                </div>

                {/* Metrics Pill Matrix */}
                <div>
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#1e1e1e]/10 my-2 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-[#838282] block">Exp. Return</span>
                      <span className="text-xs font-bold text-[#111111]">
                        +{(p.expected_return * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#838282] block">Volatility</span>
                      <span className="text-xs font-semibold text-[#111111]">
                        {(p.volatility * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#838282] block">Expense</span>
                      <span className="text-xs font-semibold text-[#111111]">
                        {(p.expense_ratio * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {isBlocked && (
                    <div className="mt-3 p-2.5 bg-[#f2f2f2] border border-[#1e1e1e]/10 rounded-sm text-[11px] text-[#838282] flex items-center gap-1.5 font-mono">
                      <Lock className="w-3.5 h-3.5 shrink-0 text-[#111111]" />
                      <span>Suitability Block (S1): Exceeds Level {userMaxRisk} profile.</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#1e1e1e]/15 rounded-sm max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e1e1e]/10 mb-6">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#111111]" />
                <h3 className="text-sm font-clash font-bold text-[#111111]">Side-by-Side Product Comparison</h3>
              </div>
              <button
                onClick={() => setComparison(null)}
                className="text-[#838282] hover:text-[#111111] p-1 rounded-sm transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparison.map((c) => (
                <div key={c.id} className="bg-[#f2f2f2] border border-[#1e1e1e]/10 rounded-sm p-5 space-y-4 font-mono">
                  <div className="border-b border-[#1e1e1e]/10 pb-3">
                    <span className="text-[10px] text-[#838282] uppercase">{c.asset_class}</span>
                    <h4 className="text-xs font-clash font-bold text-[#111111] leading-tight mt-1">{c.name}</h4>
                    <span className="text-[11px] text-[#838282] mt-1 inline-block">
                      Risk Level {c.risk_level}/5
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1e1e1e]/10">
                      <span className="text-[#838282]">10-Yr Fee Cost:</span>
                      <span className="font-bold text-[#111111]">${c.fee_cost_10y_on_10k}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1e1e1e]/10">
                      <span className="text-[#838282]">Sharpe Ratio:</span>
                      <span className="font-bold text-[#111111]">{c.sharpe_ratio}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1e1e1e]/10">
                      <span className="text-[#838282]">Exp. Return:</span>
                      <span className="font-semibold text-[#111111]">{c.expected_return_pct}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1e1e1e]/10">
                      <span className="text-[#838282]">Volatility:</span>
                      <span className="font-semibold text-[#111111]">{c.volatility_pct}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1e1e1e]/10">
                      <span className="text-[#838282]">Best 1-Yr:</span>
                      <span className="font-bold text-[#111111]">{c.best_year_pct}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1e1e1e]/10">
                      <span className="text-[#838282]">Worst 1-Yr:</span>
                      <span className="font-semibold text-[#838282]">{c.worst_year_pct}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#838282]">Min. Inv.:</span>
                      <span className="font-semibold text-[#111111]">${c.min_investment}</span>
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
