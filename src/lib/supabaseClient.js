import { createClient } from '@supabase/supabase-js'

// These pull from your .env file locally or Vercel settings online
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL // The name of env var is VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY // The name of env var is VITE_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase Environment Variables!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)