// Shared option lists + helper for the client profile fields (AXIS-21), used by
// the signup wizard (SignupForm) and the profile editor (AXIS-30) so the two
// never drift apart.

export const SENIORITY = ['Entry level', 'Mid level', 'Senior', 'Management', 'Executive'];
export const EMPLOYMENT = ['Employed & looking', 'Unemployed', 'Student', 'Career-changer'];

// Blank -> null so optional fields don't store empty strings in the profile.
export const clean = (v) => {
  const t = (v || '').trim();
  return t === '' ? null : t;
};
