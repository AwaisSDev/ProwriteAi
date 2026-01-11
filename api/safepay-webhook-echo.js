import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const receivedAt = new Date().toISOString();
  console.log(`\n--- SAFEPAY WEBHOOK ECHO (${receivedAt}) ---`);

  if (req.method !== 'POST') {
    console.log('Method not allowed for echo endpoint:', req.method);
    return res.status(200).json({ ok: true, message: 'Send POST with SafePay payload' });
  }

  // raw reader
  async function readRaw() {
    return await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => { resolve(data); });
      req.on('error', () => { resolve(''); });
    });
  }

  let payload = req.body;
  try {
    if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
      const raw = req.rawBody || req.bodyRaw || await readRaw();
      if (raw && typeof raw === 'string') {
        try { payload = JSON.parse(raw); } catch (e) { payload = raw; }
      }
    }
  } catch (err) {
    console.warn('Failed to parse raw body in echo:', err?.message || err);
  }

  console.log('Payload (echo):', typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));

  const type = payload?.type || payload?.event || null;
  const state = payload?.data?.state || payload?.state || null;
  const orderId = payload?.data?.metadata?.order_id || payload?.data?.metadata?.orderId || payload?.reference || payload?.data?.reference || null;

  const isSuccess = type === 'payment.succeeded' || ['PAID', 'TRACKER_ENDED'].includes(String(state).toUpperCase());

  if (!isSuccess) {
    console.log('Echo: not a success event.');
    return res.status(200).json({ ok: true, parsed: { type, state, orderId }, message: 'Not a success event' });
  }

  if (!orderId || typeof orderId !== 'string') {
    console.log('Echo: missing order_id');
    return res.status(200).json({ ok: true, parsed: { type, state, orderId }, message: 'Missing order_id' });
  }

  const parts = orderId.split('_');
  if (parts.length < 3) {
    console.log('Echo: unexpected order_id format', orderId);
    return res.status(200).json({ ok: true, parsed: { type, state, orderId }, message: 'Unexpected order_id format' });
  }

  const [, userId, ...planParts] = parts;
  const planName = planParts.join('_');
  const credits = String(planName).toLowerCase() === 'pro' ? 200 : 100;

  console.log(`Echo updating user ${userId} -> plan=${planName} credits=${credits}`);

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  );

  if (!supabase) {
    console.error('Echo: Supabase client not created. Check env vars.');
    return res.status(200).json({ ok: false, error: 'Supabase client not configured' });
  }

  try {
    const { data: updateData, error } = await supabase
      .from('profiles')
      .update({ plan: planName, credits })
      .eq('id', userId)
      .select('*');

    if (error) {
      console.error('Echo Supabase error:', error.message || error);
      return res.status(200).json({ ok: false, parsed: { type, state, orderId, userId, planName }, error });
    }

    console.log('Echo Supabase update result:', JSON.stringify(updateData, null, 2));
    return res.status(200).json({ ok: true, parsed: { type, state, orderId, userId, planName, credits }, updateData });

  } catch (err) {
    console.error('Echo unexpected error:', err?.stack || err);
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
