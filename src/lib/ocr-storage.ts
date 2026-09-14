/**
 * Phase 89: minimal upload-URL helper for the OCR pipeline.
 *
 * The OCR feature is used during the admin "Add Offline Student" wizard,
 * BEFORE the student row exists. We don't have a real `student_id` to
 * namespace the storage path under, so we mint a synthetic UUID and
 * prefix it with `ocr-tmp/` for easy cleanup later.
 *
 * The file is downloaded by the extract route, sent to the vision model,
 * and (once the wizard's `handleSave()` runs) the file will be re-linked
 * to the real student_id via a future PATCH on the document. For now,
 * the file lives in `student-documents/<ocr-tmp-uuid>/<docId>-<filename>`
 * under the same bucket as real student docs.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getStorageClient, STUDENT_DOCS_BUCKET } from '@/lib/storage';

export interface OcrUploadUrl {
  uploadUrl: string;
  storagePath: string;
  token: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createOcrUploadUrl(
  documentId: string,
  originalFileName: string,
): Promise<OcrUploadUrl | null> {
  if (!UUID_RE.test(documentId)) return null;
  const supabase: SupabaseClient | null = getStorageClient();
  if (!supabase) return null;

  const ext = (originalFileName.split('.').pop() || 'pdf').toLowerCase();
  const safeExt = ext.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'pdf';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const ownerPrefix = `ocr-tmp-${crypto.randomUUID()}`;
  const storagePath = `${ownerPrefix}/${documentId}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(STUDENT_DOCS_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error('[createOcrUploadUrl]', error);
    return null;
  }
  return { uploadUrl: data.signedUrl, storagePath, token: data.token };
}

/**
 * Fetch a previously-uploaded OCR file as a Buffer so the extract
 * route can base64-encode it for the vision model. Returns null on
 * any failure (best-effort — the route surfaces a friendly error).
 */
export async function downloadOcrFile(storagePath: string): Promise<Buffer | null> {
  const supabase: SupabaseClient | null = getStorageClient();
  if (!supabase) return null;
  const { data, error } = await supabase.storage
    .from(STUDENT_DOCS_BUCKET)
    .download(storagePath);
  if (error || !data) {
    console.error('[downloadOcrFile]', error);
    return null;
  }
  return Buffer.from(await data.arrayBuffer());
}