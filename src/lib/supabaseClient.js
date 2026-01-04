import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lpxhedhqdakigtvqeppq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweGhlZGhxZGFraWd0dnFlcHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0MzY3NDcsImV4cCI6MjA4MzAxMjc0N30.gyWf_jGYz7wNViCiCcrKoxXeUN0Re3OSmdjz4XMs_Hw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)