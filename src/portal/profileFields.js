// Shared option lists + helper for the client profile fields (AXIS-21), used by
// the signup wizard (SignupForm) and the profile editor (AXIS-30) so the two
// never drift apart.

export const SENIORITY = ['Entry level', 'Mid level', 'Senior', 'Management', 'Executive'];
export const EMPLOYMENT = ['Employed & looking', 'Unemployed', 'Student', 'Career-changer'];

// AXIS-42 — target industry becomes a dropdown instead of free text. 33 options,
// approved by the user on 2026-11-17, grounded on Pnet's SA sector taxonomy.
// A-Z so it can be scanned quickly, with "Other" held last as the catch-all.
export const INDUSTRIES = [
  'Accounting & Auditing',
  'Admin, Office & Support',
  'Agriculture, Forestry & Fishing',
  'Architecture & Engineering',
  'Automotive',
  'Banking & Financial Services',
  'Building & Construction',
  'Call Centre & Customer Service',
  'Consulting & Professional Services',
  'Design, Media & Arts',
  'Education & Training',
  'Energy & Utilities',
  'Government & Public Sector',
  'Healthcare & Medical',
  'Hospitality, Travel & Tourism',
  'Human Resources & Recruitment',
  'Information Technology',
  'Insurance',
  'Legal',
  'Logistics, Transport & Supply Chain',
  'Manufacturing & Production',
  'Marketing, Advertising & PR',
  'Mining & Minerals',
  'NGO, Non-Profit & Development',
  'Pharmaceuticals & Life Sciences',
  'Property & Real Estate',
  'Retail & Wholesale',
  'Sales & Business Development',
  'Science & Research',
  'Security & Defence',
  'Sport, Fitness & Recreation',
  'Telecommunications',
  'Other',
];

// Suggestions for the skills picker, not a closed list — the picker always
// accepts a typed entry, because no fixed list survives contact with every
// trade. These are the cross-industry ones a CV writer actually looks for;
// anything specialist the client types themselves.
export const SKILLS = [
  'Accounting', 'Administration', 'Account Management', 'Analytics & Reporting',
  'Budgeting & Forecasting', 'Business Development', 'Change Management',
  'Client Relationship Management', 'Coaching & Mentoring', 'Communication',
  'Compliance & Regulation', 'Conflict Resolution', 'Content Creation',
  'Contract Negotiation', 'Customer Service', 'Data Analysis', 'Data Entry',
  'Design', 'Event Coordination', 'Facilitation & Training', 'Financial Reporting',
  'Fundraising', 'Graphic Design', 'Health & Safety', 'Inventory Management',
  'Leadership', 'Logistics & Distribution', 'Marketing Strategy',
  'Microsoft Excel', 'Microsoft Office', 'Operations Management',
  'Payroll', 'People Management', 'Presentation Skills', 'Problem Solving',
  'Procurement', 'Project Management', 'Public Relations', 'Quality Assurance',
  'Recruitment & Selection', 'Research', 'Risk Management', 'Sales',
  'Social Media Management', 'Software Development', 'Stakeholder Engagement',
  'Strategic Planning', 'Supervision', 'Teamwork', 'Technical Support',
  'Time Management', 'Training & Development', 'Writing & Editing',
];

// South African qualification ladder, roughly NQF order, with the catch-alls
// last. Used by the Education & Qualifications sub-form.
export const QUALIFICATION_LEVELS = [
  'Matric / National Senior Certificate',
  'Higher Certificate',
  'National Certificate',
  'Diploma',
  'Advanced Diploma',
  'Bachelor’s Degree',
  'Postgraduate Diploma',
  'Honours Degree',
  'Master’s Degree',
  'Doctorate (PhD)',
  'Professional Certification',
  'Short Course',
  'Other',
];

// Blank -> null so optional fields don't store empty strings in the profile.
export const clean = (v) => {
  const t = (v || '').trim();
  return t === '' ? null : t;
};

// AXIS-42 — the array equivalents. An empty list is stored as null, not [], so
// "never filled in" and "filled in then emptied" read the same everywhere and
// no screen has to handle both.
export const cleanList = (list) => (Array.isArray(list) && list.length ? list : null);

// A profile's skills/education columns are jsonb: they can come back null, or
// (from an older hand-edited row) as something that is not an array at all.
// Everything that reads them goes through this so one bad row cannot blank a page.
export const asList = (v) => (Array.isArray(v) ? v : []);

// One education entry is only worth keeping if it says what the qualification
// was — the rest is detail.
export const cleanEducation = (rows) => cleanList(
  asList(rows)
    .filter((r) => (r?.qualification || '').trim())
    .map((r) => ({
      qualification: (r.qualification || '').trim(),
      field_of_study: (r.field_of_study || '').trim() || null,
      institution: (r.institution || '').trim() || null,
      year: (r.year || '').toString().trim() || null,
    })),
);

// Compare two list values for "has this changed?". Plain JSON.stringify is not
// enough: Postgres hands jsonb back with its own key order, so an education row
// saved as {qualification, field_of_study, institution, year} comes back as
// {year, institution, qualification, field_of_study}. Same data, different
// string — which left the editor stuck on "Unsaved changes" for ever. Object
// keys are sorted; array order is left alone, because the order of someone's
// qualifications is real information.
export const stableJson = (value) => JSON.stringify(value, (key, val) => (
  val && typeof val === 'object' && !Array.isArray(val)
    ? Object.fromEntries(Object.keys(val).sort().map((k) => [k, val[k]]))
    : val
));

// "BCom, Finance — UJ (2019)" for the admin's client page and anywhere else a
// qualification has to fit on one line.
export const educationLine = (row) => {
  if (!row) return '';
  const head = [row.qualification, row.field_of_study].filter(Boolean).join(', ');
  const tail = [row.institution, row.year ? `(${row.year})` : null].filter(Boolean).join(' ');
  return [head, tail].filter(Boolean).join(' — ');
};
