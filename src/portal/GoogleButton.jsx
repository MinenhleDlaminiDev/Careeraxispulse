import { useState } from 'react';
import { useAuth } from './AuthContext';
import { isConfigured, googleAuthEnabled } from '../supabase';
import { MUTED } from './theme';

// Google's mark, drawn inline so the button needs no network request and no
// extra asset. The four brand colours are fixed by Google's guidelines, so they
// are hard-coded rather than themed.
const GoogleMark = (
  <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
    <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
  </svg>
);

// AXIS-43: "Continue with Google", shared by the login card and the signup
// modal. Sign-in and sign-up are the same OAuth call — Google decides whether
// the account is new, and handle_new_user creates the profile row either way.
//
// On success nothing happens here: the browser leaves for Google. Only a
// failure to even start the redirect comes back, and that is reported through
// `onError` so it appears beside the host form's other errors rather than in a
// second place the client has to find.
//
// Renders NOTHING unless VITE_GOOGLE_AUTH=true. See supabase.js: a disabled
// provider is not reported back to us, it dumps raw JSON on the client, so the
// only safe guard is to not show the button at all until Google is live.
export default function GoogleButton({ label = 'Continue with Google', onError }) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);

  if (!googleAuthEnabled) return null;

  const go = async () => {
    onError?.('');
    setBusy(true);
    const { error } = await signInWithGoogle();
    if (error) {
      onError?.(error.message);
      setBusy(false);
    }
    // No success branch: the page navigates to Google.
  };

  const disabled = busy || !isConfigured;

  return (
    <>
      <button type="button" className="ax-google" onClick={go} disabled={disabled}>
        {GoogleMark}
        <span>{busy ? 'Taking you to Google…' : label}</span>
      </button>
      <div className="ax-or"><span style={{ color: MUTED }}>or</span></div>
    </>
  );
}
