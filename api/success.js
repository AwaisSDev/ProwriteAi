export default function handler(req, res) {
    // This catches the POST from SafePay and sends the user home safely
    res.redirect(303, 'https://www.prowriteai.online/pricing?status=success');
}