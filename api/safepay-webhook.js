import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const payload = req.body;
    console.log("Incoming Webhook Data:", JSON.stringify(payload));

    // 1. Hunt for the Order ID (Checks root, data object, and metadata array)
    let orderId = payload.reference || payload.tracker || payload.data?.reference;

    if (payload.payment_metadata && Array.isArray(payload.payment_metadata)) {
        const orderMeta = payload.payment_metadata.find(m => m.meta_key === 'order_id');
        if (orderMeta) orderId = orderMeta.meta_value;
    }

    // 2. Determine if it's a success
    const state = payload.state || payload.data?.state || payload.status;
    const isSuccess = state === 'PAID' || payload.event === 'payment.succeeded';

    if (isSuccess && orderId) {
        const parts = orderId.split('_');

        if (parts.length >= 3) {
            const userId = parts[1];
            const planName = parts[2];
            const credits = planName === 'Pro' ? 200 : 100;

            const supabase = createClient(
                process.env.VITE_SUPABASE_URL,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            const { error } = await supabase
                .from('profiles')
                .update({ plan: planName, credits: credits })
                .eq('id', userId);

            if (!error) {
                console.log(`✅ DATABASE UPDATED: User ${userId} is now ${planName}`);
                return res.status(200).json({ success: true });
            }
            console.error("❌ SUPABASE ERROR:", error.message);
        } else {
            console.log("ℹ️ Skipping: ID format doesn't match ours:", orderId);
        }
    }

    // Always send 200 so SafePay stops retrying
    return res.status(200).send("OK");
}