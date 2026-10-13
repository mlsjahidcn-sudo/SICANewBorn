import { describe, expect, it } from 'vitest';
import {
  checkAllUniversities,
  checkUniversity,
  type EligibilityInput,
} from '@/lib/webinar-eligibility';
import type { WebinarFeaturedUniversity } from '@/lib/webinar-content';

/**
 * Phase 161: rule-based eligibility checker tests. The fixture
 * mirrors the seeded featured_universities jsonb (migration
 * 2026-10-13_webinars_multi.sql) — SCUT carries the English gate,
 * NUAA the GPA gate, the rest review holistically.
 */

function uni(
  slug: string,
  eligibility: WebinarFeaturedUniversity['eligibility'],
): WebinarFeaturedUniversity {
  return {
    slug,
    nameEn: slug.toUpperCase(),
    nameZh: slug,
    cityEn: 'City',
    cityZh: '城市',
    rankingLabel: '985',
    englishProgramsEn: '',
    englishProgramsZh: '',
    scholarshipEn: '',
    scholarshipZh: '',
    requirementsEn: '',
    requirementsZh: '',
    deadline: '2027-06-30',
    eligibility,
  };
}

const HITSZ = uni('hitsz', {});
const SCUT = uni('scut', { english: { ielts: 5.5, toefl: 68 } });
const UESTC = uni('uestc', {});
const SICHUAN = uni('sichuan-university', {});
const NUAA = uni('nuaa', { min_gpa_percent: 80 });
const ALL = [HITSZ, SCUT, UESTC, SICHUAN, NUAA];

const baseInput: EligibilityInput = {
  educationLevel: 'high_school',
  gpaPercent: 85,
  englishTest: 'ielts',
  englishScore: 6.5,
  hskLevel: null,
  country: 'Bangladesh',
};

describe('checkUniversity — English gate (SCUT)', () => {
  it('passes when IELTS meets the 5.5 floor', () => {
    const result = checkUniversity(SCUT, { ...baseInput, englishScore: 5.5 });
    expect(result.verdict).toBe('likely');
    expect(result.reasonKeys).toEqual(['meetsAll']);
  });

  it('passes when TOEFL meets the 68 floor on the other scale', () => {
    const result = checkUniversity(SCUT, { ...baseInput, englishTest: 'toefl', englishScore: 68 });
    expect(result.verdict).toBe('likely');
  });

  it('borderline when IELTS is 5.0 (within 0.5 of the floor)', () => {
    const result = checkUniversity(SCUT, { ...baseInput, englishScore: 5.0 });
    expect(result.verdict).toBe('borderline');
    expect(result.reasonKeys).toContain('englishBorderline');
  });

  it('unlikely when IELTS is well below the floor', () => {
    const result = checkUniversity(SCUT, { ...baseInput, englishScore: 4.0 });
    expect(result.verdict).toBe('unlikely');
    expect(result.reasonKeys).toContain('englishBelow');
  });

  it('unlikely when no English test at all', () => {
    const result = checkUniversity(SCUT, { ...baseInput, englishTest: 'none', englishScore: null });
    expect(result.verdict).toBe('unlikely');
    expect(result.reasonKeys).toContain('englishMissing');
  });

  it('borderline when TOEFL is 63 (within 5 of the floor)', () => {
    const result = checkUniversity(SCUT, { ...baseInput, englishTest: 'toefl', englishScore: 63 });
    expect(result.verdict).toBe('borderline');
  });

  it('unlikely when TOEFL is 50 (more than 5 below the floor)', () => {
    const result = checkUniversity(SCUT, { ...baseInput, englishTest: 'toefl', englishScore: 50 });
    expect(result.verdict).toBe('unlikely');
  });
});

describe('checkUniversity — GPA gate (NUAA 80+)', () => {
  it('passes at exactly 80', () => {
    const result = checkUniversity(NUAA, { ...baseInput, gpaPercent: 80 });
    expect(result.verdict).toBe('likely');
  });

  it('borderline at 76 (within 5 points)', () => {
    const result = checkUniversity(NUAA, { ...baseInput, gpaPercent: 76 });
    expect(result.verdict).toBe('borderline');
    expect(result.reasonKeys).toContain('gpaBorderline');
  });

  it('unlikely below 75', () => {
    const result = checkUniversity(NUAA, { ...baseInput, gpaPercent: 70 });
    expect(result.verdict).toBe('unlikely');
    expect(result.reasonKeys).toContain('gpaBelow');
  });

  it('borderline (not unlikely) when GPA left blank — the visitor may just not have filled it', () => {
    const result = checkUniversity(NUAA, { ...baseInput, gpaPercent: null });
    expect(result.verdict).toBe('borderline');
    expect(result.reasonKeys).toContain('gpaMissing');
  });
});

describe('checkUniversity — holistic review schools', () => {
  it('HITSZ / UESTC / Sichuan return likely + reviewOnly with no hard gates', () => {
    for (const u of [HITSZ, UESTC, SICHUAN]) {
      const result = checkUniversity(u, baseInput);
      expect(result.verdict).toBe('likely');
      expect(result.reviewOnly).toBe(true);
      expect(result.reasonKeys).toEqual(['reviewOnly']);
    }
  });

  it('reviewOnly stays likely even with no inputs filled at all', () => {
    const result = checkUniversity(HITSZ, {
      educationLevel: 'other',
      gpaPercent: null,
      englishTest: 'none',
      englishScore: null,
      hskLevel: null,
      country: '',
    });
    expect(result.verdict).toBe('likely');
  });
});

describe('checkUniversity — worst gate wins', () => {
  const gated = uni('gated', { english: { ielts: 6.5 }, min_gpa_percent: 80 });

  it('likely only when both gates pass', () => {
    expect(checkUniversity(gated, { ...baseInput, englishScore: 7.0, gpaPercent: 85 }).verdict).toBe('likely');
  });

  it('a hard English failure beats a borderline GPA', () => {
    const result = checkUniversity(gated, { ...baseInput, englishScore: 4.0, gpaPercent: 78 });
    expect(result.verdict).toBe('unlikely');
    expect(result.reasonKeys).toContain('englishBelow');
    expect(result.reasonKeys).toContain('gpaBorderline');
  });

  it('a missing GPA downgrades an otherwise-passing profile to borderline', () => {
    const result = checkUniversity(gated, { ...baseInput, englishScore: 7.0, gpaPercent: null });
    expect(result.verdict).toBe('borderline');
  });
});

describe('checkUniversity — HSK gate (future Chinese-taught webinars)', () => {
  const hskUni = uni('hsk-gated', { hsk: 4 });

  it('passes at the required level', () => {
    expect(checkUniversity(hskUni, { ...baseInput, hskLevel: 4 }).verdict).toBe('likely');
  });

  it('unlikely below the required level', () => {
    const result = checkUniversity(hskUni, { ...baseInput, hskLevel: 3 });
    expect(result.verdict).toBe('unlikely');
    expect(result.reasonKeys).toContain('hskBelow');
  });

  it('unlikely when HSK missing', () => {
    const result = checkUniversity(hskUni, { ...baseInput, hskLevel: null });
    expect(result.verdict).toBe('unlikely');
    expect(result.reasonKeys).toContain('hskMissing');
  });
});

describe('checkAllUniversities — seeded fixture', () => {
  it('a strong profile qualifies for all 5', () => {
    const results = checkAllUniversities(ALL, baseInput);
    expect(results).toHaveLength(5);
    expect(results.every((r) => r.verdict === 'likely')).toBe(true);
    // Seeded order preserved (HITSZ first, NUAA last).
    expect(results.map((r) => r.university.slug)).toEqual([
      'hitsz',
      'scut',
      'uestc',
      'sichuan-university',
      'nuaa',
    ]);
  });

  it('a weak-English strong-GPA profile fails SCUT only', () => {
    const results = checkAllUniversities(ALL, { ...baseInput, englishScore: 4.5 });
    const bySlug = Object.fromEntries(results.map((r) => [r.university.slug, r.verdict]));
    expect(bySlug.scut).toBe('unlikely');
    expect(bySlug.nuaa).toBe('likely');
    expect(bySlug.hitsz).toBe('likely');
  });

  it('a strong-English weak-GPA profile fails NUAA, passes SCUT', () => {
    const results = checkAllUniversities(ALL, { ...baseInput, gpaPercent: 72 });
    const bySlug = Object.fromEntries(results.map((r) => [r.university.slug, r.verdict]));
    expect(bySlug.nuaa).toBe('unlikely');
    expect(bySlug.scut).toBe('likely');
  });
});
