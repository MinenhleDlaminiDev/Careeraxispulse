import { supabase } from '../supabase';
import { CV_TIERS, CV_TIERS_RETURNING, cvTiers } from '../payments.js';

// AXIS-41: CV revamp orders, and the one question the portal asks of them —
// is this client a returning revamp client?
//
// A client counts as returning when EITHER
//   • profiles.returning_client is ticked (the admin's manual override, for the
//     clients she served before cv_orders existed), OR
//   • they have at least one confirmed cv_orders row.
//
// The OR is the whole mechanism. Because the derived half reads real history,
// the first revamp bought through the portal automatically prices the next one
// — there is no "mark them as returning" step to forget. Nothing ever writes
// the flag automatically, so the two halves never disagree.
//
// Writes here are admin-only at the database level (cv_orders_admin_write, and
// returning_client is in the profiles privilege guard). These helpers are the
// admin UI's side of that; a client calling them would simply be refused.

// Tier keys in the order the admin should see them, with their labels — taken
// from CV_TIERS so a new tier never has to be added in two places.
export const TIER_OPTIONS = CV_TIERS.map((t) => ({ key: t.key, label: `${t.label} (${t.band})` }));

export const ORDER_STATUSES = ['confirmed', 'pending', 'refunded'];

const tierLabel = (key) => CV_TIERS.find((t) => t.key === key)?.label || key;

// "Mid-level · R160 · returning" — one line for a recorded order.
export function orderLine(order) {
  const parts = [tierLabel(order.tier)];
  if (order.amount != null) parts.push(`R${Number(order.amount).toFixed(0)}`);
  if (order.is_returning) parts.push('returning price');
  if (order.status !== 'confirmed') parts.push(order.status);
  return parts.join(' · ');
}

// Does this client have revamp history? Asks for one row, not a count, because
// the answer is only ever yes/no. `head` would also work but returns no data to
// check, and an error must read as "don't know" rather than "no".
//
// Returns { has, error }. On error `has` is false and the caller keeps
// first-time pricing — the safe direction: the client is never under-charged by
// a failed lookup, and the admin can still tick the manual flag.
export async function hasConfirmedOrder(userId) {
  if (!supabase || !userId) return { has: false, error: null };
  const { data, error } = await supabase
    .from('cv_orders')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .limit(1);
  if (error) return { has: false, error };
  return { has: (data || []).length > 0, error: null };
}

// Every order for one client, newest first. Admin view; a client could call it
// for themselves under cv_orders_select but nothing in the client UI does.
export async function listOrders(userId) {
  if (!supabase || !userId) return { orders: [], error: null };
  const { data, error } = await supabase
    .from('cv_orders')
    .select('id, tier, amount, status, is_returning, note, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { orders: data || [], error };
}

// Record a confirmed revamp the admin has reconciled against Paystack.
// `amount` arrives from a text input, so an empty or unparseable value is
// stored as null rather than NaN.
export async function recordOrder({ userId, tier, amount, isReturning, note, status = 'confirmed' }) {
  if (!supabase) return { data: null, error: new Error('Portal not configured') };
  const value = Number.parseFloat(amount);
  return supabase
    .from('cv_orders')
    .insert({
      user_id: userId,
      tier,
      amount: Number.isFinite(value) ? value : null,
      status,
      is_returning: !!isReturning,
      note: (note || '').trim() || null,
    })
    .select('id, tier, amount, status, is_returning, note, created_at')
    .single();
}

// The list price for a tier, as a bare number for an amount input. The admin can
// always type something else — a discount, a part payment, an old price.
export function suggestedAmount(tier, isReturning) {
  const price = cvTiers(isReturning).find((t) => t.key === tier)?.price;
  return price ? price.replace('R', '') : '';
}

// Is this amount still one of our list prices, i.e. untouched by the admin?
// Used to decide whether changing the tier may overwrite the amount field —
// a figure they typed themselves is never thrown away.
const LIST_PRICES = new Set(
  [...CV_TIERS, ...CV_TIERS_RETURNING].map((t) => t.price.replace('R', '')),
);
export const isListPrice = (value) => value === '' || LIST_PRICES.has(String(value).trim());

export async function deleteOrder(id) {
  if (!supabase) return { error: new Error('Portal not configured') };
  return supabase.from('cv_orders').delete().eq('id', id);
}

// Tick or untick the manual override. Admin-only: the profiles privilege guard
// raises if a non-admin tries, so this can't become a self-granted discount.
export async function setReturningClient(id, value) {
  if (!supabase) return { data: null, error: new Error('Portal not configured') };
  return supabase
    .from('profiles')
    .update({ returning_client: !!value })
    .eq('id', id)
    .select('returning_client')
    .single();
}
