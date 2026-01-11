// api/safepay-session.js
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { amount, planName, userId } = req.body;
    const SAFEPAY_API_KEY = "sec_12efcfb2-706e-4401-b85f-7ec98c6d669a"; // Sandbox API Key

    try {
        const response = await fetch("https://sandbox.api.getsafepay.com/order/v1/init", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client: SAFEPAY_API_KEY,
                amount: parseFloat(amount),
                currency: 'PKR',
                environment: 'sandbox'
            })
        });

        const result = await response.json();

        if (result.status.message === "success") {
            // Return the token and a custom order_id for your system
            res.status(200).json({
                token: result.data.token,
                order_id: `ORDER_${userId}_${planName}_${Date.now()}`
            });
        } else {
            res.status(400).json({ error: "Safepay Init Failed" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}