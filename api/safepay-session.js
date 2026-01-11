export default async function handler(req, res) {
    // If SafePay hits this route (POST or GET) after payment
    if (req.method === 'GET' || (req.method === 'POST' && req.body.tracker)) {
        // This sends the user back to your site safely
        return res.redirect(303, 'https://www.prowriteai.online/pricing?success=true');
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    // ... your existing code to initialize the payment (fetch safepay token) ...
    const { amount, planName, userId } = req.body;
    const SAFEPAY_API_KEY = process.env.SAFEPAY_API_KEY;

    try {
        const response = await fetch("https://sandbox.api.getsafepay.com/order/v1/init", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client: SAFEPAY_API_KEY,
                amount: parseFloat(amount),
                currency: 'PKR',
                environment: 'sandbox',
                // ADD THIS LINE - This is the "label" on the payment
                metadata: {
                    order_id: `ORDER_${userId}_${planName}`
                }
            })
        });

        const result = await response.json();
        if (result.status.message === "success") {
            res.status(200).json({
                token: result.data.token,
                order_id: `ORDER_${userId}_${planName}`
            });
        } else {
            res.status(400).json({ error: result.status.message });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}