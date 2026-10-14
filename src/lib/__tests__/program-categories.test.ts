import { describe, expect, it } from 'vitest';
import { programSchema } from '../validators/program';
import { normalizeProgramRows } from '../ai/program-parse-sanitize';
import { buildProgramFaqSchema } from '../program-faq';

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

  it('uses source fee units and does not infer language, requirements or intakes in FAQ data', () => {
    const faq = buildProgramFaqSchema({
      name: 'Foundation Program', tuition: 'CNY 12,000/semester',
      language: 'To be confirmed', requirements: [], intake: '',
    }, 'Example University');
    const answers = faq.mainEntity.map((item) => item.acceptedAnswer.text);
    expect(answers[0]).toContain('CNY 12,000/semester.');
    expect(answers[0]).not.toContain('per year');
    expect(answers[1]).toContain('has not been confirmed');
    expect(answers[1]).not.toContain('HSK');
    expect(answers[2]).not.toContain("bachelor's degree");
    expect(answers[3]).not.toContain('September');
  });
});
