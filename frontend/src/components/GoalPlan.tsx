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
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-2xl space-y-4">
        <Compass className="w-12 h-12 text-brand-cyan mx-auto" />
        <h3 className="text-xl font-bold text-white">Risk Profile Required</h3>
        <p className="text-xs text-slate-400">
          Under strict suitability compliance, the agent cannot build an investment plan without an active, verified risk assessment.
        </p>
        <button
          onClick={onNavigateToProfile}
          className="px-5 py-2.5 bg-brand-cyan text-navy-950 font-bold text-xs rounded-xl hover:bg-cyan-300 transition shadow-lg shadow-brand-cyan/20"
        >
          Start Risk Questionnaire
        </button>
      </div>
    );
  }

  const ASSET_COLORS: Record<string, string> = {
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

  return (
    <div className="space-y-6">
      {/* Goal Header & Simulation Parameter Controls */}
      <div className="bg-navy-900 border border-navy-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-5 h-5 text-brand-cyan" />
            <h2 className="text-xl font-bold text-white">Goal Asset Allocation & Monte Carlo Simulation</h2>
          </div>
          <p className="text-xs text-slate-400">
            Demo Persona: Priya (24) — First-time home deposit goal. 5,000 seeded paths under Geometric Brownian Motion.
          </p>
        </div>

        {/* Input Parameters */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Target ($)</span>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="w-24 bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Horizon (Yrs)</span>
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-16 bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Initial ($)</span>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-20 bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Monthly ($)</span>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-20 bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>

          <button
            onClick={handleBuildAndSimulate}
            disabled={loading}
            className="mt-3.5 px-4 py-1.5 bg-brand-cyan text-navy-950 font-bold text-xs rounded-lg hover:bg-cyan-300 transition flex items-center gap-1 shadow-md shadow-brand-cyan/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? 'Simulating...' : 'Recalculate'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {simulation && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl shadow-lg">
            <span className="text-[11px] text-slate-400 font-medium block">Probability of Success</span>
            <span
              className={`text-2xl font-black mt-1 block ${
                simulation.probabilityOfSuccess >= 75
                  ? 'text-emerald-400'
                  : simulation.probabilityOfSuccess >= 50
                  ? 'text-amber-300'
                  : 'text-rose-400'
              }`}
            >
              {simulation.probabilityOfSuccess}%
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">5,000 Monte Carlo Paths</span>
          </div>

          <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl shadow-lg">
            <span className="text-[11px] text-slate-400 font-medium block">Monthly Needed for 75%</span>
            <span className="text-2xl font-black text-brand-cyan mt-1 block font-mono">
              ${simulation.monthlyNeededFor75Pct}
              <span className="text-xs text-slate-400 font-normal">/mo</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">Solved via Bisection Search</span>
          </div>

          <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl shadow-lg">
            <span className="text-[11px] text-slate-400 font-medium block">Median Final Wealth (P50)</span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">
              ${simulation.terminalValues.p50.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 mt-1 block">
              +${(simulation.terminalValues.p50 - targetAmount).toLocaleString()} above target
            </span>
          </div>

          <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl shadow-lg">
            <span className="text-[11px] text-slate-400 font-medium block">Conservative Floor (P10)</span>
            <span className="text-2xl font-black text-slate-300 mt-1 block font-mono">
              ${simulation.terminalValues.p10.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">10th Percentile Pessimistic</span>
          </div>
        </div>
      )}

      {/* Main Grid: Chart on Left, Allocation Donut on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monte Carlo Fan Chart */}
        <div className="lg:col-span-8 bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-cyan" />
                Monte Carlo Projection Fan Chart (P10 / P50 / P90)
              </h3>
              <p className="text-[11px] text-slate-400">
                Correlated geometric random walk with ${(plan?.expectedReturn ? plan.expectedReturn * 100 : 7.5).toFixed(1)}% portfolio expected return.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Seed: 42</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="p90Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="p50Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1528', borderColor: '#1E293B', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="P90" stroke="#00D4FF" fill="url(#p90Grad)" name="Optimistic (P90)" />
                <Area type="monotone" dataKey="P50" stroke="#60A5FA" fill="url(#p50Grad)" strokeWidth={2} name="Median (P50)" />
                <Line type="monotone" dataKey="P10" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} name="Conservative (P10)" />
                <Line type="monotone" dataKey="Target" stroke="#F43F5E" strokeWidth={2} strokeDasharray="6 4" name="Target Goal" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Donut & Lowest-Cost Bucket Choices */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-cyan" />
              Target Allocation (Risk {userProfile.level} / {userProfile.label})
            </h3>
            <p className="text-[11px] text-slate-400">
              Lowest-cost suitable fund selected per asset bucket.
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
                  contentStyle={{ backgroundColor: '#0B1528', borderColor: '#1E293B', borderRadius: 8, fontSize: 11 }}
                  formatter={(value: any) => [`${value}%`, 'Target Weight']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Allocation List */}
          <div className="space-y-2 text-xs pt-2 border-t border-navy-800">
            {plan?.allocations.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-1 border-b border-navy-850/60">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ASSET_COLORS[a.assetClass] || '#64748B' }}
                  />
                  <span className="text-slate-300 font-medium truncate max-w-[170px]">{a.productName}</span>
                </div>
                <span className="font-bold text-white font-mono">{(a.weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
