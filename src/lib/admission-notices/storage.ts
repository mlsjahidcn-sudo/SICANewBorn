/**
 * admission-notices/storage.ts
 *
 * Supabase Storage helpers for the Success Stories feature
 * (Phase 51). Single bucket `admission-notices` with two
 * top-level folders:
 *
 *   - `public/{noticeId}.jpg`      — watermarked, bucket-public
 *   - `originals/{noticeId}.{ext}` — original, admin-only
 *
 * Both files are kept so:
 *   - The public URL serves the watermarked file (the only file
 *     a public visitor ever sees; the file has the watermark
 *     baked in, so any download includes it).
 *   - The admin can re-render the watermark if the brand
 *     changes (cheap: re-run applySicaWatermark on the original
 *     + overwrite the public file).
 *
 * The bucket itself is created public-read; the `originals/`
 * folder is protected by the bucket's RLS + a prefix-check
 * defense-in-depth in the API routes.
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export const ADMISSION_NOTICES_BUCKET = 'admission-notices';

/** Sub-paths inside the bucket. */
const PUBLIC_PREFIX = 'public';
const ORIGINALS_PREFIX = 'originals';

function getStorageClient() {
  const url = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Originals filename: keep the user-uploaded extension so the
 *  format round-trips (PNG → PNG, JPEG → JPEG). */
function makeOriginalPath(noticeId: string, originalFilename: string): string {
  const ext = (originalFilename.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${ORIGINALS_PREFIX}/${noticeId}.${ext || 'jpg'}`;
}

/** Public filename is always .jpg because the watermark function
 *  outputs JPEG. */
function makePublicPath(noticeId: string): string {
  return `${PUBLIC_PREFIX}/${noticeId}.jpg`;
}

/**
 * Upload both the original and the watermarked buffer for a
 * new notice. Generates the noticeId client-side so the public
 * path is deterministic (the public path = bucket URL suffix,
 *  predictable in the DB row).
 *
 * Returns the storage paths (relative to the bucket, no leading
 * slash) that should be stored in admission_notices.image_path /
 * .original_path.
 */
export async function uploadAdmissionNoticeImages(args: {
  originalFilename: string;
  originalBuffer: Buffer;
  watermarkedBuffer: Buffer;
}): Promise<{ originalPath: string; publicPath: string } | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;
  const noticeId = randomUUID();
  const originalPath = makeOriginalPath(noticeId, args.originalFilename);
  const publicPath = makePublicPath(noticeId);

  // Upload the original first (admin-only, can fail loudly).
  const { error: origErr } = await supabase.storage
    .from(ADMISSION_NOTICES_BUCKET)
    .upload(originalPath, args.originalBuffer, {
      contentType: guessContentTypeFromExt(args.originalFilename),
      upsert: true,
    });
  if (origErr) {
    console.error('[admission-notices storage] original upload:', origErr);
    return null;
  }
  // Upload the watermarked public file.
  const { error: pubErr } = await supabase.storage
    .from(ADMISSION_NOTICES_BUCKET)
    .upload(publicPath, args.watermarkedBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  if (pubErr) {
    // Roll back the original upload so we don't leak storage.
    await supabase.storage.from(ADMISSION_NOTICES_BUCKET).remove([originalPath]);
    console.error('[admission-notices storage] public upload:', pubErr);
    return null;
  }
  return { originalPath, publicPath };
}

/**
 * Delete both the original and the public file for a notice.
 * Best-effort: returns true if both removed, false otherwise.
 * Caller should still proceed with the DB delete even if storage
 * cleanup fails (so the admin can clear a stuck row).
 */
export async function deleteAdmissionNoticeImages(
  originalPath: string,
  publicPath: string,
): Promise<{ originalRemoved: boolean; publicRemoved: boolean }> {
  const supabase = getStorageClient();
  if (!supabase) return { originalRemoved: false, publicRemoved: false };
  const { data: removed } = await supabase.storage
    .from(ADMISSION_NOTICES_BUCKET)
    .remove([originalPath, publicPath]);
  // The `removed` array is a list of FileObject entries that were
  // successfully removed (each has a `name` field matching the
  // storage path we passed in). If a path isn't in the list, it
  // either didn't exist or we lacked permission. Supabase JS SDK
  // 2.95.x returns FileObject[] not string[] — extract names.
  const removedNames = new Set((removed || []).map((r) => r.name));
  return {
    originalRemoved: removedNames.has(originalPath),
    publicRemoved: removedNames.has(publicPath),
  };
}

/** Get the public URL for a stored public file. Works because
 *  the bucket is public-read. */
export function getAdmissionNoticePublicUrl(publicPath: string): string | null {
  const supabase = getStorageClient();
  if (!supabase) return null;
  const { data } = supabase.storage
    .from(ADMISSION_NOTICES_BUCKET)
    .getPublicUrl(publicPath);
  return data.publicUrl;
}

/** Get a 1h signed URL for the private original. Admin-only
 *  endpoint uses this for the "download original" button. */
export async function getAdmissionNoticeOriginalSignedUrl(
  originalPath: string,
): Promise<string | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(ADMISSION_NOTICES_BUCKET)
    .createSignedUrl(originalPath, 3600);
  if (error) {
    console.error('[admission-notices storage] original signed url:', error);
    return null;
  }
  return data.signedUrl;
}

/** Defense-in-depth prefix check: every operation that touches
 *  the originals/ folder MUST go through this gate. Catches a
 *  malicious or buggy client trying to read/write a public/ path
 *  under the original endpoint. */
export function isOriginalPath(path: string): boolean {
  return path.startsWith(`${ORIGINALS_PREFIX}/`);
}

function guessContentTypeFromExt(name: string): string {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  return 'image/jpeg';
}
