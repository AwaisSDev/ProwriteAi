export default async function handler(req, res) {
    // 1. If it's a GET request from your frontend, run the initialization logic
    if (req.method === 'POST') {
        // If the body has a token, it's SafePay coming BACK to us
        if (req.body && req.body.tracker) {
            return res.redirect(303, 'https://www.prowriteai.online/pricing?success=true');
        }

        // Otherwise, it's our frontend asking to START a payment
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
                    environment: 'sandbox'
                })
            });

            const result = await response.json();

            if (result.status.message === "success") {
                return res.status(200).json({
                    token: result.data.token,
                    order_id: `ORDER_${userId}_${planName}`
                });
            } else {
                return res.status(400).json({ error: result.status.message });
            }
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    // 2. If SafePay redirects here via GET, just send them home
    if (req.method === 'GET') {
        return res.redirect(303, 'https://www.prowriteai.online/pricing?success=true');
    }

    return res.status(405).send('Method Not Allowed');
}