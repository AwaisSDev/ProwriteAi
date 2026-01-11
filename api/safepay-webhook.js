import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // 1. Log everything so we can see the "Secret" structure
    console.log("BODY RECEIVED:", JSON.stringify(req.body, null, 2));

    const payload = req.body;

    // 2. SafePay Sandbox often puts data in 'data' or directly in the root
    const state = payload.state || payload.data?.state;
    const orderId = payload.reference || payload.tracker || payload.data?.reference;

    // 3. Check for "PAID" or "payment.success"
    if (state === 'PAID' || payload.event === 'payment.success') {

        const orderParts = orderId?.split('_');
        if (!orderParts || orderParts.length < 3) {
            console.log("Format Error with Order ID:", orderId);
            return res.status(400).send("Invalid Format");
        }

        const userId = orderParts[1];
        const planName = orderParts[2];
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
            console.error("Supabase Error:", error);
            return res.status(500).json(error);
        }

        console.log(`✅ Success! Upgraded ${userId} to ${planName}`);
        return res.status(200).json({ status: "updated" });
    }

    console.log("Ignoring event. State was:", state);
    return res.status(200).send("Event received but not processed");
}