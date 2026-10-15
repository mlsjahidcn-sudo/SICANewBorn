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
  // Phase 181: visa-critical fields. Real columns, not `extra` — these
  // feed a guarantor declaration and a visa-category decision, so they
  // must be queryable and reportable.
  chineseName?: string | null;
  placeOfBirth?: string | null;
  maritalStatus?: string | null;
  permanentAddress?: string | null;
  postalCode?: string | null;
  hasStudiedInChina?: string | null;
  fundingSource?: string | null;
  sponsorName?: string | null;
  sponsorRelationship?: string | null;
  sponsorOccupation?: string | null;
  sponsorPhone?: string | null;
  sponsorEmail?: string | null;
  sponsorAnnualIncome?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;
  fatherName?: string | null;
  fatherNationality?: string | null;
  fatherOccupation?: string | null;
  fatherPhone?: string | null;
  motherName?: string | null;
  motherNationality?: string | null;
  motherOccupation?: string | null;
  motherPhone?: string | null;

  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: string;
  /** Phase 125: student_profiles.passport_number (fixed column). Falls
   * back to the `extra.passportNumber` copy the admin offline form used
   * to write before this became a first-class field. */
  passportNumber: string;
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
  // Phase 136b: newest successful email send (email_log, test sends
  // excluded) — populated by the list endpoint for the
  // "✓ Email sent <date>" chip. Undefined elsewhere.
  lastEmailSentAt?: string | null;
  // Phase 145: payment aggregate across every student_fees row
  // where student_id is this student. The list endpoint fills this
  // in one round-trip; the single-student GET doesn't. The page
  // renders "Outstanding ¥X · Paid ¥Y" in the new Payment column.
  payment?: {
    status: 'paid' | 'partial' | 'unpaid' | 'overdue' | 'none';
    totalByCurrency: Record<string, number>;
    paidByCurrency: Record<string, number>;
    outstandingByCurrency: Record<string, number>;
    feeCount: number;
    lastPaidAt: string | null;
  };
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
    // Phase 125: the real fixed column is written by the student
    // self-profile page + the signup trigger. The admin offline form
    // historically landed its input in `extra.passportNumber` instead,
    // so fall back to that for rows created before the column write.
    passportNumber:
      (row.passport_number as string) ||
      (typeof extra.passportNumber === 'string' ? extra.passportNumber : '') ||
      '',
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
    // Phase 181: visa-critical columns. Read the column first, then
    // fall back to `extra` so a row written before the migration still
    // surfaces whatever a previous version happened to stash there.
    chineseName: (row.chinese_name as string | null) ?? ((extra.chineseName as string | null) ?? null),
    placeOfBirth: (row.place_of_birth as string | null) ?? ((extra.placeOfBirth as string | null) ?? null),
    maritalStatus: (row.marital_status as string | null) ?? ((extra.maritalStatus as string | null) ?? null),
    permanentAddress: (row.permanent_address as string | null) ?? ((extra.permanentAddress as string | null) ?? null),
    postalCode: (row.postal_code as string | null) ?? ((extra.postalCode as string | null) ?? null),
    hasStudiedInChina: (row.has_studied_in_china as string | null) ?? ((extra.hasStudiedInChina as string | null) ?? null),
    fundingSource: (row.funding_source as string | null) ?? ((extra.fundingSource as string | null) ?? null),
    sponsorName: (row.sponsor_name as string | null) ?? ((extra.sponsorName as string | null) ?? null),
    sponsorRelationship: (row.sponsor_relationship as string | null) ?? ((extra.sponsorRelationship as string | null) ?? null),
    sponsorOccupation: (row.sponsor_occupation as string | null) ?? ((extra.sponsorOccupation as string | null) ?? null),
    sponsorPhone: (row.sponsor_phone as string | null) ?? ((extra.sponsorPhone as string | null) ?? null),
    sponsorEmail: (row.sponsor_email as string | null) ?? ((extra.sponsorEmail as string | null) ?? null),
    sponsorAnnualIncome: (row.sponsor_annual_income as string | null) ?? ((extra.sponsorAnnualIncome as string | null) ?? null),
    emergencyContactName: (row.emergency_contact_name as string | null) ?? ((extra.emergencyContactName as string | null) ?? null),
    emergencyContactRelationship: (row.emergency_contact_relationship as string | null) ?? ((extra.emergencyContactRelationship as string | null) ?? null),
    emergencyContactPhone: (row.emergency_contact_phone as string | null) ?? ((extra.emergencyContactPhone as string | null) ?? null),
    emergencyContactEmail: (row.emergency_contact_email as string | null) ?? ((extra.emergencyContactEmail as string | null) ?? null),
    fatherName: (row.father_name as string | null) ?? ((extra.fatherName as string | null) ?? null),
    fatherNationality: (row.father_nationality as string | null) ?? ((extra.fatherNationality as string | null) ?? null),
    fatherOccupation: (row.father_occupation as string | null) ?? ((extra.fatherOccupation as string | null) ?? null),
    fatherPhone: (row.father_phone as string | null) ?? ((extra.fatherPhone as string | null) ?? null),
    motherName: (row.mother_name as string | null) ?? ((extra.motherName as string | null) ?? null),
    motherNationality: (row.mother_nationality as string | null) ?? ((extra.motherNationality as string | null) ?? null),
    motherOccupation: (row.mother_occupation as string | null) ?? ((extra.motherOccupation as string | null) ?? null),
    motherPhone: (row.mother_phone as string | null) ?? ((extra.motherPhone as string | null) ?? null),

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
  // Phase 125: write the real fixed column (the offline form now sends
  // this through FIXED_FIELDS instead of the extra JSONB blob).
  if (input.passportNumber !== undefined) dbRow.passport_number = input.passportNumber;
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

  // Phase 181: visa-critical fields are real columns. Writing them to
  // `extra` would store them but make them unqueryable — which is how
  // passportIssueDate ended up invisible to every report.
  if (input.chineseName !== undefined) dbRow.chinese_name = input.chineseName;
  if (input.placeOfBirth !== undefined) dbRow.place_of_birth = input.placeOfBirth;
  if (input.maritalStatus !== undefined) dbRow.marital_status = input.maritalStatus;
  if (input.permanentAddress !== undefined) dbRow.permanent_address = input.permanentAddress;
  if (input.postalCode !== undefined) dbRow.postal_code = input.postalCode;
  if (input.hasStudiedInChina !== undefined) dbRow.has_studied_in_china = input.hasStudiedInChina;
  if (input.fundingSource !== undefined) dbRow.funding_source = input.fundingSource;
  if (input.sponsorName !== undefined) dbRow.sponsor_name = input.sponsorName;
  if (input.sponsorRelationship !== undefined) dbRow.sponsor_relationship = input.sponsorRelationship;
  if (input.sponsorOccupation !== undefined) dbRow.sponsor_occupation = input.sponsorOccupation;
  if (input.sponsorPhone !== undefined) dbRow.sponsor_phone = input.sponsorPhone;
  if (input.sponsorEmail !== undefined) dbRow.sponsor_email = input.sponsorEmail;
  if (input.sponsorAnnualIncome !== undefined) dbRow.sponsor_annual_income = input.sponsorAnnualIncome;
  if (input.emergencyContactName !== undefined) dbRow.emergency_contact_name = input.emergencyContactName;
  if (input.emergencyContactRelationship !== undefined) dbRow.emergency_contact_relationship = input.emergencyContactRelationship;
  if (input.emergencyContactPhone !== undefined) dbRow.emergency_contact_phone = input.emergencyContactPhone;
  if (input.emergencyContactEmail !== undefined) dbRow.emergency_contact_email = input.emergencyContactEmail;
  if (input.fatherName !== undefined) dbRow.father_name = input.fatherName;
  if (input.fatherNationality !== undefined) dbRow.father_nationality = input.fatherNationality;
  if (input.fatherOccupation !== undefined) dbRow.father_occupation = input.fatherOccupation;
  if (input.fatherPhone !== undefined) dbRow.father_phone = input.fatherPhone;
  if (input.motherName !== undefined) dbRow.mother_name = input.motherName;
  if (input.motherNationality !== undefined) dbRow.mother_nationality = input.motherNationality;
  if (input.motherOccupation !== undefined) dbRow.mother_occupation = input.motherOccupation;
  if (input.motherPhone !== undefined) dbRow.mother_phone = input.motherPhone;

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
