import { fieldStyle, labelStyle } from './AuthCard';
import { QUALIFICATION_LEVELS, asList } from './profileFields';
import { CREAM, MUTED, GOLD_INK } from './theme';

const BLANK = { qualification: '', field_of_study: '', institution: '', year: '' };

// AXIS-42 — Education & Qualifications as a repeatable sub-form. A client can
// hold a matric, a diploma and a degree, so one set of inputs was never going
// to do; each entry is its own small card that can be removed on its own.
//
// The value is the raw array; the parent decides when to clean and save it
// (cleanEducation drops any entry with no qualification chosen).
export default function EducationFields({ value, onChange, max = 6 }) {
  const rows = asList(value);

  const setRow = (i, key, v) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  const addRow = () => onChange([...rows, { ...BLANK }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div>
      {rows.length === 0 && (
        <div style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, marginBottom: 12 }}>
          Nothing added yet. Matric counts — add it the same way as a degree.
        </div>
      )}

      {rows.map((r, i) => (
        // Index as key: these rows have no id, and removing one re-renders the
        // whole list from the new array anyway.
        <div key={i} className="ax-edu-row">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: MUTED }}>
              Qualification {i + 1}
            </span>
            <button type="button" className="ax-iconbtn" onClick={() => removeRow(i)} style={{ padding: '6px 12px', fontSize: 12.5 }}>
              Remove
            </button>
          </div>

          <label style={{ ...labelStyle, marginTop: 0 }}>
            Qualification
            <select value={r.qualification || ''} onChange={(e) => setRow(i, 'qualification', e.target.value)} style={fieldStyle}>
              <option value="">Select…</option>
              {QUALIFICATION_LEVELS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </label>

          <label style={{ ...labelStyle, marginTop: 13 }}>
            Field of study
            <input type="text" value={r.field_of_study || ''} onChange={(e) => setRow(i, 'field_of_study', e.target.value)}
              placeholder="Accounting, Nursing, Mechanical Engineering…" style={fieldStyle} />
          </label>

          <div className="ax-edu-pair">
            <label style={{ ...labelStyle, marginTop: 13 }}>
              Institution
              <input type="text" value={r.institution || ''} onChange={(e) => setRow(i, 'institution', e.target.value)}
                placeholder="School, college or university" style={fieldStyle} />
            </label>
            <label style={{ ...labelStyle, marginTop: 13 }}>
              Year completed
              <input type="text" inputMode="numeric" value={r.year || ''} onChange={(e) => setRow(i, 'year', e.target.value)}
                placeholder="2019 or In progress" style={fieldStyle} />
            </label>
          </div>
        </div>
      ))}

      {rows.length < max ? (
        <button type="button" className="ax-iconbtn" onClick={addRow} style={{ color: GOLD_INK, borderColor: 'var(--ax-gold-border)' }}>
          + Add {rows.length ? 'another ' : ''}qualification
        </button>
      ) : (
        <div style={{ fontSize: 12.5, color: MUTED }}>That’s the maximum of {max}. Remove one to add another.</div>
      )}

      {rows.length > 0 && (
        <div style={{ fontSize: 12, color: MUTED, marginTop: 9, lineHeight: 1.55 }}>
          <span style={{ color: CREAM }}>Only the qualification is needed</span> — the rest helps us write it up properly.
        </div>
      )}
    </div>
  );
}
