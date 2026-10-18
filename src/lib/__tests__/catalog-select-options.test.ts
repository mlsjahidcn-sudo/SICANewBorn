import { describe, expect, it } from 'vitest';
import {
  buildProgramSelectOptions,
  buildUniversitySelectOptions,
} from '@/lib/catalog-select-options';

const UNIS = [
  {
    slug: 'tsinghua-university',
    name: 'Tsinghua University',
    nameCn: '清华大学',
    city: 'Beijing',
    cityCn: '北京',
    logo: '/university-logos/tsinghua-university.avif',
  },
  {
    slug: 'peking-university',
    name: 'Peking University',
    nameCn: '北京大学',
    city: 'Beijing',
    cityCn: '北京',
    logo: '/university-logos/peking-university.avif',
  },
] as const;

const PROGRAMS = [
  {
    slug: 'cs-bsc-tsinghua',
    name: 'BSc in Computer Science',
    nameCn: '计算机科学学士',
    universitySlug: 'tsinghua-university',
    degree: 'Bachelor' as const,
    language: 'English' as const,
  },
  {
    slug: 'mba-pku',
    name: 'MBA',
    nameCn: '工商管理硕士',
    universitySlug: 'peking-university',
    degree: 'Master' as const,
    language: 'English' as const,
  },
  {
    slug: 'phd-physics-tsinghua',
    name: 'PhD in Physics',
    nameCn: '物理学博士',
    universitySlug: 'tsinghua-university',
    degree: 'PhD' as const,
    language: 'Chinese' as const,
  },
];

describe('buildUniversitySelectOptions', () => {
  it('maps slug/label/city/logo', () => {
    const opts = buildUniversitySelectOptions({ universities: UNIS });
    expect(opts).toHaveLength(2);
    expect(opts[0]).toEqual({
      value: 'tsinghua-university',
      label: 'Tsinghua University',
      sublabel: 'Beijing',
      logo: '/university-logos/tsinghua-university.avif',
    });
  });

  it('uses Chinese name + city when locale=zh', () => {
    const opts = buildUniversitySelectOptions({
      universities: UNIS,
      locale: 'zh',
    });
    expect(opts[0].label).toBe('清华大学');
    expect(opts[0].sublabel).toBe('北京');
  });

  it('skips rows without slug and respects limit', () => {
    const opts = buildUniversitySelectOptions({
      universities: [
        { ...UNIS[0], slug: '' },
        UNIS[0],
        UNIS[1],
      ],
      limit: 1,
    });
    expect(opts).toHaveLength(1);
    expect(opts[0].value).toBe('tsinghua-university');
  });
});

describe('buildProgramSelectOptions', () => {
  it('includes university logo + at-uni sublabel', () => {
    const opts = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
    });
    expect(opts).toHaveLength(3);
    expect(opts[0]).toMatchObject({
      value: 'cs-bsc-tsinghua',
      label: 'BSc in Computer Science',
      logo: '/university-logos/tsinghua-university.avif',
    });
    expect(opts[0].sublabel).toBe(
      'at Tsinghua University · Bachelor · English',
    );
  });

  it('accepts custom atLabel interpolator', () => {
    const opts = buildProgramSelectOptions({
      programs: [PROGRAMS[0]],
      universities: UNIS,
      atLabel: (name) => `就读于 ${name}`,
    });
    expect(opts[0].sublabel).toBe(
      '就读于 Tsinghua University · Bachelor · English',
    );
  });

  it('filters by degree and universitySlug independently', () => {
    const byDegree = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      degreeFilter: 'Master',
    });
    expect(byDegree.map((o) => o.value)).toEqual(['mba-pku']);

    const byUni = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      universitySlugFilter: 'tsinghua-university',
    });
    expect(byUni.map((o) => o.value)).toEqual([
      'cs-bsc-tsinghua',
      'phd-physics-tsinghua',
    ]);

    const both = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      degreeFilter: 'PhD',
      universitySlugFilter: 'tsinghua-university',
    });
    expect(both.map((o) => o.value)).toEqual(['phd-physics-tsinghua']);
  });

  it('filters by universitySlugFilters (multi) and takes precedence over single', () => {
    const multi = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      universitySlugFilters: ['tsinghua-university', 'peking-university'],
    });
    expect(multi.map((o) => o.value)).toEqual([
      'cs-bsc-tsinghua',
      'mba-pku',
      'phd-physics-tsinghua',
    ]);

    const oneOfMulti = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      universitySlugFilters: ['peking-university'],
    });
    expect(oneOfMulti.map((o) => o.value)).toEqual(['mba-pku']);

    // Multi takes precedence over the single-slug filter when both set.
    const precedence = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      universitySlugFilter: 'tsinghua-university',
      universitySlugFilters: ['peking-university'],
    });
    expect(precedence.map((o) => o.value)).toEqual(['mba-pku']);

    // Empty / whitespace-only multi list falls through to single filter.
    const emptyMulti = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      universitySlugFilter: 'tsinghua-university',
      universitySlugFilters: ['  ', ''],
    });
    expect(emptyMulti.map((o) => o.value)).toEqual([
      'cs-bsc-tsinghua',
      'phd-physics-tsinghua',
    ]);

    // Multi + degree still AND together.
    const multiAndDegree = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      degreeFilter: 'Bachelor',
      universitySlugFilters: ['tsinghua-university', 'peking-university'],
    });
    expect(multiAndDegree.map((o) => o.value)).toEqual(['cs-bsc-tsinghua']);
  });

  it('falls back meta-only sublabel when university is missing', () => {
    const opts = buildProgramSelectOptions({
      programs: [
        {
          ...PROGRAMS[0],
          universitySlug: 'unknown-uni',
        },
      ],
      universities: UNIS,
    });
    expect(opts[0].sublabel).toBe('Bachelor · English');
    expect(opts[0].logo).toBeUndefined();
  });

  it('uses Chinese labels when locale=zh', () => {
    const opts = buildProgramSelectOptions({
      programs: [PROGRAMS[0]],
      universities: UNIS,
      locale: 'zh',
    });
    expect(opts[0].label).toBe('计算机科学学士');
    expect(opts[0].sublabel).toContain('清华大学');
  });

  it('respects limit after filters', () => {
    const opts = buildProgramSelectOptions({
      programs: PROGRAMS,
      universities: UNIS,
      limit: 1,
    });
    expect(opts).toHaveLength(1);
  });
});
