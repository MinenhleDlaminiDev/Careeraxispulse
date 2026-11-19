import { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';
import AuthCard, { fieldStyle, labelStyle, primaryBtnStyle } from './AuthCard';
import ProfileStepFields, { PROFILE_STEPS, profileValuesFrom, profilePayload } from './ProfileStepFields';
import { missingProfileFields, needsCvConsent } from './profileFields';
import { DANGER, GOLD_INK, CREAM, MUTED, SERIF, BORDER } from './theme';

const funStyle = { color: MUTED, fontSize: 13.5, lineHeight: 1.5, margin: '0 0 18px' };
const secondaryBtn = {
  padding: '13px 18px', borderRadius: 8, border: `1px solid ${BORDER}`,
  background: 'transparent', color: CREAM, fontWeight: 600, fontSize: 15, cursor: 'pointer',
};

const LAST = PROFILE_STEPS.length;

// AXIS-43: the gate. A signed-in client whose profile is missing required
// fields lands here and cannot reach the rest of the portal until it is filled
// in — or until they sign out, which is deliberately left open so nobody is
// ever trapped in the app.
//
// Who sees it:
//   • anyone who signed up with Google, since Google gives us a name and an
//     email and nothing else we ask for;
//   • existing email clients from before these fields were required.
//
// It reuses the signup wizard's own steps and validation (ProfileStepFields),
// so it cannot ask for something signup would not have, or accept something
// signup would have rejected.
//
// Full name is asked for here only when it is actually missing. Google supplies
// it, so for most people this screen is the three profile steps and nothing
// more; an email client who somehow has no name gets one extra field rather
// than a whole extra step.
export default function CompleteProfile() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(() => profileValuesFrom(profile));
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const needsName = !((profile?.full_name || '').trim());
  // AXIS-47: clients who predate the consent are never asked for it, even when
  // they land here for a missing profile field.
  const askConsent = needsCvConsent(profile);
  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));
  const stepDef = PROFILE_STEPS[step - 1];
  const missing = missingProfileFields(profile).length
    + (askConsent && profile?.cv_sharing_consent !== true ? 1 : 0);

  // Write what has been filled in so far. Called on EVERY step, not just the
  // last one: a Google signup clicked one button to get in and was not
  // expecting a form, so they are exactly the person likely to wander off
  // halfway. Saving per step means they resume where they stopped instead of
  // facing an empty step 1 again.
  //
  // Writing the whole payload each time is safe because `values` was seeded
  // from the existing profile — fields this step didn't touch are written back
  // as they already were, not blanked.
  //
  // Consent is the exception: it is only included on the step that actually
  // asks for it. Writing a consent value from a screen that never showed the
  // box would be recording an answer nobody gave.
  const persist = async (last) => {
    const payload = profilePayload(values, { includeConsent: askConsent && last });
    if (needsName) payload.full_name = fullName.trim();
    // The client's own row, through profiles_self_update. None of these columns
    // are in the privilege guard, so a client may set them all.
    const { error: err } = await supabase.from('profiles').update(payload).eq('id', user.id);
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    const last = step === LAST;
    const err = await persist(last);
    setBusy(false);
    // Don't advance on a failed save — moving on would tell them it was kept
    // when it wasn't. Pressing Continue again retries.
    if (err) { setError('We couldn’t save that. Check your connection and try again.'); return; }
    if (!last) { setStep(step + 1); return; }
    // Last step: refresh so profileComplete flips. The gate in ProtectedRoute
    // then stops redirecting and the portal appears on its own.
    await refreshProfile();
  };

  return (
    <AuthCard eyebrow="One more step">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 19, color: CREAM, lineHeight: 1.15 }}>
          Complete your profile
        </div>
        <div style={{ fontSize: 13.5, color: MUTED, marginTop: 6, lineHeight: 1.6 }}>
          {missing === 0
            ? 'Just confirm your details to carry on.'
            : `We need ${missing} more ${missing === 1 ? 'detail' : 'details'} before we can set up your portal. This is what we build your CV and interview prep around.`}
        </div>
      </div>

      <div className="ax-steps">
        <div className="ax-steps-track">
          <div className="ax-steps-fill" style={{ width: `${(step / LAST) * 100}%` }} />
        </div>
        <div className="ax-steps-label">Step {step} of {LAST} · {stepDef.label}</div>
      </div>
      <p style={funStyle}>{stepDef.fun}</p>

      <form onSubmit={onSubmit}>
        {/* Only when Google (or an old signup) left it blank. */}
        {needsName && step === 1 && (
          <label style={{ ...labelStyle, marginBottom: 16, display: 'block' }}>
            Full name
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" style={fieldStyle} />
          </label>
        )}

        <ProfileStepFields stepKey={stepDef.key} values={values} set={set} showConsent={askConsent} />

        {error && <div style={{ marginTop: 16, color: DANGER, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          {step > 1 && (
            <button type="button" onClick={() => { setError(''); setStep(step - 1); }} style={secondaryBtn}>
              Back
            </button>
          )}
          <button type="submit" disabled={busy} style={{ ...primaryBtnStyle(busy), marginTop: 0, flex: 1 }}>
            {busy ? 'Saving…' : step < LAST ? 'Continue' : 'Finish'}
          </button>
        </div>

        {/* Worth saying out loud — it's the reason it's safe to stop. */}
        <div style={{ marginTop: 12, fontSize: 12.5, color: MUTED, textAlign: 'center' }}>
          Your answers are saved as you go, so you can stop and come back.
        </div>
      </form>

      {/* Never trap anyone in the app. Signing out is always available. */}
      <div style={{ marginTop: 18, fontSize: 13, color: MUTED, textAlign: 'center' }}>
        Signed in as {profile?.email || user?.email}.{' '}
        <button type="button" onClick={() => signOut()} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: GOLD_INK, fontWeight: 600, cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </AuthCard>
  );
}
