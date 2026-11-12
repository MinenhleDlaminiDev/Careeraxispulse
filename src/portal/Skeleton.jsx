// Skeleton placeholders (AXIS-33): greyed, shimmering stand-ins shown while a
// list loads, so the screen keeps its shape and feels faster than a spinner.
// `.ax-skel` (shimmer) and the surfaces are themed, so these work light/dark.

export function Skel({ w = '100%', h = 12, r = 8, style }) {
  return <div className="ax-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

// Mirrors an admin client card (avatar, name/email, meta rows, an action).
export function ClientCardSkeleton() {
  return (
    <div className="ax-card" style={{ padding: '20px 20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <Skel w={46} h={46} r={12} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Skel w="60%" h={14} style={{ marginBottom: 9 }} />
          <Skel w="82%" h={11} />
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Skel w="70%" h={11} />
        <Skel w="55%" h={11} />
        <Skel w="38%" h={11} />
      </div>
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--ax-border)' }}>
        <Skel w={120} h={30} r={8} />
      </div>
    </div>
  );
}

// Mirrors an admin CV card (client header + a couple of file rows + actions).
export function CvCardSkeleton() {
  return (
    <div className="ax-card" style={{ padding: '20px 20px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <Skel w={46} h={46} r={12} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Skel w="55%" h={14} style={{ marginBottom: 9 }} />
          <Skel w="75%" h={11} />
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Skel w="100%" h={46} r={10} />
        <Skel w="100%" h={46} r={10} />
      </div>
      <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--ax-border)', display: 'flex', gap: 9 }}>
        <Skel w={130} h={30} r={8} />
        <Skel w={150} h={30} r={8} />
      </div>
    </div>
  );
}
