import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const payload = req.body;
    console.log("Structure Received:", JSON.stringify(payload));

    // 1. Hunt for the Order ID based on the payload you sent
    // It's inside data -> metadata -> order_id
    let orderId = payload.data?.metadata?.order_id || payload.reference || payload.tracker;

    // Fallback if it's in the other metadata format
    if (!orderId && payload.payment_metadata) {
        const orderMeta = payload.payment_metadata.find(m => m.meta_key === 'order_id');
        if (orderMeta) orderId = orderMeta.meta_value;
    }

    // 2. Check for Success (Accepting PAID or TRACKER_ENDED)
    const state = payload.data?.state || payload.state;
    const isSuccess = state === 'PAID' || state === 'TRACKER_ENDED' || payload.type === 'payment.succeeded';

    if (isSuccess && orderId) {
        const parts = orderId.split('_');

        // Only update if it's OUR format (ORDER_id_plan)
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

            if (error) {
                console.error("DB Error:", error.message);
                return res.status(500).send("DB Update Failed");
            }

            console.log(`✅ SUCCESS: ${userId} upgraded to ${planName}`);
            return res.status(200).json({ status: "success" });
        } else {
            console.log("ℹ️ Test event ignored (Order ID was not in our format):", orderId);
        }
    }

    return res.status(200).send("OK");
}