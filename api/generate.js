import Groq from "groq-sdk";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Only POST requests allowed' });
    }

    try {
        // 1. Verify User
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Missing Authorization header" });
        }

        // Create authenticated Supabase client for this request
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        // 2. Check Credits
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('credits')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error("Profile fetch error:", profileError);
            return res.status(500).json({ error: "Failed to fetch user profile" });
        }

        if (profile.credits < 1) {
            return res.status(403).json({ error: "Insufficient credits. Please upgrade or top up." });
        }

        // 3. Deduct Credit
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: profile.credits - 1 })
            .eq('id', user.id);

        if (updateError) {
            console.error("Credit deduction error:", updateError);
            return res.status(500).json({ error: "Failed to update credits" });
        }

        // 4. Generate Content
        const { name, features, tone } = req.body; // Added 'tone' to destructuring as it was passed in frontend
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an elite copywriter. Tone: ${tone || 'Professional'}. Follow this EXACT format: Write 'TITLE:' then a catchy hook. Write 'DESCRIPTION:' then a paragraph. Write 'FEATURES:' then a numbered list (1., 2., 3.). Write 'TAGS:' then 5 SEO tags starting with #. Use standard sentence case. No stars.`
                },
                { role: "user", content: `Product: ${name}. Features: ${features}` }
            ],
            model: "llama-3.3-70b-versatile",
        });

        res.status(200).json({ description: response.choices[0].message.content });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}