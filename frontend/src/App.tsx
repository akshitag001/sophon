import React, { useState, useEffect } from 'react';
import { api, RiskProfile, PortfolioView as IPortfolioView } from './api/client';
import { SwissEchoHero } from './components/SwissEchoHero';
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
  Sparkles,
  ShieldCheck,
  Terminal,
  Layers,
  Compass,
  Wallet,
  KeyRound,
  FileSignature,
  ShieldAlert,
  Database,
  RefreshCw,
  ArrowRight,
  Github,
  Globe,
  FileText,
  Mail,
  User,
  Sliders,
  MapPin,
  Phone
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'chat' | 'profile' | 'products' | 'plan' | 'portfolio' | 'approvals' | 'mandate' | 'security' | 'audit'
  >('overview');
  const [userId, setUserId] = useState<'priya' | 'chen'>('priya');
  const [userProfile, setUserProfile] = useState<RiskProfile | null>(null);
  const [portfolio, setPortfolio] = useState<IPortfolioView | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [currentScenario, setCurrentScenario] = useState<string>('normal');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [showDemoControls, setShowDemoControls] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, [userId, refreshTrigger]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const p = await api.getProfile(userId).catch(() => null);
      setUserProfile(p);

      const port = await api.getPortfolio(userId).catch(() => null);
      if (port) {
        setPortfolio(port);
        setCurrentDay(port.currentDay);
        setCurrentScenario(port.marketScenario);
      }

      const auditRes = await api.getAuditEvents(userId, 50).catch(() => null);
      if (auditRes) {
        const needsApp = auditRes.events.filter((e) => e.decision === 'NEEDS_APPROVAL');
        setPendingApprovalsCount(needsApp.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleForceSeed = async () => {
    if (!confirm('Re-seed Sophon demo database? This will reset Priya to $20,000 cash and Chen to a drifted 60/40 portfolio.')) return;
    try {
      await api.resetSandbox();
      setSeedSuccessMsg('Database re-seeded successfully with demo personas.');
      setTimeout(() => setSeedSuccessMsg(null), 3500);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err: any) {
      alert(`Seed failed: ${err.message}`);
    }
  };

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'chat', label: 'Advisor' },
    { id: 'profile', label: 'Risk Gate' },
    { id: 'products', label: 'Products' },
    { id: 'plan', label: 'Monte Carlo' },
    { id: 'portfolio', label: 'Sandbox' },
    { id: 'approvals', label: 'L3 Approvals', badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined },
    { id: 'security', label: 'Red-Team' },
    { id: 'audit', label: 'Audit Trail' }
  ];

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-[#f2f2f2] flex flex-col justify-between">
      {/* 1. STICKY HEADER (Height: 80px, Background: #f2f2f2 with 90% opacity, backdrop-blur 12px) */}
      <header className="sticky top-0 z-50 h-20 bg-[#f2f2f2]/90 backdrop-blur-[12px] border-b border-[#1e1e1e]/10 px-4 sm:px-8 flex items-center justify-between transition-all">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-sm bg-[#111111] text-[#f2f2f2] flex items-center justify-center font-clash font-bold text-base transition-transform group-hover:scale-105">
              S
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-clash font-bold text-base tracking-tight text-[#111111] leading-none">
                SOPHON
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#838282] mt-0.5">
                TOPIC B • AUTONOMOUS
              </span>
            </div>
          </button>
        </div>

        {/* 14px Uppercase Satoshi Nav Links with 120ms color transition */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id as any)}
                className={`font-satoshi text-[13px] xl:text-[14px] uppercase tracking-wider font-semibold transition-colors duration-[120ms] relative py-1 ${
                  isActive
                    ? 'text-[#111111]'
                    : 'text-[#111111] hover:text-[#b6b5b5]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#111111]" />
                )}
                {link.badge && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-[#111111] text-[#f2f2f2] text-[10px] font-mono">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Header Controls: Persona Switcher & Pill Contact Button */}
        <div className="flex items-center gap-3">
          {/* Active Persona Pill Toggle */}
          <div className="hidden sm:flex items-center p-1 bg-white rounded-full border border-[#1e1e1e]/10 text-xs font-mono">
            <button
              onClick={() => setUserId('priya')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                userId === 'priya'
                  ? 'bg-[#111111] text-[#f2f2f2]'
                  : 'text-[#838282] hover:text-[#111111]'
              }`}
            >
              Priya ($20k)
            </button>
            <button
              onClick={() => setUserId('chen')}
              className={`px-3 py-1 rounded-full font-medium transition ${
                userId === 'chen'
                  ? 'bg-[#111111] text-[#f2f2f2]'
                  : 'text-[#838282] hover:text-[#111111]'
              }`}
            >
              Chen (Drifted)
            </button>
          </div>

          {/* Simulation Drawer Toggle */}
          <button
            onClick={() => setShowDemoControls(!showDemoControls)}
            className="p-2 rounded-full border border-[#1e1e1e]/15 text-[#111111] hover:bg-white transition"
            title="Toggle Clock & Macro Scenarios"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Pill-Shaped Contact/Pitch Button with 1px solid #1e1e1e border that inverts on hover */}
          <button
            onClick={() => setIsTourOpen(true)}
            className="px-5 py-2.5 rounded-full border border-[#1e1e1e] bg-transparent text-[#111111] font-satoshi font-semibold text-xs tracking-wider uppercase transition-all duration-200 hover:bg-[#1e1e1e] hover:text-[#f2f2f2] shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pitch &amp; Demo</span>
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer for smaller screens (<lg) */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 border-b border-[#1e1e1e]/10 bg-[#f2f2f2] no-scrollbar">
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id as any)}
              className={`font-satoshi text-xs uppercase tracking-wider whitespace-nowrap px-3 py-1 rounded-full transition ${
                isActive
                  ? 'bg-[#111111] text-[#f2f2f2] font-semibold'
                  : 'text-[#838282] hover:text-[#111111] bg-white border border-[#1e1e1e]/10'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Seed Notification Toast */}
        {seedSuccessMsg && (
          <div className="p-4 bg-white border border-[#111111]/15 rounded-sm shadow-sm text-xs font-semibold text-[#111111] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#111111]" />
            <span>{seedSuccessMsg}</span>
          </div>
        )}

        {/* Collapsible Simulation Drawer */}
        {showDemoControls && (
          <div className="bg-white p-5 rounded-sm border border-[#1e1e1e]/15 shadow-sm space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1e1e1e]/10 pb-3">
              <span className="text-xs uppercase font-mono tracking-wider text-[#838282]">
                SANDBOX SIMULATION CONTROLLER (T+1 SETTLEMENT)
              </span>
              <button
                onClick={() => setShowDemoControls(false)}
                className="text-xs text-[#838282] hover:text-[#111111] font-mono"
              >
                Close ×
              </button>
            </div>
            <DemoControls
              currentDay={currentDay}
              currentScenario={currentScenario}
              onRefresh={loadUserData}
            />
          </div>
        )}

        {/* Dynamic Views */}
        {activeTab === 'overview' && (
          <SwissEchoHero
            onSelectTab={(tab, persona) => {
              if (persona) setUserId(persona);
              setActiveTab(tab as any);
            }}
            onOpenPitch={() => setIsTourOpen(true)}
            currentDay={currentDay}
            currentScenario={currentScenario}
          />
        )}

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
      </main>

      {/* 5. FOOTER (Deep dark theme #1e1e1e, 60% opacity off-white text #f6f6f6, thin 5% opacity white top border) */}
      <footer className="bg-[#1e1e1e] text-[#f6f6f6]/60 border-t border-white/5 py-16 px-4 sm:px-8 mt-24 font-sans text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-white/5">
          {/* Column 1: Brand Summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-7 h-7 bg-white text-[#111111] font-clash font-bold text-sm flex items-center justify-center rounded-sm">
                S
              </div>
              <span className="font-clash font-bold text-base tracking-tight text-white">
                SOPHON
              </span>
            </div>
            <p className="leading-relaxed">
              Autonomous Financial Participant built for Shenzhen FinTechathon 2026 Topic B. Grounded in deterministic TypeScript verification and append-only cryptographic audit logs.
            </p>
            <div className="flex items-center gap-3 pt-2 text-white/80">
              <span className="font-mono text-[11px] bg-white/5 px-2 py-1 rounded border border-white/10">
                MiFID II • FINRA Compliant
              </span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <span className="text-white uppercase font-mono text-[11px] font-bold tracking-wider block">
              Core Navigation
            </span>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('overview')} className="hover:text-white transition">
                  Editorial Overview & Echo
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('chat')} className="hover:text-white transition">
                  Autonomous Advisor Chat
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('profile')} className="hover:text-white transition">
                  Suitability Gate (min(C, T))
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('plan')} className="hover:text-white transition">
                  5,000-Path Monte Carlo
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('portfolio')} className="hover:text-white transition">
                  Brokerage Sandbox & Drift
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance & Security */}
          <div className="space-y-3">
            <span className="text-white uppercase font-mono text-[11px] font-bold tracking-wider block">
              Auditing & Governance
            </span>
            <ul className="space-y-2 font-mono text-[11px]">
              <li>
                <button onClick={() => setActiveTab('security')} className="hover:text-white transition">
                  10 Red-Team Attack Suites
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('audit')} className="hover:text-white transition">
                  SHA-256 Immutability Verifier
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('approvals')} className="hover:text-white transition">
                  Tier L3 PIN Approvals
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('mandate')} className="hover:text-white transition">
                  Signed Mandate Limits
                </button>
              </li>
              <li>
                <button onClick={handleForceSeed} className="hover:text-white transition text-zinc-400">
                  Reset / Seed Sandbox Data
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Pitch Details with Lucide-style line icons */}
          <div className="space-y-3">
            <span className="text-white uppercase font-mono text-[11px] font-bold tracking-wider block">
              Contact &amp; Evaluation
            </span>
            <ul className="space-y-2.5 text-[12px] font-mono">
              <li className="flex items-center gap-2.5 text-white/80 hover:text-white transition">
                <Mail className="w-3.5 h-3.5 text-white/60" />
                <span>contact@sophon.ai</span>
              </li>
              <li className="flex items-center gap-2.5 text-white/80 hover:text-white transition">
                <Globe className="w-3.5 h-3.5 text-white/60" />
                <span>sophon.ai / demo</span>
              </li>
              <li className="flex items-center gap-2.5 text-white/80 hover:text-white transition">
                <MapPin className="w-3.5 h-3.5 text-white/60" />
                <span>Shenzhen FinTechathon Topic B</span>
              </li>
              <li className="flex items-center gap-2.5 text-white/80 hover:text-white transition">
                <Github className="w-3.5 h-3.5 text-white/60" />
                <span>github.com/akshitag001</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => setIsTourOpen(true)}
                className="w-full py-2.5 px-3 bg-white text-[#111111] font-satoshi font-semibold text-xs rounded-sm hover:bg-zinc-200 transition text-center tracking-wider uppercase flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch 4-Min Demo Pitch</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <span>&copy; 2026 Sophon. Shenzhen FinTechathon Topic B Project.</span>
          <span className="text-[#f6f6f6]/40">Editorial Brutalism • Clash Display &amp; Satoshi</span>
        </div>
      </footer>

      {/* Guided Tour Modal */}
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
