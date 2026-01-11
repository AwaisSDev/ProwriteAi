import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use Service Role Key to make sure the update actually happens
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const payload = req.body;
        console.log('SafePay Webhook received:', JSON.stringify(payload, null, 2));

        const { event, data } = payload;

        // Handle successful payment
        if (event === 'payment.success' || payload.state === 'PAID') {
            const orderId = data?.reference || payload.tracker;
            const amount = data?.amount || payload.amount;

            const orderParts = orderId?.split('_');

            if (!orderParts || orderParts.length < 3) {
                console.error('Invalid order ID format:', orderId);
                return res.status(400).json({ error: 'Invalid order ID' });
            }

            const userId = orderParts[1];
            const planName = orderParts[2];

            console.log('Processing payment for:', { userId, planName, amount });

            // Initialize Supabase with the ADMIN key
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            const credits = planName === 'Pro' ? 200 : planName === 'Plus' ? 100 : 5;

            const { error } = await supabase
                .from('profiles')
                .update({
                    plan: planName,
                    credits: credits
                })
                .eq('id', userId);

            if (error) {
                console.error('Database update error:', error);
                return res.status(500).json({ error: 'Failed to update user plan' });
            }

            console.log(`✅ Successfully upgraded user ${userId} to ${planName}`);
            return res.status(200).json({ success: true, message: 'Payment processed' });
        }

        // Handle failed payment (Keeping your original logic)
        if (event === 'payment.failed' || payload.state === 'FAILED') {
            console.log('❌ Payment failed:', payload);
            return res.status(200).json({ success: true, message: 'Failure acknowledged' });
        }

        console.log('ℹ️ Unhandled event type:', event || payload.state);
        return res.status(200).json({ success: true, message: 'Event received' });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}