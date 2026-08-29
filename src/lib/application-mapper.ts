/**
 * Application mapper — converts between DB rows (snake_case) and the
 * `AdminApplication` shape (camelCase) used by the admin list + detail
 * pages.
 *
 * Mirrors the pattern of `student-mapper.ts` (S9).
 *
 * Two modes per row:
 *   - "linked"  : student_id is set, joined student record is present
 *   - "unlinked": student_id is null, applicant_* fields are present
 *
 * The list page and detail page use the SAME shape so the UI can
 * consume the data uniformly.
 */

/**
 * Phase 77: single source of truth for "what name should we show for
 * this student?". Falls through 3 tiers:
 *   1. first_name + last_name (trimmed) → "John Smith" / "John"
 *   2. applicant_name (admin-created, unlinked rows)
 *   3. email local-part ("jane.doe" from jane.doe@gmail.com)
 *   4. "—" (only when everything is empty)
 *
 * Exported so admin list / detail / partner pages share the same logic
 * instead of each writing its own trim+coalesce chain.
 */
export function deriveDisplayName(input: {
  studentFirstName?: string | null;
  studentLastName?: string | null;
  studentEmail?: string | null;
  applicantName?: string | null;
}): string {
  const first = (input.studentFirstName ?? '').trim();
  const last = (input.studentLastName ?? '').trim();
  if (first || last) return `${first} ${last}`.trim();
  const applicant = input.applicantName?.trim();
  if (applicant) return applicant;
  if (input.studentEmail) return input.studentEmail.split('@')[0];
  return '—';
}

/**
 * Convenience wrapper around `deriveDisplayName` for a `student_profiles`
 * row (no applicant_name). Used by /admin/applications/[id], the student
 * detail fullName header, and the student-tab Applications API.
 */
export function deriveStudentFullName(student: {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}): string {
  return deriveDisplayName({
    studentFirstName: student.first_name,
    studentLastName: student.last_name,
    studentEmail: student.email,
  });
}

export interface AdminApplication {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  isLinked: boolean;
  university: string;
  universityNameCn: string | null;
  program: string;
  programNameCn: string | null;
  degree: string;
  intake: string;
  status: string;
  // S28: 'Partner CRM' was added so the unified admin list
  // can distinguish a partner_applications row (the partner's
  // own pipeline) from a student_applications row where the
  // student's source='Partner'. Same 'Partner' tab in the UI
  // covers both.
  source: 'Admin' | 'Partner' | 'Online' | 'Partner CRM';
  // S28: the `surface` distinguishes the two underlying
  // tables so the page knows which detail URL to link to.
  surface: 'student' | 'partner';
  applicationNumber: string | null;
  createdAt: string;
  updatedAt: string;
  personalStatement: string | null;
  additionalNotes: string | null;
  adminNotes: string | null;
}

export type RawApp = {
  id: string;
  student_id: string | null;
  university_id: string;
  university_name: string;
  university_name_cn: string | null;
  program_id: string | null;
  program_name: string;
  program_name_cn: string | null;
  degree: string;
  degree_level: string | null;
  intake: string;
  status: string;
  priority: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  decision_date: string | null;
  decision: string | null;
  decision_letter_url: string | null;
  student_notes: string | null;
  personal_statement: string | null;
  additional_notes: string | null;
  admin_notes: string | null;
  application_number: string | null;
  applicant_name: string | null;
  applicant_email: string | null;
  applicant_phone: string | null;
  applicant_nationality: string | null;
  created_at: string;
  updated_at: string;
  student?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    source: string;
    status: string;
  } | null;
};

export function mapApplicationFromDb(row: RawApp): AdminApplication {
  const isLinked = !!row.student_id && !!row.student;
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: deriveDisplayName({
      studentFirstName: row.student?.first_name,
      studentLastName: row.student?.last_name,
      studentEmail: row.student?.email ?? row.applicant_email,
      applicantName: row.applicant_name,
    }),
    studentEmail: isLinked
      ? row.student!.email || ''
      : row.applicant_email || '',
    isLinked,
    university: row.university_name,
    universityNameCn: row.university_name_cn,
    program: row.program_name,
    programNameCn: row.program_name_cn,
    degree: row.degree,
    intake: row.intake,
    status: row.status,
    source: isLinked ? ((row.student!.source as 'Admin' | 'Partner' | 'Online') || 'Online') : 'Admin',
    // S28: surface marks this as a student_applications row
    // (vs. a partner_applications row, which the unified list
    // GET handler maps separately).
    surface: 'student',
    applicationNumber: row.application_number,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    personalStatement: row.personal_statement,
    additionalNotes: row.additional_notes,
    adminNotes: row.admin_notes,
  };
}

export const APPLICATION_SORTABLE_FIELDS = [
  'created_at',
  'updated_at',
  'intake',
  'status',
] as const;
export type ApplicationSortField = (typeof APPLICATION_SORTABLE_FIELDS)[number];

/**
 * Student-scoped application shape.
 *
 * Same as AdminApplication but without the fields the student doesn't
 * need to see (source, isLinked, applicant_*, admin_notes). Cleaner
 * UI payload, no risk of the student seeing internal data.
 */
export interface StudentApplication {
  id: string;
  applicationNumber: string | null;
  university: string;
  universityNameCn: string | null;
  program: string;
  programNameCn: string | null;
  degree: string;
  intake: string;
  status: string;
  personalStatement: string | null;
  additionalNotes: string | null;
  /**
   * Phase 1: admin leaves notes here via the admin PATCH and they
   * appear to the student as a "Note from SICA" banner on the detail
   * page. Intended to be a public-facing message from SICA — e.g.
   * "we need a clearer photo of your passport", "your application is
   * on hold until March", etc.
   */
  adminNotes: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function mapApplicationForStudent(row: RawApp): StudentApplication {
  return {
    id: row.id,
    applicationNumber: row.application_number,
    university: row.university_name,
    universityNameCn: row.university_name_cn,
    program: row.program_name,
    programNameCn: row.program_name_cn,
    degree: row.degree,
    intake: row.intake,
    status: row.status,
    personalStatement: row.personal_statement,
    additionalNotes: row.additional_notes,
    adminNotes: row.admin_notes,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * The 8 valid application statuses. Centralized so the UI, the
 * server-side validation, and the DB CHECK constraint all agree.
 */
export const APPLICATION_STATUSES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Documents Requested',
  'Decision Made',
  'Accepted',
  'Rejected',
  'Withdrawn',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function parseApplicationStatus(input: unknown): ApplicationStatus | null {
  return (APPLICATION_STATUSES as readonly string[]).includes(input as string)
    ? (input as ApplicationStatus)
    : null;
}
