import { json } from 'stream/consumers';

export default async function handler(req, res) {
  const receivedAt = new Date().toISOString();
  console.log(`\n--- SAFEPAY WEBHOOK DEBUG (${receivedAt}) ---`);
  console.log('Request method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // Try to parse body defensively and capture raw stream if needed
  let payload = req.body;
  async function readRaw() {
    return await new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk) => { data += chunk; });
      req.on('end', () => { resolve(data); });
      req.on('error', () => { resolve(''); });
    });
  }

  try {
    if (!payload || (typeof payload === 'object' && Object.keys(payload).length === 0)) {
      const raw = req.rawBody || req.bodyRaw || await readRaw();
      if (raw && typeof raw === 'string') {
        try { payload = JSON.parse(raw); } catch (e) { payload = raw; }
      }
    }
  } catch (err) {
    console.warn('Failed to parse raw body:', err?.message || err);
  }

  console.log('Payload (debug):', typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2));

  // Always return 200 so SafePay doesn't retry while debugging
  return res.status(200).json({ ok: true, receivedAt });
}
