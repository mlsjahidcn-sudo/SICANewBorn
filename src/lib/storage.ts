/**
 * Supabase Storage helpers for file upload.
 *
 * Pattern: server generates a signed upload URL → client uploads directly
 * to Supabase Storage → client submits form with the storage path.
 *
 * This avoids passing files through the Next.js server.
 *
 * Buckets:
 *   - `transcripts`     (existing) — for assessment transcripts
 *   - `student-documents` (C1)     — for student profile / application documents
 */

import { createClient } from '@supabase/supabase-js';

export function getStorageClient() {
  const url = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

const TRANSCRIPT_BUCKET = 'transcripts';
const STUDENT_DOCS_BUCKET = 'student-documents';

// ---------------------------------------------------------------------------
// Transcript helpers (existing, untouched)
// ---------------------------------------------------------------------------

export async function createTranscriptUploadUrl(
  folderId: string,
  fileName: string,
): Promise<{ uploadUrl: string; storagePath: string } | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const ext = fileName.split('.').pop() || 'pdf';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const storagePath = `assessments/${folderId}/${safeName}`;

  const { data, error } = await supabase.storage
    .from(TRANSCRIPT_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error('[createTranscriptUploadUrl]', error);
    return null;
  }

  return { uploadUrl: data.signedUrl, storagePath };
}

export async function createTranscriptDownloadUrl(
  storagePath: string,
): Promise<string | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(TRANSCRIPT_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error || !data) {
    console.error('[createTranscriptDownloadUrl]', error);
    return null;
  }

  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// Student document helpers (new in C1)
// ---------------------------------------------------------------------------

/**
 * Allowed file types for student documents. Mirror the bucket's
 * allowed_mime_types so a 400 here means the upload will fail at the
 * storage layer too.
 */
export const STUDENT_DOC_ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;
export type StudentDocMimeType = (typeof STUDENT_DOC_ALLOWED_TYPES)[number];

export const STUDENT_DOC_MAX_BYTES = 10 * 1024 * 1024; // 10MB

export interface StudentDocUploadUrl {
  /** Signed URL the client PUTs the file to (Supabase Storage) */
  uploadUrl: string;
  /** Path the file lives at inside the bucket — stored in student_documents.file_url */
  storagePath: string;
  /** Token included in the PUT for verification */
  token: string;
}

/**
 * Generate a signed upload URL for a student document.
 *
 * Path layout: `{student_id}/{doc_id}-{filename}` (the doc_id is supplied
 * by the caller so it can be reused as the FK reference in the
 * student_documents row).
 *
 * The path is intentionally NOT a function of the file name — sanitized
 * timestamps + random suffix are appended. We keep the original
 * `fileName` in the row's `file_name` column for human display.
 */
export async function createStudentDocUploadUrl(
  studentId: string,
  documentId: string,
  originalFileName: string,
): Promise<StudentDocUploadUrl | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const ext = (originalFileName.split('.').pop() || 'pdf').toLowerCase();
  // Strip any chars that would break the path; allow [a-z0-9-]
  const safeExt = ext.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'pdf';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const storagePath = `${studentId}/${documentId}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(STUDENT_DOCS_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error('[createStudentDocUploadUrl]', error);
    return null;
  }

  return {
    uploadUrl: data.signedUrl,
    storagePath,
    token: data.token,
  };
}

/**
 * Generate a signed download URL for a student document. Returns a URL
 * valid for 1 hour.
 */
export async function createStudentDocDownloadUrl(
  storagePath: string,
): Promise<string | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(STUDENT_DOCS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error || !data) {
    console.error('[createStudentDocDownloadUrl]', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Delete a file from the student-documents bucket. Used when a student
 * deletes their own document row, so the storage object doesn't orphan.
 */
export async function deleteStudentDocFile(storagePath: string): Promise<boolean> {
  const supabase = getStorageClient();
  if (!supabase) return false;

  const { error } = await supabase.storage.from(STUDENT_DOCS_BUCKET).remove([storagePath]);
  if (error) {
    console.error('[deleteStudentDocFile]', error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Partner document helpers (new in partner-documents phase 1)
//
// Namespace convention: partner-uploaded files live in the SAME
// `student-documents` bucket as student-uploaded files, but under a
// `partner/{partnerId}/{partnerStudentId}/...` path prefix so the two
// name-spaces never collide. The student-doc RLS + the new partner-doc
// RLS (database/2026-06-12_partner_documents.sql) are both scoped to
// the bucket and already account for which path-prefix a row belongs
// to (partner_student_id IS NOT NULL for the partner policies).
//
// Why one bucket, not two:
//   - Admin reviewers fetch the doc in the same /api/admin/documents
//     queue regardless of who uploaded it (student or partner).
//   - Reuses the same STUDENT_DOC_ALLOWED_TYPES / STUDENT_DOC_MAX_BYTES
//     rules (PDF/PNG/JPG/WEBP/DOC/DOCX, 10MB) — partner docs have the
//     same shape as student docs.
//   - Avoids a second bucket + second signed-URL plumbing.
// ---------------------------------------------------------------------------

/**
 * Generate a signed upload URL for a partner document.
 *
 * Path layout: `partner/{partnerId}/{partnerStudentId}/{docId}-{safeName}.{ext}`
 *
 * The docId is supplied by the caller so it can be reused as the FK
 * reference in the `student_documents` row. partnerId is the org-level
 * scope (so the admin review queue can group by partner org) and
 * partnerStudentId is the per-student scope (matches the RLS helper
 * `is_doc_partner_member(partner_student_id)`).
 *
 * Mirrors `createStudentDocUploadUrl` 1:1 — only the path layout
 * differs, plus the extra partnerId arg.
 */
export async function createPartnerDocUploadUrl(
  partnerId: string,
  partnerStudentId: string,
  documentId: string,
  originalFileName: string,
): Promise<StudentDocUploadUrl | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const ext = (originalFileName.split('.').pop() || 'pdf').toLowerCase();
  // Strip any chars that would break the path; allow [a-z0-9-]
  const safeExt = ext.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'pdf';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const storagePath = `partner/${partnerId}/${partnerStudentId}/${documentId}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(STUDENT_DOCS_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error('[createPartnerDocUploadUrl]', error);
    return null;
  }

  return {
    uploadUrl: data.signedUrl,
    storagePath,
    token: data.token,
  };
}

/**
 * Generate a signed download URL for a partner document. Returns a URL
 * valid for 1 hour. The path is whatever was stored on the row
 * (`student_documents.file_url`), so this works for both student- and
 * partner-uploaded files in the same bucket.
 */
export async function createPartnerDocDownloadUrl(
  storagePath: string,
): Promise<string | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(STUDENT_DOCS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error || !data) {
    console.error('[createPartnerDocDownloadUrl]', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Delete a partner-uploaded file from the student-documents bucket.
 * Used when a partner removes their own document row, so the storage
 * object doesn't orphan. Mirrors `deleteStudentDocFile` 1:1 — same
 * bucket, same `remove([paths])` shape, the only difference is the
 * function name (and the JSDoc, for grep-ability).
 */
export async function deletePartnerDocFile(storagePath: string): Promise<boolean> {
  const supabase = getStorageClient();
  if (!supabase) return false;

  const { error } = await supabase.storage.from(STUDENT_DOCS_BUCKET).remove([storagePath]);
  if (error) {
    console.error('[deletePartnerDocFile]', error);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Partner service-fee payment proof helpers
// ---------------------------------------------------------------------------

/**
 * Generate a signed upload URL for a partner service-fee payment proof.
 * Stores the screenshot in the existing `student-documents` bucket under
 * `partner/{partnerId}/fees/{feeId}-{safeName}.{ext}` so admin reviewers
 * can fetch it with the same signed-URL plumbing as other partner docs.
 */
export async function createPartnerFeeProofUploadUrl(
  partnerId: string,
  feeId: string,
  originalFileName: string,
): Promise<StudentDocUploadUrl | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const ext = (originalFileName.split('.').pop() || 'png').toLowerCase();
  const safeExt = ext.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'png';
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const storagePath = `partner/${partnerId}/fees/${feeId}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(STUDENT_DOCS_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error('[createPartnerFeeProofUploadUrl]', error);
    return null;
  }

  return {
    uploadUrl: data.signedUrl,
    storagePath,
    token: data.token,
  };
}

/**
 * Generate a signed download URL for a partner fee payment proof.
 */
export async function createPartnerFeeProofDownloadUrl(
  storagePath: string,
): Promise<string | null> {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(STUDENT_DOCS_BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error || !data) {
    console.error('[createPartnerFeeProofDownloadUrl]', error);
    return null;
  }

  return data.signedUrl;
}

// ---------------------------------------------------------------------------
// Bucket introspection (existing)
// ---------------------------------------------------------------------------

export async function getBucketInfo() {
  const supabase = getStorageClient();
  if (!supabase) return null;

  const { data, error } = await supabase.storage.getBucket(TRANSCRIPT_BUCKET);
  if (error) return null;
  return data;
}
