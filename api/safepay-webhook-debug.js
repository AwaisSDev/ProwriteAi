import { json } from 'stream/consumers';

export default async function handler(req, res) {
  const receivedAt = new Date().toISOString();
  console.log(`\n--- SAFEPAY WEBHOOK DEBUG (${receivedAt}) ---`);
  console.log('Request method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // Try to parse body defensively
  let payload = req.body;
  try {
    if (!payload || Object.keys(payload).length === 0) {
      const raw = req.rawBody || req.bodyRaw || '';
      if (raw && typeof raw === 'string') payload = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse raw body:', err?.message || err);
  }

  console.log('Payload (debug):', JSON.stringify(payload, null, 2));

  // Always return 200 so SafePay doesn't retry while debugging
  return res.status(200).json({ ok: true, receivedAt });
}
