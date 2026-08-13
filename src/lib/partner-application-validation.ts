/**
 * partner-application-validation.ts
 *
 * Server-side field validation for partner portal application writes
 * (`/api/partner/applications` POST + `/api/partner/applications/[id]`
 * PATCH). Lives here as a single source of truth so the API and any
 * future server actions stay in sync.
 *
 * Phase A: created to fix the data-correctness bugs surfaced by the
 * partner portal audit (no format / no length / no date-order / no
 * enum checks on partner_applications writes).
 *
 * The helper returns a { field, message }[] array so the caller can
 * decide whether to return a 400 (single error) or 422 (collect all).
 * In practice we 400 on the first error — partner forms are short
 * and the partner only needs to know the next thing to fix.
 */

import {
  GENDERS,
  MARITAL_STATUSES,
  HIGHEST_EDUCATIONS,
  ENGLISH_TESTS,
  HSK_LEVELS,
  EMERGENCY_RELATIONSHIPS,
  PARTNER_APPLICATION_DEGREES,
  PARTNER_APPLICATION_PRIORITIES,
} from './partner-application-mapper';

// RFC 5322 lite — good enough to catch obvious typos like
// "gmial.com" / "foo@bar" without rejecting the long tail of
// valid RFC addresses. Mirrors the client-side check the partner
// application form uses (Phase 23 M9).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Postgres column limits (see migration-supabase-cloud.sql +
// 2026-06-05/06 partner_applications enrich migrations). TEXT
// columns get a practical 4000-char cap to keep rows readable.
export const PARTNER_APPLICATION_FIELD_LIMITS = {
  studentName: 255,
  university: 255,
  program: 255,
  studentEmail: 255,
  studentPhone: 50,
  nationality: 128,
  placeOfBirth: 128,
  currentAddress: 4000,
  passportNumber: 32,
  emergencyContactName: 128,
  emergencyContactRelationship: 64,
  emergencyContactPhone: 64,
  emergencyContactEmail: 255,
  schoolName: 255,
  schoolCountry: 128,
  major: 128,
  gpa: 16,
  classRank: 32,
  nativeLanguage: 64,
  englishScore: 16,
  hskScore: 16,
  intake: 64,
  notes: 4000,
  applicationNumber: 32,
} as const;

// Minimum notes length when a partner leaves university/program out
// of the catalog. This keeps the admin from receiving a blank request.
export const MIN_NOTES_WHEN_UNASSIGNED = 10;

export type PartnerApplicationFieldKey = keyof typeof PARTNER_APPLICATION_FIELD_LIMITS;

export interface PartnerApplicationValidationError {
  field: PartnerApplicationFieldKey | 'general';
  message: string;
}

function toTrimmedString(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
}

function isValidDateString(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return false;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return false;
  return d.toISOString().slice(0, 10) === trimmed;
}

function isValidEnum(value: unknown, allowed: readonly string[]): boolean {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value);
}

/**
 * Validate a partner_applications write payload (POST or PATCH).
 *
 * - For POST: pass `mode: 'create'`. studentName, university, and
 *   program are required.
 * - For PATCH: pass `mode: 'update'`. Required fields are only
 *   checked when they are present in the body, so single-field
 *   updates still work.
 *
 * Returns an empty array if the payload is valid.
 */
export function validatePartnerApplicationPayload(
  body: Record<string, unknown>,
  mode: 'create' | 'update',
): PartnerApplicationValidationError[] {
  const errors: PartnerApplicationValidationError[] = [];

  // Required core fields
  // Phase 54: university and program are no longer hard-required for
  // partner-created applications. A partner can leave them empty when
  // the target school/program is not in the catalog yet, but must
  // describe the desired option in notes so the admin can assign it
  // later. We still validate length when they are provided.
  const studentName = toTrimmedString(body.studentName);
  if (!studentName) {
    errors.push({ field: 'studentName', message: 'studentName is required' });
  } else if (studentName.length > PARTNER_APPLICATION_FIELD_LIMITS.studentName) {
    errors.push({
      field: 'studentName',
      message: `studentName must be at most ${PARTNER_APPLICATION_FIELD_LIMITS.studentName} characters`,
    });
  }

  const university = toTrimmedString(body.university);
  const program = toTrimmedString(body.program);

  if (mode === 'create' || body.university !== undefined) {
    if (university.length > PARTNER_APPLICATION_FIELD_LIMITS.university) {
      errors.push({
        field: 'university',
        message: `university must be at most ${PARTNER_APPLICATION_FIELD_LIMITS.university} characters`,
      });
    }
  }
  if (mode === 'create' || body.program !== undefined) {
    if (program.length > PARTNER_APPLICATION_FIELD_LIMITS.program) {
      errors.push({
        field: 'program',
        message: `program must be at most ${PARTNER_APPLICATION_FIELD_LIMITS.program} characters`,
      });
    }
  }

  // Phase 54: when either catalog field is empty, notes must describe
  // the desired school/program so the admin has something to assign.
  if (mode === 'create' && (!university || !program)) {
    const notes = toTrimmedString(body.notes);
    if (!notes) {
      errors.push({
        field: 'notes',
        message: 'notes is required when university or program is not selected from the catalog',
      });
    } else if (notes.length < MIN_NOTES_WHEN_UNASSIGNED) {
      errors.push({
        field: 'notes',
        message: `notes must be at least ${MIN_NOTES_WHEN_UNASSIGNED} characters when university or program is not selected`,
      });
    }
  }

  // Optional email fields
  for (const { key, label, max } of [
    { key: 'studentEmail', label: 'studentEmail', max: PARTNER_APPLICATION_FIELD_LIMITS.studentEmail },
    { key: 'emergencyContactEmail', label: 'emergencyContactEmail', max: PARTNER_APPLICATION_FIELD_LIMITS.emergencyContactEmail },
  ] as const) {
    if (!isPresent(body[key])) continue;
    const str = String(body[key]).trim();
    if (str.length > max) {
      errors.push({
        field: key as PartnerApplicationFieldKey,
        message: `${label} must be at most ${max} characters`,
      });
    } else if (!EMAIL_REGEX.test(str)) {
      errors.push({
        field: key as PartnerApplicationFieldKey,
        message: `${label} must be a valid email address (e.g. user@example.com)`,
      });
    }
  }

  // Optional plain string fields with length caps
  const stringFields: Array<{ key: PartnerApplicationFieldKey; label: string; max: number }> = [
    { key: 'studentPhone', label: 'studentPhone', max: PARTNER_APPLICATION_FIELD_LIMITS.studentPhone },
    { key: 'nationality', label: 'nationality', max: PARTNER_APPLICATION_FIELD_LIMITS.nationality },
    { key: 'placeOfBirth', label: 'placeOfBirth', max: PARTNER_APPLICATION_FIELD_LIMITS.placeOfBirth },
    { key: 'currentAddress', label: 'currentAddress', max: PARTNER_APPLICATION_FIELD_LIMITS.currentAddress },
    { key: 'passportNumber', label: 'passportNumber', max: PARTNER_APPLICATION_FIELD_LIMITS.passportNumber },
    { key: 'emergencyContactName', label: 'emergencyContactName', max: PARTNER_APPLICATION_FIELD_LIMITS.emergencyContactName },
    { key: 'emergencyContactPhone', label: 'emergencyContactPhone', max: PARTNER_APPLICATION_FIELD_LIMITS.emergencyContactPhone },
    { key: 'schoolName', label: 'schoolName', max: PARTNER_APPLICATION_FIELD_LIMITS.schoolName },
    { key: 'schoolCountry', label: 'schoolCountry', max: PARTNER_APPLICATION_FIELD_LIMITS.schoolCountry },
    { key: 'major', label: 'major', max: PARTNER_APPLICATION_FIELD_LIMITS.major },
    { key: 'gpa', label: 'gpa', max: PARTNER_APPLICATION_FIELD_LIMITS.gpa },
    { key: 'classRank', label: 'classRank', max: PARTNER_APPLICATION_FIELD_LIMITS.classRank },
    { key: 'nativeLanguage', label: 'nativeLanguage', max: PARTNER_APPLICATION_FIELD_LIMITS.nativeLanguage },
    { key: 'englishScore', label: 'englishScore', max: PARTNER_APPLICATION_FIELD_LIMITS.englishScore },
    { key: 'hskScore', label: 'hskScore', max: PARTNER_APPLICATION_FIELD_LIMITS.hskScore },
    { key: 'intake', label: 'intake', max: PARTNER_APPLICATION_FIELD_LIMITS.intake },
    { key: 'notes', label: 'notes', max: PARTNER_APPLICATION_FIELD_LIMITS.notes },
    { key: 'applicationNumber', label: 'applicationNumber', max: PARTNER_APPLICATION_FIELD_LIMITS.applicationNumber },
  ];
  for (const { key, label, max } of stringFields) {
    if (!isPresent(body[key])) continue;
    if (String(body[key]).length > max) {
      errors.push({ field: key, message: `${label} must be at most ${max} characters` });
    }
  }

  // Date fields
  if (isPresent(body.dateOfBirth) && !isValidDateString(body.dateOfBirth)) {
    errors.push({ field: 'general', message: 'dateOfBirth must be a valid date (YYYY-MM-DD)' });
  }
  if (isPresent(body.passportIssueDate) && !isValidDateString(body.passportIssueDate)) {
    errors.push({ field: 'general', message: 'passportIssueDate must be a valid date (YYYY-MM-DD)' });
  }
  if (isPresent(body.passportExpiryDate) && !isValidDateString(body.passportExpiryDate)) {
    errors.push({ field: 'general', message: 'passportExpiryDate must be a valid date (YYYY-MM-DD)' });
  }
  if (
    isValidDateString(body.passportIssueDate) &&
    isValidDateString(body.passportExpiryDate)
  ) {
    const issue = String(body.passportIssueDate);
    const expiry = String(body.passportExpiryDate);
    if (expiry < issue) {
      errors.push({
        field: 'general',
        message: 'passportExpiryDate must be on or after passportIssueDate',
      });
    }
  }

  // Closed-set enum fields
  if (isPresent(body.gender) && !isValidEnum(body.gender, GENDERS)) {
    errors.push({ field: 'general', message: `gender must be one of: ${GENDERS.join(', ')}` });
  }
  if (isPresent(body.maritalStatus) && !isValidEnum(body.maritalStatus, MARITAL_STATUSES)) {
    errors.push({
      field: 'general',
      message: `maritalStatus must be one of: ${MARITAL_STATUSES.join(', ')}`,
    });
  }
  if (
    isPresent(body.emergencyContactRelationship) &&
    !isValidEnum(body.emergencyContactRelationship, EMERGENCY_RELATIONSHIPS)
  ) {
    errors.push({
      field: 'general',
      message: `emergencyContactRelationship must be one of: ${EMERGENCY_RELATIONSHIPS.join(', ')}`,
    });
  }
  if (isPresent(body.highestEducation) && !isValidEnum(body.highestEducation, HIGHEST_EDUCATIONS)) {
    errors.push({
      field: 'general',
      message: `highestEducation must be one of: ${HIGHEST_EDUCATIONS.join(', ')}`,
    });
  }
  if (isPresent(body.englishTest) && !isValidEnum(body.englishTest, ENGLISH_TESTS)) {
    errors.push({
      field: 'general',
      message: `englishTest must be one of: ${ENGLISH_TESTS.join(', ')}`,
    });
  }
  if (isPresent(body.hskLevel) && !isValidEnum(body.hskLevel, HSK_LEVELS)) {
    errors.push({ field: 'general', message: `hskLevel must be one of: ${HSK_LEVELS.join(', ')}` });
  }
  if (isPresent(body.degree) && !isValidEnum(body.degree, PARTNER_APPLICATION_DEGREES)) {
    errors.push({
      field: 'general',
      message: `degree must be one of: ${PARTNER_APPLICATION_DEGREES.join(', ')}`,
    });
  }
  if (isPresent(body.priority) && !isValidEnum(body.priority, PARTNER_APPLICATION_PRIORITIES)) {
    errors.push({
      field: 'general',
      message: `priority must be one of: ${PARTNER_APPLICATION_PRIORITIES.join(', ')}`,
    });
  }

  // Numeric fields
  if (isPresent(body.graduationYear)) {
    const year = typeof body.graduationYear === 'number' ? body.graduationYear : parseInt(String(body.graduationYear), 10);
    if (!Number.isFinite(year) || year < 1950 || year > 2100) {
      errors.push({ field: 'general', message: 'graduationYear must be an integer between 1950 and 2100' });
    }
  }

  return errors;
}
