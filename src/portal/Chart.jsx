import { MUTED, BORDER } from './theme';

// AXIS-55 — the two charts the Reports screen needs, built from divs.
//
// No chart library, and no SVG either. Bars are flex children with a percentage
// height, which means the browser handles every width for free: no viewBox to
// pick, no text that shrinks to 6px on a phone or blows up to 20px on a
// desktop, and the colours are the portal's own CSS variables, so light and
// dark mode already work. For a bar chart this is less code than SVG, not more.
//
// Values are PRINTED, not shown on hover. The brief is mobile first and a
// tooltip needs a tap on a phone. The title attribute is still set, so a mouse
// user gets the exact figure anywhere, including on the 30-day chart where
// there is no room to print all of them.

// Two series colours, gold and slate, defined in index.css. Gold against blue
// is the safest pair to tell apart, including for the commonest kinds of colour
// blindness.
export const SERIES_GOLD = 'var(--ax-chart-1)';
export const SERIES_SLATE = 'var(--ax-chart-2)';
const TRACK = 'var(--ax-chart-track)';

const labelStyle = { fontSize: 11, color: MUTED, textAlign: 'center', lineHeight: 1.3 };

export function Legend({ series }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 14 }}>
      {series.map((s) => (
        <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: MUTED }}>
          <span style={{ width: 11, height: 11, borderRadius: 3, background: s.color, flexShrink: 0 }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

// Vertical bars, one group per row, one bar per series.
//
//   rows   [{ label, values: { <seriesKey>: number } }]
//   series [{ key, label, color }]
//
// `labelEvery` thins the labels out: 30 day numbers will not fit across a phone,
// so the daily chart shows every fifth. `format` turns a value into the text in
// the hover title and the printed figure.
export function BarChart({
  rows,
  series,
  height = 150,
  labelEvery = 1,
  format = (v) => String(v),
  showValues,
  emptyNote = 'Nothing recorded yet.',
}) {
  const max = Math.max(0, ...rows.flatMap((r) => series.map((s) => Number(r.values[s.key]) || 0)));
  // Print the figure above each bar only when there is room. Decided from the
  // number of groups, not from the screen width, so it never changes under the
  // reader mid-resize.
  const printed = showValues ?? rows.length <= 14;

  if (max <= 0) {
    return (
      <div style={{ padding: '26px 4px', fontSize: 13.5, color: MUTED, textAlign: 'center' }}>{emptyNote}</div>
    );
  }

  return (
    <div>
      {/* The scale: the tallest bar's value, sitting on the dashed line it
          reaches. One number is enough, and the baseline is obviously zero.
          Deliberately NOT a max on the left with a 0 on the right, which reads
          as a horizontal scale and means nothing on a bar chart. The word
          matters too: a bare figure above a row of bare day numbers reads as
          one of them. */}
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Highest: {format(max)}</div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 3,
          height,
          borderTop: `1px dashed ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          paddingTop: printed ? 17 : 4,
          boxSizing: 'border-box',
        }}
      >
        {rows.map((r) => {
          const total = series.reduce((sum, s) => sum + (Number(r.values[s.key]) || 0), 0);
          return (
            <div
              key={r.key || r.label}
              style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
            >
              {printed && (
                <div style={{ ...labelStyle, fontSize: 11, marginBottom: 3, color: total ? 'var(--ax-text)' : 'transparent', fontWeight: 600 }}>
                  {total ? format(total) : '0'}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 2, flex: 1 }}>
                {series.map((s) => {
                  const v = Number(r.values[s.key]) || 0;
                  return (
                    <div
                      key={s.key}
                      title={`${r.title || r.label}: ${format(v)}`}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        // A zero still leaves a 2px stub, so an empty day reads
                        // as an empty day rather than as a day that is missing.
                        height: v > 0 ? `${Math.max(2, (v / max) * 100)}%` : 2,
                        background: v > 0 ? s.color : TRACK,
                        borderRadius: '3px 3px 0 0',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Labels. `labelEvery` thins them out, and each row's `group` (the month,
          for a daily chart) is appended to the first label shown from that
          group. Tracked across the labels actually RENDERED, not across all the
          rows, or a month change landing on a skipped label would never be
          named. */}
      <div style={{ display: 'flex', gap: 3, marginTop: 7 }}>
        {(() => {
          let shownGroup = null;
          return rows.map((r, i) => {
            const show = i % labelEvery === 0 || i === rows.length - 1;
            let text = '';
            if (show) {
              text = r.group && r.group !== shownGroup ? `${r.label} ${r.group}` : r.label;
              if (r.group) shownGroup = r.group;
            }
            return (
              <div key={r.key || r.label} style={{ flex: 1, minWidth: 0, ...labelStyle }}>{text}</div>
            );
          });
        })()}
      </div>
    </div>
  );
}

// Horizontal bars, for a handful of named categories. The label sits beside the
// bar rather than under it, so long names stay readable on a phone.
//
//   rows [{ label, value }]
export function HBarChart({ rows, format = (v) => String(v), emptyNote = 'Nothing recorded yet.' }) {
  const max = Math.max(0, ...rows.map((r) => Number(r.value) || 0));

  if (max <= 0) {
    return (
      <div style={{ padding: '26px 4px', fontSize: 13.5, color: MUTED, textAlign: 'center' }}>{emptyNote}</div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {rows.map((r) => {
        const v = Number(r.value) || 0;
        return (
          <div key={r.key || r.label} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 92, flexShrink: 0, fontSize: 12.5, color: MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.label}
            </div>
            <div style={{ flex: 1, minWidth: 0, height: 20, background: TRACK, borderRadius: 5, overflow: 'hidden' }}>
              <div
                title={`${r.label}: ${format(v)}`}
                style={{ width: `${(v / max) * 100}%`, height: '100%', background: SERIES_GOLD, borderRadius: 5 }}
              />
            </div>
            <div style={{ width: 54, flexShrink: 0, textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--ax-text)' }}>
              {format(v)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
