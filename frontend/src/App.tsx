import React, { useState, useEffect } from 'react';
import { api, RiskProfile, PortfolioView as IPortfolioView } from './api/client';
import { AdvisorChat } from './components/AdvisorChat';
import { RiskQuestionnaire } from './components/RiskQuestionnaire';
import { ProductCatalog } from './components/ProductCatalog';
import { GoalPlan } from './components/GoalPlan';
import { PortfolioView } from './components/PortfolioView';
import { ApprovalsView } from './components/ApprovalsView';
import { MandateView } from './components/MandateView';
import { AuditView } from './components/AuditView';
import { DemoControls } from './components/DemoControls';
import { SecurityView } from './components/SecurityView';
import { GuidedTourModal } from './components/GuidedTourModal';
import {
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Compass,
  Wallet,
  KeyRound,
  FileSignature,
  Terminal,
  User,
  Info,
  CheckCircle,
  ExternalLink,
  PlayCircle,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'chat' | 'profile' | 'products' | 'plan' | 'portfolio' | 'approvals' | 'mandate' | 'audit' | 'security'
  >('chat');
  const [userId, setUserId] = useState<'priya' | 'chen'>('priya');
  const [userProfile, setUserProfile] = useState<RiskProfile | null>(null);
  const [portfolio, setPortfolio] = useState<IPortfolioView | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [currentScenario, setCurrentScenario] = useState<string>('normal');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const p = await api.getProfile(userId).catch(() => null);
      setUserProfile(p);

      const port = await api.getPortfolio(userId).catch(() => null);
      if (port) {
        setPortfolio(port);
        setCurrentDay(port.currentDay);
        setCurrentScenario(port.marketScenario);
      }

      // Check pending proposals in audit
      const auditRes = await api.getAuditEvents(userId, 50).catch(() => null);
      if (auditRes) {
        const needsApp = auditRes.events.filter((e) => e.decision === 'NEEDS_APPROVAL');
        setPendingApprovalsCount(needsApp.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'chat', label: 'Advisor Chat', icon: MessageSquare },
    { id: 'profile', label: 'Risk Profile', icon: ShieldCheck, badge: userProfile ? `L${userProfile.level}` : 'New' },
    { id: 'products', label: 'Products & Compare', icon: Layers },
    { id: 'plan', label: 'Goal Plan & MC', icon: Compass },
    { id: 'portfolio', label: 'Portfolio & Sandbox', icon: Wallet },
    { id: 'approvals', label: 'L3 Approvals', icon: KeyRound, badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined },
    { id: 'mandate', label: 'Mandate Envelope', icon: FileSignature },
    { id: 'security', label: 'Red-Team Security', icon: ShieldAlert, badge: '10 Tests' },
    { id: 'audit', label: 'Audit Trail', icon: Terminal }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-brand-cyan/20 selection:text-brand-cyan">
      {/* Permanent Regulatory Compliance Banner */}
      <header className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-b border-navy-800 text-[11px] py-2 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-brand-cyan shrink-0" />
          <span>
            <strong className="text-slate-200">Simulated Brokerage Environment:</strong> Evaluated for 2026 Shenzhen FinTechathon Topic B (AI as a Financial Participant).
          </span>
        </div>

        {/* Live System Pills */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-brand-cyan">
            GATE: ACTIVE (S1-S7)
          </span>
          <span className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-emerald-400">
            AUDIT: SHA-256
          </span>
          <span className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-slate-300">
            DAY {currentDay} • {currentScenario.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 bg-navy-900 border-r border-navy-800 flex flex-col justify-between shrink-0">
          <div>
            {/* Logo and Brand */}
            <div className="p-4 border-b border-navy-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-navy-950 font-black text-xs shadow-md shadow-brand-cyan/20">
                    X
                  </div>
                  <h1 className="text-base font-extrabold tracking-tight text-white">XyraFin Advisor</h1>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block mt-0.5">Topic B • AI Wealth Participant</span>
              </div>
            </div>

            {/* Quick 4-Min Demo Tour Trigger Button */}
            <div className="p-3 border-b border-navy-800 bg-navy-950/70">
              <button
                onClick={() => setIsTourOpen(true)}
                className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-brand-cyan hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Guided 4-Min Pitch Tour</span>
              </button>
            </div>

            {/* Persona Switcher */}
            <div className="p-3 border-b border-navy-800 bg-navy-950/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5 px-1">
                Active Demo Persona
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setUserId('priya')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    userId === 'priya'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-navy-850 text-slate-400 hover:text-slate-200 border border-navy-800'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>Priya (24)</span>
                </button>
                <button
                  onClick={() => setUserId('chen')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                    userId === 'chen'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-navy-850 text-slate-400 hover:text-slate-200 border border-navy-800'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>Chen (Drift)</span>
                </button>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/30 to-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan shadow-lg shadow-brand-cyan/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          item.badge === 'New'
                            ? 'bg-brand-cyan/20 text-brand-cyan font-bold'
                            : item.id === 'security'
                            ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                            : item.id === 'approvals'
                            ? 'bg-amber-400 text-navy-950 font-bold'
                            : 'bg-navy-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Status */}
          <div className="p-4 border-t border-navy-800 bg-navy-950/60 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center justify-between">
              <span>Risk Suitability Gate:</span>
              <span className="text-emerald-400 font-bold font-mono">ACTIVE (S1-S7)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Audit Chain:</span>
              <span className="text-brand-cyan font-mono font-bold">SHA-256 APPEND</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-4">
          {/* Top Demo Controls Panel */}
          <DemoControls
            currentDay={currentDay}
            currentScenario={currentScenario}
            onRefresh={loadUserData}
          />

          {/* Active Screen */}
          <div className="flex-1">
            {activeTab === 'chat' && (
              <AdvisorChat
                userId={userId}
                onNavigateToApprovals={() => setActiveTab('approvals')}
                onNavigateToProfile={() => setActiveTab('profile')}
              />
            )}
            {activeTab === 'profile' && (
              <RiskQuestionnaire
                userId={userId}
                onProfileUpdated={(p) => setUserProfile(p)}
              />
            )}
            {activeTab === 'products' && (
              <ProductCatalog userProfile={userProfile} />
            )}
            {activeTab === 'plan' && (
              <GoalPlan
                userId={userId}
                userProfile={userProfile}
                onNavigateToProfile={() => setActiveTab('profile')}
              />
            )}
            {activeTab === 'portfolio' && (
              <PortfolioView
                userId={userId}
                onNavigateToChat={() => setActiveTab('chat')}
              />
            )}
            {activeTab === 'approvals' && (
              <ApprovalsView
                userId={userId}
                onOrderExecuted={loadUserData}
              />
            )}
            {activeTab === 'mandate' && (
              <MandateView userId={userId} />
            )}
            {activeTab === 'security' && (
              <SecurityView userId={userId} />
            )}
            {activeTab === 'audit' && (
              <AuditView />
            )}
          </div>
        </main>
      </div>

      {/* Guided 4-Minute Presentation Tour Modal */}
      <GuidedTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigate={(tab, persona) => {
          if (persona) setUserId(persona);
          setActiveTab(tab as any);
        }}
      />
    </div>
  );
}
