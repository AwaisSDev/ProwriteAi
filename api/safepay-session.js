export default async function handler(req, res) {
    // 1. Set CORS headers so the frontend can talk to it
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { amount, planName, userId } = req.body;
        const apiKey = process.env.SAFEPAY_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL: SAFEPAY_API_KEY is missing!");
            return res.status(500).json({ error: "API Key missing on server" });
        }

        const response = await fetch('https://sandbox.api.getsafepay.com/v1/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: apiKey,
                amount: Number(amount),
                currency: 'PKR',
                environment: 'sandbox'
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(400).json({ error: "SafePay rejected request", details: result });
        }

        return res.status(200).json({
            token: result.data.token,
            order_id: `PRO_${userId}_${planName}_${Date.now()}`
        });

    } catch (error) {
        console.error("Function Crash:", error);
        return res.status(500).json({ error: error.message });
    }
}