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
  CheckCircle2
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
    try {
      await api.chat(userId, 'session_main', 'Detect drift and rebalance portfolio');
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

      {/* Holdings Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-brand-cyan" />
            <h3 className="text-base font-bold text-white">Current Asset Holdings</h3>
          </div>
          <button
            onClick={handleRebalance}
            disabled={rebalancing || !portfolio?.holdings.length}
            className="px-3.5 py-1.5 bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rebalancing ? 'animate-spin text-brand-cyan' : ''}`} />
            Check Drift & Auto-Rebalance
          </button>
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
          <h3 className="text-base font-bold text-white">Simulated Brokerage Orders</h3>
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
