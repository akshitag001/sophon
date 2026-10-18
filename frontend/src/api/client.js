const API_BASE = '';
async function fetchJson(url, options) {
    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
    if (!res.ok) {
        let errMsg = `Request failed: ${res.statusText}`;
        try {
            const errObj = await res.json();
            errMsg = errObj.error || errMsg;
        }
        catch (e) {
            // ignore
        }
        throw new Error(errMsg);
    }
    return res.json();
}
export const api = {
    // Health
    getHealth: () => fetchJson('/health'),
    // Risk & Profile
    getQuestions: () => fetchJson('/profile/questions'),
    getProfile: (userId) => fetchJson(`/profile/${userId}`),
    submitProfile: (userId, answers) => fetchJson('/profile', {
        method: 'POST',
        body: JSON.stringify({ userId, answers })
    }),
    // Products
    getProducts: (params) => {
        const query = new URLSearchParams();
        if (params?.asset_class)
            query.set('asset_class', params.asset_class);
        if (params?.max_risk_level)
            query.set('max_risk_level', String(params.max_risk_level));
        return fetchJson(`/products?${query.toString()}`);
    },
    getProduct: (id) => fetchJson(`/products/${id}`),
    compareProducts: (ids) => fetchJson('/products/compare', {
        method: 'POST',
        body: JSON.stringify({ ids })
    }),
    // Planning & Simulation
    buildPlan: (userId, goal) => fetchJson('/plan', {
        method: 'POST',
        body: JSON.stringify({ userId, goal })
    }),
    simulateGoal: (plan, initial, monthlyContribution, years, target, seed = 42) => fetchJson('/plan/simulate', {
        method: 'POST',
        body: JSON.stringify({ plan, initial, monthlyContribution, years, target, seed })
    }),
    // Portfolio & Sandbox
    getPortfolio: (userId) => fetchJson(`/portfolio/${userId}`),
    getOrders: (userId) => fetchJson(`/orders/${userId}`),
    advanceClock: (days) => fetchJson('/sandbox/advance', {
        method: 'POST',
        body: JSON.stringify({ days })
    }),
    setScenario: (scenario) => fetchJson('/sandbox/scenario', {
        method: 'POST',
        body: JSON.stringify({ scenario })
    }),
    resetSandbox: () => fetchJson('/sandbox/reset', {
        method: 'POST',
        body: JSON.stringify({})
    }),
    // Mandate
    getMandate: async (userId) => {
        try {
            // Mandates can be retrieved or simulated
            const res = await fetchJson(`/mandates/${userId}`).catch(() => null);
            return res;
        }
        catch {
            return null;
        }
    },
    // Agent Chat & Approvals
    chat: (userId, sessionId, message) => fetchJson('/agent/chat', {
        method: 'POST',
        body: JSON.stringify({ userId, sessionId, message })
    }),
    uploadFactsheet: (userId, text, filename) => fetchJson('/agent/factsheet', {
        method: 'POST',
        body: JSON.stringify({ userId, text, filename })
    }),
    approveProposal: (proposalId, typedAmount, pin) => fetchJson('/agent/approve', {
        method: 'POST',
        body: JSON.stringify({ proposalId, typedAmount, pin })
    }),
    // Audit
    getAuditEvents: (userId, limit = 200) => {
        const url = userId ? `/audit/${userId}?limit=${limit}` : `/audit?limit=${limit}`;
        return fetchJson(url);
    },
    verifyAuditChain: () => fetchJson('/audit/verify'),
    exportAuditUrl: () => `${API_BASE}/audit/export`
};
