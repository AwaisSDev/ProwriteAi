import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    console.log("--- WEBHOOK HIT ---");
    console.log("Method:", req.method);
    console.log("Body:", JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        console.log("❌ REJECTED: Not a POST request");
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { event, data, state, tracker, reference } = req.body;

        // More flexible way to find the Order ID
        const orderId = data?.reference || reference || tracker;
        console.log("Extracted Order ID:", orderId);

        if (event === 'payment.success' || state === 'PAID') {
            const orderParts = orderId?.split('_');

            if (!orderParts || orderParts.length < 3) {
                console.log("❌ REJECTED: Invalid Format", orderId);
                return res.status(400).send('Invalid Format');
            }

            const userId = orderParts[1];
            const planName = orderParts[2];
            const credits = planName === 'Pro' ? 200 : planName === 'Plus' ? 100 : 5;

            const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

            const { error } = await supabase
                .from('profiles')
                .update({ plan: planName, credits: credits })
                .eq('id', userId);

            if (error) {
                console.log("❌ SUPABASE ERROR:", error);
                throw error;
            }

            console.log("✅ SUCCESS: Plan updated for", userId);
            return res.status(200).json({ success: true });
        }

        console.log("ℹ️ IGNORED: Event was not a success", event || state);
        return res.status(200).send('Event ignored');
    } catch (error) {
        console.error('🔥 CRASH:', error.message);
        return res.status(500).json({ error: error.message });
    }
}