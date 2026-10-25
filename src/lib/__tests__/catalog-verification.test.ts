import { describe, expect, it } from 'vitest';
import { catalogVerificationSchema, readCatalogVerification } from '@/lib/validators/catalog-verification';
import { datedIntake, verifiedEvidence } from '@/lib/catalog-verification';
import { buildProgramFaqItems, buildUniversityFaqItems, faqSchema } from '@/lib/program-faq';
import { programs, universities } from '@/lib/data';

describe('evidence-based public details', () => {
  it('does not upgrade recurring start months to a dated intake', () => {
    expect(datedIntake('September')).toBe('');
    expect(datedIntake('February 2027')).toBe('February 2027');
    expect(datedIntake('September', { intake: 'September 2027' })).toBe('September 2027');
  });
  it('requires source/date and a named intake for availability and deadlines', () => {
    expect(catalogVerificationSchema.safeParse({ intakeStatus: 'open' }).success).toBe(false);
    expect(catalogVerificationSchema.safeParse({ sourceUrl: 'https://university.edu.cn/admissions', verifiedAt: '2026-01-01', deadline: '2027-06-01', intake: 'September' }).success).toBe(false);
    const evidence = { sourceUrl: 'https://university.edu.cn/admissions', verifiedAt: '2026-01-01', intake: 'September 2027', intakeStatus: 'open' as const, deadline: '2027-06-01' };
    expect(readCatalogVerification(evidence)).toEqual(evidence);
    expect(verifiedEvidence(evidence)).toBe(true);
  });
  it('rejects unsafe source links, future verification and unsupported funding assertions', () => {
    expect(readCatalogVerification({ sourceUrl: 'javascript:alert(1)' })).toBeUndefined();
    expect(readCatalogVerification({ sourceUrl: 'https://university.edu.cn', verifiedAt: '2099-01-01' })).toBeUndefined();
    expect(catalogVerificationSchema.safeParse({ funding: 'Full funding' }).success).toBe(false);
  });
  it('shares exactly the visible answers with FAQ schema in both languages', () => {
    for (const locale of ['en', 'zh'] as const) {
      const items = buildProgramFaqItems(programs[0], universities[0].name, locale);
      expect(faqSchema(items).mainEntity.map((item) => item.acceptedAnswer.text)).toEqual(items.map((item) => item.answer));
      const universityFaqs = buildUniversityFaqItems(universities[0], 0, locale);
      expect(faqSchema(universityFaqs).mainEntity.map((item) => item.name)).toEqual(universityFaqs.map((item) => item.question));
    }
  });
  it('never asserts universal CSC funding or invents degree offerings for an empty catalog', () => {
    const items = buildUniversityFaqItems(universities[0], 0, 'en');
    expect(items[0].answer).toContain('0 public programs');
    expect(JSON.stringify(items)).not.toContain('participates in');
    expect(JSON.stringify(items)).not.toContain("Bachelor's, Master's");
  });
});
