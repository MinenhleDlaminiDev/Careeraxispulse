import { useEffect, useState } from 'react';
import { initials } from './format';
import { signedAvatarUrl } from './avatarStorage';

// Shared avatar (AXIS-28): shows the profile photo via a short-lived signed URL
// from the private 'avatars' bucket, and falls back to initials when there's no
// photo or the URL can't be made. Keeps the .ax-avatar box so sizing and theming
// stay uniform. Pass `path` = profiles.avatar_path, plus name/email for the
// fallback. `size` (px) overrides the default 46px box.
//
// AXIS-43: `src` = profiles.avatar_url, an EXTERNAL photo from an OAuth
// provider (Google's 'picture'). It is used only when there is no uploaded
// photo, so a client who uploads one replaces their Google picture for good.
// It is kept in its own prop and column because `path` is signed, and a foreign
// URL cannot be signed — passing one as `path` would quietly show initials.
export default function Avatar({ path, src, name, email, size, style, className = '' }) {
  const [signed, setSigned] = useState(null);
  // An external URL can 404 or be blocked (Google rotates these). Track that so
  // we fall through to initials instead of rendering a broken image box.
  const [extFailed, setExtFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setSigned(null);
    if (path) {
      signedAvatarUrl(path).then((u) => { if (active) setSigned(u); });
    }
    return () => { active = false; };
  }, [path]);

  useEffect(() => { setExtFailed(false); }, [src]);

  // Uploaded photo wins; then the provider's; then initials.
  //
  // `!path` matters: with BOTH an upload and a Google picture, using src while
  // the signed URL is still resolving would flash the old provider photo and
  // then swap to the real one. If there is an upload we wait for it and show
  // initials meanwhile, so the wrong face is never displayed.
  const url = signed || (!path && !extFailed && src ? src : null);
  const sizeStyle = size ? { width: size, height: size, fontSize: Math.round(size * 0.37) } : null;

  return (
    <div className={`ax-avatar${url ? ' has-photo' : ''}${className ? ' ' + className : ''}`} style={{ ...sizeStyle, ...style }}>
      {url
        ? <img src={url} alt={name || 'Profile photo'} onError={() => { if (!signed) setExtFailed(true); }} />
        : initials(name, email)}
    </div>
  );
}
