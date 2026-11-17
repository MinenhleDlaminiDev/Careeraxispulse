import { supabase } from '../supabase';

// AXIS-37: the Interview Code videos live in a PRIVATE 'videos' bucket, because
// they are the thing clients pay for. A public bucket would mean one shared link
// lets anyone watch forever, and the URLs are guessable from the bucket name.
//
// So playback goes through a signed URL. Supabase checks the storage RLS policy
// (videos_read: live interview access, or admin) when the signature is issued,
// which means the access check happens server-side and cannot be skipped by
// editing anything in the browser. A client whose access has lapsed is refused
// a new signature on their next visit.
export const VIDEO_BUCKET = 'videos';

// Long enough to watch a slide's video without a mid-play refetch, short enough
// that a copied link is useless by the time it is shared.
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 2;

// Returns { url, error }. `error` is a message we can show as-is; Supabase says
// "Object not found" both for a missing file AND for one RLS hides, so we never
// repeat it to the client — it would read as a broken site to someone whose
// access simply ran out.
export async function signedVideoUrl(path) {
  if (!supabase) return { url: null, error: 'Video storage is not configured.' };
  if (!path) return { url: null, error: null };
  const { data, error } = await supabase.storage
    .from(VIDEO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return { url: null, error: 'This video could not be loaded.' };
  return { url: data.signedUrl, error: null };
}
