/**
 * program-facets.test.ts
 *
 * PF-1 / PF-3 — the data-driven filter vocabulary and the relevance
 * ranker.
 *
 * The reason this file exists: the finder's filter options used to
 * come from three hardcoded arrays in `src/lib/data.ts` (8 disciplines
 * for a catalogue that has 82 live discipline values), so most of the
 * catalogue was unfilterable. The vocabulary now comes from the table
 * itself, and these tests pin the two pieces of pure logic behind it:
 * the counting + the ranking.
 */
import { describe, it, expect } from 'vitest';
import {
  countFacetValues,
  facetCount,
  PROGRAM_FACET_NONE,
  type ProgramFacet,
} from '@/lib/program-facets';
import { rankByRelevance } from '@/lib/program-search';
import { queryPrograms, parseProgramQueryParams } from '@/lib/program-query';

const ROWS = [
  { degree: 'Master', language: 'English', discipline: 'Nursing', discipline_cn: '护理学', university_slug: 'u-a', scholarship_available: true },
  { degree: 'Master', language: 'English', discipline: 'Nursing', discipline_cn: '护理学', university_slug: 'u-a', scholarship_available: true },
  { degree: 'Bachelor', language: 'Chinese', discipline: 'Nursing', discipline_cn: '护理学', university_slug: 'u-b', scholarship_available: false },
  { degree: 'Bachelor', language: 'English', discipline: 'Dentistry', discipline_cn: '牙科学', university_slug: 'u-b', scholarship_available: false },
  { degree: 'PhD', language: 'English', discipline: null, discipline_cn: null, university_slug: 'u-c', scholarship_available: null },
  { degree: null, language: null, discipline: null, discipline_cn: null, university_slug: 'u-c', scholarship_available: null },
];

describe('countFacetValues', () => {
  it('counts each distinct value', () => {
    const facets = countFacetValues(ROWS, (r) => r.degree);
    const byValue = Object.fromEntries(facets.map((f) => [f.value, f.count]));
    expect(byValue).toEqual({ Master: 2, Bachelor: 2, PhD: 1, '': 1 });
  });

  it('sorts by count desc, then value asc, with the not-published bucket last', () => {
    const facets = countFacetValues(ROWS, (r) => r.degree);
    expect(facets[0].value).toBe('Bachelor');
    expect(facets[1].value).toBe('Master');
    expect(facets[2].value).toBe('PhD');
    expect(facets[3].value).toBe('');
  });

  it('folds NULL and empty strings into the same not-published bucket', () => {
    const facets = countFacetValues(ROWS, (r) => r.discipline);
    const none = facets.find((f) => f.value === '');
    expect(none?.count).toBe(2);
  });

  it('keeps the most frequent Chinese label for a value', () => {
    const facets = countFacetValues(ROWS, (r) => r.discipline, (r) => r.discipline_cn);
    const nursing = facets.find((f) => f.value === 'Nursing');
    expect(nursing?.labelCn).toBe('护理学');
  });

  it('omits the Chinese label when the catalogue has none', () => {
    const facets = countFacetValues(ROWS, (r) => r.degree);
    expect(facets.every((f) => f.labelCn === undefined)).toBe(true);
  });
});

describe('facetCount', () => {
  const facets: ProgramFacet[] = [
    { value: 'Nursing', count: 3 },
    { value: '', count: 2 },
  ];

  it('returns the count for a known value', () => {
    expect(facetCount(facets, 'Nursing')).toBe(3);
  });

  it('maps the not-published sentinel onto the empty bucket', () => {
    expect(facetCount(facets, PROGRAM_FACET_NONE)).toBe(2);
  });

  it('returns 0 for an unknown or empty value', () => {
    expect(facetCount(facets, 'Nope')).toBe(0);
    expect(facetCount(facets, '')).toBe(0);
    expect(facetCount(facets, null)).toBe(0);
  });
});

describe('rankByRelevance', () => {
  const programs = [
    { name: 'Master of Nursing', nameCn: '护理学硕士', universitySlug: 'u-a' },
    { name: 'Nursing', nameCn: '护理', universitySlug: 'u-b' },
    { name: 'Bachelor of Nursing Science', nameCn: '护理学学士', universitySlug: 'u-c' },
    { name: 'Dental Hygiene', nameCn: '口腔卫生', universitySlug: 'u-d' },
    { name: 'Business Administration', nameCn: '工商管理', universitySlug: 'u-e' },
  ];

  it('ranks an exact name match first', () => {
    const ranked = rankByRelevance(programs, 'nursing', []);
    expect(ranked[0].name).toBe('Nursing');
  });

  it('ranks a prefix match before a contains match', () => {
    const ranked = rankByRelevance(programs, 'nursing', []);
    expect(ranked.map((p) => p.name)).toEqual([
      'Nursing',
      'Master of Nursing',
      'Bachelor of Nursing Science',
      'Dental Hygiene',
      'Business Administration',
    ]);
  });

  it('ranks a Chinese-name match above a university match', () => {
    const ranked = rankByRelevance(programs, '护理学', ['u-d']);
    expect(ranked[0].name).toBe('Master of Nursing');
    // 'Dental Hygiene' matched only through its university (score 4),
    // so it sits above the rows that did not match at all (score 5).
    expect(ranked.map((p) => p.name).indexOf('Dental Hygiene')).toBeLessThan(
      ranked.map((p) => p.name).indexOf('Business Administration'),
    );
  });

  it('puts a university match above a non-match', () => {
    const ranked = rankByRelevance(programs, 'zzz', ['u-e']);
    expect(ranked[0].name).toBe('Business Administration');
  });

  it('is stable for equal scores', () => {
    const a = { name: 'A Program', nameCn: 'A', universitySlug: 'x' };
    const b = { name: 'B Program', nameCn: 'B', universitySlug: 'y' };
    const ranked = rankByRelevance([a, b], 'zzz', []);
    expect(ranked.map((p) => p.name)).toEqual(['A Program', 'B Program']);
  });

  it('returns the input untouched for an empty term', () => {
    expect(rankByRelevance(programs, '   ', [])).toHaveLength(programs.length);
  });
});

describe('PF-2 band mapping', () => {
  it('maps a tuition band key onto numeric bounds', () => {
    const p = parseProgramQueryParams(new URLSearchParams('tuition=20000-40000'));
    expect(p.tuitionMin).toBe(20000);
    expect(p.tuitionMax).toBe(40000);
  });

  it('maps an open-ended band onto a single bound', () => {
    const p = parseProgramQueryParams(new URLSearchParams('tuition=40000-'));
    expect(p.tuitionMin).toBe(40000);
    expect(p.tuitionMax).toBeNull();
  });

  it('maps a duration band key onto numeric bounds', () => {
    const p = parseProgramQueryParams(new URLSearchParams('duration=1-2'));
    expect(p.durationMin).toBe(1);
    expect(p.durationMax).toBe(2);
  });

  it('still accepts the raw numeric params for programmatic callers', () => {
    const p = parseProgramQueryParams(
      new URLSearchParams('tuition_min=10000&tuition_max=20000'),
    );
    expect(p.tuitionMin).toBe(10000);
    expect(p.tuitionMax).toBe(20000);
  });

  it('ignores an unknown band key instead of inventing bounds', () => {
    const p = parseProgramQueryParams(new URLSearchParams('tuition=nonsense'));
    expect(p.tuitionMin).toBeNull();
    expect(p.tuitionMax).toBeNull();
  });

  it('carries the intake + city params through', () => {
    const p = parseProgramQueryParams(
      new URLSearchParams('intake=September&year=2027&city=Beijing'),
    );
    expect(p.intakeSeason).toBe('September');
    expect(p.intakeYear).toBe(2027);
    expect(p.city).toBe('Beijing');
  });
});

describe('queryPrograms relevance sort (static fallback)', () => {  it('puts an exact title match ahead of a partial one', async () => {
    const res = await queryPrograms({ search: 'engineering', sort: 'relevance', page: 1, limit: 100 });
    expect(res.programs.length).toBeGreaterThan(0);
    const idx = res.programs.findIndex((p) => p.name.toLowerCase() === 'engineering');
    if (idx >= 0) {
      expect(idx).toBe(0);
    }
  });

  it('keeps the total independent of the sort', async () => {
    const byName = await queryPrograms({ page: 1, limit: 500 });
    const byRelevance = await queryPrograms({ page: 1, limit: 500, sort: 'relevance' });
    expect(byRelevance.total).toBe(byName.total);
  });
});
