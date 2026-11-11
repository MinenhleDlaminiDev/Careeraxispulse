import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabase';

// Holds the session plus the signed-in user's profile row (role + access
// expiry). Role and access decide what the UI shows; RLS enforces it server
// side. Consumed via useAuth().
//
// `loading`      — the initial session check is still running.
// `profileReady` — a profile fetch has completed for the current user (success
//                  or failure). Lets callers tell "still loading" apart from
//                  "loaded, but no profile", so a failed load never traps the
//                  user on a spinner.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileReady, setProfileReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    if (!supabase || !userId) { setProfile(null); setProfileReady(true); return; }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, interview_access_expires_at, avatar_path, phone, location, linkedin_url, target_role, target_industry, seniority_level, target_companies, employment_status, change_driver')
      .eq('id', userId)
      .single();
    if (error) { console.error('Failed to load profile:', error.message); setProfile(null); }
    else setProfile(data);
    setProfileReady(true);
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session?.user?.id);
      setLoading(false);
    });

    // Don't await supabase calls directly inside this callback (it can
    // deadlock) — defer the profile load to a fresh tick. Flip profileReady
    // off synchronously when a user arrives so the UI shows loading, not the
    // "no profile" state, during the fetch.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.id) {
        setProfileReady(false);
        setTimeout(() => { if (active) loadProfile(newSession.user.id); }, 0);
      } else {
        // Signed out (or session lost): drop the previous user's profile now so
        // no stale role lingers into the next sign-in (AXIS-20).
        setProfile(null);
        setProfileReady(true);
      }
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  // Re-read the current user's profile row — used after a self-edit (photo or
  // profile fields) so the UI reflects the change without a reload.
  const refreshProfile = useCallback(() => loadProfile(session?.user?.id), [loadProfile, session]);

  const signIn = useCallback((email, password) => {
    if (!supabase) return Promise.resolve({ error: { message: 'Portal is not configured yet.' } });
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUp = useCallback((email, password, fullName, profile = {}) => {
    if (!supabase) return Promise.resolve({ error: { message: 'Portal is not configured yet.' } });
    // full_name plus the extra profile fields (AXIS-21) land in
    // raw_user_meta_data; the handle_new_user trigger reads them when it creates
    // the profiles row (role 'client', no access). Blank optional fields arrive
    // as null from the form, so they store as null, not ''.
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, ...profile } },
    });
  }, []);

  const signOut = useCallback(() => {
    if (!supabase) return Promise.resolve({ error: null });
    return supabase.auth.signOut();
  }, []);

  const isAdmin = profile?.role === 'admin';
  const hasInterviewAccess =
    !!profile?.interview_access_expires_at &&
    new Date(profile.interview_access_expires_at) > new Date();

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    profileReady,
    loading,
    isAdmin,
    hasInterviewAccess,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
