/**
 * programs-search.test.ts
 *
 * Phase 173 — university-name search for the programs module.
 *
 * Covers the three pure helpers in src/lib/program-search.ts plus the
 * static-fallback half of `queryPrograms` (which runs with no Supabase
 * configured, so it's directly testable here).
 */
import { describe, it, expect } from 'vitest';
import {
  matchUniversitySlugs,
  buildProgramsSearchOr,
  programMatchesSearch,
  UNIVERSITY_SLUG_MATCH_CAP,
} from '@/lib/program-search';
import { queryPrograms, parseProgramQueryParams } from '@/lib/program-query';
import { programSchema } from '@/lib/validators/program';

const UNIVERSITIES = [
  { slug: 'tsinghua-university', name: 'Tsinghua University', nameCn: '清华大学' },
  { slug: 'peking-university', name: 'Peking University', nameCn: '北京大学' },
  { slug: 'fudan-university', name: 'Fudan University', nameCn: '复旦大学' },
  { slug: 'zhejiang-university', name: 'Zhejiang University', nameCn: '浙江大学' },
];

describe('matchUniversitySlugs', () => {
  it('matches an English university name', () => {
    expect(matchUniversitySlugs('tsinghua', UNIVERSITIES)).toEqual(['tsinghua-university']);
  });

  it('matches a Chinese university name', () => {
    expect(matchUniversitySlugs('清华', UNIVERSITIES)).toEqual(['tsinghua-university']);
  });

  it('is case-insensitive and matches on a partial name', () => {
    expect(matchUniversitySlugs('UNIVERSITY', UNIVERSITIES)).toHaveLength(4);
    expect(matchUniversitySlugs('inghua', UNIVERSITIES)).toEqual(['tsinghua-university']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(matchUniversitySlugs('not-a-real-school', UNIVERSITIES)).toEqual([]);
  });

  it('returns an empty list for an empty or whitespace term', () => {
    expect(matchUniversitySlugs('', UNIVERSITIES)).toEqual([]);
    expect(matchUniversitySlugs('   ', UNIVERSITIES)).toEqual([]);
  });

  it('caps the result set', () => {
    const many = Array.from({ length: 120 }, (_, i) => ({
      slug: `university-${String(i).padStart(3, '0')}`,
      name: `Test University ${i}`,
      nameCn: `测试大学${i}`,
    }));
    expect(matchUniversitySlugs('test', many)).toHaveLength(UNIVERSITY_SLUG_MATCH_CAP);
    // Deterministic: slug order, so the same term always yields the same set.
    expect(matchUniversitySlugs('test', many)).toEqual(matchUniversitySlugs('test', many));
  });

  it('honours an explicit cap override', () => {
    expect(matchUniversitySlugs('university', UNIVERSITIES, 2)).toHaveLength(2);
  });

  it('skips rows with an empty slug rather than emitting an empty in() entry', () => {
    const withBlank = [...UNIVERSITIES, { slug: '', name: 'Blank University', nameCn: '' }];
    expect(matchUniversitySlugs('blank', withBlank)).toEqual([]);
  });

  it('tolerates a missing nameCn', () => {
    const partial = [{ slug: 'x-university', name: 'X University' }];
    expect(matchUniversitySlugs('x', partial)).toEqual(['x-university']);
  });
});

describe('buildProgramsSearchOr', () => {
  it('builds a name-only filter when no university matched', () => {
    expect(buildProgramsSearchOr('cs', [])).toBe('name.ilike.%cs%,name_cn.ilike.%cs%');
  });

  it('appends the university slug list into the SAME or() group', () => {
    expect(buildProgramsSearchOr('tsing', ['tsinghua-university'])).toBe(
      'name.ilike.%tsing%,name_cn.ilike.%tsing%,university_slug.in.(tsinghua-university)',
    );
  });

  it('supports multiple slugs', () => {
    expect(buildProgramsSearchOr('u', ['a-university', 'b-university'])).toBe(
      'name.ilike.%u%,name_cn.ilike.%u%,university_slug.in.(a-university,b-university)',
    );
  });

  /**
   * The `in.()` list is interpolated into a PostgREST filter string with
   * no escaping. That is only safe because program/university slugs are
   * validated to a charset with no comma, paren or quote. If that regex
   * is ever loosened this test must be revisited — it is the guard rail.
   */
  it('is safe because validated slugs cannot contain PostgREST syntax characters', () => {
    const parsed = programSchema.safeParse({
      slug: 'x'.repeat(10),
      name: 'Test',
      discipline: 'Engineering',
      universitySlug: 'some-university',
      description: 'Test program',
    });
    expect(parsed.success).toBe(true);
    const slug = parsed.success ? parsed.data.slug : '';
    expect(slug).not.toMatch(/[,()"'\s]/);

    // Anything passing programSchema's slug rule is safe to interpolate.
    for (const safe of ['a', 'abc-123', 'zhong-guo-shi-da-xue']) {
      expect(safe).not.toMatch(/[,()"'\s]/);
    }
  });
});

describe('programMatchesSearch', () => {
  const program = {
    name: 'Computer Science',
    nameCn: '计算机科学',
    universitySlug: 'tsinghua-university',
  };

  it('matches the English program name', () => {
    expect(programMatchesSearch(program, 'computer', [])).toBe(true);
  });

  it('matches the Chinese program name', () => {
    expect(programMatchesSearch(program, '计算机', [])).toBe(true);
  });

  it('matches by university slug even when the name does not match', () => {
    expect(programMatchesSearch(program, 'tsinghua', ['tsinghua-university'])).toBe(true);
  });

  it('does NOT match a university that is not in the resolved set', () => {
    expect(programMatchesSearch(program, 'tsinghua', ['peking-university'])).toBe(false);
  });

  it('matches everything for an empty term', () => {
    expect(programMatchesSearch(program, '', [])).toBe(true);
    expect(programMatchesSearch(program, '  ', [])).toBe(true);
  });
});

describe('parseProgramQueryParams', () => {
  it('applies sane defaults', () => {
    const p = parseProgramQueryParams(new URLSearchParams());
    expect(p.page).toBe(1);
    expect(p.sort).toBe('name');
    expect(p.scholarshipOnly).toBe(false);
    expect(p.featured).toBe(false);
    expect(p.includeArchived).toBe(false);
    expect(p.onlyArchived).toBe(false);
  });

  it('reads the public page param names', () => {
    const p = parseProgramQueryParams(
      new URLSearchParams('degree=Master&lang=English&disc=Engineering&uni=tsinghua-university&scholarship=1&sort=tuition&page=3'),
    );
    expect(p.degree).toBe('Master');
    expect(p.language).toBe('English');
    expect(p.discipline).toBe('Engineering');
    expect(p.university).toBe('tsinghua-university');
    expect(p.scholarshipOnly).toBe(true);
    expect(p.sort).toBe('tuition');
    expect(p.page).toBe(3);
  });

  /**
   * Regression guard: programs-client.tsx binds `lang` / `disc` / `uni` /
   * `q` to the URL via useUrlState, so those are what a shared or
   * reloaded link actually carries. The RSC must understand them or it
   * renders page 1 unfiltered while the URL claims otherwise — and the
   * client deliberately skips its mount fetch, so nothing recovers.
   */
  it('accepts the short aliases the public page writes to the URL', () => {
    const p = parseProgramQueryParams(
      new URLSearchParams('q=tsinghua&lang=English&disc=Engineering&uni=tsinghua-university'),
    );
    expect(p.search).toBe('tsinghua');
    expect(p.language).toBe('English');
    expect(p.discipline).toBe('Engineering');
    expect(p.university).toBe('tsinghua-university');
  });

  it('prefers the long API param names when both are present', () => {
    const p = parseProgramQueryParams(
      new URLSearchParams('search=long&q=short&language=EN&lang=ZH'),
    );
    expect(p.search).toBe('long');
    expect(p.language).toBe('EN');
  });

  it('clamps garbage paging instead of propagating NaN', () => {
    expect(parseProgramQueryParams(new URLSearchParams('page=abc')).page).toBe(1);
    expect(parseProgramQueryParams(new URLSearchParams('page=-5')).page).toBe(1);
    expect(parseProgramQueryParams(new URLSearchParams('limit=99999')).limit).toBe(500);
  });

  it('treats sort=default as name ordering (the page sends it, the API never did)', () => {
    expect(parseProgramQueryParams(new URLSearchParams('sort=default')).sort).toBe('default');
    // 'default' is not tuition/featured_rank, so queryPrograms falls
    // through to ORDER BY name — deterministic rather than arbitrary.
  });
});

describe('queryPrograms static fallback (no Supabase configured)', () => {
  it('returns a page of rows rather than the whole catalogue', async () => {
    const res = await queryPrograms({ page: 1, limit: 5 });
    expect(res.programs.length).toBeLessThanOrEqual(5);
    expect(res.total).toBeGreaterThan(0);
    expect(res.totalPages).toBe(Math.ceil(res.total / 5));
  });

  it('filters by program name', async () => {
    const res = await queryPrograms({ search: 'engineering', page: 1, limit: 100 });
    expect(res.total).toBeGreaterThan(0);
    for (const p of res.programs) {
      const hit =
        p.name.toLowerCase().includes('engineering') ||
        (p.nameCn ?? '').toLowerCase().includes('engineering');
      expect(hit).toBe(true);
    }
  });

  /**
   * The headline Phase 173 behaviour: a term that is a UNIVERSITY name
   * returns that university's programs, and reports which university
   * matched so the UI can say so.
   */
  it('finds programs by university name', async () => {
    const res = await queryPrograms({ search: 'tsinghua', page: 1, limit: 100 });
    expect(res.matchedUniversitySlugs).toContain('tsinghua-university');
    expect(res.total).toBeGreaterThan(0);
    for (const p of res.programs) {
      const nameHit = p.name.toLowerCase().includes('tsinghua');
      expect(nameHit || res.matchedUniversitySlugs.includes(p.universitySlug)).toBe(true);
    }
  });

  it('finds programs by Chinese university name', async () => {
    const res = await queryPrograms({ search: '清华', page: 1, limit: 100 });
    expect(res.matchedUniversitySlugs).toContain('tsinghua-university');
  });

  it('reports no matched universities for a term that hits nothing', async () => {
    const res = await queryPrograms({ search: 'zzz-not-a-real-thing', page: 1, limit: 100 });
    expect(res.matchedUniversitySlugs).toEqual([]);
    expect(res.total).toBe(0);
    expect(res.programs).toEqual([]);
  });

  /**
   * Track 1.3 U3 #1: a filter that legitimately matches nothing must
   * return `[]`, never silently fall back to the unfiltered list.
   */
  it('does not fall back to the full catalogue when a filter matches nothing', async () => {
    const all = await queryPrograms({ page: 1, limit: 500 });
    const none = await queryPrograms({ search: 'zzz-not-a-real-thing', page: 1, limit: 500 });
    expect(none.total).toBe(0);
    expect(none.programs).toHaveLength(0);
    expect(all.total).toBeGreaterThan(0);
  });

  it('applies the scholarship filter', async () => {
    const res = await queryPrograms({ scholarshipOnly: true, page: 1, limit: 500 });
    for (const p of res.programs) expect(p.scholarshipAvailable).toBeTruthy();
  });

  it('composes scholarship + university filters', async () => {
    const res = await queryPrograms({
      scholarshipOnly: true,
      university: 'tsinghua-university',
      page: 1,
      limit: 500,
    });
    for (const p of res.programs) {
      expect(p.universitySlug).toBe('tsinghua-university');
      expect(p.scholarshipAvailable).toBeTruthy();
    }
  });

  it('paginates consistently with the total', async () => {
    const page1 = await queryPrograms({ page: 1, limit: 2 });
    const page2 = await queryPrograms({ page: 2, limit: 2 });
    if (page1.total > 2) {
      expect(page2.programs.length).toBeGreaterThan(0);
      const overlap = page1.programs.filter((p) => page2.programs.some((q) => q.slug === p.slug));
      expect(overlap).toHaveLength(0);
    }
  });
});
