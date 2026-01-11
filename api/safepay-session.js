export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, planName, userId } = req.body;

    try {
        console.log("Starting SafePay init for:", { amount, planName });

        const response = await fetch('https://sandbox.api.getsafepay.com/v1/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: "sec_76543210-9876-5432-1098-765432109876", // REPLACE WITH YOUR ACTUAL KEY
                amount: Number(amount),
                currency: 'PKR',
                environment: 'sandbox'
            })
        });

        const data = await response.json();

        // Check if SafePay sent an error back
        if (!response.ok) {
            console.error("SafePay API Error:", data);
            return res.status(400).json({ error: data });
        }

        return res.status(200).json({
            token: data.data.token,
            order_id: `PRO_${userId}_${planName}_${Date.now()}`
        });

    } catch (error) {
        console.error("Backend Crash:", error.message);
        return res.status(500).json({ error: error.message });
    }
}