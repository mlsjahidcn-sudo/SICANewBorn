/**
 * partner-validation.ts
 *
 * Server-side field validation for partner portal writes
 * (`/api/partner/students` POST + PATCH). Lives here as a single
 * source of truth so the API and any future server actions stay
 * in sync.
 *
 * Phase 47: this file was created to fix the data-correctness bugs
 * surfaced by the partner portal audit (no format / no length / no
 * empty-required-field checks on partner_students writes).
 *
 *  - studentName: required, 1..200 chars
 *  - studentEmail: optional; if present must be a valid format
 *  - studentPhone: optional; max 50 chars (no format check — international
 *    numbers have too many legitimate spellings to be picky)
 *  - nationality: optional; max 100 chars
 *  - targetUniversity: optional; max 200 chars
 *  - targetProgram: optional; max 200 chars
 *  - notes: optional; max 4000 chars
 *
 * The helper returns a { field, message }[] array so the caller can
 * decide whether to return a 400 (single error) or 422 (collect all).
 * In practice we 400 on the first error — partner forms are short
 * and the partner only needs to know the next thing to fix.
 */

// RFC 5322 lite — good enough to catch obvious typos like
// "gmial.com" / "foo@bar" without rejecting the long tail of
// valid RFC addresses. Mirrors the client-side check the partner
// application form uses (Phase 23 M9).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PARTNER_STUDENT_FIELD_LIMITS = {
  studentName: 200,
  studentEmail: 200,
  studentPhone: 50,
  nationality: 100,
  targetUniversity: 200,
  targetProgram: 200,
  notes: 4000,
} as const;

export type PartnerStudentFieldKey = keyof typeof PARTNER_STUDENT_FIELD_LIMITS;

export interface PartnerStudentValidationError {
  field: PartnerStudentFieldKey | 'general';
  message: string;
}

/**
 * Validate a partner_students write payload (POST or PATCH).
 *
 * - For POST: pass `mode: 'create'`. studentName is required.
 * - For PATCH: pass `mode: 'update'`. studentName is required
 *   *only if present in the body* — partners can PATCH a single
 *   field, but if they include studentName it must not be empty.
 *
 * Returns an empty array if the payload is valid.
 */
export function validatePartnerStudentPayload(
  body: Record<string, unknown>,
  mode: 'create' | 'update',
): PartnerStudentValidationError[] {
  const errors: PartnerStudentValidationError[] = [];

  // studentName
  if (mode === 'create' || body.studentName !== undefined) {
    const name = body.studentName;
    if (typeof name !== 'string' || !name.trim()) {
      errors.push({ field: 'studentName', message: 'studentName is required' });
    } else if (name.trim().length > PARTNER_STUDENT_FIELD_LIMITS.studentName) {
      errors.push({
        field: 'studentName',
        message: `studentName must be at most ${PARTNER_STUDENT_FIELD_LIMITS.studentName} characters`,
      });
    }
  }

  // studentEmail (optional, but if present must look like an email)
  if (body.studentEmail !== undefined && body.studentEmail !== null && body.studentEmail !== '') {
    const email = String(body.studentEmail).trim();
    if (email.length > PARTNER_STUDENT_FIELD_LIMITS.studentEmail) {
      errors.push({
        field: 'studentEmail',
        message: `studentEmail must be at most ${PARTNER_STUDENT_FIELD_LIMITS.studentEmail} characters`,
      });
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push({
        field: 'studentEmail',
        message: 'studentEmail must be a valid email address (e.g. student@example.com)',
      });
    }
  }

  // studentPhone (optional; max-length only — see file header)
  if (body.studentPhone !== undefined && body.studentPhone !== null && body.studentPhone !== '') {
    if (String(body.studentPhone).length > PARTNER_STUDENT_FIELD_LIMITS.studentPhone) {
      errors.push({
        field: 'studentPhone',
        message: `studentPhone must be at most ${PARTNER_STUDENT_FIELD_LIMITS.studentPhone} characters`,
      });
    }
  }

  // nationality
  if (body.nationality !== undefined && body.nationality !== null && body.nationality !== '') {
    if (String(body.nationality).length > PARTNER_STUDENT_FIELD_LIMITS.nationality) {
      errors.push({
        field: 'nationality',
        message: `nationality must be at most ${PARTNER_STUDENT_FIELD_LIMITS.nationality} characters`,
      });
    }
  }

  // targetUniversity
  if (
    body.targetUniversity !== undefined &&
    body.targetUniversity !== null &&
    body.targetUniversity !== ''
  ) {
    if (String(body.targetUniversity).length > PARTNER_STUDENT_FIELD_LIMITS.targetUniversity) {
      errors.push({
        field: 'targetUniversity',
        message: `targetUniversity must be at most ${PARTNER_STUDENT_FIELD_LIMITS.targetUniversity} characters`,
      });
    }
  }

  // targetProgram
  if (
    body.targetProgram !== undefined &&
    body.targetProgram !== null &&
    body.targetProgram !== ''
  ) {
    if (String(body.targetProgram).length > PARTNER_STUDENT_FIELD_LIMITS.targetProgram) {
      errors.push({
        field: 'targetProgram',
        message: `targetProgram must be at most ${PARTNER_STUDENT_FIELD_LIMITS.targetProgram} characters`,
      });
    }
  }

  // notes
  if (body.notes !== undefined && body.notes !== null && body.notes !== '') {
    if (String(body.notes).length > PARTNER_STUDENT_FIELD_LIMITS.notes) {
      errors.push({
        field: 'notes',
        message: `notes must be at most ${PARTNER_STUDENT_FIELD_LIMITS.notes} characters`,
      });
    }
  }

  return errors;
}
