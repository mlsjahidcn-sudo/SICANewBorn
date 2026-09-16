/**
 * admin-document-validation.ts
 *
 * Whitelist helpers for student_documents admin writes (Phase 109
 * Batch 1).
 *
 * Mirrors src/lib/student-fee-validation.ts:1-50 pattern: allow-list
 * Set + iterate-and-filter, returns Record<string, unknown> so callers
 * can pass it straight to .update().
 *
 * Two functions:
 *   - pickAdminDocRowUpdates  — the per-row PATCH whitelist (status,
 *                                rejection_reason, application_id,
 *                                etc.) used by /api/admin/documents/[id]
 *   - parseAndValidateAdminDocumentUpload — POST body validation for
 *                                /api/admin/documents that consolidates
 *                                the per-field checks the route does
 *                                inline today
 */

const EDITABLE_ADMIN_DOC_FIELDS = new Set([
  'name',
  'name_cn',
  'description',
  'notes',
  'file_url',
  'file_name',
  'file_type',
  'file_size',
  'category',
  'status',
  'rejection_reason',
  'application_id',
  'verified_at',
  'verified_by',
]);

// Fields that the server always sets or that should never be writable
// from the admin route (identity + bookkeeping).
const SERVER_ONLY_ADMIN_DOC_FIELDS = new Set([
  'id',
  'student_id',
  'partner_student_id',
  'partner_application_id',
  'uploaded_at',
  'created_at',
  'updated_at',
]);

export interface AdminDocUpdatePayload {
  [key: string]: unknown;
}

/**
 * Returns the subset of `body` that contains only editable fields, in
 * snake_case. Empty payload → caller should 400 'No editable fields
 * provided'.
 */
export function pickAdminDocRowUpdates(
  body: AdminDocUpdatePayload,
): AdminDocUpdatePayload {
  const updates: AdminDocUpdatePayload = {};
  for (const [k, v] of Object.entries(body)) {
    if (SERVER_ONLY_ADMIN_DOC_FIELDS.has(k)) continue;
    if (EDITABLE_ADMIN_DOC_FIELDS.has(k)) {
      updates[k] = v;
    }
  }
  return updates;
}

/**
 * Validates the camelCase body of POST /api/admin/documents. Returns
 * `{ ok: true, value }` on success or `{ ok: false, error }` with a
 * 400-friendly error message on the first failing field. Mirrors the
 * pattern from src/lib/__tests__/student-fee-validation.test.ts but
 * is not currently used by the route (which still validates
 * inline) — kept here for future test refactors + as a single
 * source of truth for the upload body shape.
 */
import {
  parseStudentDocCategory,
  type StudentDocCategory,
} from './admin-document-categories';

export interface AdminDocumentUploadBody {
  studentId: string;
  applicationId?: string | null;
  name: string;
  nameCn?: string | null;
  category: StudentDocCategory;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  notes?: string | null;
}

export type AdminDocumentUploadValidation =
  | { ok: true; value: AdminDocumentUploadBody }
  | { ok: false; error: string };

export function parseAndValidateAdminDocumentUpload(
  body: Record<string, unknown>,
): AdminDocumentUploadValidation {
  const studentId =
    typeof body.studentId === 'string' ? body.studentId.trim() : '';
  if (!studentId) return { ok: false, error: 'studentId is required' };

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) return { ok: false, error: 'name is required' };

  const category = parseStudentDocCategory(body.category);
  if (!category) {
    return { ok: false, error: `category must be one of the allowed values` };
  }

  const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl : '';
  if (!fileUrl) return { ok: false, error: 'fileUrl is required' };

  const fileName = body.fileName;
  const fileType = body.fileType;
  const fileSize = body.fileSize;
  if (typeof fileName !== 'string' || !fileName) {
    return { ok: false, error: 'fileName is required' };
  }
  if (typeof fileType !== 'string' || !fileType) {
    return { ok: false, error: 'fileType is required' };
  }
  if (typeof fileSize !== 'number') {
    return { ok: false, error: 'fileSize must be a number' };
  }

  const applicationIdRaw =
    typeof body.applicationId === 'string' ? body.applicationId.trim() : '';
  const nameCn = typeof body.nameCn === 'string' ? body.nameCn.trim() || null : null;
  const notes = typeof body.notes === 'string' ? body.notes.trim() || null : null;

  return {
    ok: true,
    value: {
      studentId,
      applicationId: applicationIdRaw || null,
      name,
      nameCn,
      category,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      notes,
    },
  };
}