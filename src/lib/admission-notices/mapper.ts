/**
 * admission-notices/mapper.ts
 *
 * Maps between the camelCase shape the UI uses and the snake_case
 * `admission_notices` DB table. Mirrors the `partner-student-mapper.ts`
 * and `partner-application-mapper.ts` pattern.
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                  ↔             id
 *   studentName         ↔             student_name
 *   universityName      ↔             university_name
 *   program             ↔             program
 *   degree              ↔             degree
 *   intake              ↔             intake
 *   scholarship         ↔             scholarship
 *   country             ↔             country
 *   imagePath           ↔             image_path
 *   originalPath        ↔             original_path
 *   isPublished         ↔             is_published
 *   displayOrder        ↔             display_order
 *   createdBy           ↔             created_by
 *   createdAt           ↔             created_at
 *   updatedAt           ↔             updated_at
 */

import {
  AdmissionNotice,
  CreateAdmissionNoticePayload,
  RawAdmissionNotice,
  UpdateAdmissionNoticePayload,
  parseAdmissionDegree,
} from './types';

export function mapAdmissionNoticeFromDb(
  row: RawAdmissionNotice,
): AdmissionNotice {
  // Validate degree through the closed taxonomy so a bad DB value
  // falls back to null (not garbage rendered to the user).
  const degree = parseAdmissionDegree(row.degree);
  return {
    id: row.id,
    studentName: row.student_name,
    universityName: row.university_name,
    program: row.program ?? null,
    degree,
    intake: row.intake ?? null,
    scholarship: row.scholarship ?? null,
    country: row.country ?? null,
    imagePath: row.image_path,
    originalPath: row.original_path,
    isPublished: row.is_published,
    displayOrder: row.display_order,
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Build a snake_case DB insert row from a camelCase POST payload.
 * Used by the admin create endpoint after the image has already
 * been uploaded (imagePath + originalPath are required).
 */
export function mapAdmissionNoticeInsertToDb(
  payload: CreateAdmissionNoticePayload,
  createdBy: string,
): Record<string, unknown> {
  return {
    student_name: payload.studentName.trim(),
    university_name: payload.universityName.trim(),
    program: payload.program?.trim() || null,
    degree: payload.degree || null,
    intake: payload.intake?.trim() || null,
    scholarship: payload.scholarship?.trim() || null,
    country: payload.country?.trim() || null,
    image_path: payload.imagePath,
    original_path: payload.originalPath,
    is_published: payload.isPublished ?? false,
    display_order: payload.displayOrder ?? 0,
    created_by: createdBy,
  };
}

/**
 * Build a snake_case DB update row from a camelCase PATCH payload.
 * Only includes fields that are explicitly provided. Server-derived
 * fields (created_by, created_at) are rejected at the API layer.
 */
export function mapAdmissionNoticeUpdateToDb(
  payload: UpdateAdmissionNoticePayload,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (payload.studentName !== undefined) {
    row.student_name = payload.studentName.trim();
  }
  if (payload.universityName !== undefined) {
    row.university_name = payload.universityName.trim();
  }
  if (payload.program !== undefined) {
    row.program = payload.program?.trim() || null;
  }
  if (payload.degree !== undefined) {
    row.degree = payload.degree || null;
  }
  if (payload.intake !== undefined) {
    row.intake = payload.intake?.trim() || null;
  }
  if (payload.scholarship !== undefined) {
    row.scholarship = payload.scholarship?.trim() || null;
  }
  if (payload.country !== undefined) {
    row.country = payload.country?.trim() || null;
  }
  if (payload.imagePath !== undefined) {
    row.image_path = payload.imagePath;
  }
  if (payload.originalPath !== undefined) {
    row.original_path = payload.originalPath;
  }
  if (payload.isPublished !== undefined) {
    row.is_published = payload.isPublished;
  }
  if (payload.displayOrder !== undefined) {
    row.display_order = payload.displayOrder;
  }
  return row;
}
