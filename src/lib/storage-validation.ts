/**
 * storage-validation.ts — pure-function validation helpers for storage
 * uploads. Extracted so the same rules apply to the API route, the
 * client-side pre-check, and any future server-side ingestion.
 */

import {
  STUDENT_DOC_ALLOWED_TYPES,
  STUDENT_DOC_MAX_BYTES,
  StudentDocMimeType,
} from '@/lib/storage';

export interface ValidationOk {
  ok: true;
}
export interface ValidationFail {
  ok: false;
  error: string;
}
export type ValidationResult = ValidationOk | ValidationFail;

export function isAllowedMimeType(input: unknown): input is StudentDocMimeType {
  return (
    typeof input === 'string' &&
    (STUDENT_DOC_ALLOWED_TYPES as readonly string[]).includes(input)
  );
}

export function validateFileType(contentType: unknown): ValidationResult {
  if (!isAllowedMimeType(contentType)) {
    return {
      ok: false,
      error: `File type not allowed. Use PDF, PNG, JPG, WEBP, or DOC/DOCX. (got: ${String(contentType)})`,
    };
  }
  return { ok: true };
}

export function validateFileSize(sizeBytes: unknown): ValidationResult {
  if (typeof sizeBytes !== 'number' || isNaN(sizeBytes) || sizeBytes < 0) {
    return { ok: false, error: 'fileSize must be a non-negative number' };
  }
  if (sizeBytes > STUDENT_DOC_MAX_BYTES) {
    return {
      ok: false,
      error: `File too large. Max is ${STUDENT_DOC_MAX_BYTES / 1024 / 1024}MB (got: ${(sizeBytes / 1024 / 1024).toFixed(1)}MB)`,
    };
  }
  if (sizeBytes === 0) {
    return { ok: false, error: 'File is empty (0 bytes)' };
  }
  return { ok: true };
}

export function validateFileName(name: unknown): ValidationResult {
  if (typeof name !== 'string' || !name.trim()) {
    return { ok: false, error: 'fileName is required' };
  }
  // Disallow path traversal
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    return { ok: false, error: 'fileName must not contain path separators' };
  }
  if (name.length > 255) {
    return { ok: false, error: 'fileName too long (max 255 chars)' };
  }
  return { ok: true };
}
