import { createClient } from '@supabase/supabase-js';

// Reads the repo-root .env. The publishable key is the current client-safe key;
// VITE_SUPABASE_ANON_KEY is the legacy name, still accepted during the switch.
// Both are safe in the frontend — RLS protects the data.
const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

if (!isConfigured) {
  console.error(
    'Missing Supabase env. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env (see .env.example).'
  );
}

// Null when unconfigured so the app shows a clear message instead of crashing
// on import (createClient throws on an empty URL).
export const supabase = isConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
