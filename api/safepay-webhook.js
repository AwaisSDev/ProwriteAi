import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const payload = req.body;

    // 1. LOUD LOG: This will show you exactly what SafePay is sending
    console.log("--- INCOMING WEBHOOK DATA ---");
    console.log(JSON.stringify(payload, null, 2));

    // 2. Extract Data
    const type = payload.type || payload.event;
    const state = payload.data?.state || payload.state;
    const orderId = payload.data?.metadata?.order_id || payload.reference;

    console.log(`Type: ${type} | State: ${state} | OrderID: ${orderId}`);

    // 3. Logic: Only proceed if it's a Success
    if (type === 'payment.succeeded' || state === 'PAID' || state === 'TRACKER_ENDED') {

        if (!orderId || !orderId.includes('_')) {
            console.log("ℹ️ Success received, but Order ID format is just a test/generic.");
            return res.status(200).send("Test event acknowledged");
        }

        const parts = orderId.split('_');
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
            console.error("❌ SUPABASE ERROR:", error.message);
            return res.status(500).send("Database update failed");
        }

        console.log(`✅ SUCCESS: User ${userId} upgraded to ${planName}`);
        return res.status(200).json({ status: "success" });

    } else {
        // Log exactly why we are ignoring it (like the 'stolen card' error)
        console.log(`⚠️ Webhook ignored because status is not 'Success'. Current Type: ${type}`);
        return res.status(200).send("Not a success event");
    }
}