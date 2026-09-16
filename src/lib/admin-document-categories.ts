/**
 * admin-document-categories.ts
 *
 * Centralized closed-set for student_documents.category (Phase 109
 * Batch 1). Mirrors src/lib/partner-doc-mapper.ts:6-11 (PARTNER_DOC_CATEGORIES)
 * — same6-value taxonomy so admin-uploaded and partner-uploaded docs can be
 * filtered / grouped consistently across the admin document review queue,
 * the new wizard upload dialog, and the detail-page Documents tab.
 */

export const STUDENT_DOC_CATEGORIES = [
  'Passport',
  'Transcript',
  'Diploma',
  'Language Test',
  'Recommendation',
  'Other',
] as const;
export type StudentDocCategory = (typeof STUDENT_DOC_CATEGORIES)[number];

export function parseStudentDocCategory(input: unknown): StudentDocCategory | null {
  if (typeof input !== 'string') return null;
  if ((STUDENT_DOC_CATEGORIES as readonly string[]).includes(input)) {
    return input as StudentDocCategory;
  }
  return null;
}