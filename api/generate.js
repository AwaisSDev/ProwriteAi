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

        // 2. Fetch/Reset Credits & Plan
        const { data: initialProfile, error: profileError } = await supabase
            .from('profiles')
            .select('credits, plan, last_reset_date')
            .eq('id', user.id)
            .single();

        let profile = initialProfile;
        if (profileError) {
            console.error("Profile fetch error (possibly missing column):", profileError.message);
            // If the column doesn't exist, let's at least try to get basic info
            const { data: fallbackProfile } = await supabase.from('profiles').select('credits, plan').eq('id', user.id).single();
            if (!fallbackProfile) return res.status(500).json({ error: "Failed to fetch user profile" });
            profile = fallbackProfile;
        }

        // --- DAILY RESET LOGIC ---
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        let currentCredits = profile?.credits ?? 0;

        // Only attempt reset if the column exists in the fetched profile
        if (profile && 'last_reset_date' in profile && profile.last_reset_date !== today) {
            // New day! Reset to 50
            currentCredits = 50;
            const { error: resetError } = await supabase
                .from('profiles')
                .update({ credits: 50, last_reset_date: today, plan: 'Pro' })
                .eq('id', user.id);

            if (resetError) console.warn("Could not reset daily credits (column may be missing):", resetError.message);
        }
        // -------------------------

        const userPlan = 'Pro'; // Force Pro for everyone!

        if (currentCredits < 1) {
            return res.status(403).json({ error: "Daily limit reached (50/50). Come back tomorrow!" });
        }

        // 3. Deduct Credit
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ credits: currentCredits - 1 })
            .eq('id', user.id);

        if (updateError) {
            console.error("Credit deduction error:", updateError);
            return res.status(500).json({ error: "Failed to update credits" });
        }

        // 4. Generate Content
        const { name, features, tone } = req.body;

        // Tiered System Prompts
        let systemPrompt = "";
        const commonRules = `STRICT RULES: Never use em-dashes (—). No stars. No robotic language like "Introducing" or "Are you looking for". Use standard sentence case.`;

        if (userPlan === 'Pro') {
            systemPrompt = `You are a World-Class Direct Response Copywriter & SEO Strategist. 
            TONE: ${tone || 'Professional'}.
            ${commonRules}
            
            SEO LEVEL: MASTER (Way Better).
            - Utilize LSI (Latent Semantic Indexing) keywords related to the product.
            - Optimize for "Search Intent" and "Featured Snippets".
            - Include 15 hyper-targeted SEO tags/hashtags.
            
            EXACT FORMAT:
            TITLE: [High-CTR Psychological Hook]
            DESCRIPTION: [3-4 sentence storytelling paragraph focused on transformation]
            FEATURES: [5 Benefit-first bullet points with a gap line between each: 1., 2.. 3.. 4.. 5.]
            TAGS: [15 Search-optimized hashtags]`;
        } else if (userPlan === 'Plus') {
            systemPrompt = `You are an Elite Copywriter and SEO Expert. 
            TONE: ${tone || 'Professional'}.
            ${commonRules}
            
            SEO LEVEL: ADVANCED (Better).
            - Focus on high-conversion keywords.
            - Include 10 high-volume SEO hashtags.
            
            EXACT FORMAT:
            TITLE: [Catchy Hook]
            DESCRIPTION: [Effective storytelling paragraph]
            FEATURES: [5 punchy bullet points with a gap line between each: 1., 2.. 3.. 4.. 5.]
            TAGS: [10 High-volume hashtags]`;
        } else {
            systemPrompt = `You are an AI Copywriter. 
            TONE: ${tone || 'Professional'}.
            ${commonRules}
            
            SEO LEVEL: STANDARD.
            - Include 5 basic SEO hashtags.
            
            EXACT FORMAT:
            TITLE: [Catchy Title]
            DESCRIPTION: [Simple paragraph]
            FEATURES: [3 simple features with a gap line between each: 1., 2.. 3.]
            TAGS: [5 basic hashtags]`;
        }

        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Product: ${name}. Features: ${features}` }
            ],
            model: userPlan === 'Pro' ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant",
        });

        res.status(200).json({ description: response.choices[0].message.content });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}