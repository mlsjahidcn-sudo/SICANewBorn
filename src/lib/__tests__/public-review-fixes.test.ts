import { describe, expect, it } from 'vitest';
import { publicApplicationSchema } from '@/lib/public-application';
import { scholarshipDeadline, compareScholarshipDeadlines } from '@/lib/scholarship-deadlines';
import { uniqueComparisonUniversities } from '@/lib/comparison-universities';
import { ALL_COUNTRIES } from '@/lib/common-countries';

describe('public applicant validation', () => {
  const contact = { studentName: 'Applicant', studentEmail: 'applicant@example.com' };
  it('accepts undecided applicants with contact and meaningful study goals', () => {
    const parsed = publicApplicationSchema.parse({ ...contact, notes: 'I want an English-taught engineering bachelor in 2027.' });
    expect(parsed.notes).toContain('engineering');
    expect(parsed.university).toBeUndefined();
  });
  it('rejects an uncontactable applicant even with a chosen program', () => {
    expect(publicApplicationSchema.safeParse({ studentName: 'Applicant', university: 'University', program: 'Program' }).success).toBe(false);
  });
  it('accepts phone-only contact and preserves partner attribution', () => {
    const payload = { studentName: 'Applicant', studentPhone: '+880123456789', university: 'University', program: 'Program', referringPartnerId: '00000000-0000-4000-8000-000000000001' };
    expect(publicApplicationSchema.parse(payload).referringPartnerId).toBe(payload.referringPartnerId);
  });
  it('rejects missing goals when either program field is blank', () => {
    for (const fields of [{}, { university: 'University' }, { program: 'Program' }]) {
      const result = publicApplicationSchema.safeParse({ ...contact, ...fields });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues.some((issue) => issue.path[0] === 'notes')).toBe(true);
    }
  });
});

describe('deadline presentation', () => {
  const row = (slug: string, deadline: string) => ({ slug, deadline, deadlineCn: deadline });
  it('uses the country tracker instead of a misleading bilateral seasonal range', () => {
    const info = scholarshipDeadline(row('csc-bilateral-program', 'January — April'), 'en');
    expect(info.label).not.toContain('January');
    expect(info.note).toContain('December 2026');
    expect(info.href).toBe('/csc-scholarship-deadlines-2027-2028');
  });
  it('orders dated entries chronologically, then seasonal windows by month, then unknown dates', () => {
    const items = [row('april', 'April — May'), row('february', 'February'), row('unknown', 'Rolling'), row('later', '2027-01-29'), row('earlier', '2026-12-19')];
    expect(items.sort(compareScholarshipDeadlines).map((item) => item.slug)).toEqual(['earlier', 'later', 'february', 'april', 'unknown']);
  });
});

it('groups display aliases without combining different campuses or mutating the catalog', () => {
  const items = [{ slug: 'a', name: 'Example University', city: 'Beijing' }, { slug: 'b', name: 'example university ', city: 'Beijing' }, { slug: 'c', name: 'Example University', city: 'Shanghai' }];
  expect(uniqueComparisonUniversities(items).map((item) => item.slug)).toEqual(['a', 'c']);
  expect(items).toHaveLength(3);
});

it('allows countries covered by the CSC tracker in webinar registration', () => {
  for (const country of ['Maldives', 'Singapore', 'South Sudan', 'Timor-Leste']) {
    expect(ALL_COUNTRIES.some((option) => option.value === country)).toBe(true);
  }
});
