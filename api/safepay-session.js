
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, currency, planName, userId } = req.body;

    try {
        console.log('Creating SafePay session for:', { amount, currency, planName, userId });

        // SafePay sandbox credentials
        const SAFEPAY_KEY = 'sec_12efcfb2-706e-4401-b85f-7ec98c6d669a';

        // Create a unique order reference
        const orderRef = `ORDER_${userId}_${planName}_${Date.now()}`;

        // For sandbox testing, create a checkout URL
        // In production, you'd call SafePay's API to get a real checkout token
        const checkoutUrl = `https://sandbox.getsafepay.pk/checkout?` +
            `amount=${amount}&` +
            `currency=${currency || 'PKR'}&` +
            `order_id=${orderRef}&` +
            `api_key=${SAFEPAY_KEY}&` +
            `environment=sandbox`;

        return res.status(200).json({
            checkoutUrl: checkoutUrl,
            orderId: orderRef,
            amount: parseFloat(amount),
            currency: currency || 'PKR'
        });
    } catch (error) {
        console.error('SafePay Session Error:', error.message);
        return res.status(500).json({ error: error.message || 'Payment initialization failed' });
    }
}
