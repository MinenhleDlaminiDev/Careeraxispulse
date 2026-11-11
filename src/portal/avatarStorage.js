import { supabase } from '../supabase';

// Profile photos (AXIS-28) live in the private "avatars" bucket under
// "<userId>/<file>" (the storage policy keys off that first folder), mirroring
// cvStorage. The chosen path is also saved to profiles.avatar_path so we know
// which object to show and which to clean up when the photo is replaced.

export const AVATAR_MAX_BYTES = 4 * 1024 * 1024; // 4 MB
export const AVATAR_ALLOWED = ['png', 'jpg', 'jpeg', 'webp'];
export const AVATAR_ACCEPT = 'image/png,image/jpeg,image/webp';

const ext = (name) => (name.split('.').pop() || '').toLowerCase();
const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_');

// Returns a user-facing error string if the file isn't an allowed image, else null.
export function validateAvatarFile(file) {
  if (!AVATAR_ALLOWED.includes(ext(file.name))) return 'Please choose a PNG, JPG or WEBP image.';
  if (file.size > AVATAR_MAX_BYTES) return 'That image is over 4 MB. Please choose a smaller one.';
  return null;
}

// Upload a new photo, point the profile row at it, then delete the previous
// object so the bucket doesn't accumulate orphans. Returns { error, path }.
export async function uploadAvatar({ userId, file, previousPath }) {
  if (!supabase) return { error: new Error('Portal not configured'), path: null };
  const path = `${userId}/${Date.now()}-${safeName(file.name)}`;
  const up = await supabase.storage.from('avatars').upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (up.error) return { error: up.error, path: null };
  const upd = await supabase.from('profiles').update({ avatar_path: path }).eq('id', userId);
  if (upd.error) {
    // Roll back the orphaned object so storage and the column stay in sync.
    await supabase.storage.from('avatars').remove([path]);
    return { error: upd.error, path: null };
  }
  if (previousPath && previousPath !== path) {
    await supabase.storage.from('avatars').remove([previousPath]);
  }
  return { error: null, path };
}

// Clear the column first, then delete the object. Returns { error }.
export async function removeAvatar({ userId, path }) {
  if (!supabase) return { error: new Error('Portal not configured') };
  const upd = await supabase.from('profiles').update({ avatar_path: null }).eq('id', userId);
  if (upd.error) return { error: upd.error };
  if (path) await supabase.storage.from('avatars').remove([path]);
  return { error: null };
}

// A short-lived signed URL for showing a photo (the bucket is private). Returns
// the URL or null; the caller caches it in component state.
export async function signedAvatarUrl(path) {
  if (!supabase || !path) return null;
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
