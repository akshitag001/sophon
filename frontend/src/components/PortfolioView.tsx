import React, { useState, useEffect } from 'react';
import { api, PortfolioView as IPortfolioView, OrderRecord } from '../api/client';
import {
  Wallet,
  TrendingUp,
  Clock,
  History,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  PieChart,
  Scale
} from 'lucide-react';

interface PortfolioViewProps {
  userId: string;
  onNavigateToChat: () => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ userId, onNavigateToChat }) => {
  const [portfolio, setPortfolio] = useState<IPortfolioView | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [rebalancing, setRebalancing] = useState(false);
  const [rebalanceSuccessMsg, setRebalanceSuccessMsg] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error(err);
    } finally {
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
    } catch (err: any) {
      alert(`Rebalancing failed: ${err.message}`);
    } finally {
      setRebalancing(false);
    }
  };

  if (loading && !portfolio) {
    return <div className="p-8 text-center text-slate-400">Loading simulated portfolio & holdings...</div>;
  }

  const totalValue = portfolio?.totalPortfolioValue || 0;
  const cash = portfolio?.cash || 0;
  const holdingsValue = portfolio?.totalHoldingsValue || 0;

  // Compute equity vs fixed income vs cash weights
  let equityValue = 0;
  let bondValue = 0;
  portfolio?.holdings.forEach((h) => {
    if (h.assetClass === 'equity') equityValue += h.marketValue;
    else if (h.assetClass === 'bonds') bondValue += h.marketValue;
  });

  const equityWeight = totalValue > 0 ? (equityValue / totalValue) * 100 : 0;
  const bondWeight = totalValue > 0 ? (bondValue / totalValue) * 100 : 0;
  const cashWeight = totalValue > 0 ? (cash / totalValue) * 100 : 100;

  // Target for Level 2 (Chen): 35% Equity, 50% Bonds, 15% Cash
  const targetEquity = 35;
  const targetBond = 50;
  const equityDrift = equityWeight - targetEquity;
  const hasSignificantDrift = Math.abs(equityDrift) > 5;

  return (
    <div className="space-y-6">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-slate-400 font-medium block">Total Simulated Net Worth</span>
          <span className="text-3xl font-black text-white mt-1.5 block font-mono">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
            <span>Clock Day: {portfolio?.currentDay}</span>
            <span>•</span>
            <span className="capitalize text-brand-cyan">{portfolio?.marketScenario} Market</span>
          </div>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-slate-400 font-medium block">Simulated Cash Available</span>
          <span className="text-3xl font-black text-emerald-400 mt-1.5 block font-mono">
            ${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-400 mt-2 block">
            {totalValue > 0 ? `${((cash / totalValue) * 100).toFixed(1)}% of total portfolio` : '100%'}
          </span>
        </div>

        <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs text-slate-400 font-medium block">Invested Holdings Market Value</span>
          <span className="text-3xl font-black text-brand-cyan mt-1.5 block font-mono">
            ${holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-400 mt-2 block">
            {portfolio?.holdings.length || 0} active asset positions
          </span>
        </div>
      </div>

      {/* Asset Allocation Drift Analysis Card */}
      {portfolio && portfolio.holdings.length > 0 && (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-cyan" />
                Asset Allocation & Portfolio Drift Monitor
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Weights vs Current Market Weights. Mandate tolerance band is ±5%.
              </p>
            </div>

            <button
              onClick={handleRebalance}
              disabled={rebalancing}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-brand-cyan hover:from-blue-500 hover:to-brand-cyan text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-brand-cyan/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${rebalancing ? 'animate-spin' : ''}`} />
              <span>{rebalancing ? 'Evaluating Rebalance Orders...' : 'Generate Auto-Rebalance Orders'}</span>
            </button>
          </div>

          {/* Rebalance Success Banner */}
          {rebalanceSuccessMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Autonomous Advisor Rebalance Triggered:</strong>
                <p className="mt-0.5 opacity-90">{rebalanceSuccessMsg}</p>
              </div>
            </div>
          )}

          {/* Allocation Drift Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Equities</span>
                <span className="font-mono text-white font-bold">{equityWeight.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-navy-850 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-cyan h-full rounded-full" style={{ width: `${Math.min(equityWeight, 100)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Target: {targetEquity}%</span>
                <span className={equityDrift > 5 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  Drift: {equityDrift > 0 ? '+' : ''}{equityDrift.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Fixed Income / Bonds</span>
                <span className="font-mono text-white font-bold">{bondWeight.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-navy-850 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(bondWeight, 100)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Target: {targetBond}%</span>
                <span className="text-slate-400">Drift: {(bondWeight - targetBond).toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-semibold">Liquid Cash</span>
                <span className="font-mono text-white font-bold">{cashWeight.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-navy-850 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${Math.min(cashWeight, 100)}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Target: 15%</span>
                <span className="text-slate-400">Buffer Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-cyan" />
            <h3 className="text-base font-bold text-white">Current Asset Holdings</h3>
          </div>
        </div>

        {!portfolio?.holdings.length ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-navy-800 rounded-xl">
            <p className="text-sm">No asset holdings currently settled.</p>
            <p className="text-xs text-slate-500 mt-1">
              Ask the advisor to invest your cash or advance the simulation clock to settle queued orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/80 text-slate-400 border-b border-navy-800 font-mono uppercase">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Asset Class</th>
                  <th className="py-3 px-4 text-right">Units</th>
                  <th className="py-3 px-4 text-right">Avg Cost</th>
                  <th className="py-3 px-4 text-right">Current Price</th>
                  <th className="py-3 px-4 text-right">Market Value</th>
                  <th className="py-3 px-4 text-right">Unrealized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {portfolio.holdings.map((h) => {
                  const isPositive = h.unrealizedPnL >= 0;
                  return (
                    <tr key={h.productId} className="hover:bg-navy-850/50 transition">
                      <td className="py-3.5 px-4 font-bold text-white">{h.productName}</td>
                      <td className="py-3.5 px-4 text-slate-400 uppercase font-mono">{h.assetClass}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">{h.units}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">${h.avgCost.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-white font-semibold">
                        ${h.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-100">
                        ${h.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono font-bold flex items-center justify-end gap-1 ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {isPositive ? '+' : ''}${h.unrealizedPnL.toFixed(2)} ({h.unrealizedPnLPct})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders History Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-brand-cyan" />
          <h3 className="text-base font-bold text-white">Simulated Brokerage Orders (T+1 Settlement)</h3>
        </div>

        {!orders.length ? (
          <div className="p-6 text-center text-slate-400 text-xs">No orders recorded in sandbox yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/80 text-slate-400 border-b border-navy-800 font-mono uppercase">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Side</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-right">Fee</th>
                  <th className="py-2.5 px-3">Exec Day</th>
                  <th className="py-2.5 px-3">Settle Day</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 font-mono">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-navy-850/50 transition">
                    <td className="py-2.5 px-3 text-slate-400">{o.id}</td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={o.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{o.side}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-200">{o.productName}</td>
                    <td className="py-2.5 px-3 text-right text-white font-bold">${o.amount.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-slate-400">${o.fee.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-400">Day {o.executionDay}</td>
                    <td className="py-2.5 px-3 text-slate-400">Day {o.settlementDay}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status === 'settled'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : o.status === 'queued'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {o.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
