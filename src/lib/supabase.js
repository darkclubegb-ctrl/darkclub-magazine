import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// ── Diagnostic: logs whether env vars reached the Vercel build ──
console.log('[Supabase] ENV check:', {
    url: supabaseUrl ? `✅ set (${supabaseUrl.substring(0, 30)}...)` : '❌ MISSING',
    key: supabaseKey ? `✅ set (${supabaseKey.substring(0, 20)}...)` : '❌ MISSING',
    env: import.meta.env.MODE,
});

// Graceful fallback when keys aren't configured yet
export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

if (!supabase) {
    console.error('[Supabase] ⚠️ CLIENT IS NULL — Auth will NOT work. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel Environment Variables.');
}

export const isSupabaseConfigured = () => !!supabase;
