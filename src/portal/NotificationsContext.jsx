import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { supabase } from '../supabase';

const Ctx = createContext({ items: [], unread: 0, loading: false, markRead: () => {}, markAllRead: () => {}, refresh: () => {} });

export const useNotifications = () => useContext(Ctx);

const LIMIT = 50;

// AXIS-13 — one store for the bell, so the sidebar bell (desktop) and the top
// bar bell (phone) are the same list and the same count. Two independent
// components would double every fetch and drift apart the moment one of them
// marked something read.
//
// No realtime subscription: the events behind these rows are manual, human-paced
// admin actions (granting access, delivering a CV), so a websocket per signed-in
// client would cost more than it's worth. We load once and refetch on every
// route change, which is the moment a client would look at the bell anyway.
export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase || !user) { setItems([]); return; }
    setLoading(true);
    // The user_id filter is NOT optional. The select policy is
    // "user_id = auth.uid() OR is_admin()", so an unfiltered query signed in as
    // an admin would return every client's notifications too.
    const { data, error } = await supabase
      .from('notifications')
      .select('id, message, read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(LIMIT);
    if (!mountedRef.current) return;
    setLoading(false);
    if (error) return; // Keep whatever we last had rather than blanking the bell.
    setItems(data || []);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh, pathname]);

  const markRead = useCallback(async (id) => {
    const row = items.find((n) => n.id === id);
    if (!row || row.read) return;
    // Optimistic: the badge should drop the instant it is tapped. On failure we
    // put it back, so the count never lies for long.
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (error && mountedRef.current) setItems((list) => list.map((n) => (n.id === id ? { ...n, read: false } : n)));
  }, [items]);

  const markAllRead = useCallback(async () => {
    const ids = items.filter((n) => !n.read).map((n) => n.id);
    if (!ids.length || !user) return;
    setItems((list) => list.map((n) => ({ ...n, read: true })));
    const { error } = await supabase
      .from('notifications').update({ read: true }).in('id', ids).eq('user_id', user.id);
    if (error && mountedRef.current) {
      setItems((list) => list.map((n) => (ids.includes(n.id) ? { ...n, read: false } : n)));
    }
  }, [items, user]);

  const unread = items.reduce((n, x) => n + (x.read ? 0 : 1), 0);

  return (
    <Ctx.Provider value={{ items, unread, loading, markRead, markAllRead, refresh }}>
      {children}
    </Ctx.Provider>
  );
}
