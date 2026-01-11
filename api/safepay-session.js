export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, planName, userId } = req.body;

        // Call SafePay to get a tracker/session
        // (Add your actual SafePay fetch logic here)

        res.status(200).json({
            orderId: `TRACK_${Date.now()}`, // Replace with real SafePay tracker
            amount: amount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}