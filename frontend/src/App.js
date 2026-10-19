import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { api } from './api/client';
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
import { MessageSquare, ShieldCheck, ShieldAlert, Layers, Compass, Wallet, KeyRound, FileSignature, Terminal, User, Info, Sparkles } from 'lucide-react';
export default function App() {
    const [activeTab, setActiveTab] = useState('chat');
    const [userId, setUserId] = useState('priya');
    const [userProfile, setUserProfile] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [currentDay, setCurrentDay] = useState(0);
    const [currentScenario, setCurrentScenario] = useState('normal');
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
    const [isTourOpen, setIsTourOpen] = useState(false);
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
        }
        catch (e) {
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
    return (_jsxs("div", { className: "min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-brand-cyan/20 selection:text-brand-cyan", children: [_jsxs("header", { className: "bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border-b border-navy-800 text-[11px] py-2 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Info, { className: "w-3.5 h-3.5 text-brand-cyan shrink-0" }), _jsxs("span", { children: [_jsx("strong", { className: "text-slate-200", children: "Simulated Brokerage Environment:" }), " Evaluated for 2026 Shenzhen FinTechathon Topic B (AI as a Financial Participant)."] })] }), _jsxs("div", { className: "flex items-center gap-2 text-[10px] font-mono", children: [_jsx("span", { className: "px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-brand-cyan", children: "GATE: ACTIVE (S1-S7)" }), _jsx("span", { className: "px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-emerald-400", children: "AUDIT: SHA-256" }), _jsxs("span", { className: "px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-slate-300", children: ["DAY ", currentDay, " \u2022 ", currentScenario.toUpperCase()] })] })] }), _jsxs("div", { className: "flex-1 flex flex-col md:flex-row overflow-hidden", children: [_jsxs("aside", { className: "w-full md:w-64 bg-navy-900 border-r border-navy-800 flex flex-col justify-between shrink-0", children: [_jsxs("div", { children: [_jsx("div", { className: "p-4 border-b border-navy-800 flex items-center justify-between", children: _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-navy-950 font-black text-xs shadow-md shadow-brand-cyan/20", children: "X" }), _jsx("h1", { className: "text-base font-extrabold tracking-tight text-white", children: "XyraFin Advisor" })] }), _jsx("span", { className: "text-[10px] font-mono text-slate-400 block mt-0.5", children: "Topic B \u2022 AI Wealth Participant" })] }) }), _jsx("div", { className: "p-3 border-b border-navy-800 bg-navy-950/70", children: _jsxs("button", { onClick: () => setIsTourOpen(true), className: "w-full py-2 px-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-brand-cyan hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5 text-amber-300 animate-pulse" }), _jsx("span", { children: "Guided 4-Min Pitch Tour" })] }) }), _jsxs("div", { className: "p-3 border-b border-navy-800 bg-navy-950/40", children: [_jsx("span", { className: "text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5 px-1", children: "Active Demo Persona" }), _jsxs("div", { className: "grid grid-cols-2 gap-1.5", children: [_jsxs("button", { onClick: () => setUserId('priya'), className: `px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${userId === 'priya'
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-navy-850 text-slate-400 hover:text-slate-200 border border-navy-800'}`, children: [_jsx(User, { className: "w-3 h-3" }), _jsx("span", { children: "Priya (24)" })] }), _jsxs("button", { onClick: () => setUserId('chen'), className: `px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${userId === 'chen'
                                                            ? 'bg-blue-600 text-white shadow-md'
                                                            : 'bg-navy-850 text-slate-400 hover:text-slate-200 border border-navy-800'}`, children: [_jsx(User, { className: "w-3 h-3" }), _jsx("span", { children: "Chen (Drift)" })] })] })] }), _jsx("nav", { className: "p-3 space-y-1", children: navItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.id;
                                            return (_jsxs("button", { onClick: () => setActiveTab(item.id), className: `w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${isActive
                                                    ? 'bg-gradient-to-r from-blue-600/30 to-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan shadow-lg shadow-brand-cyan/10'
                                                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Icon, { className: `w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-slate-400'}` }), _jsx("span", { children: item.label })] }), item.badge && (_jsx("span", { className: `text-[10px] font-mono px-2 py-0.5 rounded-full ${item.badge === 'New'
                                                            ? 'bg-brand-cyan/20 text-brand-cyan font-bold'
                                                            : item.id === 'security'
                                                                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                                                                : item.id === 'approvals'
                                                                    ? 'bg-amber-400 text-navy-950 font-bold'
                                                                    : 'bg-navy-800 text-slate-300'}`, children: item.badge }))] }, item.id));
                                        }) })] }), _jsxs("div", { className: "p-4 border-t border-navy-800 bg-navy-950/60 text-[11px] text-slate-500 space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Risk Suitability Gate:" }), _jsx("span", { className: "text-emerald-400 font-bold font-mono", children: "ACTIVE (S1-S7)" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { children: "Audit Chain:" }), _jsx("span", { className: "text-brand-cyan font-mono font-bold", children: "SHA-256 APPEND" })] })] })] }), _jsxs("main", { className: "flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-4", children: [_jsx(DemoControls, { currentDay: currentDay, currentScenario: currentScenario, onRefresh: loadUserData }), _jsxs("div", { className: "flex-1", children: [activeTab === 'chat' && (_jsx(AdvisorChat, { userId: userId, onNavigateToApprovals: () => setActiveTab('approvals'), onNavigateToProfile: () => setActiveTab('profile') })), activeTab === 'profile' && (_jsx(RiskQuestionnaire, { userId: userId, onProfileUpdated: (p) => setUserProfile(p) })), activeTab === 'products' && (_jsx(ProductCatalog, { userProfile: userProfile })), activeTab === 'plan' && (_jsx(GoalPlan, { userId: userId, userProfile: userProfile, onNavigateToProfile: () => setActiveTab('profile') })), activeTab === 'portfolio' && (_jsx(PortfolioView, { userId: userId, onNavigateToChat: () => setActiveTab('chat') })), activeTab === 'approvals' && (_jsx(ApprovalsView, { userId: userId, onOrderExecuted: loadUserData })), activeTab === 'mandate' && (_jsx(MandateView, { userId: userId })), activeTab === 'security' && (_jsx(SecurityView, { userId: userId })), activeTab === 'audit' && (_jsx(AuditView, {}))] })] })] }), _jsx(GuidedTourModal, { isOpen: isTourOpen, onClose: () => setIsTourOpen(false), onNavigate: (tab, persona) => {
                    if (persona)
                        setUserId(persona);
                    setActiveTab(tab);
                } })] }));
}
