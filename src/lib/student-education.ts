/**
 * student-education.ts
 *
 * Phase 183: pure validation for the repeatable education history.
 *
 * Replaces eight fixed columns (highSchool*, bachelor*, master*) that
 * could not express a fourth qualification, a gap year, or a grading
 * scale — "3.5" is meaningless without knowing whether it is on a 4.0
 * scale, a percentage, or A-Level.
 *
 * Pure module: no Supabase, no React. The route does I/O; this decides
 * what is allowed in.
 */

/** More than this and an advisor is transcribing a transcript, not
 *  capturing a profile. A gap-year-heavy path can legitimately reach 5. */
export const MAX_EDUCATION_ROWS = 12;

/**
 * Closed-ish set. `Other` exists because real intakes contain
 * qualifications nobody enumerated — foundation courses, vocational
 * diplomas, Chinese 预科. Blocking them would push advisors back into
 * the free-text blob this feature replaces.
 */
export const QUALIFICATIONS = [
  'High School',
  'Diploma',
  'Foundation',
  'Bachelor',
  'Master',
  'PhD',
  'Other',
] as const;

export type Qualification = (typeof QUALIFICATIONS)[number];

/** Common scales, offered as suggestions. Deliberately NOT a CHECK
 *  constraint on the column — agencies see more scales than this list
 *  and rejecting "national class (5-tier)" would be worse than storing
 *  it. The UI suggests; the DB accepts. */
export const GRADING_SCALES = [
  '4.0 GPA',
  '5.0 GPA',
  'percentage',
  'A-Level',
  'national class',
  'unspecified',
] as const;

export interface EducationRow {
  id?: string;
  institution: string | null;
  country: string | null;
  qualification: string | null;
  subject: string | null;
  startDate: string | null;
  endDate: string | null;
  grade: string | null;
  gradingScale: string | null;
  isCurrent: boolean;
}

export interface EducationIssue {
  index: number;
  field: string;
  reason: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clean(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, max);
  return t === '' ? null : t;
}

function cleanDate(v: unknown): string | null {
  const s = clean(v, 10);
  if (s === null) return null;
  return DATE_RE.test(s) ? s : null;
}

/**
 * Validate a submitted education history.
 *
 * Rules:
 *  - must be an array, at most MAX_EDUCATION_ROWS
 *  - a row needs at least an institution OR a qualification, otherwise
 *    it is a blank row the admin added and never filled in
 *  - dates must be ISO `YYYY-MM-DD`; a malformed one is DROPPED to null
 *    rather than rejecting the row, because a typo in a start date
 *    should not cost the advisor the whole qualification
 *  - `is_current` rows have their endDate cleared — an in-progress
 *    course with a graduation date is a contradiction, and storing it
 *    would make "who is still studying" answerable two different ways
 *  - end before start is an ISSUE, not a silent drop: that one is
 *    worth refusing, because it usually means the years were swapped
 */
export function sanitizeEducationRows(raw: unknown): {
  rows: EducationRow[];
  issues: EducationIssue[];
} {
  const issues: EducationIssue[] = [];

  if (!Array.isArray(raw)) {
    return { rows: [], issues: [{ index: -1, field: 'rows', reason: 'rows must be an array' }] };
  }
  if (raw.length > MAX_EDUCATION_ROWS) {
    return {
      rows: [],
      issues: [{ index: -1, field: 'rows', reason: `at most ${MAX_EDUCATION_ROWS} qualifications` }],
    };
  }

  const rows: EducationRow[] = [];

  raw.forEach((item, index) => {
    const r = (item ?? {}) as Record<string, unknown>;

    const institution = clean(r.institution, 255);
    const qualificationRaw = clean(r.qualification, 64);
    const subject = clean(r.subject, 255);
    const country = clean(r.country, 128);
    const grade = clean(r.grade, 32);
    const gradingScale = clean(r.gradingScale, 64);

    // A wholly empty row is dropped, not stored — the editor lets an
    // admin add a row before filling it in, and saving with one
    // half-typed placeholder should not create a junk qualification.
    if (!institution && !qualificationRaw && !subject) return;

    if (!institution) {
      issues.push({ index, field: 'institution', reason: 'institution is required' });
      return;
    }

    let qualification: string | null = qualificationRaw;
    if (qualificationRaw && !(QUALIFICATIONS as readonly string[]).includes(qualificationRaw)) {
      // Unknown values are coerced to 'Other' rather than rejected: a
      // foundation course or a national diploma is real, and the
      // subject/institution carry the detail.
      qualification = 'Other';
    }

    const startDate = cleanDate(r.startDate);
    let endDate = cleanDate(r.endDate);
    const isCurrent = r.isCurrent === true || r.is_current === true;

    if (startDate && endDate && endDate < startDate) {
      issues.push({ index, field: 'endDate', reason: 'end date is before the start date' });
      return;
    }

    // Contradiction guard — see the doc comment.
    if (isCurrent) endDate = null;

    // A grading scale with no grade adds nothing.
    rows.push({
      id: typeof r.id === 'string' ? r.id : undefined,
      institution,
      country,
      qualification,
      subject,
      startDate,
      endDate,
      grade,
      gradingScale: grade ? (gradingScale ?? 'unspecified') : null,
      isCurrent,
    });
  });

  return { rows, issues };
}

/** UI-side blank row. */
export function emptyEducationRow(): EducationRow {
  return {
    institution: null,
    country: null,
    qualification: 'Bachelor',
    subject: null,
    startDate: null,
    endDate: null,
    grade: null,
    gradingScale: null,
    isCurrent: false,
  };
}
