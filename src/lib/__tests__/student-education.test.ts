/**
 * student-education.test.ts
 *
 * Phase 183: unit tests for education-history validation.
 *
 * The rules that carry weight here:
 *   - a row with no institution is REJECTED (it can't be told apart
 *     from a blank editor row)
 *   - a genuinely blank row is DROPPED, not stored
 *   - a malformed date is cleared, not fatal — a typo in a start date
 *     should not cost the advisor the whole qualification
 *   - end-before-start is REJECTED, because that's usually swapped years
 *   - is_current clears end_date — "still studying" must have one answer
 *   - unknown qualifications coerce to 'Other' rather than bouncing
 */
import { describe, it, expect } from 'vitest';
import {
  sanitizeEducationRows,
  emptyEducationRow,
  MAX_EDUCATION_ROWS,
  QUALIFICATIONS,
  type EducationRow,
} from '../student-education';

const row = (over: Partial<EducationRow> = {}) => ({
  institution: 'Tsinghua University',
  qualification: 'Bachelor',
  subject: 'Computer Science',
  country: 'China',
  startDate: '2018-09-01',
  endDate: '2022-07-01',
  grade: '3.7',
  gradingScale: '4.0 GPA',
  isCurrent: false,
  ...over,
});

describe('sanitizeEducationRows', () => {
  it('accepts a well-formed row', () => {
    const { rows, issues } = sanitizeEducationRows([row()]);
    expect(issues).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].institution).toBe('Tsinghua University');
    expect(rows[0].gradingScale).toBe('4.0 GPA');
  });

  it('preserves input order — it is the advisor’s chronology', () => {
    const { rows } = sanitizeEducationRows([
      row({ institution: 'High School A', qualification: 'High School' }),
      row({ institution: 'Uni B', qualification: 'Bachelor' }),
      row({ institution: 'Uni C', qualification: 'Master' }),
    ]);
    expect(rows.map((r) => r.institution)).toEqual(['High School A', 'Uni B', 'Uni C']);
  });

  it('rejects a non-array', () => {
    expect(sanitizeEducationRows(null).rows).toHaveLength(0);
    expect(sanitizeEducationRows('x').issues[0].field).toBe('rows');
  });

  it('drops a wholly blank row instead of storing it', () => {
    const { rows, issues } = sanitizeEducationRows([
      row(),
      { institution: '', qualification: '', subject: '' },
    ]);
    expect(rows).toHaveLength(1);
    expect(issues).toHaveLength(0);
  });

  it('rejects a row that has data but no institution', () => {
    const { rows, issues } = sanitizeEducationRows([{ qualification: 'Bachelor', subject: 'CS' }]);
    expect(rows).toHaveLength(0);
    expect(issues[0]).toMatchObject({ field: 'institution' });
  });

  it(`caps at ${MAX_EDUCATION_ROWS} rows`, () => {
    const many = Array.from({ length: MAX_EDUCATION_ROWS + 1 }, (_, i) =>
      row({ institution: `Uni ${i}` }),
    );
    expect(sanitizeEducationRows(many).rows).toHaveLength(0);
    expect(sanitizeEducationRows(many).issues[0].reason).toContain(String(MAX_EDUCATION_ROWS));
  });

  it('accepts exactly the maximum', () => {
    const many = Array.from({ length: MAX_EDUCATION_ROWS }, (_, i) =>
      row({ institution: `Uni ${i}` }),
    );
    expect(sanitizeEducationRows(many).rows).toHaveLength(MAX_EDUCATION_ROWS);
  });

  // ── the rules that matter ──
  it('clears a malformed date instead of failing the row', () => {
    const { rows, issues } = sanitizeEducationRows([
      row({ startDate: 'Sept 2018' as never, endDate: 'not-a-date' as never }),
    ]);
    expect(issues).toHaveLength(0);
    expect(rows).toHaveLength(1);
    expect(rows[0].startDate).toBeNull();
    expect(rows[0].endDate).toBeNull();
  });

  it('REJECTS an end date before the start date', () => {
    const { rows, issues } = sanitizeEducationRows([
      row({ startDate: '2022-07-01', endDate: '2018-09-01' }),
    ]);
    expect(rows).toHaveLength(0);
    expect(issues[0]).toMatchObject({ field: 'endDate' });
  });

  it('allows the same start and end date (a one-day course)', () => {
    expect(sanitizeEducationRows([row({ startDate: '2022-07-01', endDate: '2022-07-01' })]).rows)
      .toHaveLength(1);
  });

  it('clears endDate when isCurrent — "still studying" gets one answer', () => {
    const { rows } = sanitizeEducationRows([row({ isCurrent: true, endDate: '2026-07-01' })]);
    expect(rows[0].isCurrent).toBe(true);
    expect(rows[0].endDate).toBeNull();
  });

  it('accepts is_current as well as isCurrent', () => {
    const { rows } = sanitizeEducationRows([{ ...row(), is_current: true }]);
    expect(rows[0].isCurrent).toBe(true);
  });

  it('coerces an unknown qualification to Other rather than rejecting', () => {
    const { rows, issues } = sanitizeEducationRows([row({ qualification: 'National Diploma' })]);
    expect(issues).toHaveLength(0);
    expect(rows[0].qualification).toBe('Other');
  });

  it('accepts every documented qualification verbatim', () => {
    for (const q of QUALIFICATIONS) {
      expect(sanitizeEducationRows([row({ qualification: q })]).rows[0].qualification).toBe(q);
    }
  });

  it('defaults gradingScale to "unspecified" when a grade is given without one', () => {
    // "3.5" is meaningless without knowing the scale — better an honest
    // unknown than a guess.
    const { rows } = sanitizeEducationRows([row({ gradingScale: null })]);
    expect(rows[0].gradingScale).toBe('unspecified');
  });

  it('drops gradingScale entirely when there is no grade', () => {
    const { rows } = sanitizeEducationRows([row({ grade: null, gradingScale: '4.0 GPA' })]);
    expect(rows[0].gradingScale).toBeNull();
  });

  it('preserves a free-text grading scale (the UI suggests, the DB accepts)', () => {
    const { rows } = sanitizeEducationRows([row({ gradingScale: 'national class (5-tier)' })]);
    expect(rows[0].gradingScale).toBe('national class (5-tier)');
  });

  it('keeps an existing row id so the editor round-trips', () => {
    const { rows } = sanitizeEducationRows([{ ...row(), id: 'abc-123' }]);
    expect(rows[0].id).toBe('abc-123');
  });

  it('trims and length-caps free text', () => {
    const { rows } = sanitizeEducationRows([row({ institution: `  ${'x'.repeat(400)}  ` })]);
    expect(rows[0].institution).toHaveLength(255);
    expect(rows[0].institution!.startsWith('x')).toBe(true);
  });

  it('survives a null entry', () => {
    expect(sanitizeEducationRows([null]).rows).toHaveLength(0);
  });

  it('returns empty for an empty list', () => {
    expect(sanitizeEducationRows([])).toEqual({ rows: [], issues: [] });
  });

  it('emptyEducationRow is itself valid and produces no issues', () => {
    const { rows, issues } = sanitizeEducationRows([{ ...emptyEducationRow(), institution: 'X' }]);
    expect(issues).toHaveLength(0);
    expect(rows).toHaveLength(1);
  });
});
