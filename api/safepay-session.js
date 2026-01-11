// api/safepay-session.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, planName, userId } = req.body;

    try {
        // 1. Get a Tracker Token from SafePay Sandbox
        // In production, use: https://api.getsafepay.com/v1/init
        const response = await fetch('https://sandbox.api.getsafepay.com/v1/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.SAFEPAY_API_KEY, // Get this from SafePay Dashboard
                amount: amount,
                currency: 'PKR',
                environment: 'sandbox'
            })
        });

        const data = await response.json();

        if (!data.status || data.status.errors) {
            throw new Error("SafePay initialization failed");
        }

        // 2. Return the token and a custom order_id to your frontend
        // We embed the plan name in the order_id so we can read it on return
        res.status(200).json({
            token: data.data.token,
            order_id: `PRO_${userId}_${planName}_${Date.now()}`
        });

    } catch (error) {
        console.error("SafePay Backend Error:", error);
        res.status(500).json({ error: "Failed to initialize payment session" });
    }
}