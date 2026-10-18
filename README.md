# XyraFin Advisor 🚀

> **AI Wealth Advisory Agent for First-Time Investors: Risk Profiling, Asset Allocation, and Simulated Sandbox Execution**

[![FinTechathon 2026](https://img.shields.io/badge/FinTechathon_2026-Topic_B:_AI_Wealth_Assistant-00D4FF?style=for-the-badge)](https://fintechathon.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Tests: 57 Passed](https://img.shields.io/badge/Tests-57%20Passed-10B981?style=for-the-badge)](backend/tests)
[![Audit Chain](https://img.shields.io/badge/Audit_Chain-SHA--256_Verified-teal?style=for-the-badge)](evidence/chain_verify.txt)
[![Status: Works Offline](https://img.shields.io/badge/Offline_Mode-Zero_API_Key_Required-amber?style=for-the-badge)](#quick-start)

---

## 💡 The Problem

Young, first-time retail investors (such as our demo persona **Priya, 24**, saving for a home deposit in 6 years) face a frustrating financial landscape:
1. **Conflicted, High-Fee Human Advice:** Complex jargon and high sales commissions.
2. **Opaque Black-Box Robo-Advisers:** Rigid questionnaire scoring with zero conversational explanation and no user control over agent autonomy.
3. **Unregulated Generative AI Chatbots:** Chatbots that hallucinate speculative returns, ignore MiFID II / SFC regulatory suitability, and lack permission boundaries to actually execute tasks.

---

## ✨ The Solution: "AI as a Financial Participant"

XyraFin Advisor bridges the gap between conversational intelligence and regulated financial execution through three core pillars:

1. **Code Computes, the Model Explains:**  
   Risk scores, suitability gates (S1–S7), 10-year fee drag, Sharpe ratios, glide paths, and 5,000-path Monte Carlo simulations are computed exclusively by deterministic TypeScript algorithms. The LLM only explains verified tool results and never invents numbers.
2. **Hard Suitability Gate & Bounded Autonomy (Tiers L0–L3):**  
   The agent can never recommend or purchase an unsuitable product (e.g., a Risk 5 Leveraged Fund is strictly blocked in code by Rule S1). The user signs a cryptographically bound Investment Mandate with hard per-order and monthly limits. Trades exceeding limits require explicit human confirmation with a 6-digit PIN.
3. **Append-Only Cryptographic Audit Log:**  
   Every state change, tool call, policy evaluation, and order is logged in a hash-chained SQLite table protected by database triggers. Any database tampering is instantly detected via `verifyChain()`.

---

## 📸 System Architecture & Dashboard Preview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        XyraFin Wealth Advisor                          │
│  [SIMULATED BROKERAGE SANDBOX: NO REAL MONEY • NOT FINANCIAL ADVICE]   │
├───────────────────────────────┬────────────────────────────────────────┤
│          Advisor Chat         │       Live Agent Decision Feed         │
│                               │                                        │
│ Priya: Invest $2,000 in       │ tool::place_order({amount: 2000})      │
│        Balanced 60/40 fund    │ ┌────────────────────────────────────┐ │
│                               │ │ Tier: L2 | Decision: ALLOWED       │ │
│ Agent: Queued order for       │ │ Rule: L2_MANDATE_PASSED            │ │
│        $2,000. Settle T+1.    │ └────────────────────────────────────┘ │
│                               │                                        │
│ Priya: Put $10,000 in it now  │ tool::place_order({amount: 10000})     │
│                               │ ┌────────────────────────────────────┐ │
│ Agent: Order exceeds mandate! │ │ Tier: L3 | Decision: NEEDS_APPROVAL│ │
│        Created proposal       │ │ Rule: MANDATE_ORDER_LIMIT_EXCEEDED │ │
│        for PIN approval.      │ └────────────────────────────────────┘ │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

## ⚡ Quick Start (Zero API Key Needed!)

XyraFin runs **completely offline** with a deterministic state machine and intent router out-of-the-box. An optional OpenAI/DeepSeek API key can be set in `.env` if desired.

### 1. Setup & Installation
```bash
# Clone the repository
git clone https://github.com/your-org/XyraFin.git
cd XyraFin

# Install backend, frontend, and concurrent dev dependencies in one step
npm run setup
```

### 2. Seed the Sandbox Database
```bash
# Initializes SQLite database, sets up clock, Priya ($20k cash), and Chen (drift demo)
npm run seed
```

### 3. Launch Development Server
```bash
# Starts Express backend (:8787) and Vite frontend (:5173) concurrently
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

*(Optional)* To connect a live LLM provider, copy `.env.example` to `.env` in the backend folder and set `LLM_API_KEY=your_key` (`LLM_BASE_URL` defaults to DeepSeek).

---

## 🧪 Testing & Execution Evidence

### Run the Vitest Test Suite (57 Tests across 9 Suites)
```bash
npm test
```
Includes unit tests for risk scoring, suitability rules (S1–S7), Monte Carlo determinism, fee math, and **10 adversarial Red-Team cases** (prompt injection, mandate escalation, approval replay, tamper protection, and database integrity).

### Run Execution Evidence Generator
```bash
npm run evidence
```
Runs the full end-to-end sandbox lifecycle (profiling $\to$ fund comparison $\to$ suitability block $\to$ Monte Carlo $\to$ mandate signing $\to$ L2 order $\to$ L3 PIN approval $\to$ crash rebalancing $\to$ audit chain validation) and regenerates:
- `evidence/operation_log.jsonl` (raw audit export)
- `evidence/chain_verify.txt` (cryptographic proof report)
- `evidence/summary.md` (human-readable execution timeline table)

---

## 📂 Repository Map

```
XyraFin/
├── backend/
│   ├── src/
│   │   ├── agent/           # LLM client, 11 tools, system prompt, output guard, offline router
│   │   ├── domain/          # Pure deterministic finance: risk, catalog, suitability, allocation, projection
│   │   ├── sandbox/         # Broker simulator: accounts, holdings, orders, clock, scenarios
│   │   ├── security/        # Permissions (L0-L3), mandate, injection defense, audit chain
│   │   ├── routes/          # Express API routes (profile, products, plan, portfolio, agent, audit)
│   │   ├── data/            # Simulated fund catalog (12 products including Risk 5 fund)
│   │   ├── config.ts        # Zod environment variable parsing
│   │   ├── db.ts            # better-sqlite3 with append-only triggers
│   │   └── server.ts        # Express app and static asset server
│   ├── scripts/             # seed.ts, evidence.ts
│   └── tests/               # 9 test suites: unit, security, and red-team tests
├── frontend/
│   ├── src/
│   │   ├── api/             # Typed API client
│   │   ├── components/      # 8 screens: Chat, Risk, Products, Plan, Portfolio, Approvals, Mandate, Audit
│   │   ├── App.tsx          # Main SPA with left sidebar navigation
│   │   └── index.css        # Tailwind CSS design system (Dark navy aesthetic)
│   └── vite.config.ts       # Vite configuration with API proxy
├── docs/
│   ├── TECHNICAL_DOCUMENTATION.md   # Mathematical formulas, sequence flows, API reference
│   ├── SECURITY_SELF_ASSESSMENT.md  # Permission tiers, STRIDE threat model, OWASP LLM mapping
│   ├── DEMO_SCRIPT.md               # 4-minute demo narration & click-by-click script
│   └── DECK_OUTLINE.md              # 10-slide competition presentation deck outline
├── evidence/                # Generated execution logs, verification report, summary table
├── archive/smart-contracts/ # Legacy prototype smart contracts (archived; not part of submission)
├── Dockerfile               # Multi-stage single-container production build
└── package.json             # Root workspace scripts (setup, dev, test, seed, evidence)
```

---

## 🏆 Alignment with FinTechathon Judging Criteria

| Criterion | Weight | How XyraFin Excels | Proving Evidence |
|---|---|---|---|
| **Task Completion** | **40%** | Full lifecycle: 10-question risk profiling, side-by-side fund comparison with 10-yr fee drag, 5,000-path Monte Carlo projection, bounded autonomous orders, T+1 settlement, and crash rebalancing. | `evidence/summary.md` (13 verified events) |
| **Security & Compliance** | **30%** | Hard Suitability Gate (S1–S7) in code; Tier L0–L3 permissions; tamper-proof signed mandates; prompt-injection detection; output guard for hallucinated numbers; hash-chained audit log with SQLite immutability triggers. | `docs/SECURITY_SELF_ASSESSMENT.md` (10/10 Red-Team tests passing) |
| **Innovation & Interaction** | **30%** | True "Financial Participant" paradigm; live Agent Decision Chain cards showing tier and rule IDs in real time; dual-mode execution (works offline without API keys or connects to DeepSeek); single-use PIN approval workflow. | Frontend UI (8 interactive screens) |

---

## ⚠️ Transparent Limitations

- **Simulated Market Environment:** Asset prices evolve under geometric Brownian motion rather than real-time order books with liquidity slippage.
- **Rule-Based Injection Filter:** Regex pattern matching can be bypassed by advanced zero-day obfuscations; production requires semantic embedding filters.
- **Single-Node SQLite:** Optimized for local reproducible judging; production requires distributed PostgreSQL and HSM-backed key management.
- **PIN-Based Approval:** 6-digit confirmation PIN is designed for hackathon demonstration; production requires WebAuthn / FIDO2 biometric authentication.

---

## 👥 Competition Team

**Team XyraFin**  
2026 Shenzhen International FinTech Competition (FinTechathon)  
International Track — Topic B: AI Wealth Assistant  
*Submission Deadline: 20 October 2026, 23:59 Beijing Time (UTC+8)*
