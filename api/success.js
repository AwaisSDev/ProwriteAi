export default function handler(req, res) {
    // This catches the POST from Safepay and turns it into a GET for your site
    res.redirect(303, 'https://www.prowriteai.online/pricing?status=success');
}