# XyraFin Execution Evidence: Sandbox Audit Trail

**Competition:** 2026 Shenzhen FinTechathon — Topic B: AI Wealth Assistant  
**Theme:** "AI as a Financial Participant"  
**Audit Verification:** **PASSED (100% Intact SHA-256 Chain)**  
**Total Audit Events:** 13  

---

## Step-by-Step Execution Verification Table

| Seq | Timestamp (UTC) | Actor | Tier | Action | Decision | Rules | Hash (First 16 chars) |
|---|---|---|---|---|---|---|---|
| **1** | `19:10:30` | **user** | `L3` | `SUBMIT_RISK_PROFILE` | **ALLOW** | PROFILE_ASSESSED | `39e2e0a133f69a68...` |
| **2** | `19:10:30` | **agent** | `L1` | `COMPARE_PRODUCTS` | **ALLOW** | CATALOG_COMPARISON | `74cb27b043698aa4...` |
| **3** | `19:10:30` | **agent** | `L2` | `SUITABILITY_GATE_BLOCK` | **DENIED** | S1 | `a2af54f51efb8c06...` |
| **4** | `19:10:30` | **agent** | `L1` | `BUILD_PLAN_AND_SIMULATE` | **ALLOW** | MONTE_CARLO_PROJECTION | `24f57e909b92a9db...` |
| **5** | `19:10:30` | **user** | `L3` | `SIGN_MANDATE` | **ALLOW** | MANDATE_CRYPTOGRAPHICALLY_SIGNED | `98434fb865983f9c...` |
| **6** | `19:10:30` | **agent** | `L2` | `ORDER_QUEUED` | **EXECUTED** | ORDER_QUEUE_T1 | `9440c7dd98f55a6c...` |
| **7** | `19:10:30` | **agent** | `L3` | `MANDATE_APPROVAL_TRIGGERED` | **NEEDS_APPROVAL** | MANDATE_ORDER_LIMIT_EXCEEDED, MANDATE_MONTHLY_LIMIT_EXCEEDED | `2b0493f7ec5c6305...` |
| **8** | `19:10:30` | **user** | `L3` | `PROPOSAL_APPROVED` | **ALLOW** | HUMAN_L3_PIN_VERIFIED | `34d701ab42ef397a...` |
| **9** | `19:10:30` | **agent** | `L2` | `ORDER_QUEUED` | **EXECUTED** | ORDER_QUEUE_T1 | `2f81dcf0d8f5c770...` |
| **10** | `19:10:30` | **system** | `L3` | `INJECTION_DETECTED` | **BLOCKED** | INJ_SYSTEM_PREFIX, INJ_IGNORE_RULES, INJ_UNAUTHORIZED_TRADE | `f323e88a10ecdcb3...` |
| **11** | `19:10:30` | **system** | `L2` | `ORDER_SETTLED` | **EXECUTED** | SETTLEMENT_T1_COMPLETE | `508e6be3e193f3da...` |
| **12** | `19:10:30` | **system** | `L2` | `ORDER_SETTLED` | **EXECUTED** | SETTLEMENT_T1_COMPLETE | `f6020e95a522ade1...` |
| **13** | `19:10:30` | **agent** | `L3` | `MANDATE_APPROVAL_TRIGGERED` | **NEEDS_APPROVAL** | MANDATE_MONTHLY_LIMIT_EXCEEDED | `94a40581a1b0c21a...` |

---

## Detailed Audit Payload Timeline

### Event #1: `SUBMIT_RISK_PROFILE` (ALLOW)
- **Timestamp:** 2026-10-18T19:10:30.946Z
- **Actor:** user | **Tier:** L3
- **Rules Triggered:** PROFILE_ASSESSED
- **Previous Hash:** `0000000000000000000000000000000000000000000000000000000000000000`
- **Computed Event Hash:** `39e2e0a133f69a68fb7dabcc18050b16327120ddb2c681f1b20800459e37dd8a`
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
- **Timestamp:** 2026-10-18T19:10:30.947Z
- **Actor:** agent | **Tier:** L1
- **Rules Triggered:** CATALOG_COMPARISON
- **Previous Hash:** `39e2e0a133f69a68fb7dabcc18050b16327120ddb2c681f1b20800459e37dd8a`
- **Computed Event Hash:** `74cb27b043698aa45832e535195300e0dc5cc04a5c467e24fbebca5ab524f24a`
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
- **Timestamp:** 2026-10-18T19:10:30.947Z
- **Actor:** agent | **Tier:** L2
- **Rules Triggered:** S1
- **Previous Hash:** `74cb27b043698aa45832e535195300e0dc5cc04a5c467e24fbebca5ab524f24a`
- **Computed Event Hash:** `a2af54f51efb8c067676a51355fd7bc001c5bfb4a1d9719a8dc2a335b0165b44`
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
- **Timestamp:** 2026-10-18T19:10:30.985Z
- **Actor:** agent | **Tier:** L1
- **Rules Triggered:** MONTE_CARLO_PROJECTION
- **Previous Hash:** `a2af54f51efb8c067676a51355fd7bc001c5bfb4a1d9719a8dc2a335b0165b44`
- **Computed Event Hash:** `24f57e909b92a9db66088075ee49dc4843bbae127f6422bb927450f88bb0614b`
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
- **Timestamp:** 2026-10-18T19:10:30.986Z
- **Actor:** user | **Tier:** L3
- **Rules Triggered:** MANDATE_CRYPTOGRAPHICALLY_SIGNED
- **Previous Hash:** `24f57e909b92a9db66088075ee49dc4843bbae127f6422bb927450f88bb0614b`
- **Computed Event Hash:** `98434fb865983f9ce9e26c36f7789e752a8a314c5f7cf6e0be074497b11f3b49`
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
- **Timestamp:** 2026-10-18T19:10:30.986Z
- **Actor:** agent | **Tier:** L2
- **Rules Triggered:** ORDER_QUEUE_T1
- **Previous Hash:** `98434fb865983f9ce9e26c36f7789e752a8a314c5f7cf6e0be074497b11f3b49`
- **Computed Event Hash:** `9440c7dd98f55a6cf7d9fbb0bc1d4d13e1fd658e2a556b0058810411c01346c3`
- **Canonical Payload:**
```json
{
  "orderId": "ord_7ckoyhtn",
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
- **Timestamp:** 2026-10-18T19:10:30.987Z
- **Actor:** agent | **Tier:** L3
- **Rules Triggered:** MANDATE_ORDER_LIMIT_EXCEEDED, MANDATE_MONTHLY_LIMIT_EXCEEDED
- **Previous Hash:** `9440c7dd98f55a6cf7d9fbb0bc1d4d13e1fd658e2a556b0058810411c01346c3`
- **Computed Event Hash:** `2b0493f7ec5c6305a05221cbdd6e72dc87aa2b78d3579cfa4b6daded33fae227`
- **Canonical Payload:**
```json
{
  "userId": "priya",
  "orderAmount": 10000,
  "reasons": [
    "Order amount ($10,000) exceeds your mandate per-order limit of $2,000.",
    "Order would bring monthly investment to $12,000, exceeding monthly limit of $3,000."
  ],
  "proposalId": "prop_2p9uo9ki"
}
```

### Event #8: `PROPOSAL_APPROVED` (ALLOW)
- **Timestamp:** 2026-10-18T19:10:30.987Z
- **Actor:** user | **Tier:** L3
- **Rules Triggered:** HUMAN_L3_PIN_VERIFIED
- **Previous Hash:** `2b0493f7ec5c6305a05221cbdd6e72dc87aa2b78d3579cfa4b6daded33fae227`
- **Computed Event Hash:** `34d701ab42ef397adce7261ee43095e68cc76e54de67797845db24e05395b029`
- **Canonical Payload:**
```json
{
  "proposalId": "prop_2p9uo9ki",
  "userId": "priya",
  "amount": 10000,
  "productId": "fund-balanced-05"
}
```

### Event #9: `ORDER_QUEUED` (EXECUTED)
- **Timestamp:** 2026-10-18T19:10:30.988Z
- **Actor:** agent | **Tier:** L2
- **Rules Triggered:** ORDER_QUEUE_T1
- **Previous Hash:** `34d701ab42ef397adce7261ee43095e68cc76e54de67797845db24e05395b029`
- **Computed Event Hash:** `2f81dcf0d8f5c770db362652c694948b86e3caa27c88f04c6da8a37baf0e935a`
- **Canonical Payload:**
```json
{
  "orderId": "ord_hnwusw6j",
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
- **Timestamp:** 2026-10-18T19:10:30.988Z
- **Actor:** system | **Tier:** L3
- **Rules Triggered:** INJ_SYSTEM_PREFIX, INJ_IGNORE_RULES, INJ_UNAUTHORIZED_TRADE
- **Previous Hash:** `2f81dcf0d8f5c770db362652c694948b86e3caa27c88f04c6da8a37baf0e935a`
- **Computed Event Hash:** `f323e88a10ecdcb3571e88054753650652b557b1163bc9118918720646cbd8f2`
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
- **Timestamp:** 2026-10-18T19:10:30.989Z
- **Actor:** system | **Tier:** L2
- **Rules Triggered:** SETTLEMENT_T1_COMPLETE
- **Previous Hash:** `f323e88a10ecdcb3571e88054753650652b557b1163bc9118918720646cbd8f2`
- **Computed Event Hash:** `508e6be3e193f3da436799cd368d32462520247918935b9cccfc3858df321ab0`
- **Canonical Payload:**
```json
{
  "orderId": "ord_7ckoyhtn",
  "userId": "priya",
  "productId": "fund-balanced-05",
  "settledDay": 90
}
```

### Event #12: `ORDER_SETTLED` (EXECUTED)
- **Timestamp:** 2026-10-18T19:10:30.989Z
- **Actor:** system | **Tier:** L2
- **Rules Triggered:** SETTLEMENT_T1_COMPLETE
- **Previous Hash:** `508e6be3e193f3da436799cd368d32462520247918935b9cccfc3858df321ab0`
- **Computed Event Hash:** `f6020e95a522ade1336ac4b35f90071535104e94667f8662ceadf507fa0ae298`
- **Canonical Payload:**
```json
{
  "orderId": "ord_hnwusw6j",
  "userId": "priya",
  "productId": "fund-balanced-05",
  "settledDay": 90
}
```

### Event #13: `MANDATE_APPROVAL_TRIGGERED` (NEEDS_APPROVAL)
- **Timestamp:** 2026-10-18T19:10:30.989Z
- **Actor:** agent | **Tier:** L3
- **Rules Triggered:** MANDATE_MONTHLY_LIMIT_EXCEEDED
- **Previous Hash:** `f6020e95a522ade1336ac4b35f90071535104e94667f8662ceadf507fa0ae298`
- **Computed Event Hash:** `94a40581a1b0c21ab4d10a771c01f8721143e7e894e47f8eda89fcf8a9718c22`
- **Canonical Payload:**
```json
{
  "userId": "priya",
  "orderAmount": 1000,
  "reasons": [
    "Order would bring monthly investment to $13,000, exceeding monthly limit of $3,000."
  ],
  "proposalId": "prop_8oi97kop"
}
```

