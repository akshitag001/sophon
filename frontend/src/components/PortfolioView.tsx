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
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 font-sans">
        <div className="w-8 h-8 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#838282]">Loading portfolio &amp; positions...</p>
      </div>
    );
  }

  const totalValue = portfolio?.totalPortfolioValue || 0;
  const cash = portfolio?.cash || 0;
  const holdingsValue = portfolio?.totalHoldingsValue || 0;

  let equityValue = 0;
  let bondValue = 0;
  portfolio?.holdings.forEach((h) => {
    if (h.assetClass === 'equity') equityValue += h.marketValue;
    else if (h.assetClass === 'bonds') bondValue += h.marketValue;
  });

  const equityWeight = totalValue > 0 ? (equityValue / totalValue) * 100 : 0;
  const bondWeight = totalValue > 0 ? (bondValue / totalValue) * 100 : 0;
  const cashWeight = totalValue > 0 ? (cash / totalValue) * 100 : 100;

  const targetEquity = 35;
  const targetBond = 50;
  const equityDrift = equityWeight - targetEquity;
  const hasSignificantDrift = Math.abs(equityDrift) > 5;

  return (
    <div className="space-y-6 font-sans">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm card-hover-swiss">
          <span className="text-xs text-[#838282] font-medium block">
            Total Simulated Net Worth
          </span>
          <span className="text-3xl font-clash font-bold text-[#111111] tracking-tight mt-1.5 block">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <div className="flex items-center gap-2 mt-3 text-[11px] font-mono text-[#838282]">
            <span className="px-2.5 py-0.5 rounded-full bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] font-bold">
              DAY {portfolio?.currentDay}
            </span>
            <span className="capitalize text-[#111111]">
              • {portfolio?.marketScenario} Regime
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm card-hover-swiss">
          <span className="text-xs text-[#838282] font-medium block">
            Simulated Liquid Cash
          </span>
          <span className="text-3xl font-clash font-bold text-[#111111] tracking-tight mt-1.5 block">
            ${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] font-mono text-[#838282] mt-3 block">
            {totalValue > 0 ? `${((cash / totalValue) * 100).toFixed(1)}% of total capital` : '100%'}
          </span>
        </div>

        <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm card-hover-swiss">
          <span className="text-xs text-[#838282] font-medium block">
            Invested Market Assets
          </span>
          <span className="text-3xl font-clash font-bold text-[#111111] tracking-tight mt-1.5 block">
            ${holdingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[11px] font-mono text-[#838282] mt-3 block">
            {portfolio?.holdings.length || 0} active asset positions
          </span>
        </div>
      </div>

      {/* Asset Allocation Drift Analysis Card */}
      {portfolio && portfolio.holdings.length > 0 && (
        <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#1e1e1e]/10">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#111111]" />
                <h3 className="text-sm font-clash font-bold text-[#111111]">Asset Allocation &amp; Portfolio Drift Monitor</h3>
              </div>
              <p className="text-xs text-[#838282] mt-1 font-satoshi font-medium">
                Target Model Weights vs Live Evaluated Market Weights (Mandate band: &plusmn;5%).
              </p>
            </div>

            <button
              onClick={handleRebalance}
              disabled={rebalancing}
              className="px-4 py-2 bg-[#111111] hover:bg-black text-[#f2f2f2] text-xs font-semibold rounded-full transition flex items-center gap-2 shadow-sm disabled:opacity-50 font-satoshi"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${rebalancing ? 'animate-spin' : ''}`} />
              <span>{rebalancing ? 'Evaluating...' : 'Trigger Rebalance'}</span>
            </button>
          </div>

          {rebalanceSuccessMsg && (
            <div className="p-4 bg-[#f2f2f2] border border-[#1e1e1e]/15 rounded-sm text-xs text-[#111111] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-[#111111]">Autonomous Advisor Rebalance:</strong>
                <p className="mt-1 text-[#838282] font-mono text-[11px] leading-relaxed">{rebalanceSuccessMsg}</p>
              </div>
            </div>
          )}

          {/* Allocation Drift Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="bg-[#f2f2f2] p-4 rounded-sm border border-[#1e1e1e]/10 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#111111] font-semibold">Equities</span>
                <span className="font-mono text-[#111111] font-bold">{equityWeight.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#1e1e1e]/10">
                <div
                  className="bg-[#111111] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(equityWeight, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#838282]">
                <span>Target: {targetEquity}%</span>
                <span className="text-[#111111] font-bold">
                  Drift: {equityDrift > 0 ? '+' : ''}{equityDrift.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-[#f2f2f2] p-4 rounded-sm border border-[#1e1e1e]/10 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#111111] font-semibold">Fixed Income / Bonds</span>
                <span className="font-mono text-[#111111] font-bold">{bondWeight.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#1e1e1e]/10">
                <div
                  className="bg-[#838282] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(bondWeight, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#838282]">
                <span>Target: {targetBond}%</span>
                <span>Drift: {(bondWeight - targetBond).toFixed(1)}%</span>
              </div>
            </div>

            <div className="bg-[#f2f2f2] p-4 rounded-sm border border-[#1e1e1e]/10 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#111111] font-semibold">Liquid Cash Buffer</span>
                <span className="font-mono text-[#111111] font-bold">{cashWeight.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-[#1e1e1e]/10">
                <div
                  className="bg-[#b6b5b5] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(cashWeight, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-[#838282]">
                <span>Target: 15%</span>
                <span className="text-[#111111] font-semibold">Buffer Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e1e1e]/10">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#111111]" />
            <h3 className="text-sm font-clash font-bold text-[#111111]">Current Asset Holdings</h3>
          </div>
        </div>

        {!portfolio?.holdings.length ? (
          <div className="p-8 text-center text-[#838282] border border-dashed border-[#1e1e1e]/15 rounded-sm">
            <p className="text-xs font-mono">No asset holdings currently settled.</p>
            <p className="text-[11px] text-[#838282] mt-1">
              Ask the advisor in chat to execute an investment or advance the clock to settle queued orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#f2f2f2] text-[#838282] border-b border-[#1e1e1e]/10 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Asset Class</th>
                  <th className="py-3 px-3 text-right">Units</th>
                  <th className="py-3 px-3 text-right">Avg Cost</th>
                  <th className="py-3 px-3 text-right">Current Price</th>
                  <th className="py-3 px-3 text-right">Market Value</th>
                  <th className="py-3 px-3 text-right">Unrealized P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]/10 font-mono">
                {portfolio.holdings.map((h) => {
                  const isPositive = h.unrealizedPnL >= 0;
                  return (
                    <tr key={h.productId} className="hover:bg-[#f2f2f2]/60 transition">
                      <td className="py-3 px-3 font-semibold text-[#111111] font-sans">{h.productName}</td>
                      <td className="py-3 px-3 text-[#838282] uppercase text-[11px]">{h.assetClass}</td>
                      <td className="py-3 px-3 text-right text-[#111111]">{h.units}</td>
                      <td className="py-3 px-3 text-right text-[#838282]">${h.avgCost.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right text-[#111111] font-semibold">
                        ${h.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#111111]">
                        ${h.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold flex items-center justify-end gap-1 text-[#111111]">
                        {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5 text-[#838282]" />}
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
      <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1e1e1e]/10">
          <History className="w-4 h-4 text-[#111111]" />
          <h3 className="text-sm font-clash font-bold text-[#111111]">Simulated Brokerage Orders (T+1 Settlement)</h3>
        </div>

        {!orders.length ? (
          <div className="p-6 text-center text-[#838282] text-xs font-mono">No orders recorded in sandbox yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#f2f2f2] text-[#838282] border-b border-[#1e1e1e]/10 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Side</th>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-right">Fee</th>
                  <th className="py-3 px-3">Exec Day</th>
                  <th className="py-3 px-3">Settle Day</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]/10 font-mono">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#f2f2f2]/60 transition">
                    <td className="py-3 px-3 text-[#838282]">{o.id}</td>
                    <td className="py-3 px-3 font-bold text-[#111111]">
                      {o.side}
                    </td>
                    <td className="py-3 px-3 text-[#111111] font-sans">{o.productName}</td>
                    <td className="py-3 px-3 text-right text-[#111111] font-bold">${o.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-[#838282]">${o.fee.toFixed(2)}</td>
                    <td className="py-3 px-3 text-[#838282]">Day {o.executionDay}</td>
                    <td className="py-3 px-3 text-[#838282]">Day {o.settlementDay}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-[#f2f2f2] border border-[#1e1e1e]/15 text-[#111111] font-bold">
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
