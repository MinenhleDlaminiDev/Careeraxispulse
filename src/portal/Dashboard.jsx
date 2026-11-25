import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GOLD, MUTED, BORDER, SERIF, DANGER } from './theme';
import Banner from './Banner';
import PageHeader from './PageHeader';
import { Skel } from './Skeleton';
import { BarChart, HBarChart, Legend, SERIES_GOLD, SERIES_SLATE } from './Chart';
import { fmtDate } from './format';
import {
  loadReportData, summary, signupsByDay, tierSplit, revenueByMonth,
  codeBuyers, revampBuyers, rands, AXIS_CODE_PRICE,
} from './dashboardData';

// The admin Dashboard (AXIS-55, named in AXIS-57). How many clients, how many
// arrived today, who bought a CV revamp and who bought the Axis Interview Code.
//
// The screen's one rule: never flatter the business. A figure that is missing
// says it is missing, an estimate says it is an estimate, and a number nobody
// has recorded yet reads as "none recorded" rather than as a zero that looks
// like a fact.

const ellipsis = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };

function Card({ title, note, children }) {
  return (
    <section className="ax-card" style={{ padding: '20px 20px 22px' }}>
      <h2 style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, margin: 0, color: 'var(--ax-text)' }}>{title}</h2>
      {note && <p style={{ fontSize: 12.5, color: MUTED, margin: '5px 0 0', lineHeight: 1.5 }}>{note}</p>}
      <div style={{ marginTop: 18 }}>{children}</div>
    </section>
  );
}

function Stat({ label, value, hint }) {
  // Six across leaves a card near 105px wide on a laptop, which holds about six
  // characters of 26px serif. A longer value, like "Not set up", steps down a
  // size rather than spilling out of the card.
  //
  // The padding, the label tracking and the hint size are all tuned for that
  // width (AXIS-57). At the old 17px padding and .12em tracking the cards came
  // out 180px tall, because "PAYING CLIENTS" wrapped and every hint ran to four
  // narrow lines. The hints themselves were cut to a few words for the same
  // reason: on one line each card is as tall as the wordiest one.
  const size = String(value).length > 6 ? 19 : 26;
  return (
    <div className="ax-card" style={{ padding: '13px 13px 14px' }}>
      <div style={{ fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase', color: GOLD, lineHeight: 1.3 }}>{label}</div>
      <div style={{ fontFamily: SERIF, fontSize: size, fontWeight: 700, lineHeight: 1.15, margin: '7px 0 0', color: 'var(--ax-text)' }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

// One person in a sales list. Name and email on the left, the figures on the
// right, the whole row a link to their detail page. Padding keeps the tap
// target comfortably past 44px on a phone.
function PersonRow({ to, name, email, right, meta, last }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit',
        padding: '12px 2px', minHeight: 44,
        // No rule under the last row: it would look like a divider above
        // nothing.
        borderBottom: last ? 'none' : `1px solid ${BORDER}`,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ax-text)', ...ellipsis }}>{name || 'Unnamed client'}</div>
        <div style={{ fontSize: 12.5, color: MUTED, ...ellipsis }}>{email}</div>
        {meta && <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{meta}</div>}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>{right}</div>
    </Link>
  );
}

function Empty({ children }) {
  return <div style={{ fontSize: 13.5, color: MUTED, padding: '20px 2px', lineHeight: 1.6 }}>{children}</div>;
}

export default function Dashboard() {
  const [state, setState] = useState({ loading: true, error: false, data: null });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: false }));
    const data = await loadReportData();
    setState({ loading: false, error: data.error, data });
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = state.data;
  const view = useMemo(() => {
    if (!d || d.error) return null;
    return {
      s: summary(d.clients, d.orders, d.grants),
      days: signupsByDay(d.clients, 30),
      tiers: tierSplit(d.orders),
      months: revenueByMonth(d.orders, d.grants),
      code: codeBuyers(d.clients, d.grants),
      revamps: revampBuyers(d.clients, d.orders),
      grantsUnavailable: d.grantsUnavailable,
      testAccounts: d.testAccounts || 0,
    };
  }, [d]);

  const header = (
    <PageHeader eyebrow="Dashboard" title="Dashboard">
      How the business is doing: who has signed up, who has bought the Axis Interview Code, and who has bought a CV revamp.
    </PageHeader>
  );

  if (state.loading) {
    return (
      <div>
        {header}
        <div className="ax-stats">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ax-card" style={{ padding: '16px 17px 17px' }}>
              <Skel w="60%" h={9} />
              <div style={{ marginTop: 12 }}><Skel w="45%" h={24} /></div>
            </div>
          ))}
        </div>
        <div className="ax-card" style={{ padding: 20, marginTop: 16 }}>
          <Skel w="40%" h={13} />
          <div style={{ marginTop: 20 }}><Skel h={150} r={10} /></div>
        </div>
      </div>
    );
  }

  if (state.error || !view) {
    return (
      <div>
        {header}
        <div style={{ color: DANGER, fontSize: 14 }}>Couldn’t load the dashboard. Refresh to try again.</div>
      </div>
    );
  }

  const { s, days, tiers, months, code, revamps, grantsUnavailable, testAccounts } = view;
  const busiest = days.reduce((best, r) => (r.value > best.value ? r : best), days[0]);

  // What the revenue figure does and does not include, said plainly under it.
  const revenueCaveats = [];
  if (!grantsUnavailable && s.codeSales > 0) {
    revenueCaveats.push(`Axis Code at ${rands(AXIS_CODE_PRICE)} list`);
  }
  if (s.ordersMissingAmount > 0) {
    revenueCaveats.push(`${s.ordersMissingAmount} revamp${s.ordersMissingAmount === 1 ? '' : 's'} with no amount`);
  }

  return (
    <div>
      {header}

      {grantsUnavailable && (
        <Banner kind="error" style={{ marginBottom: 14 }}>
          Axis Code sales history isn’t set up yet, so those figures are blank. Everything else on this page is live.
        </Banner>
      )}

      <div className="ax-stats">
        <Stat label="Clients" value={s.clients} hint="Admins excluded" />
        <Stat label="New today" value={s.newToday} hint={`${s.newThisWeek} in 7 days`} />
        <Stat
          label="Axis Code"
          value={grantsUnavailable ? 'Not set up' : s.codeSales}
          hint={grantsUnavailable ? 'History not set up' : `${s.codeBuyers} ${s.codeBuyers === 1 ? 'person' : 'people'}, ${s.accessLive} live now`}
        />
        <Stat
          label="CV revamps"
          value={s.revamps}
          hint={s.revamps ? `${s.revampBuyers} ${s.revampBuyers === 1 ? 'person' : 'people'}` : 'None recorded yet'}
        />
        <Stat
          label="Revenue"
          value={rands(s.revenue)}
          hint={revenueCaveats.length ? revenueCaveats.join('. ') : 'Recorded sales only'}
        />
        <Stat
          label="Paying clients"
          value={`${s.payingRate}%`}
          // Short on purpose (AXIS-57). On one line every card stretches to the
          // tallest, so a long hint here would have grown all six.
          hint={`${s.paying} of ${s.clients} signups`}
        />
      </div>

      {/* AXIS-58. The Clients page still lists the test accounts, so without
          this line the two screens would simply show different client numbers
          and neither would say why. */}
      {testAccounts > 0 && (
        <p style={{ fontSize: 12.5, color: MUTED, margin: '11px 2px 0', lineHeight: 1.5 }}>
          {testAccounts === 1 ? 'One test account is' : `${testAccounts} test accounts are`} left out of every figure
          above. {testAccounts === 1 ? 'It still appears' : 'They still appear'} on the Clients page.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
        <Card
          title="Signups, last 30 days"
          note={busiest && busiest.value > 0
            ? `Busiest day was ${fmtDate(busiest.date)} with ${busiest.value} ${busiest.value === 1 ? 'signup' : 'signups'}. Hover a bar for its exact count.`
            : 'No signups in the last 30 days.'}
        >
          <BarChart
            rows={days.map((r) => ({ key: r.key, label: r.label, group: r.group, title: fmtDate(r.date), values: { signups: r.value } }))}
            series={[{ key: 'signups', label: 'Signups', color: SERIES_GOLD }]}
            labelEvery={5}
            height={150}
          />
        </Card>

        <Card
          title="CV revamps by tier"
          note="Confirmed orders only. Pending and refunded ones are left out."
        >
          <HBarChart
            rows={tiers}
            emptyNote="No revamp orders have been recorded yet."
          />
        </Card>

        <Card
          title="Revenue by month"
          note={`The figure above each month is that month’s total. Axis Code sales are valued at the ${rands(AXIS_CODE_PRICE)} list price, since the amount actually charged isn’t recorded.`}
        >
          <Legend series={[
            { key: 'revamp', label: 'CV revamps', color: SERIES_GOLD },
            { key: 'code', label: 'Axis Interview Code', color: SERIES_SLATE },
          ]} />
          <BarChart
            rows={months.map((m) => ({ key: m.key, label: m.label, values: { revamp: m.revamp, code: m.code } }))}
            series={[
              { key: 'revamp', label: 'CV revamps', color: SERIES_GOLD },
              { key: 'code', label: 'Axis Interview Code', color: SERIES_SLATE },
            ]}
            format={rands}
            height={140}
            showValues={months.length <= 6}
            emptyNote="No sales recorded yet, so there is nothing to total."
          />
        </Card>

        <Card title="Who bought the Axis Interview Code" note="Newest buyer first. Tap a name for their full profile.">
          {grantsUnavailable ? (
            <Empty>Sales history isn’t set up yet, so this list is empty. It fills in from the next grant onwards.</Empty>
          ) : code.length === 0 ? (
            <Empty>No Axis Code sales recorded yet. Granting access on the Clients screen records one.</Empty>
          ) : (
            <div>
              {code.map((c, i) => {
                const live = c.latestExpiry && c.latestExpiry.getTime() > Date.now();
                return (
                  <PersonRow
                    key={c.id}
                    last={i === code.length - 1}
                    to={`/portal/admin/clients/${c.id}`}
                    name={c.name}
                    email={c.email}
                    meta={[
                      c.firstBought ? `Bought ${fmtDate(c.firstBought)}${c.estimated ? ' (estimated)' : ''}` : null,
                      c.times > 1 ? `${c.times} times` : null,
                    ].filter(Boolean).join(' · ')}
                    right={
                      <>
                        <span className={`ax-badge ax-badge-${live ? 'gold' : 'danger'}`}>{live ? 'Live' : 'Expired'}</span>
                        {c.latestExpiry && (
                          <div style={{ fontSize: 12, color: MUTED, marginTop: 5 }}>
                            {live ? 'until ' : ''}{fmtDate(c.latestExpiry)}
                          </div>
                        )}
                      </>
                    }
                  />
                );
              })}
            </div>
          )}
        </Card>

        <Card title="Who bought a CV revamp" note="One line per order, newest first, so a repeat client appears more than once.">
          {revamps.length === 0 ? (
            <Empty>
              No revamp orders have been recorded yet. Open a client, then use Record order on their page, and they will
              appear here along with the revenue.
            </Empty>
          ) : (
            <div>
              {revamps.map((r, i) => (
                <PersonRow
                  key={`${r.id}-${i}`}
                  last={i === revamps.length - 1}
                  to={`/portal/admin/clients/${r.id}`}
                  name={r.name}
                  email={r.email}
                  meta={[r.tier, r.isReturning ? 'returning price' : null, r.date ? fmtDate(r.date) : null].filter(Boolean).join(' · ')}
                  right={
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ax-text)' }}>
                      {r.amount == null ? <span style={{ fontSize: 12.5, fontWeight: 500, color: MUTED }}>No amount</span> : rands(r.amount)}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
