import { supabase } from '../supabase';

// Shared CV storage helpers used by the client uploader (CvUpload) and the admin
// CV tools (AdminCvs). CVs live in the private "cvs" bucket under "<userId>/…"
// (the storage policy keys off that first folder) with a matching cv_uploads row.
//   source = WHO uploaded it ('client' | 'admin')
//   stage  = 'original' (to work from) | 'revised' (the finished delivery)

export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED = ['pdf', 'doc', 'docx'];
export const ACCEPT = '.pdf,.doc,.docx';

export const ext = (name) => (name.split('.').pop() || '').toLowerCase();

// Turn a stored path ("<uid>/<timestamp>-<name>") back into the friendly file
// name we showed on upload, by stripping the folder and the timestamp prefix.
export const displayName = (path) => (path || '').split('/').pop().replace(/^\d+-/, '');

// Make a file name safe for a storage key: keep letters, numbers, dot, dash,
// underscore; collapse everything else to a single underscore.
const safeName = (name) => name.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_');

// Returns a user-facing error string if the file isn't an allowed CV, else null.
export function validateCvFile(file) {
  if (!ALLOWED.includes(ext(file.name))) return 'Please upload a PDF, DOC or DOCX file.';
  if (file.size > MAX_BYTES) return 'That file is over 5 MB. Please upload a smaller file.';
  return null;
}

// Upload a CV to "<userId>/<ts>-<name>" and record the cv_uploads row. If the
// row insert fails, remove the orphaned object so storage and the table don't
// drift. Returns { error } — null on success.
export async function uploadCv({ userId, file, source, stage = 'original' }) {
  if (!supabase) return { error: new Error('Portal not configured') };
  const path = `${userId}/${Date.now()}-${safeName(file.name)}`;
  const up = await supabase.storage.from('cvs').upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (up.error) return { error: up.error };
  const ins = await supabase.from('cv_uploads').insert({ user_id: userId, storage_path: path, source, stage });
  if (ins.error) {
    await supabase.storage.from('cvs').remove([path]);
    return { error: ins.error };
  }
  return { error: null };
}

// Trigger a browser download of a stored CV via a short-lived signed URL. We use
// a temporary <a download> rather than window.open so pop-up blockers (Brave,
// Safari) don't suppress it after the await. Returns { ok } — false if the
// signed URL couldn't be created.
export async function downloadCv(storagePath) {
  if (!supabase) return { ok: false };
  const name = displayName(storagePath);
  const { data, error } = await supabase.storage.from('cvs').createSignedUrl(storagePath, 60, { download: name });
  if (error || !data?.signedUrl) return { ok: false };
  const a = document.createElement('a');
  a.href = data.signedUrl;
  a.download = name;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return { ok: true };
}
