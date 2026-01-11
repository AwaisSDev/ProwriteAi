export default async function handler(req, res) {
    // 1. Log to your TERMINAL (not browser) to see if key exists
    console.log("Key Check:", process.env.SAFEPAY_API_KEY ? "Found" : "MISSING");

    if (!process.env.SAFEPAY_API_KEY) {
        return res.status(500).json({
            error: "The SAFEPAY_API_KEY is not defined in your environment variables."
        });
    }

    const { amount, planName, userId } = req.body;

    try {
        const response = await fetch('https://sandbox.api.getsafepay.com/v1/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.SAFEPAY_API_KEY,
                amount: Number(amount),
                currency: 'PKR',
                environment: 'sandbox'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ error: data });
        }

        res.status(200).json({
            token: data.data.token,
            order_id: `PRO_${userId}_${planName}_${Date.now()}`
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to connect to SafePay API" });
    }
}