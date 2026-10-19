import React, { useState, useEffect } from 'react';
import { api, InvestmentPlan, SimulationResult, RiskProfile } from '../api/client';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Compass,
  Target,
  Sparkles,
  TrendingUp,
  Percent,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface GoalPlanProps {
  userId: string;
  userProfile: RiskProfile | null;
  onNavigateToProfile: () => void;
}

export const GoalPlan: React.FC<GoalPlanProps> = ({ userId, userProfile, onNavigateToProfile }) => {
  const [targetAmount, setTargetAmount] = useState<number>(30000);
  const [years, setYears] = useState<number>(6);
  const [initialAmount, setInitialAmount] = useState<number>(5000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(300);

  const [plan, setPlan] = useState<InvestmentPlan | null>(null);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      handleBuildAndSimulate();
    }
  }, [userProfile]);

  const handleBuildAndSimulate = async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const generatedPlan = await api.buildPlan(userId, {
        name: 'Home Deposit',
        targetAmount,
        years
      });
      setPlan(generatedPlan);

      const sim = await api.simulateGoal(
        generatedPlan,
        initialAmount,
        monthlyContribution,
        years,
        targetAmount,
        42
      );
      setSimulation(sim);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="bg-white border border-[#1e1e1e]/10 rounded-sm p-8 text-center max-w-xl mx-auto shadow-sm space-y-4 font-sans">
        <Compass className="w-10 h-10 text-[#111111] mx-auto" />
        <h3 className="text-base font-clash font-bold text-[#111111]">Risk Profile Required</h3>
        <p className="text-xs text-[#838282] font-satoshi font-medium leading-relaxed">
          Under strict suitability compliance, the agent cannot build an investment plan without an active, verified risk assessment.
        </p>
        <button
          onClick={onNavigateToProfile}
          className="px-6 py-2.5 bg-[#111111] hover:bg-black text-[#f2f2f2] font-semibold text-xs rounded-full transition shadow-sm font-mono uppercase tracking-wider"
        >
          Start Risk Questionnaire
        </button>
      </div>
    );
  }

  const ASSET_COLORS: Record<string, string> = {
    equity: '#111111',
    bonds: '#838282',
    cash: '#b6b5b5',
    real_assets: '#d9d9d9',
    balanced: '#444444'
  };

  const donutData = plan
    ? plan.allocations.map((a) => ({
        name: `${a.assetClass.toUpperCase()}: ${a.productName}`,
        value: Math.round(a.weight * 100),
        color: ASSET_COLORS[a.assetClass] || '#838282'
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

  return (
    <div className="space-y-6 font-sans">
      {/* Goal Header & Simulation Parameter Controls */}
      <div className="bg-white border border-[#1e1e1e]/10 p-6 rounded-sm shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-[#111111]" />
            <h2 className="text-sm font-clash font-bold text-[#111111]">
              Goal Allocation &amp; Monte Carlo Simulation
            </h2>
          </div>
          <p className="text-xs text-[#838282] font-satoshi font-medium">
            Demo Persona: {userId.toUpperCase()} — Target Horizon Modeling. 5,000 seeded paths under Geometric Brownian Motion.
          </p>
        </div>

        {/* Input Parameters */}
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <div>
            <span className="text-[10px] text-[#838282] uppercase block mb-1">Target ($)</span>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-24 bg-[#f2f2f2] border border-[#1e1e1e]/15 rounded-md px-3 py-1.5 text-xs text-[#111111] font-bold focus:outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#838282] uppercase block mb-1">Horizon (Yrs)</span>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-18 bg-[#f2f2f2] border border-[#1e1e1e]/15 rounded-md px-3 py-1.5 text-xs text-[#111111] font-bold focus:outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#838282] uppercase block mb-1">Initial ($)</span>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-22 bg-[#f2f2f2] border border-[#1e1e1e]/15 rounded-md px-3 py-1.5 text-xs text-[#111111] font-bold focus:outline-none focus:border-[#111111]"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#838282] uppercase block mb-1">Monthly ($)</span>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-22 bg-[#f2f2f2] border border-[#1e1e1e]/15 rounded-md px-3 py-1.5 text-xs text-[#111111] font-bold focus:outline-none focus:border-[#111111]"
            />
          </div>

          <button
            onClick={handleBuildAndSimulate}
            disabled={loading}
            className="mt-4 px-5 py-2 bg-[#111111] hover:bg-black text-[#f2f2f2] font-semibold text-xs rounded-full transition flex items-center gap-1.5 shadow-sm font-satoshi disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>{loading ? 'Simulating...' : 'Recalculate'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {simulation && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#1e1e1e]/10 p-5 rounded-sm shadow-sm card-hover-swiss">
            <span className="text-xs text-[#838282] font-medium block">Probability of Success</span>
            <span className="text-3xl font-clash font-bold tracking-tight mt-1 block text-[#111111]">
              {simulation.probabilityOfSuccess}%
            </span>
            <span className="text-[10px] text-[#838282] font-mono mt-1 block">5,000 Paths</span>
          </div>

          <div className="bg-white border border-[#1e1e1e]/10 p-5 rounded-sm shadow-sm card-hover-swiss">
            <span className="text-xs text-[#838282] font-medium block">Monthly for 75%</span>
            <span className="text-3xl font-clash font-bold tracking-tight text-[#111111] mt-1 block">
              ${simulation.monthlyNeededFor75Pct}
              <span className="text-xs text-[#838282] font-normal">/mo</span>
            </span>
            <span className="text-[10px] text-[#838282] font-mono mt-1 block">Bisection Solver</span>
          </div>

          <div className="bg-white border border-[#1e1e1e]/10 p-5 rounded-sm shadow-sm card-hover-swiss">
            <span className="text-xs text-[#838282] font-medium block">Median Wealth (P50)</span>
            <span className="text-3xl font-clash font-bold tracking-tight text-[#111111] mt-1 block">
              ${simulation.terminalValues.p50.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#111111] font-mono mt-1 block">
              +${(simulation.terminalValues.p50 - targetAmount).toLocaleString()} over goal
            </span>
          </div>

          <div className="bg-white border border-[#1e1e1e]/10 p-5 rounded-sm shadow-sm card-hover-swiss">
            <span className="text-xs text-[#838282] font-medium block">Conservative Floor (P10)</span>
            <span className="text-3xl font-clash font-bold tracking-tight text-[#838282] mt-1 block">
              ${simulation.terminalValues.p10.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#838282] font-mono mt-1 block">Pessimistic</span>
          </div>
        </div>
      )}

      {/* Main Grid: Chart on Left, Allocation Donut on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monte Carlo Fan Chart */}
        <div className="lg:col-span-8 bg-white border border-[#1e1e1e]/10 p-6 rounded-sm shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e1e1e]/10">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#111111]" />
                <h3 className="text-sm font-clash font-bold text-[#111111]">Monte Carlo Projection Fan Chart (P10 / P50 / P90)</h3>
              </div>
              <p className="text-[11px] text-[#838282] font-satoshi mt-0.5">
                Correlated geometric random walk with {(plan?.expectedReturn ? plan.expectedReturn * 100 : 7.5).toFixed(1)}% expected return.
              </p>
            </div>
            <span className="text-xs font-mono text-[#111111] bg-[#f2f2f2] border border-[#1e1e1e]/10 px-2.5 py-1 rounded">Seed: 42</span>
          </div>

          <div className="h-72 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="p90Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111111" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#111111" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="p50Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#838282" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#838282" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 30, 30, 0.08)" />
                <XAxis dataKey="year" stroke="#838282" fontSize={11} />
                <YAxis stroke="#838282" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(30,30,30,0.15)', borderRadius: 4, fontSize: 12, color: '#111111', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="P90" stroke="#111111" strokeWidth={2} fill="url(#p90Grad)" name="Optimistic (P90)" />
                <Area type="monotone" dataKey="P50" stroke="#838282" fill="url(#p50Grad)" strokeWidth={1.5} name="Median (P50)" />
                <Line type="monotone" dataKey="P10" stroke="#b6b5b5" strokeDasharray="3 3" strokeWidth={1.5} name="Conservative (P10)" />
                <Line type="monotone" dataKey="Target" stroke="#111111" strokeWidth={1.5} strokeDasharray="5 5" name="Target Goal" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Donut */}
        <div className="lg:col-span-4 bg-white border border-[#1e1e1e]/10 p-6 rounded-sm shadow-sm flex flex-col justify-between">
          <div className="mb-3 pb-3 border-b border-[#1e1e1e]/10">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#111111]" />
              <h3 className="text-sm font-clash font-bold text-[#111111]">Target Allocation</h3>
            </div>
            <p className="text-[11px] text-[#838282] font-satoshi mt-0.5">
              Risk Level {userProfile.level} ({userProfile.label}). Lowest-cost suitable funds.
            </p>
          </div>

          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: 'rgba(30,30,30,0.15)', borderRadius: 4, fontSize: 11, color: '#111111' }}
                  formatter={(value: any) => [`${value}%`, 'Target Weight']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation List */}
          <div className="space-y-2 text-xs pt-3 border-t border-[#1e1e1e]/10 font-mono">
            {plan?.allocations.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-[#1e1e1e]/5">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ASSET_COLORS[a.assetClass] || '#838282' }}
                  />
                  <span className="text-[#111111] font-sans truncate max-w-[170px]">{a.productName}</span>
                </div>
                <span className="font-bold text-[#111111]">{(a.weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
