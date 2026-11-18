import { createClient } from '@supabase/supabase-js';

// Reads the repo-root .env. The publishable key is the current client-safe key;
// VITE_SUPABASE_ANON_KEY is the legacy name, still accepted during the switch.
// Both are safe in the frontend — RLS protects the data.
const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);

// AXIS-43 — is Google sign-in switched on for this environment?
//
// This is NOT belt-and-braces. supabase.auth.signInWithOAuth() does not return
// an error when a provider is disabled: it sends the browser straight to
// Supabase, which answers with raw JSON —
//   {"code":400,"msg":"Unsupported provider: provider is not enabled"}
// — and the client is left staring at it with no way back. There is no
// client-side way to detect this first, so the button must not exist until
// Google is actually enabled in the Supabase dashboard.
//
// Set VITE_GOOGLE_AUTH=true in .env once the provider is configured there.
export const googleAuthEnabled =
  isConfigured && String(import.meta.env.VITE_GOOGLE_AUTH).toLowerCase() === 'true';

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
