export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

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
            // Return the token and a custom order_id for your system
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