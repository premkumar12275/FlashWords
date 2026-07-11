import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// When the env vars aren't set the app runs in guest mode: no login,
// progress stays in this browser's localStorage.
export const supabase: SupabaseClient | null =
    url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseConfigured = supabase !== null;
