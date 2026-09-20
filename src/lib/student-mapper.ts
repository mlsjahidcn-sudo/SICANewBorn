/**
 * Student mapper — converts between DB rows (snake_case) and the
 * `AdminStudent` / student API shape (camelCase).
 *
 * Why a single source of truth: every admin/student/partner API route
 * that touches student_profiles should produce the SAME shape. If each
 * route wrote its own inline mapper, we'd get drift (one returns
 * `targetDegree`, another `target_degree`, etc.) and the UI would
 * crash on a missing key.
 *
 * Field allocation:
 *   - Fixed columns in `student_profiles` map 1:1 (with snake→camel).
 *   - Form fields that don't have a fixed column (HSK/IELTS/TOEFL,
 *     bachelor/master/whatsapp/gender/maritalStatus/address/city/
 *     country/etc.) live in the `extra` JSONB column and get spread
 *     back out at read time.
 *   - `isOffline` is DERIVED from `source` — never stored. An admin
 *     can't set a Student source to 'Online' and have isOffline=true.
 *   - `createdAt` / `updatedAt` come from DB timestamps.
 *   - IDs are always the student's auth.users.id (= student_profiles.id).
 *
 * Phase 77: `firstName` is guaranteed non-empty post-migration
 * (`database/2026-08-29_student_profile_name_not_null.sql` makes
 * student_profiles.first_name NOT NULL with DEFAULT ''). `lastName`
 * stays nullable in the DB (single-name cases) — we expose '' for
 * empty. `mapStudentName()` re-exports the shared display helper.
 */

export { deriveStudentFullName as mapStudentName } from './application-mapper';

// Re-export the AdminStudent shape from data.ts so we have a single type
// that both server and client agree on.
export interface AdminStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: string;
  gender?: string;
  targetDegree: string;
  targetField: string;
  targetIntake: string;
  /** Phase 88: student_profiles.preferred_universities TEXT[]. Was
   * previously silently dropped by the mapper — admin list/detail
   * rendered nothing. Now first-class on the AdminStudent shape. */
  preferredUniversities: string[];
  isOffline: boolean;
  source: 'Admin' | 'Partner' | 'Online';
  status: 'Active' | 'Inactive' | 'Pending' | 'Suspended';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Free-form fields (HSK/IELTS/TOEFL/bachelor/master/whatsapp/etc.)
  // Round-tripped through `extra` JSONB. Optional in the shape so old
  // rows (with empty extra) don't fail TypeScript checks.
  extra?: Record<string, unknown>;

  // Phase 89: passport issue/expiry dates — surfaced from `extra` JSONB.
  // No fixed columns (the DB schema doesn't have them) so they're
  // optional on the shape too.
  passportIssueDate?: string;
  passportExpiryDate?: string;

  // Phase 122a: total applications across both surfaces —
  // student_applications by student_id PLUS partner_applications by
  // the Phase A bridge column (linked_student_profile_id). Populated
  // by the list + export endpoints; undefined on single-student GETs
  // that don't need the count.
  applicationCount?: number | null;
}

export type AdminStudentStatus = AdminStudent['status'];
export type AdminStudentSource = AdminStudent['source'];

/**
 * Map a `student_profiles` row (snake_case + `extra` JSONB) to the
 * AdminStudent shape (camelCase + flattened extra fields).
 */
export function mapStudentFromDb(row: Record<string, unknown>): AdminStudent {
  const extra = (row.extra as Record<string, unknown> | null) || {};
  // Phase 88: read student_profiles.preferred_universities TEXT[].
  // The student portal signup + the partner-link endpoint both
  // populate this; the admin mapper used to drop it on read.
  const preferredRaw = row.preferred_universities as unknown;
  const preferredUniversities: string[] = Array.isArray(preferredRaw)
    ? preferredRaw.filter((v): v is string => typeof v === 'string')
    : [];
  return {
    id: row.id as string,
    firstName: (row.first_name as string) || '',
    lastName: (row.last_name as string) || '',
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    nationality: (row.nationality as string) || '',
    dateOfBirth: (row.date_of_birth as string) || '',
    gender: (extra.gender as string) || undefined,
    targetDegree: (row.target_degree as string) || '',
    targetField: (row.target_field as string) || '',
    targetIntake: (row.target_intake as string) || '',
    preferredUniversities,
    source: ((row.source as string) || 'Online') as AdminStudentSource,
    // isOffline is derived — admin-added students are offline, others online.
    isOffline: row.source === 'Admin',
    status: ((row.status as string) || 'Active') as AdminStudentStatus,
    notes: (extra.notes as string) || undefined,
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || new Date().toISOString(),
    extra,
    // Phase 89: passportIssueDate / passportExpiryDate live in the
    // `extra` JSONB blob. Surface them as top-level fields for the
    // detail page + edit form convenience.
    passportIssueDate: typeof extra.passportIssueDate === 'string'
      ? extra.passportIssueDate
      : undefined,
    passportExpiryDate: typeof extra.passportExpiryDate === 'string'
      ? extra.passportExpiryDate
      : undefined,
    applicationCount:
      typeof row.application_count === 'number' ? row.application_count : null,
  };
}

/**
 * Map an incoming API body (camelCase AdminStudent-ish) to a
 * `student_profiles` row (snake_case + `extra` JSONB for the
 * fields that don't have fixed columns).
 *
 * IMPORTANT: the `id` field is preserved as-is when present (edit
 * flow). For create flow, the caller passes email/password/source and
 * the route generates the auth.users id + student_profiles id and
 * passes them in.
 */
export function mapStudentToDb(input: Partial<AdminStudent>): {
  dbRow: Record<string, unknown>;
  extraUpdates: Record<string, unknown>;
} {
  // Fixed-column updates
  const dbRow: Record<string, unknown> = {};
  if (input.id !== undefined) dbRow.id = input.id;
  if (input.firstName !== undefined) dbRow.first_name = input.firstName;
  if (input.lastName !== undefined) dbRow.last_name = input.lastName;
  if (input.email !== undefined) dbRow.email = input.email;
  if (input.phone !== undefined) dbRow.phone = input.phone;
  if (input.nationality !== undefined) dbRow.nationality = input.nationality;
  if (input.dateOfBirth !== undefined) dbRow.date_of_birth = input.dateOfBirth;
  if (input.targetDegree !== undefined) dbRow.target_degree = input.targetDegree;
  if (input.targetField !== undefined) dbRow.target_field = input.targetField;
  if (input.targetIntake !== undefined) dbRow.target_intake = input.targetIntake;
  // Phase 88: write preferred_universities TEXT[] with defensive
  // normalization. The admin wizard submits an array of slugs/names;
  // strip empties + non-strings so the column doesn't accumulate
  // junk from the comma-separated form input.
  if (input.preferredUniversities !== undefined) {
    dbRow.preferred_universities = input.preferredUniversities
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  if (input.source !== undefined) dbRow.source = input.source;
  if (input.status !== undefined) dbRow.status = input.status;

  // Free-form fields go to `extra`
  const extraUpdates: Record<string, unknown> = {};
  if (input.gender !== undefined) extraUpdates.gender = input.gender;
  if (input.notes !== undefined) extraUpdates.notes = input.notes;
  // Phase 89: passport issue/expiry dates from OCR.
  if (input.passportIssueDate !== undefined) {
    extraUpdates.passportIssueDate = input.passportIssueDate;
  }
  if (input.passportExpiryDate !== undefined) {
    extraUpdates.passportExpiryDate = input.passportExpiryDate;
  }
  // Future fields (whatsapp, HSK, IELTS, bachelor, etc.) can be added
  // here as we add form fields to the new/edit pages. Keep this
  // surface tight and explicit — every field here is something the
  // UI persists.
  if (input.extra) Object.assign(extraUpdates, input.extra);

  return { dbRow, extraUpdates };
}

/**
 * Helper for the API: read list of students with the standard admin
 * filters (search, status, source) and pagination.
 *
 * Returned shape: { students, total, page, limit, totalPages }
 */
export const STUDENT_SORTABLE_FIELDS = [
  'created_at',
  'updated_at',
  'first_name',
  'last_name',
] as const;
export type StudentSortField = (typeof STUDENT_SORTABLE_FIELDS)[number];

/**
 * Validate a status string is one of the four allowed values.
 * Returns the typed value or null.
 */
export function parseStatus(input: unknown): AdminStudentStatus | null {
  const allowed: AdminStudentStatus[] = ['Active', 'Inactive', 'Pending', 'Suspended'];
  return allowed.includes(input as AdminStudentStatus) ? (input as AdminStudentStatus) : null;
}

export function parseSource(input: unknown): AdminStudentSource | null {
  const allowed: AdminStudentSource[] = ['Admin', 'Partner', 'Online'];
  return allowed.includes(input as AdminStudentSource) ? (input as AdminStudentSource) : null;
}
