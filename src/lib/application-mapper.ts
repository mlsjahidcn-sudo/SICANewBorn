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
  // Phase 125: passport number from the joined student_profiles row —
  // empty for unlinked (lead) rows. Lets admins verify identity on the
  // application without opening the student profile.
  studentPassportNumber: string;
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
  // Phase 107 Batch 4: lead attribution. Polymorphic — pair leadId with
  // leadType ('chat_lead' | 'student_assessment' | 'contact_submission').
  leadId: string | null;
  leadType: 'chat_lead' | 'student_assessment' | 'contact_submission' | null;
  // Phase 107 Batch 2: enrollment stage. Null until /enroll writes the
  // application_enrollments row + sets this timestamp.
  enrolledAt: string | null;
  decision: string | null;
  decisionDate: string | null;
  priority: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  // Phase 107 Batch 6: opt-out for internal timeline events.
  timelineVisibleToStudent: boolean;
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
  // Phase 107 — lead attribution + enrollment fields read off
  // student_applications when present (left as optional since
  // some callers — including the partner_admin route — may select
  // a narrower set).
  lead_id?: string | null;
  lead_type?: string | null;
  enrolled_at?: string | null;
  timeline_visible_to_student?: boolean;
  student?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    source: string;
    status: string;
    passport_number?: string | null;
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
    studentPassportNumber: isLinked ? row.student!.passport_number || '' : '',
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
    // Phase 107 — new fields. Polymorphic lead pair; empty when none.
    leadId: row.lead_id ?? null,
    leadType:
      (row.lead_type as AdminApplication['leadType']) ??
      (row.lead_id ? null : null),
    enrolledAt: row.enrolled_at ?? null,
    decision: row.decision,
    decisionDate: row.decision_date,
    priority: row.priority,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    timelineVisibleToStudent: row.timeline_visible_to_student ?? true,
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
  /**
   * Phase 97: the university slug (student_applications.university_id
   * stores the wizard's slug, not a UUID). Surfaced so the wizard's
   * ?resume= flow can restore the pickers directly — no name→slug
   * reverse matching against a possibly-unloaded catalog.
   */
  universityId: string;
  program: string;
  programNameCn: string | null;
  /** Phase 97: the program slug, same rationale as universityId. */
  programId: string | null;
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
  // Phase 107 — enrollment banner. Surfaced to the student so they
  // see a green "Enrolled" state on the detail page once the admin
  // has finalized the application.
  enrolledAt: string | null;
  // Phase 107 Batch 6: opt-out for internal timeline events. When
  // false the server suppresses application_timeline + stage_history
  // rows from the GET response. Defaults to true so existing rows
  // (where the column is NULL) stay visible.
  timelineVisibleToStudent: boolean;
}

export function mapApplicationForStudent(row: RawApp): StudentApplication {
  return {
    id: row.id,
    applicationNumber: row.application_number,
    university: row.university_name,
    universityNameCn: row.university_name_cn,
    universityId: row.university_id,
    program: row.program_name,
    programNameCn: row.program_name_cn,
    programId: row.program_id,
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
    enrolledAt: row.enrolled_at ?? null,
    timelineVisibleToStudent: row.timeline_visible_to_student ?? true,
  };
}

/**
 * Phase 97: fields every Submitted application must carry. POST has
 * always validated these, but PUT's Draft→Submitted (and Rejected→
 * Submitted resubmit) path didn't — a draft missing degree/intake
 * could be stamped submitted_at and shipped.
 *
 * Returns the missing field names (snake_case) — empty array = ready.
 */
export function missingSubmitFields(row: {
  university_name?: string | null;
  program_name?: string | null;
  degree?: string | null;
  intake?: string | null;
}): string[] {
  const missing: string[] = [];
  if (!row.university_name || !row.university_name.trim()) missing.push('university');
  if (!row.program_name || !row.program_name.trim()) missing.push('program');
  if (!row.degree || !row.degree.trim()) missing.push('degree');
  if (!row.intake || !row.intake.trim()) missing.push('intake');
  return missing;
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

/**
 * Phase 98: the single source of truth for which status transitions a
 * STUDENT may drive. The PUT route validates against this, and the
 * detail page derives its Withdraw/Resubmit buttons from it — the old
 * hand-written UI list allowed Withdraw on Under Review /
 * Documents Requested, which the server always rejected with a 400.
 *
 * Same-status entries are the no-op path. Terminal statuses map to
 * themselves only.
 */
export const STUDENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  Draft: ['Draft', 'Withdrawn'],
  Submitted: ['Submitted', 'Withdrawn'],
  'Documents Requested': ['Documents Requested', 'Under Review'],
  Rejected: ['Rejected', 'Submitted'],
  'Under Review': ['Under Review'],
  'Decision Made': ['Decision Made'],
  Accepted: ['Accepted'],
  Withdrawn: ['Withdrawn'],
};

export function parseApplicationStatus(input: unknown): ApplicationStatus | null {
  return (APPLICATION_STATUSES as readonly string[]).includes(input as string)
    ? (input as ApplicationStatus)
    : null;
}

// ----------------------------------------------------------------------------
// Phase 107 — lead attribution
// ----------------------------------------------------------------------------

/**
 * Polymorphic lead types that can be back-linked to a student_application.
 * Kept in sync with the student_applications_lead_type_check constraint
 * added in database/2026-09-17_phase107_applications_foundation.sql.
 */
export const STUDENT_LEAD_TYPES = [
  'chat_lead',
  'student_assessment',
  'contact_submission',
] as const;
export type StudentLeadType = (typeof STUDENT_LEAD_TYPES)[number];

export function parseStudentLeadType(input: unknown): StudentLeadType | null {
  return (STUDENT_LEAD_TYPES as readonly string[]).includes(input as string)
    ? (input as StudentLeadType)
    : null;
}

/**
 * Validates that an admin POST to /api/admin/applications has either a
 * studentId OR (applicantName + applicantEmail) — the existing lead
 * path. Phase 107 Batch 5 additionally accepts a (leadId, leadType) pair
 * as a stronger claim than the soft email match.
 */
export function leadAttributionIsValid(input: {
  studentId?: string | null;
  applicantName?: string | null;
  applicantEmail?: string | null;
  leadId?: string | null;
  leadType?: string | null;
}): { ok: true } | { ok: false; reason: string } {
  const hasStudent = !!input.studentId;
  const hasLeadPath =
    !!input.applicantName?.trim() && !!input.applicantEmail?.trim();
  if (!hasStudent && !hasLeadPath) {
    return {
      ok: false,
      reason: 'Either studentId or applicantName+applicantEmail is required',
    };
  }
  if (input.leadId && !input.leadType) {
    return { ok: false, reason: 'leadType is required when leadId is set' };
  }
  if (input.leadType && !parseStudentLeadType(input.leadType)) {
    return { ok: false, reason: `Unknown leadType: ${input.leadType}` };
  }
  return { ok: true };
}
