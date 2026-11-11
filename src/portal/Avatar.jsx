import { useEffect, useState } from 'react';
import { initials } from './format';
import { signedAvatarUrl } from './avatarStorage';

// Shared avatar (AXIS-28): shows the profile photo via a short-lived signed URL
// from the private 'avatars' bucket, and falls back to initials when there's no
// photo or the URL can't be made. Keeps the .ax-avatar box so sizing and theming
// stay uniform. Pass `path` = profiles.avatar_path, plus name/email for the
// fallback. `size` (px) overrides the default 46px box.
export default function Avatar({ path, name, email, size, style, className = '' }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let active = true;
    setUrl(null);
    if (path) {
      signedAvatarUrl(path).then((u) => { if (active) setUrl(u); });
    }
    return () => { active = false; };
  }, [path]);

  const sizeStyle = size ? { width: size, height: size, fontSize: Math.round(size * 0.37) } : null;

  return (
    <div className={`ax-avatar${url ? ' has-photo' : ''}${className ? ' ' + className : ''}`} style={{ ...sizeStyle, ...style }}>
      {url ? <img src={url} alt={name || 'Profile photo'} /> : initials(name, email)}
    </div>
  );
}
