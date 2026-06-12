/**
 * partner-doc-mapper.ts
 *
 * Closed-set taxonomies + DB-row ↔ UI-shape mappers for the partner
 * portal's document management.
 *
 * Mirrors the structure of partner-application-mapper.ts but kept
 * in its own file because the partner_documents surface (upload,
 * list, review) has different concerns than partner_applications
 * (intake form, status workflow). The closed-set constants are
 * deliberately kept here (not pushed into partner-application-mapper)
 * so the document mappers have a single import surface.
 *
 * Categories mirror the student-side `student_documents.category`
 * closed enum (student-data.ts + the student POST route) so partner
 * + student docs share the same admin review vocabulary. The status
 * set matches the admin-side /api/admin/documents allow-list so the
 * admin review queue can move partner-uploaded docs through the
 * same Verified/Rejected workflow without translation.
 */

export const PARTNER_DOC_CATEGORIES = [
  'Identity',
  'Academic',
  'Language',
  'Financial',
  'Recommendation',
  'Other',
] as const;
export type PartnerDocCategory = (typeof PARTNER_DOC_CATEGORIES)[number];

export const PARTNER_DOC_STATUSES = ['Pending', 'Verified', 'Rejected'] as const;
export type PartnerDocStatus = (typeof PARTNER_DOC_STATUSES)[number];

export function parsePartnerDocCategory(input: unknown): PartnerDocCategory | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_DOC_CATEGORIES as readonly string[]).includes(input)) {
    return input as PartnerDocCategory;
  }
  return null;
}

export function parsePartnerDocStatus(input: unknown): PartnerDocStatus | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_DOC_STATUSES as readonly string[]).includes(input)) {
    return input as PartnerDocStatus;
  }
  return null;
}

/**
 * Row shape as returned by Supabase (snake_case + joined relations).
 * Used as the input to `mapPartnerDocumentFromDb`.
 *
 * The optional `partner_student` and `partner_application` fields
 * are added by the partner documents GET route when it joins the
 * two related tables in a batched query — saves the UI from N+1
 * round-trips when rendering the list / detail page.
 */
export interface RawPartnerDocument {
  id: string;
  partner_student_id: string | null;
  partner_application_id: string | null;
  document_type_id: string;
  name: string;
  name_cn?: string | null;
  category: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  status: string;
  notes: string | null;
  rejection_reason: string | null;
  uploaded_at: string;
  verified_at: string | null;
  verified_by: string | null;
  // Joined by GET — optional, present only when the route hydrates
  // them. Single object per row (Supabase infers 1:1 from the FK).
  partner_student?: {
    id: string;
    student_name?: string | null;
    student_email?: string | null;
  } | null;
  partner_application?: {
    id: string;
    university?: string | null;
    program?: string | null;
  } | null;
}

/**
 * UI-facing shape (camelCase) for a partner document row. Returned
 * to the partner portal so the components never have to think
 * about snake_case.
 */
export interface PartnerDocument {
  id: string;
  partnerStudentId: string | null;
  partnerApplicationId: string | null;
  documentTypeId: string;
  name: string;
  nameCn: string | null;
  category: PartnerDocCategory;
  fileUrl: string;
  fileName: string | null;
  fileType: string | null;
  fileSize: number | null;
  status: PartnerDocStatus;
  notes: string | null;
  rejectionReason: string | null;
  uploadedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  // Joined metadata (null when the GET route didn't hydrate them).
  partnerStudent: { id: string; name: string | null; email: string | null } | null;
  partnerApplication: { id: string; university: string | null; program: string | null } | null;
}

/**
 * Coerce a raw Supabase row into the camelCase UI shape. Defensive
 * against unknown category strings (a future admin could push a new
 * value via direct SQL) — falls back to 'Other' rather than dropping
 * the row, so the partner at least sees the doc.
 *
 * Status is also coerced: an unknown value falls back to 'Pending'
 * so the UI can render a status badge without crashing.
 */
export function mapPartnerDocumentFromDb(row: RawPartnerDocument): PartnerDocument {
  return {
    id: row.id,
    partnerStudentId: row.partner_student_id ?? null,
    partnerApplicationId: row.partner_application_id ?? null,
    documentTypeId: row.document_type_id,
    name: row.name,
    nameCn: row.name_cn ?? null,
    category: parsePartnerDocCategory(row.category) ?? 'Other',
    fileUrl: row.file_url,
    fileName: row.file_name ?? null,
    fileType: row.file_type ?? null,
    fileSize: row.file_size ?? null,
    status: parsePartnerDocStatus(row.status) ?? 'Pending',
    notes: row.notes ?? null,
    rejectionReason: row.rejection_reason ?? null,
    uploadedAt: row.uploaded_at ?? '',
    verifiedAt: row.verified_at ?? null,
    verifiedBy: row.verified_by ?? null,
    partnerStudent: row.partner_student
      ? {
          id: row.partner_student.id,
          name: row.partner_student.student_name ?? null,
          email: row.partner_student.student_email ?? null,
        }
      : null,
    partnerApplication: row.partner_application
      ? {
          id: row.partner_application.id,
          university: row.partner_application.university ?? null,
          program: row.partner_application.program ?? null,
        }
      : null,
  };
}