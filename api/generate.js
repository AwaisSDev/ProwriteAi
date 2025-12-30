import Groq from "groq-sdk";

// Vercel will pull this from your environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    const { name, features } = req.body;

    try {
        // Inside api/generate.js
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an elite copywriter. Follow this EXACT format: Write 'TITLE:' then a catchy hook. Write 'DESCRIPTION:' then a paragraph. Write 'FEATURES:' then a numbered list (1., 2., 3.). Write 'TAGS:' then 5 SEO tags starting with #. Use standard sentence case for descriptions. No stars."
                },
                    { role: "user", content: `Product: ${name}. Features: ${features}` }
            ],
            model: "llama-3.3-70b-versatile",
        });

        res.status(200).json({ description: response.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch from Groq" });
    }
}