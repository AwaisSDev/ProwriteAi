# SafePay Integration Setup

## Webhook Endpoint

Your SafePay webhook endpoint is now live at:

```
https://your-domain.com/api/safepay-webhook
```

For local testing:
```
http://localhost:3000/api/safepay-webhook
```

## Setting Up in SafePay Dashboard

1. **Login to SafePay Sandbox Dashboard**
   - Go to: https://sandbox.getsafepay.com
   - Login with your sandbox account

2. **Navigate to Webhooks**
   - Go to Settings → Developers → Webhooks
   - Click "Add Webhook"

3. **Configure Webhook**
   - **URL**: `https://your-domain.com/api/safepay-webhook`
   - **Events to Subscribe**:
     - ✅ `payment.success`
     - ✅ `payment.failed`
     - ✅ `payment.pending` (optional)

4. **Save and Test**
   - Save the webhook
   - Use SafePay's "Test Webhook" feature to verify

## How It Works

1. User clicks "Upgrade to Plus/Pro"
2. Your app creates a SafePay checkout session
3. User completes payment on SafePay
4. SafePay sends POST request to `/api/safepay-webhook`
5. Webhook validates payment and updates user's plan in Supabase
6. User gets upgraded automatically!

## Order ID Format

The webhook expects order IDs in this format:
```
ORDER_{userId}_{planName}_{timestamp}
```

Example: `ORDER_abc123_Plus_1704931200000`

## Testing Locally with ngrok

To test webhooks locally:

1. Install ngrok: `npm install -g ngrok`
2. Run your dev server: `vercel dev`
3. In another terminal: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. Add to SafePay: `https://abc123.ngrok.io/api/safepay-webhook`

## Webhook Payload Example

SafePay will send data like this:

```json
{
  "event": "payment.success",
  "data": {
    "reference": "ORDER_user123_Plus_1704931200000",
    "amount": 2800,
    "currency": "PKR",
    "status": "PAID"
  }
}
```

## Security (Production)

For production, add webhook signature verification:

```javascript
// Verify SafePay signature
const signature = req.headers['x-sfpy-signature'];
const isValid = verifySignature(req.body, signature, SAFEPAY_SECRET);

if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
}
```

## Monitoring

Check webhook logs in:
- Vercel Dashboard → Functions → safepay-webhook
- SafePay Dashboard → Webhooks → Delivery History

## Troubleshooting

**Webhook not receiving events?**
- Check URL is publicly accessible
- Verify webhook is enabled in SafePay dashboard
- Check Vercel function logs for errors

**Payment not updating plan?**
- Check order ID format is correct
- Verify Supabase credentials in environment variables
- Check webhook logs for database errors
