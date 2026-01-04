import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This if-statement prevents the crash you're seeing
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);