import { useMemo, useRef, useState } from 'react';
import { fieldStyle } from './AuthCard';
import { GOLD_INK, CREAM, MUTED } from './theme';

// AXIS-42 — a searchable chip picker. Pick one, it becomes a chip; pick several.
//
// Why not a native <select multiple>: on a phone it is a scrolling box where
// the selection is invisible once you scroll, and ctrl-click to deselect has no
// touch equivalent. Chips show the whole answer at a glance and each one has
// its own remove button.
//
// The suggestion list is never a closed list. Whatever the client types can be
// added as-is, because no fixed list of skills covers every trade.
export default function MultiSelect({
  value = [],
  onChange,
  options = [],
  placeholder = 'Search or type your own…',
  allowCustom = true,
  max = 20,
  id,
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const blurTimer = useRef(null);

  const chosen = Array.isArray(value) ? value : [];
  const full = chosen.length >= max;

  const q = query.trim().toLowerCase();
  // Case-insensitive compare throughout: "excel" must not be addable next to
  // "Excel", and a typed duplicate should be rejected rather than listed twice.
  const taken = useMemo(() => new Set(chosen.map((c) => c.toLowerCase())), [chosen]);

  const matches = useMemo(() => options
    .filter((o) => !taken.has(o.toLowerCase()))
    .filter((o) => (q ? o.toLowerCase().includes(q) : true))
    .slice(0, 8), [options, taken, q]);

  const canAddCustom = allowCustom && q.length > 1
    && !taken.has(q)
    && !options.some((o) => o.toLowerCase() === q);

  const add = (label) => {
    const text = label.trim();
    if (!text || full || taken.has(text.toLowerCase())) return;
    onChange([...chosen, text]);
    setQuery('');
  };

  const remove = (label) => onChange(chosen.filter((c) => c !== label));

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Inside a <form>, Enter would submit the step instead of adding a chip.
      e.preventDefault();
      if (matches.length) add(matches[0]);
      else if (canAddCustom) add(query);
      return;
    }
    // Backspace on an empty box takes the last chip off, the way tag inputs do.
    if (e.key === 'Backspace' && !query && chosen.length) remove(chosen[chosen.length - 1]);
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div>
      {chosen.length > 0 && (
        <div className="ax-chips">
          {chosen.map((c) => (
            <span key={c} className="ax-chip">
              {c}
              <button type="button" className="ax-chip-x" onClick={() => remove(c)} aria-label={`Remove ${c}`}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          // The blur fires before a click on an option registers, so closing is
          // deferred by a tick; clicking an option cancels the timer.
          onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 140); }}
          onKeyDown={onKeyDown}
          placeholder={full ? `That's the maximum of ${max}` : placeholder}
          disabled={full}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          style={{ ...fieldStyle, opacity: full ? 0.6 : 1 }}
        />

        {open && !full && (matches.length > 0 || canAddCustom) && (
          <div className="ax-ms-list" onMouseDown={() => clearTimeout(blurTimer.current)}>
            {matches.map((o) => (
              <button key={o} type="button" className="ax-ms-opt" onClick={() => add(o)}>
                {o}
              </button>
            ))}
            {canAddCustom && (
              <button type="button" className="ax-ms-opt" onClick={() => add(query)} style={{ color: GOLD_INK, fontWeight: 600 }}>
                + Add “{query.trim()}”
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, color: MUTED, marginTop: 7 }}>
        {chosen.length === 0
          ? 'Start typing to search. Not on the list? Type it and press Enter.'
          : <>{chosen.length} selected{full ? '' : <span style={{ color: CREAM }}> · add more or remove one above</span>}</>}
      </div>
    </div>
  );
}
