import { useEffect, useRef, useState } from 'react';
import { signedVideoUrl } from './videoStorage';
import { GOLD, CREAM, MUTED, SURFACE, BORDER } from './theme';

// AXIS-37: plays one Interview Code video from the private 'videos' bucket.
//
// The signed URL is fetched when the component mounts (so a slide nobody opens
// never costs a request) and whenever `path` changes. Playback is never
// autoplayed: these sit inside a reading flow, and a video that starts talking
// on its own is hostile on a phone, on data, and in an open-plan office.
export default function VideoPlayer({ path, label }) {
  const [state, setState] = useState({ status: 'loading', url: null, error: null });
  const videoRef = useRef(null);

  useEffect(() => {
    if (!path) { setState({ status: 'none', url: null, error: null }); return undefined; }
    // `cancelled` guards against a slower request for an older slide landing
    // after a newer one and swapping the video out from under the viewer.
    let cancelled = false;
    setState({ status: 'loading', url: null, error: null });
    signedVideoUrl(path).then(({ url, error }) => {
      if (cancelled) return;
      setState(url ? { status: 'ready', url, error: null } : { status: 'error', url: null, error });
    });
    return () => { cancelled = true; };
  }, [path]);

  // Stop audio the moment the slide changes. Without this the element can be
  // torn down mid-play and keep sounding for a beat on some mobile browsers.
  useEffect(() => () => { try { videoRef.current?.pause(); } catch { /* already gone */ } }, []);

  if (state.status === 'none') return null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ letterSpacing: '.16em', textTransform: 'uppercase', fontSize: 10.5, color: GOLD, marginBottom: 10 }}>
        Watch
      </div>
      <div style={{
        position: 'relative', aspectRatio: '16 / 9', width: '100%', overflow: 'hidden',
        borderRadius: 10, background: SURFACE, border: `1px solid ${BORDER}`,
      }}>
        {state.status === 'ready' ? (
          <video
            ref={videoRef}
            src={state.url}
            controls
            // playsInline stops iOS Safari hijacking the screen into its own
            // full-screen player, which would drop the viewer out of the deck.
            playsInline
            // Fetch the first frame and the duration only. The files are 2-4MB
            // and most of a slide's readers never press play.
            preload="metadata"
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            aria-label={label ? `Video: ${label}` : 'Interview Code video'}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', background: '#000' }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, textAlign: 'center', fontSize: 13.5, lineHeight: 1.6,
            color: state.status === 'error' ? CREAM : MUTED,
          }}>
            {state.status === 'error' ? state.error : 'Loading the video…'}
          </div>
        )}
      </div>
    </div>
  );
}
