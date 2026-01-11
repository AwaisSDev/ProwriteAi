import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// CRITICAL: Use Service Role Key here so the server can bypass RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;
        const { event, data } = payload;

        // SafePay "Success" can be in event type or state
        if (event === 'payment.success' || payload.state === 'PAID') {
            const orderId = data?.reference || payload.reference || payload.tracker;

            const orderParts = orderId?.split('_');
            if (!orderParts || orderParts.length < 3) return res.status(400).send('Invalid Format');

            const userId = orderParts[1];
            const planName = orderParts[2];

            // Initialize with Service Key
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            const credits = planName === 'Pro' ? 200 : planName === 'Plus' ? 100 : 5;

            const { error } = await supabase
                .from('profiles')
                .update({ plan: planName, credits: credits })
                .eq('id', userId);

            if (error) throw error;

            return res.status(200).json({ success: true });
        }

        return res.status(200).send('Event ignored');
    } catch (error) {
        console.error('Webhook Error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}