/**
 * partner-application-mapper.ts
 *
 * Maps between the camelCase shape the partner portal UI uses and the
 * snake_case `partner_applications` DB table.
 *
 *   UI (camelCase)                    DB (snake_case)
 *   ────────────────────              ──────────────────
 *   id                       ↔        id
 *   partnerId                ↔        partner_id
 *   studentName              ↔        student_name
 *   studentEmail             ↔        student_email
 *   studentPhone             ↔        student_phone
 *   university               ↔        university
 *   program                  ↔        program
 *   intake                   ↔        intake
 *   degree                   ↔        degree
 *   nationality              ↔        nationality
 *   priority                 ↔        priority
 *   applicationNumber        ↔        application_number
 *   status                   ↔        status
 *   submittedAt              ↔        submitted_at
 *   decision                 ↔        decision
 *   notes                    ↔        notes
 *   dateOfBirth              ↔        date_of_birth
 *   gender                   ↔        gender
 *   maritalStatus            ↔        marital_status
 *   placeOfBirth             ↔        place_of_birth
 *   currentAddress           ↔        current_address
 *   passportNumber           ↔        passport_number
 *   passportIssueDate        ↔        passport_issue_date
 *   passportExpiryDate       ↔        passport_expiry_date
 *   emergencyContactName     ↔        emergency_contact_name
 *   emergencyContactRelationship ↔    emergency_contact_relationship
 *   emergencyContactPhone    ↔        emergency_contact_phone
 *   emergencyContactEmail    ↔        emergency_contact_email
 *   highestEducation         ↔        highest_education
 *   schoolName               ↔        school_name
 *   schoolCountry            ↔        school_country
 *   major                    ↔        major
 *   graduationYear           ↔        graduation_year
 *   gpa                      ↔        gpa
 *   classRank                ↔        class_rank
 *   nativeLanguage           ↔        native_language
 *   englishTest              ↔        english_test
 *   englishScore             ↔        english_score
 *   hskLevel                 ↔        hsk_level
 *   hskScore                 ↔        hsk_score
 *   hasStudiedInChina        ↔        has_studied_in_china
 *   hasAppliedChinaUni       ↔        has_applied_china_uni
 *
 *   (S26 funding + personal-statement columns are no longer
 *   written by the form, but the read-side mapper still surfaces
 *   them for any existing data.)
 *   createdAt                ↔        created_at
 *   updatedAt                ↔        updated_at
 *   createdByUserId          ↔        created_by_user_id
 *   createdByEmail           ↔        created_by_email  (joined)
 *
 * The status set mirrors `student_applications` so admin + partner can
 * speak the same vocabulary: Draft | Submitted | In Review | Accepted
 * | Rejected | Withdrawn. (Partner usually only uses Draft, Submitted,
 * Accepted, Rejected in practice.)
 */

export const PARTNER_APPLICATION_STATUSES = [
  'Draft',
  'Submitted',
  'In Review',
  'Accepted',
  'Rejected',
  'Withdrawn',
] as const;
export type PartnerApplicationStatus = (typeof PARTNER_APPLICATION_STATUSES)[number];

export const PARTNER_APPLICATION_DECISIONS = [
  'Pending',
  'Accepted',
  'Rejected',
  'Waitlisted',
  'Deferred',
] as const;
export type PartnerApplicationDecision = (typeof PARTNER_APPLICATION_DECISIONS)[number];

export const PARTNER_APPLICATION_PRIORITIES = [
  'Low',
  'Normal',
  'High',
  'Urgent',
] as const;
export type PartnerApplicationPriority = (typeof PARTNER_APPLICATION_PRIORITIES)[number];

export const PARTNER_APPLICATION_DEGREES = [
  'Bachelor',
  'Master',
  'PhD',
  'Chinese Language',
] as const;
export type PartnerApplicationDegree = (typeof PARTNER_APPLICATION_DEGREES)[number];

// S26 — closed taxonomies for the new identity / academic / language /
// funding / personal-statement fields. Keeping these as readonly arrays
// + a string-literal union means the form <Select> can iterate the
// options and TypeScript will catch typos in the mapper.
export const GENDERS = ['Male', 'Female', 'Other'] as const;
export type Gender = (typeof GENDERS)[number];

export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
export type MaritalStatus = (typeof MARITAL_STATUSES)[number];

export const HIGHEST_EDUCATIONS = [
  'High School',
  'Diploma',
  'Bachelor',
  'Master',
  'PhD',
] as const;
export type HighestEducation = (typeof HIGHEST_EDUCATIONS)[number];

export const ENGLISH_TESTS = ['TOEFL', 'IELTS', 'PTE', 'Duolingo', 'None'] as const;
export type EnglishTest = (typeof ENGLISH_TESTS)[number];

export const HSK_LEVELS = ['None', '1', '2', '3', '4', '5', '6'] as const;
export type HskLevel = (typeof HSK_LEVELS)[number];

export const FUNDING_SOURCES = [
  'Self',
  'Parents',
  'Scholarship',
  'Sponsor',
  'Government',
] as const;
export type FundingSource = (typeof FUNDING_SOURCES)[number];

export const EMERGENCY_RELATIONSHIPS = [
  'Father',
  'Mother',
  'Sibling',
  'Spouse',
  'Friend',
  'Other',
] as const;
export type EmergencyRelationship = (typeof EMERGENCY_RELATIONSHIPS)[number];

/**
 * Phase 4 (security hardening): server-enforced allow-list for
 * partner-driven status transitions. Mirrors the student portal's
 * STUDENT_STATUS_TRANSITIONS table — every PATCH that touches `status`
 * is checked against this map, and a status that isn't reachable
 * from the current state returns HTTP 400.
 *
 * Rules:
 *   - Same → same is a no-op (UI sends them, server short-circuits)
 *   - Accepted is terminal for the partner — admin writes the final
 *     decision via the admin portal, not the partner portal
 *   - The partner can re-open Rejected / Withdrawn back to Draft
 *     (the original event is preserved on the row, just not the
 *     status)
 *   - The Submitted → Submitted / In Review / Draft / Withdrawn
 *     fan-out covers the most common "I'm still working on it" and
 *     "changed my mind" cases
 */
export const PARTNER_STATUS_TRANSITIONS: Record<PartnerApplicationStatus, readonly PartnerApplicationStatus[]> = {
  Draft: ['Draft', 'Submitted', 'Withdrawn'],
  Submitted: ['Submitted', 'In Review', 'Draft', 'Withdrawn'],
  'In Review': ['In Review', 'Accepted', 'Rejected', 'Withdrawn'],
  // Terminal from the partner's perspective — only re-open back to
  // Draft is allowed (admin re-decisioning happens elsewhere).
  Accepted: ['Accepted', 'Draft'],
  Rejected: ['Rejected', 'Draft'],
  Withdrawn: ['Withdrawn', 'Draft'],
};

export function isPartnerStatusTransitionAllowed(
  from: PartnerApplicationStatus,
  to: PartnerApplicationStatus,
): boolean {
  const allowed = PARTNER_STATUS_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export interface PartnerApplication {
  id: string;
  partnerId: string;
  // Phase 1.12: the FK to partner_students replaces the soft
  // studentName join. The name is still kept on the row for
  // display, but the canonical link is via studentId.
  studentId?: string | null;
  studentName: string;
  studentEmail?: string | null;
  studentPhone?: string | null;
  university: string;
  program: string;
  intake?: string | null;
  degree?: string | null;
  nationality?: string | null;
  priority: PartnerApplicationPriority;
  applicationNumber?: string | null;
  status: PartnerApplicationStatus;
  submittedAt?: string | null;
  decision: PartnerApplicationDecision;
  notes?: string | null;

  // S26 — extended application data
  dateOfBirth?: string | null;
  gender?: Gender | null;
  maritalStatus?: MaritalStatus | null;
  placeOfBirth?: string | null;
  currentAddress?: string | null;

  passportNumber?: string | null;
  passportIssueDate?: string | null;
  passportExpiryDate?: string | null;

  emergencyContactName?: string | null;
  emergencyContactRelationship?: EmergencyRelationship | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;

  highestEducation?: HighestEducation | null;
  schoolName?: string | null;
  schoolCountry?: string | null;
  major?: string | null;
  graduationYear?: number | null;
  gpa?: string | null;
  classRank?: string | null;

  nativeLanguage?: string | null;
  englishTest?: EnglishTest | null;
  englishScore?: string | null;
  hskLevel?: HskLevel | null;
  hskScore?: string | null;

  hasStudiedInChina?: boolean | null;
  hasAppliedChinaUni?: boolean | null;

  // S26 funding + personal-statement columns. The form no longer
  // writes these (Phase 51f), but the read-side surfaces them for
  // any existing data so the detail page still renders correctly.
  fundingSource?: FundingSource | null;
  scholarshipName?: string | null;
  whyProgram?: string | null;
  careerPlan?: string | null;

  createdAt: string;
  updatedAt: string;
  // Phase 3: who created this row
  createdByUserId?: string | null;
  createdByEmail?: string | null;
  // Phase 50b: soft-delete markers. NULL = active. Non-null =
  // archived at this time. Set via the DELETE handler which
  // PATCHes archived_at = NOW() instead of hard delete.
  archivedAt?: string | null;
  archivedByUserId?: string | null;
  // Phase A: link to the canonical student_profiles row.
  linkedStudentProfileId?: string | null;
}

// Type guard for the new closed-set fields. Returns the narrowed type
// if the input matches a known value, else null. The mapper uses these
// to defensively coerce unknown strings (e.g. from old data) into
// valid enum values.
function pickEnum<T extends string>(
  values: readonly T[],
  input: unknown,
): T | null {
  if (typeof input !== 'string') return null;
  return (values as readonly string[]).includes(input) ? (input as T) : null;
}

function pickEnumOrNull<T extends string>(
  values: readonly T[],
  input: unknown,
): T | null {
  if (input === null || input === undefined || input === '') return null;
  return pickEnum(values, input);
}

function dateToIso(input: unknown): string | null {
  if (!input) return null;
  // Accept ISO strings and YYYY-MM-DD
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    // Postgres DATE column accepts YYYY-MM-DD. If a full ISO datetime
    // sneaks in, slice off the date part so we don't store "2024-01-15T00:00:00Z"
    // into a date column.
    return /^\d{4}-\d{2}-\d{2}/.test(trimmed) ? trimmed.slice(0, 10) : null;
  }
  return null;
}

export function parsePartnerApplicationStatus(input: unknown): PartnerApplicationStatus | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_APPLICATION_STATUSES as readonly string[]).includes(input)) {
    return input as PartnerApplicationStatus;
  }
  return null;
}

export function parsePartnerApplicationDecision(input: unknown): PartnerApplicationDecision | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_APPLICATION_DECISIONS as readonly string[]).includes(input)) {
    return input as PartnerApplicationDecision;
  }
  return null;
}

export function parsePartnerApplicationPriority(input: unknown): PartnerApplicationPriority {
  if (typeof input !== 'string') return 'Normal';
  if ((PARTNER_APPLICATION_PRIORITIES as readonly string[]).includes(input)) {
    return input as PartnerApplicationPriority;
  }
  return 'Normal';
}

export function parsePartnerApplicationDegree(input: unknown): PartnerApplicationDegree | null {
  if (typeof input !== 'string') return null;
  if ((PARTNER_APPLICATION_DEGREES as readonly string[]).includes(input)) {
    return input as PartnerApplicationDegree;
  }
  return null;
}

interface RawPartnerApplication {
  id: string;
  partner_id: string;
  student_id?: string | null;
  student_name: string;
  student_email?: string | null;
  student_phone?: string | null;
  university: string;
  program: string;
  intake?: string | null;
  degree?: string | null;
  nationality?: string | null;
  priority?: string | null;
  application_number?: string | null;
  status?: string | null;
  submitted_at?: string | null;
  decision?: string | null;
  notes?: string | null;
  // Phase 50b: soft-delete markers
  archived_at?: string | null;
  archived_by_user_id?: string | null;
  // Phase A
  linked_student_profile_id?: string | null;
  // S26 extended
  date_of_birth?: string | null;
  gender?: string | null;
  marital_status?: string | null;
  place_of_birth?: string | null;
  current_address?: string | null;
  passport_number?: string | null;
  passport_issue_date?: string | null;
  passport_expiry_date?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relationship?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_email?: string | null;
  highest_education?: string | null;
  school_name?: string | null;
  school_country?: string | null;
  major?: string | null;
  graduation_year?: number | null;
  gpa?: string | null;
  class_rank?: string | null;
  native_language?: string | null;
  english_test?: string | null;
  english_score?: string | null;
  hsk_level?: string | null;
  hsk_score?: string | null;
  has_studied_in_china?: boolean | null;
  has_applied_china_uni?: boolean | null;
  funding_source?: string | null;
  scholarship_name?: string | null;
  why_program?: string | null;
  career_plan?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  created_by_user_id?: string | null;
  created_by_email?: string | null;
}

export function mapPartnerApplicationFromDb(row: RawPartnerApplication): PartnerApplication {
  return {
    id: row.id,
    partnerId: row.partner_id,
    studentId: row.student_id ?? null,
    studentName: row.student_name,
    studentEmail: row.student_email ?? null,
    studentPhone: row.student_phone ?? null,
    university: row.university ?? '',
    program: row.program ?? '',
    intake: row.intake ?? null,
    degree: row.degree ?? null,
    nationality: row.nationality ?? null,
    priority: parsePartnerApplicationPriority(row.priority),
    applicationNumber: row.application_number ?? null,
    status: parsePartnerApplicationStatus(row.status) ?? 'Draft',
    submittedAt: row.submitted_at ?? null,
    decision: parsePartnerApplicationDecision(row.decision) ?? 'Pending',
    notes: row.notes ?? null,

    // S26
    dateOfBirth: row.date_of_birth ?? null,
    gender: pickEnumOrNull(GENDERS, row.gender),
    maritalStatus: pickEnumOrNull(MARITAL_STATUSES, row.marital_status),
    placeOfBirth: row.place_of_birth ?? null,
    currentAddress: row.current_address ?? null,
    passportNumber: row.passport_number ?? null,
    passportIssueDate: row.passport_issue_date ?? null,
    passportExpiryDate: row.passport_expiry_date ?? null,
    emergencyContactName: row.emergency_contact_name ?? null,
    emergencyContactRelationship: pickEnumOrNull(
      EMERGENCY_RELATIONSHIPS,
      row.emergency_contact_relationship,
    ),
    emergencyContactPhone: row.emergency_contact_phone ?? null,
    emergencyContactEmail: row.emergency_contact_email ?? null,
    highestEducation: pickEnumOrNull(HIGHEST_EDUCATIONS, row.highest_education),
    schoolName: row.school_name ?? null,
    schoolCountry: row.school_country ?? null,
    major: row.major ?? null,
    graduationYear: row.graduation_year ?? null,
    gpa: row.gpa ?? null,
    classRank: row.class_rank ?? null,
    nativeLanguage: row.native_language ?? null,
    englishTest: pickEnumOrNull(ENGLISH_TESTS, row.english_test),
    englishScore: row.english_score ?? null,
    hskLevel: pickEnumOrNull(HSK_LEVELS, row.hsk_level),
    hskScore: row.hsk_score ?? null,
    hasStudiedInChina: row.has_studied_in_china ?? null,
    hasAppliedChinaUni: row.has_applied_china_uni ?? null,
    fundingSource: pickEnumOrNull(FUNDING_SOURCES, row.funding_source),
    scholarshipName: row.scholarship_name ?? null,
    whyProgram: row.why_program ?? null,
    careerPlan: row.career_plan ?? null,

    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
    createdByUserId: row.created_by_user_id ?? null,
    createdByEmail: row.created_by_email ?? null,
    archivedAt: row.archived_at ?? null,
    archivedByUserId: row.archived_by_user_id ?? null,
    linkedStudentProfileId: row.linked_student_profile_id ?? null,
  };
}

/**
 * Coerce an unknown value into a Postgres DATE-friendly string
 * (YYYY-MM-DD) or null. Used by the mapper for the date columns.
 */
function toDateString(input: unknown): string | null {
  if (input === null || input === undefined || input === '') return null;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;
    // Accept anything that starts with YYYY-MM-DD. The form sends
    // dates from <input type="date"> which always returns YYYY-MM-DD.
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
  }
  return null;
}

function toInt(input: unknown): number | null {
  if (input === null || input === undefined || input === '') return null;
  const n = typeof input === 'number' ? input : parseInt(String(input), 10);
  return Number.isFinite(n) ? n : null;
}

function toBool(input: unknown): boolean | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    const v = input.toLowerCase().trim();
    if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true;
    if (v === 'false' || v === '0' || v === 'no' || v === 'off') return false;
  }
  return null;
}

export function mapPartnerApplicationToDb(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  // Existing fields (S18)
  if (payload.studentId !== undefined) row.student_id = payload.studentId ? String(payload.studentId).trim() : null;
  if (payload.studentName !== undefined) row.student_name = String(payload.studentName).trim();
  if (payload.studentEmail !== undefined) row.student_email = payload.studentEmail || null;
  if (payload.studentPhone !== undefined) row.student_phone = payload.studentPhone || null;
  if (payload.university !== undefined) row.university = String(payload.university).trim();
  if (payload.program !== undefined) row.program = String(payload.program).trim();
  if (payload.intake !== undefined) row.intake = payload.intake || null;
  if (payload.degree !== undefined) {
    if (payload.degree && !parsePartnerApplicationDegree(payload.degree)) {
      throw new Error(
        `degree must be one of: ${PARTNER_APPLICATION_DEGREES.join(', ')}`,
      );
    }
    row.degree = payload.degree || null;
  }
  if (payload.nationality !== undefined) row.nationality = payload.nationality || null;
  if (payload.priority !== undefined) {
    const pri = parsePartnerApplicationPriority(payload.priority);
    row.priority = pri;
  }
  if (payload.applicationNumber !== undefined) {
    row.application_number = payload.applicationNumber || null;
  }
  if (payload.status !== undefined) row.status = payload.status;
  if (payload.submittedAt !== undefined) row.submitted_at = payload.submittedAt || null;
  if (payload.decision !== undefined) row.decision = payload.decision;
  if (payload.notes !== undefined) row.notes = payload.notes || null;
  if (payload.linkedStudentProfileId !== undefined) {
    // Intentionally NOT mapped: admin-only link, derived server-side
    // from the parent partner_students row. See partner-student-mapper.
  }

  // S26 — identity & contact
  if (payload.dateOfBirth !== undefined) row.date_of_birth = toDateString(payload.dateOfBirth);
  if (payload.gender !== undefined) {
    const g = pickEnumOrNull(GENDERS, payload.gender);
    if (payload.gender && !g) {
      throw new Error(`gender must be one of: ${GENDERS.join(', ')}`);
    }
    row.gender = g;
  }
  if (payload.maritalStatus !== undefined) {
    const m = pickEnumOrNull(MARITAL_STATUSES, payload.maritalStatus);
    if (payload.maritalStatus && !m) {
      throw new Error(`maritalStatus must be one of: ${MARITAL_STATUSES.join(', ')}`);
    }
    row.marital_status = m;
  }
  if (payload.placeOfBirth !== undefined) row.place_of_birth = payload.placeOfBirth || null;
  if (payload.currentAddress !== undefined) row.current_address = payload.currentAddress || null;

  // S26 — passport
  if (payload.passportNumber !== undefined) row.passport_number = payload.passportNumber || null;
  if (payload.passportIssueDate !== undefined) {
    row.passport_issue_date = toDateString(payload.passportIssueDate);
  }
  if (payload.passportExpiryDate !== undefined) {
    row.passport_expiry_date = toDateString(payload.passportExpiryDate);
  }

  // S26 — emergency contact
  if (payload.emergencyContactName !== undefined) {
    row.emergency_contact_name = payload.emergencyContactName || null;
  }
  if (payload.emergencyContactRelationship !== undefined) {
    const r = pickEnumOrNull(EMERGENCY_RELATIONSHIPS, payload.emergencyContactRelationship);
    if (payload.emergencyContactRelationship && !r) {
      throw new Error(
        `emergencyContactRelationship must be one of: ${EMERGENCY_RELATIONSHIPS.join(', ')}`,
      );
    }
    row.emergency_contact_relationship = r;
  }
  if (payload.emergencyContactPhone !== undefined) {
    row.emergency_contact_phone = payload.emergencyContactPhone || null;
  }
  if (payload.emergencyContactEmail !== undefined) {
    row.emergency_contact_email = payload.emergencyContactEmail || null;
  }

  // S26 — academic
  if (payload.highestEducation !== undefined) {
    const e = pickEnumOrNull(HIGHEST_EDUCATIONS, payload.highestEducation);
    if (payload.highestEducation && !e) {
      throw new Error(
        `highestEducation must be one of: ${HIGHEST_EDUCATIONS.join(', ')}`,
      );
    }
    row.highest_education = e;
  }
  if (payload.schoolName !== undefined) row.school_name = payload.schoolName || null;
  if (payload.schoolCountry !== undefined) row.school_country = payload.schoolCountry || null;
  if (payload.major !== undefined) row.major = payload.major || null;
  if (payload.graduationYear !== undefined) {
    const y = toInt(payload.graduationYear);
    if (y !== null && (y < 1950 || y > 2100)) {
      throw new Error('graduationYear must be between 1950 and 2100');
    }
    row.graduation_year = y;
  }
  if (payload.gpa !== undefined) row.gpa = payload.gpa || null;
  if (payload.classRank !== undefined) row.class_rank = payload.classRank || null;

  // S26 — language
  if (payload.nativeLanguage !== undefined) row.native_language = payload.nativeLanguage || null;
  if (payload.englishTest !== undefined) {
    const t = pickEnumOrNull(ENGLISH_TESTS, payload.englishTest);
    if (payload.englishTest && !t) {
      throw new Error(`englishTest must be one of: ${ENGLISH_TESTS.join(', ')}`);
    }
    row.english_test = t;
  }
  if (payload.englishScore !== undefined) row.english_score = payload.englishScore || null;
  if (payload.hskLevel !== undefined) {
    const h = pickEnumOrNull(HSK_LEVELS, payload.hskLevel);
    if (payload.hskLevel && !h) {
      throw new Error(`hskLevel must be one of: ${HSK_LEVELS.join(', ')}`);
    }
    row.hsk_level = h;
  }
  if (payload.hskScore !== undefined) row.hsk_score = payload.hskScore || null;

  // S26 — application context
  if (payload.hasStudiedInChina !== undefined) {
    row.has_studied_in_china = toBool(payload.hasStudiedInChina);
  }
  if (payload.hasAppliedChinaUni !== undefined) {
    row.has_applied_china_uni = toBool(payload.hasAppliedChinaUni);
  }

  return row;
}
