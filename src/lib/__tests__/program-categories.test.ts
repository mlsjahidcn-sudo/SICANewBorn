import { describe, expect, it } from 'vitest';
import { programSchema } from '../validators/program';
import { normalizeProgramRows } from '../ai/program-parse-sanitize';
import { buildProgramFaqItems, buildProgramFaqSchema } from '../program-faq';

describe('researched language and foundation programs', () => {
  const base = {
    slug: 'foundation-example-university', name: 'Foundation Program',
    universitySlug: 'example-university', discipline: 'Humanities',
    description: 'Officially listed preparatory program.',
  };

  it.each(['Chinese Language', 'Foundation', 'Non-degree'])('accepts %s for catalog editing', (degree) => {
    const result = programSchema.parse({ ...base, degree });
    expect(result.degree).toBe(degree);
    expect(result.language).toBe('To be confirmed');
    expect(result.scholarshipAvailable).toBeNull();
  });

  it('preserves an explicitly unconfirmed scholarship while editing', () => {
    const result = programSchema.parse({ ...base, scholarshipAvailable: null });
    expect(result.scholarshipAvailable).toBeNull();
  });

  it('keeps language study and foundation headings as separate program types during bulk parsing', () => {
    const { programs } = normalizeProgramRows([
      { name: 'Chinese Language Training', degree: '汉语进修', discipline: 'Humanities' },
      { name: 'Pre-university', degree: '预科', discipline: 'Humanities' },
    ]);
    expect(programs.map((p) => p.degree)).toEqual(['Chinese Language', 'Foundation']);
    expect(programs.every((p) => p.language === 'To be confirmed')).toBe(true);
  });

  it('uses source fee units and omits not-confirmed FAQ answers', () => {
    const program = {
      name: 'Foundation Program', tuition: 'CNY 12,000/semester',
      language: 'To be confirmed', requirements: [] as string[], intake: '',
    };
    const items = buildProgramFaqItems(program, 'Example University');
    expect(items).toHaveLength(1);
    expect(items[0]?.answer).toContain('CNY 12,000/semester.');
    expect(items[0]?.answer).not.toContain('per year');
    expect(JSON.stringify(items)).not.toContain('has not been confirmed');
    expect(JSON.stringify(items)).not.toContain('HSK');
    expect(JSON.stringify(items)).not.toContain("bachelor's degree");
    expect(JSON.stringify(items)).not.toContain('September');
    // A single confirmed answer is not enough for FAQPage JSON-LD.
    expect(buildProgramFaqSchema(program, 'Example University')).toBeNull();
  });
});
