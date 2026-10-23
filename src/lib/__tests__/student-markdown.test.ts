import { describe, expect, it } from 'vitest';
import { buildStudentMarkdown, studentMarkdownFilename, type StudentMarkdownData } from '@/lib/student-markdown';

const empty = (): StudentMarkdownData => ({ identity: {}, education: [], applications: [], documents: [] });
const render = (data: StudentMarkdownData): string => buildStudentMarkdown(data, '2026-10-24T08:00:00.000Z');

describe('student Markdown export', () => {
  it('includes saved profile, legacy extra, education, language and sponsor details without inventing missing values', () => {
    const data = empty();
    data.identity = { first_name: 'Amina', last_name: '李', passport_number: 'NEW123', gpa: '3.5', english_score: '7.0',
      sponsor_name: 'Parent', emergency_contact_phone: '+123', has_studied_in_china: false,
      extra: { passportNumber: 'OLD123', gender: 'Female', hskScore: 0, bachelorUniversityName: 'Old University' } };
    data.education = [{ institution: 'University', qualification: 'Bachelor', subject: 'Engineering', start_date: '2022-09-01', end_date: null, is_current: true, grade: '3.5', grading_scale: '4.0 GPA' }];
    const md = render(data);
    for (const expected of ['Amina 李', '**Passport number:** NEW123', '**Gender:** Female', '**HSK score:** 0', '**Previously studied in China:** No', '**Date of birth:** Not provided', '**Currently studying:** Yes', '**Grading scale:** 4.0 GPA', '**Sponsor name:** Parent', '**Phone:** +123', 'Old University']) expect(md).toContain(expected);
    expect(md).not.toContain('OLD123');
    expect(md).not.toMatch(/undefined|\[object Object\]/);
  });
  it('keeps each application’s applicant snapshot and target separate from the student profile', () => {
    const data = empty();
    data.identity = { first_name: 'Profile', passport_number: 'PROFILE123' };
    data.applications = [{ surface: 'partner', record: { student_name: 'Application name', passport_number: 'APP456', university: 'University A', program: 'Medicine', intake: '2027 Fall', personal_statement: 'My statement' } },
      { surface: 'student', record: { university_name: 'University B', program_name: 'Engineering', intake: '2027 Spring' } }];
    const md = render(data);
    expect(md).toContain('# Student information: Profile');
    expect(md).toContain('### Application 1 (partner)');
    expect(md).toContain('**Applicant name on application:** Application name');
    expect(md).toContain('**Passport number:** APP456');
    expect(md).toContain('### Application 2 (student)');
    expect(md.indexOf('University A')).toBeLessThan(md.indexOf('University B'));
  });
  it('never exports arbitrary extra fields, internal notes, fees, credentials or file access URLs', () => {
    const data = empty();
    data.identity = { notes: 'private-note', password: 'secret-password', extra: { apiKey: 'secret-api-key', notes: 'private-extra-note' } };
    data.applications = [{ surface: 'partner', record: { notes: 'partner-note', internal_notes: 'team-note', commission: 'fee-secret', student_email: 'student@example.test' } }];
    data.documents = [{ name: 'Passport', file_name: 'passport.pdf', file_url: 'https://private.test/file?token=secret-token', status: 'Verified' }];
    const md = render(data);
    for (const secret of ['private-note', 'secret-password', 'secret-api-key', 'private-extra-note', 'partner-note', 'team-note', 'fee-secret', 'private.test', 'secret-token']) expect(md).not.toContain(secret);
    expect(md).toContain('passport.pdf');
    expect(md).toContain('student@example.test');
  });
  it('escapes stored Markdown and HTML while preserving readable multiline applicant text', () => {
    const data = empty();
    data.identity = { first_name: '<script>bad</script>', extra: { address: 'Line 1\n# Injected heading\n[link](javascript:bad)' } };
    const md = render(data);
    expect(md).not.toContain('<script>');
    expect(md).not.toContain('\n# Injected heading');
    expect(md).toContain('Line 1\n  \\# Injected heading');
    expect(md).toContain('\\[link\\]\\(javascript:bad\\)');
  });
  it('uses safe .md filenames, including for missing or non-Latin names', () => {
    expect(studentMarkdownFilename({ first_name: 'José', last_name: '../Ali\r\nBad' })).toBe('student-info-jose-ali-bad.md');
    expect(studentMarkdownFilename({ student_name: '李明' })).toBe('student-info-student.md');
    expect(studentMarkdownFilename({})).toBe('student-info-student.md');
    expect(render(empty())).toContain('**Full name:** Not provided');
  });
});
