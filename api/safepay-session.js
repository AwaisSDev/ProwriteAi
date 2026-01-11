export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

    // Safepay usually sends these at the top level of the body
    const { tracker, signature, order_id } = req.body;
    const sharedSecret = process.env.SAFEPAY_SECRET_KEY;

    if (!tracker || !signature || !order_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // 1. Verify the Signature
    const hash = crypto.createHmac('sha256', sharedSecret).update(tracker).digest('hex');

    if (hash !== signature) {
        console.error("Auth failed: Signatures do not match");
        return res.status(401).json({ error: "Invalid signature" });
    }

    // 2. Extract info (Handles PROWRITE_userId_planName)
    const parts = order_id.split('_');
    if (parts.length < 3) return res.status(400).send("Invalid order_id format");

    const userId = parts[1];
    const planName = parts[2];

    try {
        const { error } = await supabase
            .from('profiles')
            .update({ plan: planName })
            .eq('id', userId);

        if (error) throw error;
        return res.status(200).json({ status: "success" });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}