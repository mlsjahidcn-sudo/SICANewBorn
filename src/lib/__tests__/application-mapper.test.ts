/**
 * application-mapper.test.ts — Phase 77
 *
 * Covers the 4-tier display-name fallback chain in `deriveDisplayName`
 * + the `mapApplicationFromDb` integration that uses it. Each case
 * locks in one branch of the fallback so a future refactor can't
 * silently regress any tier.
 */
import { describe, it, expect } from 'vitest';
import {
  deriveDisplayName,
  deriveStudentFullName,
  mapApplicationFromDb,
  type RawApp,
} from '@/lib/application-mapper';

describe('deriveDisplayName', () => {
  it('returns "First Last" when both names present', () => {
    expect(
      deriveDisplayName({
        studentFirstName: 'John',
        studentLastName: 'Smith',
      }),
    ).toBe('John Smith');
  });

  it('returns first name only when last is missing', () => {
    expect(
      deriveDisplayName({ studentFirstName: 'John', studentLastName: null }),
    ).toBe('John');
    expect(
      deriveDisplayName({ studentFirstName: 'John', studentLastName: '' }),
    ).toBe('John');
  });

  it('returns last name only when first is missing', () => {
    expect(
      deriveDisplayName({ studentFirstName: null, studentLastName: 'Smith' }),
    ).toBe('Smith');
  });

  it('falls back to email local-part when both names are empty', () => {
    expect(
      deriveDisplayName({
        studentFirstName: null,
        studentLastName: null,
        studentEmail: 'jane.doe@gmail.com',
      }),
    ).toBe('jane.doe');
  });

  it('falls back to applicant_name for unlinked applications', () => {
    expect(
      deriveDisplayName({
        studentFirstName: null,
        studentLastName: null,
        applicantName: 'Jane Smith',
      }),
    ).toBe('Jane Smith');
    expect(
      deriveDisplayName({
        studentFirstName: null,
        studentLastName: null,
        applicantName: '  Jane Smith  ',
      }),
    ).toBe('Jane Smith');
  });

  it('prefers applicant_name over email when names empty', () => {
    expect(
      deriveDisplayName({
        studentFirstName: null,
        studentLastName: null,
        studentEmail: 'info@example.com',
        applicantName: 'Lead Applicant',
      }),
    ).toBe('Lead Applicant');
  });

  it('returns "—" when everything is empty', () => {
    expect(deriveDisplayName({})).toBe('—');
    expect(
      deriveDisplayName({
        studentFirstName: '',
        studentLastName: '',
        studentEmail: '',
        applicantName: '',
      }),
    ).toBe('—');
  });

  it('trims whitespace correctly', () => {
    expect(
      deriveDisplayName({
        studentFirstName: '  John  ',
        studentLastName: '  Smith  ',
      }),
    ).toBe('John Smith');
  });
});

describe('deriveStudentFullName', () => {
  it('delegates to deriveDisplayName for a student record', () => {
    expect(
      deriveStudentFullName({
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
      }),
    ).toBe('John Smith');
  });

  it('falls back to email when names empty', () => {
    expect(
      deriveStudentFullName({
        first_name: null,
        last_name: null,
        email: 'jane.doe@example.com',
      }),
    ).toBe('jane.doe');
  });
});

describe('mapApplicationFromDb — name fallback', () => {
  const baseRow: RawApp = {
    id: 'app-1',
    student_id: null,
    university_id: 'uni-1',
    university_name: 'Tsinghua University',
    university_name_cn: null,
    program_id: null,
    program_name: 'CS',
    program_name_cn: null,
    degree: 'Bachelor',
    degree_level: null,
    intake: '2026 Fall',
    status: 'Submitted',
    priority: null,
    submitted_at: null,
    reviewed_at: null,
    decision_date: null,
    decision: null,
    decision_letter_url: null,
    student_notes: null,
    personal_statement: null,
    additional_notes: null,
    admin_notes: null,
    application_number: 'APP-001',
    applicant_name: null,
    applicant_email: null,
    applicant_phone: null,
    applicant_nationality: null,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    student: null,
  };

  it('uses applicant_name for unlinked applications', () => {
    const result = mapApplicationFromDb({
      ...baseRow,
      applicant_name: 'Jane Smith',
    });
    expect(result.studentName).toBe('Jane Smith');
    expect(result.isLinked).toBe(false);
  });

  it('falls back to applicant_email local-part when applicant_name is null', () => {
    const result = mapApplicationFromDb({
      ...baseRow,
      applicant_email: 'jane.doe@example.com',
    });
    expect(result.studentName).toBe('jane.doe');
  });

  it('uses joined student name for linked applications', () => {
    const result = mapApplicationFromDb({
      ...baseRow,
      student_id: 'stu-1',
      student: {
        id: 'stu-1',
        first_name: 'John',
        last_name: 'Smith',
        email: 'john@example.com',
        source: 'Online',
        status: 'Active',
      },
    });
    expect(result.studentName).toBe('John Smith');
    expect(result.isLinked).toBe(true);
  });

  it('falls back to email local-part for linked applications with NULL names', () => {
    const result = mapApplicationFromDb({
      ...baseRow,
      student_id: 'stu-1',
      student: {
        id: 'stu-1',
        first_name: null,
        last_name: null,
        email: 'legacy.user@example.com',
        source: 'Online',
        status: 'Active',
      },
    });
    expect(result.studentName).toBe('legacy.user');
  });
});