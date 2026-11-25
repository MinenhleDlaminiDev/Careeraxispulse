import { supabase } from '../supabase';
import { CV_TIERS, INTERVIEW_PRICE } from '../payments.js';

// AXIS-55 — the numbers behind the admin Dashboard (Dashboard.jsx).
//
// The file is dashboardData.js, never dashboard.js, because Windows matches
// filenames without regard to case: a reports.js beside Reports.jsx did exactly
// that during AXIS-55, and the build failed on a missing default export.
//
// Everything here is either one of three queries or a pure function over their
// results. The split is deliberate: the maths can be read, and checked, without
// rendering anything.
//
// Two honesty rules run through the whole file, because a dashboard that
// flatters is worse than no dashboard.
//
//   1. A missing figure is never shown as a zero. An order with no amount is
//      still counted as a sale, and the count of those is reported so the
//      screen can say the revenue figure is short.
//   2. The Axis Code has no recorded amount at all (AXIS-56 explains why), so
//      it is valued at the list price and the screen says so on its face.

// The Axis Code list price as a number, from the one place that holds it.
// INTERVIEW_PRICE is 'R90'; deriving it here means a price change in
// payments.js reaches the reports with nothing to remember.
export const AXIS_CODE_PRICE = Number(INTERVIEW_PRICE.replace(/[^\d.]/g, '')) || 0;

const TIER_LABEL = new Map(CV_TIERS.map((t) => [t.key, t.label]));
export const tierLabel = (key) => TIER_LABEL.get(key) || key;

// ---------------------------------------------------------------------------
// Dates. All bucketing is in the viewer's own timezone, which for this admin is
// South African time. "New today" has to mean today where she is standing, not
// today in UTC, or every signup after 2am lands on the wrong day.
// ---------------------------------------------------------------------------

export const startOfDay = (d = new Date()) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Local calendar day, as a sortable key.
export const dayKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Local calendar month, as a sortable key.
export const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const dayNumber = (d) => d.toLocaleDateString(undefined, { day: 'numeric' });
const monthName = (d) => d.toLocaleDateString(undefined, { month: 'short' });

// "R1 240" and "R0", never "R1240.00". Whole rand only: nothing here is priced
// in cents.
export const rands = (n) => `R${Math.round(n || 0).toLocaleString('en-ZA').replace(/,/g, ' ')}`;

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

// Three queries, tallied in the browser, which is the pattern AccessManagement
// already uses for its CV and order counts. No RPC and no new view, so there is
// no second place for "what counts as a client" to drift to.
//
// Returns { clients, orders, grants, error, grantsUnavailable }.
//
// A failed clients or orders query sets `error`: those two are most of the
// screen, and a half-loaded dashboard is a wrong dashboard, so it shows its
// error banner rather than a plausible-looking partial total.
//
// A failed grants query is treated separately, through `grantsUnavailable`. The
// likely cause is that the AXIS-56 migration has not been run yet, and there is
// no reason to hide the client and revamp figures behind that. The Axis Code
// panel says what is missing; nothing else pretends the number is zero.
export async function loadReportData() {
  if (!supabase) return { clients: [], testAccounts: 0, orders: [], grants: [], error: true, grantsUnavailable: true };

  const [clientsRes, ordersRes, grantsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, created_at, interview_access_expires_at, is_test_account')
      .eq('role', 'client'),
    supabase
      .from('cv_orders')
      .select('user_id, tier, amount, status, is_returning, created_at')
      .eq('status', 'confirmed'),
    supabase
      .from('access_grants')
      .select('user_id, granted_at, expires_at, source'),
  ]);

  if (clientsRes.error || ordersRes.error) {
    return { clients: [], testAccounts: 0, orders: [], grants: [], error: true, grantsUnavailable: true };
  }

  const everyClient = clientsRes.data || [];

  // AXIS-58: staff test accounts drop out here, before anything is counted.
  //
  // This one line is why the flag lives on the account rather than on a sale.
  // Every figure on the screen is counted off `clients`, so removing a row here
  // takes it out of the client count, the signup chart, the sales, the revenue
  // and the paying share at once. Flagging a single grant would have corrected
  // one of those five and left the other four quietly wrong.
  //
  // The account itself is untouched and still appears on the Clients screen,
  // which is the point: it is how the portal gets tested. The screen reports
  // `testAccounts` so the gap between the two pages is explained rather than
  // looking like one of them is broken.
  const clients = everyClient.filter((c) => !c.is_test_account);
  const testAccounts = everyClient.length - clients.length;

  // Orders and grants are narrowed to rows belonging to a current COUNTED
  // client, here, once, before anything counts them.
  //
  // Without this the totals and the lists disagree. Three admin accounts carry
  // an Interview Code expiry from testing, and granting access to one of them
  // logs a grant exactly like a sale. The buyer lists skip those rows because
  // they have no client to name, so the tile would read "3 sales" above a list
  // of one person, and revenue would be R180 too high.
  //
  // Doing it in one place rather than in each total is what keeps them in step:
  // every figure on the screen is then counted off the same rows.
  const clientIds = new Set(clients.map((c) => c.id));
  const mine = (row) => clientIds.has(row.user_id);

  return {
    clients,
    testAccounts,
    orders: (ordersRes.data || []).filter(mine),
    grants: grantsRes.error ? [] : (grantsRes.data || []).filter(mine),
    error: false,
    grantsUnavailable: !!grantsRes.error,
  };
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

// Signups per day for the last `days` days, every day present even when it is
// empty. Gaps have to be visible: a run of quiet days is the thing worth
// seeing, and a chart that skips them hides it.
export function signupsByDay(clients, days = 30) {
  const buckets = [];
  const index = new Map();
  const today = startOfDay();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // `label` is the day number and `group` the month it falls in. The chart
    // prints the month alongside the first label it shows from each one, so a
    // 30-day window spanning a month boundary cannot read as "27, 1, 6" with
    // no clue which month the 1 belongs to.
    const row = { key: dayKey(d), date: d, label: dayNumber(d), group: monthName(d), value: 0 };
    buckets.push(row);
    index.set(row.key, row);
  }
  for (const c of clients) {
    if (!c.created_at) continue;
    const row = index.get(dayKey(new Date(c.created_at)));
    if (row) row.value += 1;
  }
  return buckets;
}

// Confirmed revamps per tier, in the order the price list uses, so a new tier
// in payments.js appears here without being added in two places.
export function tierSplit(orders) {
  const counts = new Map(CV_TIERS.map((t) => [t.key, 0]));
  for (const o of orders) {
    if (counts.has(o.tier)) counts.set(o.tier, counts.get(o.tier) + 1);
  }
  return CV_TIERS.map((t) => ({ key: t.key, label: t.label, value: counts.get(t.key) || 0 }));
}

// Revenue per month, revamps and Axis Code kept apart. Months run unbroken from
// the earliest row to this month, so a blank month shows as blank, capped so
// the chart stays readable in a year's time.
export function revenueByMonth(orders, grants, maxMonths = 12) {
  const stamps = [
    ...orders.map((o) => o.created_at),
    ...grants.map((g) => g.granted_at),
  ]
    .filter(Boolean)
    .map((s) => new Date(s).getTime())
    .filter((t) => Number.isFinite(t));

  const now = new Date();
  const first = stamps.length ? new Date(Math.min(...stamps)) : now;
  // The range runs to this month OR to the latest row, whichever is later. A
  // row dated in the future, from a clock skew or a date typed by hand, would
  // otherwise fall outside every bucket and have its revenue silently dropped
  // while the stat tile still counted the sale.
  const latest = stamps.length ? new Date(Math.max(...stamps, now.getTime())) : now;

  const buckets = [];
  const index = new Map();
  const cursor = new Date(first.getFullYear(), first.getMonth(), 1);
  const end = new Date(latest.getFullYear(), latest.getMonth(), 1);
  while (cursor <= end) {
    const row = { key: monthKey(cursor), label: monthName(cursor), revamp: 0, code: 0 };
    buckets.push(row);
    index.set(row.key, row);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  for (const o of orders) {
    if (!o.created_at) continue;
    const row = index.get(monthKey(new Date(o.created_at)));
    // A null amount adds nothing here but is still a sale. summary() counts how
    // many, and the screen says the total is short by that much.
    if (row) row.revamp += Number(o.amount) || 0;
  }
  for (const g of grants) {
    if (!g.granted_at) continue;
    const row = index.get(monthKey(new Date(g.granted_at)));
    if (row) row.code += AXIS_CODE_PRICE;
  }

  return buckets.slice(-maxMonths);
}

// The stat row.
export function summary(clients, orders, grants) {
  const midnight = startOfDay().getTime();
  // Today plus the six days before it, which is what "last 7 days" means to a
  // person reading it: a week of calendar days, not 168 hours back from now.
  const weekStart = midnight - 6 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  let newToday = 0;
  let newThisWeek = 0;
  let accessLive = 0;
  for (const c of clients) {
    const t = c.created_at ? new Date(c.created_at).getTime() : 0;
    if (t >= midnight) newToday += 1;
    if (t >= weekStart) newThisWeek += 1;
    const exp = c.interview_access_expires_at;
    if (exp && new Date(exp).getTime() > now) accessLive += 1;
  }

  let revampRevenue = 0;
  let ordersMissingAmount = 0;
  const revampBuyerIds = new Set();
  for (const o of orders) {
    const amount = Number(o.amount);
    if (o.amount != null && Number.isFinite(amount)) revampRevenue += amount;
    else ordersMissingAmount += 1;
    revampBuyerIds.add(o.user_id);
  }

  const codeBuyerIds = new Set(grants.map((g) => g.user_id));
  const codeRevenue = grants.length * AXIS_CODE_PRICE;

  // Clients who have bought anything at all, either product. A set union, so
  // somebody who bought both is one paying client, not two. Rows belonging to a
  // deleted or admin account are dropped, so the share can never exceed 100%.
  //
  // Counted against client accounts, which is the only denominator this system
  // can see. Visitors who never signed up are not in the database, so this is
  // signup to sale, NOT visit to sale, and the screen says so.
  const clientIds = new Set(clients.map((c) => c.id));
  let paying = 0;
  for (const id of new Set([...revampBuyerIds, ...codeBuyerIds])) {
    if (clientIds.has(id)) paying += 1;
  }

  return {
    paying,
    payingRate: clients.length ? Math.round((paying / clients.length) * 100) : 0,
    clients: clients.length,
    newToday,
    newThisWeek,
    codeSales: grants.length,
    codeBuyers: codeBuyerIds.size,
    accessLive,
    revamps: orders.length,
    revampBuyers: revampBuyerIds.size,
    revampRevenue,
    codeRevenue,
    revenue: revampRevenue + codeRevenue,
    ordersMissingAmount,
  };
}

// Who bought the Axis Code: one row per person, not per sale, because the
// question is who they are. Repeat buyers still show, through `times`.
// A grant whose client is not in the client list (an admin test account, or a
// deleted user) is skipped rather than shown as an unnamed row.
export function codeBuyers(clients, grants) {
  const byId = new Map(clients.map((c) => [c.id, c]));
  const rows = new Map();
  for (const g of grants) {
    const client = byId.get(g.user_id);
    if (!client) continue;
    const bought = g.granted_at ? new Date(g.granted_at) : null;
    const expires = g.expires_at ? new Date(g.expires_at) : null;
    const row = rows.get(g.user_id) || {
      id: g.user_id,
      name: client.full_name,
      email: client.email,
      times: 0,
      firstBought: bought,
      latestExpiry: expires,
      estimated: false,
    };
    row.times += 1;
    if (bought && (!row.firstBought || bought < row.firstBought)) row.firstBought = bought;
    if (expires && (!row.latestExpiry || expires > row.latestExpiry)) row.latestExpiry = expires;
    // A backfilled row's date was reconstructed, not recorded. Flagged so the
    // screen can mark it rather than presenting a guess as a fact.
    if (g.source === 'backfill') row.estimated = true;
    rows.set(g.user_id, row);
  }
  return [...rows.values()].sort((a, b) => (b.firstBought?.getTime() || 0) - (a.firstBought?.getTime() || 0));
}

// Who bought a CV revamp: one row per ORDER, newest first, because the tier and
// the amount differ per order and both are the point. A client who has bought
// twice appears twice, which is what a sales list should show.
export function revampBuyers(clients, orders) {
  const byId = new Map(clients.map((c) => [c.id, c]));
  return orders
    .map((o) => {
      const client = byId.get(o.user_id);
      return {
        id: o.user_id,
        name: client?.full_name,
        email: client?.email,
        known: !!client,
        tier: tierLabel(o.tier),
        amount: o.amount == null ? null : Number(o.amount),
        isReturning: !!o.is_returning,
        date: o.created_at ? new Date(o.created_at) : null,
      };
    })
    .filter((r) => r.known)
    .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
}
