# XyraFin Advisor: Competition Presentation Deck Outline

**Competition:** 2026 Shenzhen International FinTechathon, International Track, Topic B  
**Presentation Time:** 8–10 Minutes + Q&A  
**Slides:** 10 Slides  

---

### Slide 1: Title & Vision
- **Header:** XyraFin Advisor — AI as a Financial Participant
- **Sub-header:** Compliant, Auditable Wealth Advisory Agent with Hard Permission Gates
- **Key Message:** Moving from passive chatbots to active, regulated financial participants under human mandate control.
- **Visual:** Clean high-resolution mock of the XyraFin dashboard, showing the dark navy UI, the live policy decision card, and the FinTechathon Topic B badge.

---

### Slide 2: The Problem
- **Header:** The First-Time Investor Dilemma & Chatbot Risks
- **Key Message:** 
  1. Retail investors face conflicting, high-fee advice or opaque black-box robo-advisers.
  2. Generic LLMs hallucinate financial returns, fail basic KYC/suitability, and lack execution agency.
- **Visual:** Contrast diagram: "Unregulated Generative Chatbot (Hallucinations & No Controls)" vs "Traditional Robo-Adviser (Static, Inflexible)" vs "XyraFin Advisor (Active Participant + Hard Guardrails)".

---

### Slide 3: The Target User — Priya
- **Header:** Persona Case Study: Priya (Age 24)
- **Key Message:** First job, saving for a $30,000 home deposit in 6 years. Needs tailored allocation, transparent fee metrics, and automated discipline without relinquishing control.
- **Visual:** Persona profile card showing Priya's financial goals, objective capacity ($3/5$), and psychological tolerance ($3/5$).

---

### Slide 4: Core Philosophy — "Code Computes, the Model Explains"
- **Header:** Architectural Decoupling: Deterministic Math vs Generative Language
- **Key Message:** The model never computes in its head. Numbers, risk scores, suitability evaluations, fees, projections, and orders are 100% computed by TypeScript domain code. The LLM only explains verified tool results.
- **Visual:** Two-column architecture schematic highlighting pure TypeScript algorithms on the left feeding structured facts into the LLM on the right, protected by an Output Guard.

---

### Slide 5: Permission Tiers (L0–L3) & The Mandate Envelope
- **Header:** Enforcing Bounded Autonomy Inside Permission Limits
- **Key Message:** 
  - **L0 (Read):** Profile, portfolio, catalog inquiries (Autonomous)
  - **L1 (Advise):** Product comparison, Monte Carlo simulations (Autonomous)
  - **L2 (Act Within Mandate):** Orders within signed mandate limits (Autonomous)
  - **L3 (Human Only):** Mandate updates, large sales (>25%), orders exceeding limits (Requires 6-Digit PIN)
- **Visual:** Tier pyramid diagram illustrating the transition from autonomous L0–L2 execution to L3 human cryptographic authorization.

---

### Slide 6: Hard Suitability Gate (Rules S1–S7)
- **Header:** Regulatory Protection in Code, Not Prompts
- **Key Message:** Suitability (MiFID II / SFC compliance) cannot be bypassed by prompt injection or model hallucination. An order for a Risk 5 Leveraged Fund is strictly blocked by Rule S1 before touching the broker.
- **Visual:** Workflow flowchart showing an incoming order encountering the Suitability Gate, highlighting Rules S1 (Risk Mismatch), S4 (Emergency Reserve), and S5 (Concentration Cap).

---

### Slide 7: Security Architecture & Red-Team Verification
- **Header:** Adversarial Robustness: 10/10 Red-Team Cases Passed
- **Key Message:** 
  - Regex & semantic prompt-injection scanner isolating untrusted factsheets in `<untrusted_document>` sandbox.
  - Single-use, cryptographically bound proposals preventing replay and tampering.
  - Output guard replacing fabricated return figures with audited factual data.
- **Visual:** Table of the 10 adversarial test scenarios, all showing green **PASS** badges.

---

### Slide 8: Cryptographic Hash-Chained Audit Trail
- **Header:** Transparent Non-Repudiation: Every Action SHA-256 Chained
- **Key Message:** An append-only SQLite log protected by database triggers. Any direct database tampering breaks the chain and is detected instantly via `verifyChain()`.
- **Visual:** Visual blockchain-like block diagram showing `PrevHash + CanonicalJSON(Event) -> CurrentHash`, accompanied by a screenshot of the green verification checkmark.

---

### Slide 9: Execution Evidence & Sandbox Verification
- **Header:** Reproducible Deliverables: The `npm run evidence` Suite
- **Key Message:** Full end-to-end sandbox lifecycle executed in deterministic offline mode: profiling, fund comparison, suitability block, Monte Carlo simulation, mandate signing, L2 order, L3 PIN approval, crash rebalancing, and audit verification.
- **Visual:** Screenshot of `evidence/summary.md` and the 13 verified audit events timeline.

---

### Slide 10: Production Roadmap & Team
- **Header:** From Hackathon Sandbox to Regulated Production
- **Key Message:** 
  - Hardware Security Module (HSM) root signing & optional Stellar blockchain anchor.
  - FIDO2 / WebAuthn biometric approval integration.
  - Expansion to live open-banking and multi-custodian APIs.
- **Visual:** 3-phase timeline roadmap + Team credits & Shenzhen FinTechathon 2026 closing banner.
