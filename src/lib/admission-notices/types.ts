/**
 * admission-notices/types.ts
 *
 * TypeScript types for the admission_notices feature (Phase 51).
 * Kept in a separate file so the mapper, storage, and API routes
 * share the same shape without circular imports.
 */

/** Allowed degree values. Closed set — must match the filter chip
 *  options in the public page + admin form. */
export const ADMISSION_DEGREES = [
  'Bachelor',
  'Master',
  'PhD',
  'Language',
  'Pre-University',
] as const;
export type AdmissionDegree = (typeof ADMISSION_DEGREES)[number];

/** Closed taxonomy parser. Returns null on unknown input (Phase 47
 *  pattern: a typo on either side fails fast). */
export function parseAdmissionDegree(input: unknown): AdmissionDegree | null {
  if (typeof input !== 'string') return null;
  if ((ADMISSION_DEGREES as readonly string[]).includes(input)) {
    return input as AdmissionDegree;
  }
  return null;
}

/** UI shape (camelCase) — what the page components consume. */
export interface AdmissionNotice {
  id: string;
  studentName: string;
  universityName: string;
  program: string | null;
  degree: AdmissionDegree | null;
  intake: string | null;
  scholarship: string | null;
  country: string | null;
  /** Path to the public/watermarked image in the storage bucket
   *  (relative to the `admission-notices` bucket, includes the
   *  `public/` prefix). */
  imagePath: string;
  /** Path to the private original (admin-only). */
  originalPath: string;
  isPublished: boolean;
  displayOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/** DB row shape (snake_case) — what `supabase.from('admission_notices').select('*')` returns. */
export interface RawAdmissionNotice {
  id: string;
  student_name: string;
  university_name: string;
  program?: string | null;
  degree?: string | null;
  intake?: string | null;
  scholarship?: string | null;
  country?: string | null;
  image_path: string;
  original_path: string;
  is_published: boolean;
  display_order: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

/** Upload + create payload (what the admin form POSTs to
 *  /api/admin/admission-notices, after the image is already
 *  uploaded via /api/admin/admission-notices/upload). */
export interface CreateAdmissionNoticePayload {
  studentName: string;
  universityName: string;
  program?: string | null;
  degree?: AdmissionDegree | null;
  intake?: string | null;
  scholarship?: string | null;
  country?: string | null;
  imagePath: string;
  originalPath: string;
  isPublished?: boolean;
  displayOrder?: number;
}

/** PATCH payload — every field optional. */
export interface UpdateAdmissionNoticePayload {
  studentName?: string;
  universityName?: string;
  program?: string | null;
  degree?: AdmissionDegree | null;
  intake?: string | null;
  scholarship?: string | null;
  country?: string | null;
  imagePath?: string;
  originalPath?: string;
  isPublished?: boolean;
  displayOrder?: number;
}
