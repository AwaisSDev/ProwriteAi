import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // SafePay redirects or POSTs to this URL after payment
    const { reference, order_id, tracker, state, status } = { ...req.query, ...req.body };
    const finalOrderId = reference || order_id || null;

    console.log(`\n--- SUCCESS REDIRECT HANDLER ---`);
    console.log('Detected Order ID:', finalOrderId);

    if (finalOrderId && finalOrderId.startsWith('ORDER_')) {
        try {
            const parts = finalOrderId.split('_');
            if (parts.length >= 3) {
                const userId = parts[1];
                let planElements = parts.slice(2);

                // Remove timestamp if present
                if (planElements.length > 1 && /^\d+$/.test(planElements[planElements.length - 1])) {
                    planElements.pop();
                }

                const planName = planElements.join('_');
                const planNormalized = planName.toLowerCase();
                const credits = (planNormalized === 'pro' || planNormalized.includes('pro')) ? 200 : 100;

                console.log(`Updating user ${userId} via success redirect fallback: plan=${planName}`);

                const supabase = createClient(
                    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
                    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
                );

                if (supabase) {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ plan: planName, credits: credits })
                        .eq('id', userId);

                    if (error) {
                        console.error('❌ Success redirect DB update error:', error.message);
                    } else {
                        console.log('✅ Success redirect DB update successful');
                    }
                }
            }
        } catch (err) {
            console.error('Error in success redirect logic:', err);
        }
    }

    // Always redirect the user back to the pricing page with a success flag
    res.redirect(303, 'https://www.prowriteai.online/pricing?status=success');
}