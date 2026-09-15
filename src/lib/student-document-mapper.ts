import type { DocumentCategory, DocumentStatus } from '@/lib/student-data';

/**
 * Phase 95: shared mapper for the student wizard's document pipeline.
 *
 * GET /api/student/documents returns raw student_documents rows
 * (snake_case DB columns), but the application wizard's state and
 * matching logic are camelCase — `sd.documentTypeId` was always
 * `undefined`, so uploaded docs never matched the step-2 checklist,
 * the auto-sync counter stayed at 0, and selectedDocsReady blocked
 * Submit forever. Map the rows once on fetch with mapStudentDocumentRow.
 *
 * The same pipeline had a category bug: data.ts DocumentType.category
 * uses 'Student Basic' | 'Academic' | 'Application Specific' while the
 * POST endpoint only accepts 'Identity' | 'Academic' | 'Language' |
 * 'Financial' | 'Recommendation' | 'Other' — the old mapper was a
 * blind cast, so every non-Academic upload 400'd. mapDocCategoryToStudentCategory
 * now translates explicitly.
 *
 * And a status subtlety: the finalize route writes 'Pending' (never
 * 'Uploaded'), but the wizard's readiness gates only accepted
 * 'Uploaded' | 'Verified' — so Submit stayed blocked even for
 * successfully uploaded docs. isDocumentUsable() is the single
 * definition of "this doc counts as uploaded": Pending, Uploaded
 * (legacy rows), or Verified.
 */

/** Raw row shape returned by GET /api/student/documents (select *). */
export interface StudentDocumentDbRow {
  id: string;
  student_id?: string | null;
  document_type_id?: string | null;
  name?: string | null;
  name_cn?: string | null;
  category?: string | null;
  status?: string | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  application_id?: string | null;
  rejection_reason?: string | null;
  notes?: string | null;
  uploaded_at?: string | null;
}

/** camelCase view the wizard consumes. */
export interface StudentDocumentView {
  id: string;
  studentId: string;
  documentTypeId: string;
  name: string;
  status: DocumentStatus;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  applicationId: string | null;
  rejectionReason: string | null;
  uploadedAt: string | null;
}

const VALID_STATUSES: DocumentStatus[] = ['Pending', 'Uploaded', 'Verified', 'Rejected'];

function normalizeStatus(status: unknown): DocumentStatus {
  return VALID_STATUSES.includes(status as DocumentStatus)
    ? (status as DocumentStatus)
    : 'Pending';
}

export function mapStudentDocumentRow(row: StudentDocumentDbRow): StudentDocumentView {
  return {
    id: String(row.id),
    studentId: String(row.student_id ?? ''),
    documentTypeId: String(row.document_type_id ?? ''),
    name: String(row.name ?? ''),
    status: normalizeStatus(row.status),
    fileName: String(row.file_name ?? ''),
    fileUrl: String(row.file_url ?? ''),
    fileSize: typeof row.file_size === 'number' ? row.file_size : null,
    applicationId: row.application_id ? String(row.application_id) : null,
    rejectionReason: row.rejection_reason ? String(row.rejection_reason) : null,
    uploadedAt: row.uploaded_at ? String(row.uploaded_at) : null,
  };
}

/**
 * data.ts DocumentType.category → the student-documents API category
 * union. Unknown values fall through to 'Other' so an admin-added doc
 * type can never hard-fail the upload with a 400.
 */
const DOC_CATEGORY_TO_API: Record<string, DocumentCategory> = {
  'Student Basic': 'Identity',
  Academic: 'Academic',
  'Application Specific': 'Other',
};

export function mapDocCategoryToStudentCategory(category: string): DocumentCategory {
  return DOC_CATEGORY_TO_API[category] ?? 'Other';
}

/**
 * "This doc counts as uploaded" for the wizard's readiness gates.
 * 'Pending' is what the upload finalize route writes; 'Uploaded' is a
 * legacy status some rows may carry; 'Verified' is admin-approved.
 * 'Rejected' docs do NOT count — the student must re-upload.
 */
export function isDocumentUsable(status: string | null | undefined): boolean {
  return status === 'Pending' || status === 'Uploaded' || status === 'Verified';
}
