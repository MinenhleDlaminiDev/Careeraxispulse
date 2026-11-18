import { useState } from 'react';
import { useNotifications } from './NotificationsContext';
import Modal from './Modal';
import { GOLD_INK, CREAM, MUTED } from './theme';

const BellSvg = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

// How long ago, in words. Anything older than a week just shows the date —
// "9 days ago" makes a reader do arithmetic they didn't ask for.
function when(iso) {
  const then = new Date(iso);
  const mins = Math.round((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days <= 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return then.toLocaleDateString();
}

// AXIS-13 — the bell. Rendered twice by PortalLayout (sidebar on desktop, top
// bar on a phone); both read the same store, so the count can't disagree.
//
// The list opens as a Modal rather than an anchored dropdown: the two bells sit
// at opposite corners of the screen, so an anchored panel would need different
// positioning for each, and on a phone a dropdown that long ends up scrolling
// inside a scroll. The dialog already handles Esc, the backdrop and body-scroll
// locking (AXIS-22).
export default function NotificationBell() {
  const { items, unread, loading, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="ax-bell"
        onClick={() => setOpen(true)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      >
        {BellSvg}
        {unread > 0 && <span className="ax-bell-dot">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} label="Notifications">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14, paddingRight: 28 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: CREAM }}>Notifications</h2>
            {unread > 0 && (
              <button type="button" onClick={markAllRead}
                style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', fontSize: 13, fontWeight: 600, color: GOLD_INK, cursor: 'pointer' }}>
                Mark all read
              </button>
            )}
          </div>

          {loading && items.length === 0 ? (
            <div style={{ fontSize: 14, color: MUTED }}>Loading…</div>
          ) : items.length === 0 ? (
            <div style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>
              Nothing yet. We’ll let you know here when your access changes or a CV is ready.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {items.map((n) => (
                <li key={n.id}>
                  {/* The whole row is the button: on a phone a small "mark read"
                      control next to the text would be a 20px target. */}
                  <button
                    type="button"
                    className={'ax-note' + (n.read ? '' : ' ax-note-unread')}
                    onClick={() => markRead(n.id)}
                    disabled={n.read}
                  >
                    <span className="ax-note-body">{n.message}</span>
                    <span className="ax-note-meta">
                      {when(n.created_at)}{!n.read && <span className="ax-note-new">New</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </>
  );
}
