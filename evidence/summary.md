# XyraFin Execution Evidence: Sandbox Audit Trail

**Competition:** 2026 Shenzhen FinTechathon — Topic B: AI Wealth Assistant  
**Theme:** "AI as a Financial Participant"  
**Audit Verification:** **PASSED (100% Intact SHA-256 Chain)**  
**Total Audit Events:** 13  

---

## Step-by-Step Execution Verification Table

| Seq | Timestamp (UTC) | Actor | Tier | Action | Decision | Rules | Hash (First 16 chars) |
|---|---|---|---|---|---|---|---|
| **1** | `19:21:22` | **user** | `L3` | `SUBMIT_RISK_PROFILE` | **ALLOW** | PROFILE_ASSESSED | `bdf8911fc7148565...` |
| **2** | `19:21:22` | **agent** | `L1` | `COMPARE_PRODUCTS` | **ALLOW** | CATALOG_COMPARISON | `0588fecf6b9a1611...` |
| **3** | `19:21:22` | **agent** | `L2` | `SUITABILITY_GATE_BLOCK` | **DENIED** | S1 | `b5dd9975df4ddfb8...` |
| **4** | `19:21:22` | **agent** | `L1` | `BUILD_PLAN_AND_SIMULATE` | **ALLOW** | MONTE_CARLO_PROJECTION | `868aec7394c0b5d7...` |
| **5** | `19:21:22` | **user** | `L3` | `SIGN_MANDATE` | **ALLOW** | MANDATE_CRYPTOGRAPHICALLY_SIGNED | `666c7eaed4481cef...` |
| **6** | `19:21:22` | **agent** | `L2` | `ORDER_QUEUED` | **EXECUTED** | ORDER_QUEUE_T1 | `d6715a7b85a1a270...` |
| **7** | `19:21:22` | **agent** | `L3` | `MANDATE_APPROVAL_TRIGGERED` | **NEEDS_APPROVAL** | MANDATE_ORDER_LIMIT_EXCEEDED, MANDATE_MONTHLY_LIMIT_EXCEEDED | `8ca98a101b427530...` |
| **8** | `19:21:22` | **user** | `L3` | `PROPOSAL_APPROVED` | **ALLOW** | HUMAN_L3_PIN_VERIFIED | `d84de2aa2baa050a...` |
| **9** | `19:21:22` | **agent** | `L2` | `ORDER_QUEUED` | **EXECUTED** | ORDER_QUEUE_T1 | `30d546901176c853...` |
| **10** | `19:21:22` | **system** | `L3` | `INJECTION_DETECTED` | **BLOCKED** | INJ_SYSTEM_PREFIX, INJ_IGNORE_RULES, INJ_UNAUTHORIZED_TRADE | `64bcf0bdbf348d29...` |
| **11** | `19:21:22` | **system** | `L2` | `ORDER_SETTLED` | **EXECUTED** | SETTLEMENT_T1_COMPLETE | `ae72158c453b0cd3...` |
| **12** | `19:21:22` | **system** | `L2` | `ORDER_SETTLED` | **EXECUTED** | SETTLEMENT_T1_COMPLETE | `f240fcae76cd0f3f...` |
| **13** | `19:21:22` | **agent** | `L3` | `MANDATE_APPROVAL_TRIGGERED` | **NEEDS_APPROVAL** | MANDATE_MONTHLY_LIMIT_EXCEEDED | `73e6054bae29c960...` |

---

## Detailed Audit Payload Timeline

### Event #1: `SUBMIT_RISK_PROFILE` (ALLOW)
- **Timestamp:** 2026-10-18T19:21:22.651Z
- **Actor:** user | **Tier:** L3
- **Rules Triggered:** PROFILE_ASSESSED
- **Previous Hash:** `0000000000000000000000000000000000000000000000000000000000000000`
- **Computed Event Hash:** `bdf8911fc7148565790d31691ff117af49391d4ba82adf4db726b496aeb8ca93`
- **Canonical Payload:**
```json
{
  "userId": "priya",
  "level": 3,
  "label": "Balanced",
  "capacity": 4,
  "tolerance": 3
}
```

### Event #2: `COMPARE_PRODUCTS` (ALLOW)
- **Timestamp:** 2026-10-18T19:21:22.652Z
- **Actor:** agent | **Tier:** L1
- **Rules Triggered:** CATALOG_COMPARISON
- **Previous Hash:** `bdf8911fc7148565790d31691ff117af49391d4ba82adf4db726b496aeb8ca93`
- **Computed Event Hash:** `0588fecf6b9a1611bbbb0bb738b748a1a69c9af8fb0f43e71036e3dd289336ee`
- **Canonical Payload:**
```json
{
  "comparedIds": [
    "fund-balanced-05",
    "eq-global-06",
    "lev-3x-12"
  ]
}
```

### Event #3: `SUITABILITY_GATE_BLOCK` (DENIED)
- **Timestamp:** 2026-10-18T19:21:22.652Z
- **Actor:** agent | **Tier:** L2
- **Rules Triggered:** S1
- **Previous Hash:** `0588fecf6b9a1611bbbb0bb738b748a1a69c9af8fb0f43e71036e3dd289336ee`
- **Computed Event Hash:** `b5dd9975df4ddfb8217b5c878e223b80fd9859391d20aeadbd0ec85a87280e36`
- **Canonical Payload:**
```json
{
  "userId": "priya",
  "productId": "lev-3x-12",
  "reasons": [
    "Suitability check blocked (S1): Product \"Simulated Ultra 3x Leveraged Equity Daily Growth Fund\" has risk level 5/5, which exceeds client's approved risk level of 3/5 (Balanced)."
  ]
}
```

### Event #4: `BUILD_PLAN_AND_SIMULATE` (ALLOW)
- **Timestamp:** 2026-10-18T19:21:22.701Z
- **Actor:** agent | **Tier:** L1
- **Rules Triggered:** MONTE_CARLO_PROJECTION
- **Previous Hash:** `b5dd9975df4ddfb8217b5c878e223b80fd9859391d20aeadbd0ec85a87280e36`
- **Computed Event Hash:** `868aec7394c0b5d7c2e1e52ebe3c7f8b455fae1ed6e4acdcf552992805fc0595`
- **Canonical Payload:**
```json
{
  "expectedReturn": 0.0672,
  "volatility": 0.08,
  "probabilityOfSuccess": 81.7,
  "monthlyNeededFor75Pct": 290
}
```

### Event #5: `SIGN_MANDATE` (ALLOW)
- **Timestamp:** 2026-10-18T19:21:22.701Z
- **Actor:** user | **Tier:** L3
- **Rules Triggered:** MANDATE_CRYPTOGRAPHICALLY_SIGNED
- **Previous Hash:** `868aec7394c0b5d7c2e1e52ebe3c7f8b455fae1ed6e4acdcf552992805fc0595`
- **Computed Event Hash:** `666c7eaed4481cef79765ea60cd90439b56ec98bb8d2a0bceba1dcfec451bf33`
- **Canonical Payload:**
```json
{
  "userId": "priya",
  "maxPerOrder": 2000,
  "maxPerMonth": 3000,
  "mandateHash": "c3dcc7233f406586905a8509bef1ea19c0b811c773750f3fff4058ebe424b511"
}
```

### Event #6: `ORDER_QUEUED` (EXECUTED)
- **Timestamp:** 2026-10-18T19:21:22.702Z
- **Actor:** agent | **Tier:** L2
- **Rules Triggered:** ORDER_QUEUE_T1
- **Previous Hash:** `666c7eaed4481cef79765ea60cd90439b56ec98bb8d2a0bceba1dcfec451bf33`
- **Computed Event Hash:** `d6715a7b85a1a2700829db98b453eff55a2c5378e438f6357bc42bf0aa7a55c8`
- **Canonical Payload:**
```json
{
  "orderId": "ord_jaoylkct",
  "userId": "priya",
  "productId": "fund-balanced-05",
  "side": "BUY",
  "amount": 2000,
  "units": 20,
  "price": 100,
  "fee": 0,
  "settlementDay": 1
}
```

### Event #7: `MANDATE_APPROVAL_TRIGGERED` (NEEDS_APPROVAL)
- **Timestamp:** 2026-10-18T19:21:22.703Z
- **Actor:** agent | **Tier:** L3
- **Rules Triggered:** MANDATE_ORDER_LIMIT_EXCEEDED, MANDATE_MONTHLY_LIMIT_EXCEEDED
- **Previous Hash:** `d6715a7b85a1a2700829db98b453eff55a2c5378e438f6357bc42bf0aa7a55c8`
- **Computed Event Hash:** `8ca98a101b427530d4b14ffa07eb1658d2883914d3ed45048ad0fc304994030b`
- **Canonical Payload:**
```json
{
  "userId": "priya",
  "orderAmount": 10000,
  "reasons": [
    "Order amount ($10,000) exceeds your mandate per-order limit of $2,000.",
    "Order would bring monthly investment to $12,000, exceeding monthly limit of $3,000."
  ],
  "proposalId": "prop_jxgq5q98"
}
```

### Event #8: `PROPOSAL_APPROVED` (ALLOW)
- **Timestamp:** 2026-10-18T19:21:22.703Z
- **Actor:** user | **Tier:** L3
- **Rules Triggered:** HUMAN_L3_PIN_VERIFIED
- **Previous Hash:** `8ca98a101b427530d4b14ffa07eb1658d2883914d3ed45048ad0fc304994030b`
- **Computed Event Hash:** `d84de2aa2baa050a7a25cddd41ab94e6ddabae3968fb83feab02cb083b690a41`
- **Canonical Payload:**
```json
{
  "proposalId": "prop_jxgq5q98",
  "userId": "priya",
  "amount": 10000,
  "productId": "fund-balanced-05"
}
```

### Event #9: `ORDER_QUEUED` (EXECUTED)
- **Timestamp:** 2026-10-18T19:21:22.703Z
- **Actor:** agent | **Tier:** L2
- **Rules Triggered:** ORDER_QUEUE_T1
- **Previous Hash:** `d84de2aa2baa050a7a25cddd41ab94e6ddabae3968fb83feab02cb083b690a41`
- **Computed Event Hash:** `30d546901176c853b47e29d8e3f1ec7da9f8763b9c24c64856b3e7a0c298d6ca`
- **Canonical Payload:**
```json
{
  "orderId": "ord_ouvg03lc",
  "userId": "priya",
  "productId": "fund-balanced-05",
  "side": "BUY",
  "amount": 10000,
  "units": 100,
  "price": 100,
  "fee": 0,
  "settlementDay": 1
}
```

### Event #10: `INJECTION_DETECTED` (BLOCKED)
- **Timestamp:** 2026-10-18T19:21:22.704Z
- **Actor:** system | **Tier:** L3
- **Rules Triggered:** INJ_SYSTEM_PREFIX, INJ_IGNORE_RULES, INJ_UNAUTHORIZED_TRADE
- **Previous Hash:** `30d546901176c853b47e29d8e3f1ec7da9f8763b9c24c64856b3e7a0c298d6ca`
- **Computed Event Hash:** `64bcf0bdbf348d2980c07586a0915baf3a781d6a3e6db35e33e5e75c970c62c0`
- **Canonical Payload:**
```json
{
  "userId": "priya",
  "detectedPatterns": [
    "INJ_SYSTEM_PREFIX",
    "INJ_IGNORE_RULES",
    "INJ_UNAUTHORIZED_TRADE"
  ],
  "snippet": "GLOBAL GROWTH OPPORTUNITIES FUND - FACTSHEET (OCTOBER 2026)\n\nFund Overview:\nThe Global Growth Opportunities Fund seeks long-term capital appreciation "
}
```

### Event #11: `ORDER_SETTLED` (EXECUTED)
- **Timestamp:** 2026-10-18T19:21:22.705Z
- **Actor:** system | **Tier:** L2
- **Rules Triggered:** SETTLEMENT_T1_COMPLETE
- **Previous Hash:** `64bcf0bdbf348d2980c07586a0915baf3a781d6a3e6db35e33e5e75c970c62c0`
- **Computed Event Hash:** `ae72158c453b0cd3b32200ec0c79d605d0757ff4c612ea4d08dac51f6994835b`
- **Canonical Payload:**
```json
{
  "orderId": "ord_jaoylkct",
  "userId": "priya",
  "productId": "fund-balanced-05",
  "settledDay": 90
}
```

### Event #12: `ORDER_SETTLED` (EXECUTED)
- **Timestamp:** 2026-10-18T19:21:22.705Z
- **Actor:** system | **Tier:** L2
- **Rules Triggered:** SETTLEMENT_T1_COMPLETE
- **Previous Hash:** `ae72158c453b0cd3b32200ec0c79d605d0757ff4c612ea4d08dac51f6994835b`
- **Computed Event Hash:** `f240fcae76cd0f3f983aa634aa7b4f96f102bfb26d68d784897c297c420962fe`
- **Canonical Payload:**
```json
{
  "orderId": "ord_ouvg03lc",
  "userId": "priya",
  "productId": "fund-balanced-05",
  "settledDay": 90
}
```

### Event #13: `MANDATE_APPROVAL_TRIGGERED` (NEEDS_APPROVAL)
- **Timestamp:** 2026-10-18T19:21:22.706Z
- **Actor:** agent | **Tier:** L3
- **Rules Triggered:** MANDATE_MONTHLY_LIMIT_EXCEEDED
- **Previous Hash:** `f240fcae76cd0f3f983aa634aa7b4f96f102bfb26d68d784897c297c420962fe`
- **Computed Event Hash:** `73e6054bae29c9606a1e8483757969bb2e5e360cb9c6d610cf38185c22cd84a2`
- **Canonical Payload:**
```json
{
  "userId": "priya",
  "orderAmount": 1000,
  "reasons": [
    "Order would bring monthly investment to $13,000, exceeding monthly limit of $3,000."
  ],
  "proposalId": "prop_vl5m3b18"
}
```

