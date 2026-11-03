import { Component } from 'react';

// Catches a failed lazy-chunk load (e.g. a stale chunk hash after a deploy) so
// the whole SPA doesn't white-screen — shows a reload prompt instead.
export default class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Portal failed to load:', error);
  }

  render() {
    if (this.state.failed) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#131F38', color: '#F4EFE4', fontFamily: "'Public Sans', sans-serif", padding: 22, textAlign: 'center' }}>
          <div>Couldn’t load the portal.</div>
          <button type="button" onClick={() => window.location.reload()} style={{ background: '#C9A227', color: '#131F38', border: 'none', borderRadius: 3, padding: '9px 18px', fontWeight: 600, cursor: 'pointer' }}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
