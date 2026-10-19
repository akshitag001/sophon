import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Terminal,
  Activity,
  Compass,
  Lock,
  Layers,
  Sparkles,
  Scale,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SwissEchoHeroProps {
  onSelectTab: (tab: string, persona?: 'priya' | 'chen') => void;
  onOpenPitch: () => void;
  currentDay: number;
  currentScenario: string;
}

export const SwissEchoHero: React.FC<SwissEchoHeroProps> = ({
  onSelectTab,
  onOpenPitch,
  currentDay,
  currentScenario
}) => {
  return (
    <div className="space-y-28 py-6 font-sans">
      {/* =========================================================================
          1. HERO SECTION (Full-width, 70vh to 100vh, massive text 11vw/180px, Echo Stack)
         ========================================================================= */}
      <section className="min-h-[75vh] flex flex-col justify-center items-center text-center relative px-4 select-none">
        {/* Subtle Category Pre-header */}
        <div className="mb-6 flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.25em] font-medium text-[#838282]">
            SHENZHEN FINTECHATHON 2026 • TOPIC B
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
          <span className="text-xs font-mono text-[#838282] uppercase">
            DAY {currentDay} • {currentScenario}
          </span>
        </div>

        {/* The Echo Stack: 5 Layers, top layer #111111, layers 2-5 offset by -0.04em, -0.08em, -0.12em, -0.16em */}
        <div className="relative inline-block leading-[0.9] tracking-[-0.05em] font-clash font-bold text-[14vw] sm:text-[13vw] lg:text-[160px] xl:text-[180px] my-6">
          {/* Echo Layer 5 (-0.16em) */}
          <span
            className="absolute top-0 left-0 w-full select-none pointer-events-none text-[#d9d9d9]"
            style={{ transform: 'translate(-0.16em, -0.16em)' }}
            aria-hidden="true"
          >
            XYRAFIN
          </span>

          {/* Echo Layer 4 (-0.12em) */}
          <span
            className="absolute top-0 left-0 w-full select-none pointer-events-none text-[#d1d1d1]"
            style={{ transform: 'translate(-0.12em, -0.12em)' }}
            aria-hidden="true"
          >
            XYRAFIN
          </span>

          {/* Echo Layer 3 (-0.08em) */}
          <span
            className="absolute top-0 left-0 w-full select-none pointer-events-none text-[#c9c9c9]"
            style={{ transform: 'translate(-0.08em, -0.08em)' }}
            aria-hidden="true"
          >
            XYRAFIN
          </span>

          {/* Echo Layer 2 (-0.04em) */}
          <span
            className="absolute top-0 left-0 w-full select-none pointer-events-none text-[#bfbfbf]"
            style={{ transform: 'translate(-0.04em, -0.04em)' }}
            aria-hidden="true"
          >
            XYRAFIN
          </span>

          {/* Foreground Primary Text */}
          <span className="relative z-10 text-[#111111]">
            XYRAFIN
          </span>
        </div>

        {/* Hero Supporting Copy */}
        <p className="max-w-xl text-base sm:text-lg font-satoshi font-medium text-[#838282] mt-2 mb-8 leading-relaxed">
          An autonomous wealth participant governed by deterministic verification, Box-Muller Monte Carlo projections, and append-only cryptographic audit logs.
        </p>

        {/* Hero Interactive CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenPitch}
            className="px-8 py-3.5 rounded-full bg-[#111111] text-[#f2f2f2] font-satoshi font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:bg-black hover:scale-105 shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch 4-Min Demo Pitch</span>
          </button>

          <button
            onClick={() => onSelectTab('chat')}
            className="px-8 py-3.5 rounded-full bg-transparent text-[#111111] border border-[#111111] font-satoshi font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:bg-[#111111] hover:text-[#f2f2f2]"
          >
            Enter Advisor Chat
          </button>
        </div>
      </section>

      {/* =========================================================================
          2. PHILOSOPHY / NARRATIVE SECTION
         ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        {/* Vertical Hairline Divider leading into the section */}
        <div className="w-px h-16 bg-[#1e1e1e]/15 mx-auto mb-10" />

        {/* Large-scale Quote with Editorial Serif Italic Keyword */}
        <h2 className="font-clash text-3xl sm:text-5xl lg:text-6xl text-[#111111] leading-[1.08] tracking-[-0.035em] font-bold max-w-3xl mx-auto">
          AI must not merely predict wealth; it must act as an{' '}
          <span className="font-serif italic font-normal text-4xl sm:text-6xl lg:text-7xl text-[#111111] underline decoration-1 underline-offset-8">
            audited
          </span>{' '}
          financial participant governed by deterministic law.
        </h2>

        {/* 3-Column Informational Grid (32px / gap-8) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left border-t border-[#1e1e1e]/10 pt-12">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-[#838282] uppercase tracking-wider">
              01 / BOUNDARIES
            </span>
            <h3 className="font-clash text-xl font-bold text-[#111111]">
              Deterministic Suitability
            </h3>
            <p className="text-xs font-satoshi font-medium text-[#838282] leading-relaxed">
              Rules S1 through S7 are executed strictly in verified TypeScript modules. The LLM is structurally barred from fabricating investment eligibility.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-[#838282] uppercase tracking-wider">
              02 / CRYPTOGRAPHY
            </span>
            <h3 className="font-clash text-xl font-bold text-[#111111]">
              SHA-256 Hash Chain
            </h3>
            <p className="text-xs font-satoshi font-medium text-[#838282] leading-relaxed">
              Every order, rebalance, and mandate update is committed to an append-only cryptographic ledger protected by SQLite database mutation triggers.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-[#838282] uppercase tracking-wider">
              03 / MATHEMATICS
            </span>
            <h3 className="font-clash text-xl font-bold text-[#111111]">
              Box-Muller Monte Carlo
            </h3>
            <p className="text-xs font-satoshi font-medium text-[#838282] leading-relaxed">
              5,000 correlated random-walk projection paths provide mathematically sound P10, P50, and P90 percentile horizons without hallucination.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ASYMMETRICAL SHOWCASE GRID (12 Columns, mixed aspect ratios)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#1e1e1e]/10">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#838282] font-mono block">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="font-clash text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              Asymmetrical Live Showcase
            </h2>
          </div>
          <span className="text-xs font-mono text-[#838282] uppercase hidden sm:block">
            12-COLUMN MIXED ASPECT GRID
          </span>
        </div>

        <div className="grid grid-cols-12 gap-6 items-stretch">
          {/* Item 1: Large 8-Column Rectangular Card with rounded-sm corners */}
          <div
            onClick={() => onSelectTab('chat')}
            className="col-span-12 lg:col-span-8 bg-white border border-[#1e1e1e]/10 p-8 rounded-sm card-hover-swiss cursor-pointer flex flex-col justify-between group relative overflow-hidden min-h-[440px]"
          >
            {/* Background architectural image with 20% grayscale reveal */}
            <div className="absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden hidden sm:block pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity duration-700">
              <img
                src="/assets/swiss-wide.jpg"
                alt="Swiss Pavilion"
                className="w-full h-full object-cover swiss-reveal-img"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#838282] bg-[#f2f2f2] px-2.5 py-1 rounded">
                  MODULE 01 • CHAT &amp; DECISION CHAIN
                </span>
                <div className="w-9 h-9 rounded-full border border-[#1e1e1e]/15 flex items-center justify-center text-[#111111] group-hover:bg-[#111111] group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="my-8 max-w-xl">
                <h3 className="font-clash text-2xl sm:text-4xl font-bold text-[#111111] leading-tight">
                  Autonomous Financial Participant Engine
                </h3>
                <p className="text-xs sm:text-sm text-[#838282] mt-3 font-satoshi font-medium leading-relaxed">
                  Interacts with clients in natural language while isolating untrusted documents in strict XML sandbox boundaries and enforcing L0–L3 human approval gates.
                </p>
              </div>
            </div>

            <div className="relative z-10 p-4 bg-[#f2f2f2] rounded border border-[#1e1e1e]/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#111111]" />
                <span className="text-[#111111] font-semibold">Tier L1-L3 Governance</span>
              </div>
              <span className="text-[#838282] flex items-center gap-1">
                Click to launch live advisor <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Item 2: Vertical 4-Column Pill-Shaped Card (h-[500px], rounded-full, image scales on hover, centered circular overlay with thin border) */}
          <div
            onClick={() => onSelectTab('plan')}
            className="col-span-12 lg:col-span-4 h-[500px] rounded-[9999px] overflow-hidden bg-black border border-[#1e1e1e]/10 relative group cursor-pointer flex items-center justify-center text-center shadow-sm"
          >
            {/* Image that starts with 20% grayscale and scales 1.05x on hover */}
            <img
              src="/assets/swiss-pill.jpg"
              alt="Editorial Architecture"
              className="absolute inset-0 w-full h-full object-cover swiss-reveal-img"
            />

            {/* Gradient Dimmer */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-700" />

            {/* Initial Editorial Content (fades out on hover to reveal circular overlay) */}
            <div className="relative z-10 p-8 text-white space-y-3 group-hover:opacity-0 transition-opacity duration-500">
              <div className="w-16 h-16 rounded-full border border-white/30 backdrop-blur-sm mx-auto flex items-center justify-center font-clash font-bold text-xl text-white">
                5K
              </div>
              <h4 className="font-clash text-2xl font-bold tracking-tight text-white">
                Monte Carlo
              </h4>
              <p className="text-xs font-satoshi font-medium text-white/80 max-w-[190px] mx-auto leading-relaxed">
                P10 / P50 / P90 Wealth Projections with Bisection Solver.
              </p>
            </div>

            {/* Centered Circular Overlay (only visible on hover, containing secondary text in a thin border) */}
            <div className="absolute inset-0 flex items-center justify-center p-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="w-44 h-44 rounded-full border border-white/60 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 text-white">
                <span className="font-clash text-4xl font-bold tracking-tight">75%</span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/90 mt-1">
                  P50 TARGET
                </span>
                <span className="text-[9px] font-mono tracking-wider text-white/70 mt-1 uppercase">
                  Open Simulation →
                </span>
              </div>
            </div>
          </div>

          {/* Item 3: Circular 5-Column Aspect-Square Image Card */}
          <div
            onClick={() => onSelectTab('profile')}
            className="col-span-12 lg:col-span-5 rounded-full aspect-square overflow-hidden bg-black border border-[#1e1e1e]/10 relative group cursor-pointer card-hover-swiss flex items-center justify-center"
          >
            {/* Image with 20% grayscale filter transitioning to 100% color & 1.05x scale */}
            <img
              src="/assets/swiss-circle.jpg"
              alt="MiFID II Architecture"
              className="absolute inset-0 w-full h-full object-cover swiss-reveal-img"
            />

            {/* Gradient Dimmer */}
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/60 transition-colors duration-700" />

            {/* Radial Risk Meter & Typography */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 text-white select-none">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/80 mb-2">
                MIFID II SUITABILITY
              </span>

              <div className="relative w-28 h-28 my-1 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="transparent"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - 3 / 5)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-clash font-bold text-white">3</span>
                  <span className="text-[10px] font-mono text-white/70">OF 5</span>
                </div>
              </div>

              <h4 className="font-clash text-xl font-bold text-white mt-2">
                Level = min(C, T)
              </h4>
              <p className="text-xs font-satoshi font-medium text-white/80 max-w-[220px] mt-1 leading-relaxed">
                Objective capacity &amp; psychological tolerance reconciled deterministically.
              </p>
            </div>
          </div>

          {/* Item 4: Wide 7-Column Rectangle Card */}
          <div
            onClick={() => onSelectTab('products')}
            className="col-span-12 lg:col-span-7 bg-white border border-[#1e1e1e]/10 p-8 rounded-sm card-hover-swiss cursor-pointer flex flex-col justify-between group overflow-hidden relative min-h-[380px]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#838282] bg-[#f2f2f2] px-2.5 py-1 rounded">
                MODULE 03 • SUITABILITY GATE
              </span>
              <span className="text-xs font-mono text-[#111111] font-semibold">
                S1–S7 ACTIVE
              </span>
            </div>

            <div className="my-6">
              <h3 className="font-clash text-2xl sm:text-3xl font-bold text-[#111111] leading-tight">
                Curated Product Catalog &amp; S1–S7 Matrix
              </h3>
              <p className="text-xs sm:text-sm text-[#838282] mt-2 max-w-lg font-satoshi font-medium leading-relaxed">
                Rule S1 locks Leveraged-3X funds for retail newcomers. KYC expiry, concentration limits, and emergency reserve buffers enforced in code.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-[#1e1e1e]/10 pt-4 text-xs font-mono">
              <div>
                <span className="text-[#838282] block text-[10px]">PRODUCTS</span>
                <span className="text-sm font-bold text-[#111111]">12 Funds</span>
              </div>
              <div>
                <span className="text-[#838282] block text-[10px]">RETAIL CEILING</span>
                <span className="text-sm font-bold text-[#111111]">Risk &le; 3</span>
              </div>
              <div>
                <span className="text-[#838282] block text-[10px]">SPECULATION</span>
                <span className="text-sm font-bold text-[#111111]">Locked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. BESPOKE SERVICE CARDS (3-column grid, #1e1e1e/10 borders, 64x64 icon rotating 12deg, arrow-right CTA)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="pb-6 mb-8 border-b border-[#1e1e1e]/10">
          <span className="text-xs uppercase tracking-widest text-[#838282] font-mono block">
            CORE CAPABILITIES
          </span>
          <h2 className="font-clash text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            Institutional Verification Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bespoke Card 1: Red-Team Security */}
          <div
            onClick={() => onSelectTab('security')}
            className="border border-[#1e1e1e]/10 p-8 rounded-sm bg-transparent hover:bg-white transition-all duration-300 hover:border-[#1e1e1e]/25 cursor-pointer group flex flex-col justify-between min-h-[320px] shadow-none hover:shadow-sm"
          >
            <div>
              {/* 64x64px Geometric Icon Container that rotates 12 degrees on hover */}
              <div className="w-16 h-16 bg-[#111111] text-[#f2f2f2] rounded-lg flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="font-clash text-xl font-bold text-[#111111] mb-2">
                Red-Team Security
              </h3>
              <p className="text-xs font-satoshi font-medium text-[#838282] leading-relaxed">
                10 automated adversarial attack scenarios verifying prompt injection quarantine, prompt leaks, and role escalation defense.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-6 border-t border-[#1e1e1e]/10 text-xs font-satoshi font-bold tracking-wider uppercase text-[#111111]">
              <span>Run 10 Attacks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Bespoke Card 2: Brokerage Sandbox */}
          <div
            onClick={() => onSelectTab('portfolio', 'chen')}
            className="border border-[#1e1e1e]/10 p-8 rounded-sm bg-transparent hover:bg-white transition-all duration-300 hover:border-[#1e1e1e]/25 cursor-pointer group flex flex-col justify-between min-h-[320px] shadow-none hover:shadow-sm"
          >
            <div>
              <div className="w-16 h-16 bg-[#111111] text-[#f2f2f2] rounded-lg flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="font-clash text-xl font-bold text-[#111111] mb-2">
                Brokerage Sandbox
              </h3>
              <p className="text-xs font-satoshi font-medium text-[#838282] leading-relaxed">
                T+1 settlement clock with -25% Flash Crash and +15% Bull Rally macro stress testing. Detects 5% asset drift and executes rebalancing.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-6 border-t border-[#1e1e1e]/10 text-xs font-satoshi font-bold tracking-wider uppercase text-[#111111]">
              <span>Inspect Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Bespoke Card 3: Cryptographic Audit Log */}
          <div
            onClick={() => onSelectTab('audit')}
            className="border border-[#1e1e1e]/10 p-8 rounded-sm bg-transparent hover:bg-white transition-all duration-300 hover:border-[#1e1e1e]/25 cursor-pointer group flex flex-col justify-between min-h-[320px] shadow-none hover:shadow-sm"
          >
            <div>
              <div className="w-16 h-16 bg-[#111111] text-[#f2f2f2] rounded-lg flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Terminal className="w-7 h-7" />
              </div>
              <h3 className="font-clash text-xl font-bold text-[#111111] mb-2">
                Cryptographic Audit Log
              </h3>
              <p className="text-xs font-satoshi font-medium text-[#838282] leading-relaxed">
                Append-only SHA-256 hash chaining with SQLite triggers preventing UPDATE or DELETE. 1-click mathematical verification of ledger immutability.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-6 border-t border-[#1e1e1e]/10 text-xs font-satoshi font-bold tracking-wider uppercase text-[#111111]">
              <span>Verify Hashes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
