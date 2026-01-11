import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    const receivedAt = new Date().toISOString();
    console.log(`\n--- INCOMING SAFEPAY WEBHOOK (${receivedAt}) ---`);

    // Try to read body defensively (some platforms give raw body)
    let payload = req.body;
    try {
        if (!payload || Object.keys(payload).length === 0) {
            // attempt to parse raw body if available
            const raw = req.rawBody || req.bodyRaw || '';
            if (raw && typeof raw === 'string') payload = JSON.parse(raw);
        }
    } catch (err) {
        console.warn('⚠️ Failed to parse raw body:', err?.message || err);
    }

    console.log('Request method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Payload:', JSON.stringify(payload, null, 2));

    // Extract fields with fallbacks
    const type = payload?.type || payload?.event || null;
    const state = payload?.data?.state || payload?.state || null;
    const orderId = payload?.data?.metadata?.order_id || payload?.data?.metadata?.orderId || payload?.reference || payload?.data?.reference || null;

    console.log(`Parsed: type=${type} | state=${state} | order_id=${orderId}`);

    // Default response body (we ALWAYS respond 200 to SafePay)
    const safeResponse = { ok: true };

    try {
        const isSuccess = type === 'payment.succeeded' || ['PAID', 'TRACKER_ENDED'].includes(String(state).toUpperCase());
        if (!isSuccess) {
            console.log('Ignored event: not a successful payment.');
            return res.status(200).json(safeResponse);
        }

        if (!orderId || typeof orderId !== 'string') {
            console.log('Success event received but order_id is missing or invalid.');
            return res.status(200).json(safeResponse);
        }

        // Expecting format ORDER_userid_planName (planName may contain underscores)
        const parts = orderId.split('_');
        if (parts.length < 3) {
            console.log('Unexpected order_id format:', orderId);
            return res.status(200).json(safeResponse);
        }

        const [, userId, ...planParts] = parts;
        const planName = planParts.join('_');
        const planNormalized = String(planName).toLowerCase();
        const credits = planNormalized === 'pro' ? 200 : 100;

        console.log(`Updating user ${userId}: plan=${planName} credits=${credits}`);

        // Create Supabase client with service role key (server-side)
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
        );

        if (!supabase) {
            console.error('Supabase client could not be created. Check env vars.');
            return res.status(200).json(safeResponse);
        }

        const { data: updateData, error } = await supabase
            .from('profiles')
            .update({ plan: planName, credits: credits })
            .eq('id', userId)
            .select('*');

        if (error) {
            console.error('❌ Supabase update error:', error.message || error);
        } else {
            console.log('✅ Supabase update result:', JSON.stringify(updateData, null, 2));
        }

    } catch (err) {
        console.error('Unexpected handler error:', err?.stack || err);
        // DO NOT return non-200 here — we must always acknowledge SafePay
    }

    // Always acknowledge receipt with 200 OK so SafePay won't retry infinitely
    return res.status(200).json(safeResponse);
}