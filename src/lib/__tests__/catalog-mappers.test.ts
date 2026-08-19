import { describe, it, expect } from 'vitest';
import {
  mapUniversityFromDb,
  mapUniversityToDb,
  mapProgramFromDb,
  mapScholarshipFromDb,
  mapScholarshipToDb,
  slugify,
} from '@/lib/catalog-mappers';
import { universitySchema } from '@/lib/validators/university';
import { programSchema } from '@/lib/validators/program';
import { scholarshipSchema } from '@/lib/validators/scholarship';
import { pickSentFields } from '@/lib/validators/shared';

// Track 1.3 U2: pure-function coverage for the consolidated catalog
// mappers and the slug/partial-PUT validator behavior. No DB, no
// network — same style as rate-limit.test.ts.

const universityRow: Record<string, unknown> = {
  slug: 'round-trip-university',
  name: 'Round Trip University',
  name_cn: '往返大学',
  city: 'Beijing',
  city_cn: '北京',
  ranking: 12,
  rating: 4.5,
  type: 'Public',
  type_cn: '公立',
  established: 1950,
  students: '30,000',
  intl_students: '2,000',
  description: 'A university used for mapper round-trips.',
  description_cn: '用于映射往返测试的大学。',
  popular_programs: ['CS'],
  popular_programs_cn: ['计算机'],
  tuition_undergrad: '¥30,000/year',
  tuition_graduate: '¥40,000/year',
  intake: 'September',
  intake_cn: '9月',
  disciplines: ['Engineering'],
  image: '/img/u.jpg',
  logo: '/img/u-logo.png',
  qs_ranking: '50',
  qs_world_ranking: 51,
  tags: ['C9'],
  tags_cn: ['九校联盟'],
  accommodation: 'On-campus dorms',
  accommodation_cn: '校内宿舍',
  accommodation_cost: '¥5,000/year',
  accommodation_cost_cn: '每年¥5,000',
  accommodation_types: ['Single'],
  accommodation_types_cn: ['单人间'],
  gallery: ['/img/g1.jpg'],
  highlights_en: ['Top school'],
  highlights_zh: ['顶尖学府'],
  scholarship_info: 'CSC available',
  scholarship_info_cn: '可申请CSC',
  application_deadline: '2026-03-31',
};

describe('university mappers', () => {
  it('round-trips a representative row through fromDb → toDb', () => {
    // Slug is not in the static data, so withStaticFallback is a no-op.
    const mapped = mapUniversityFromDb(universityRow);
    expect(mapUniversityToDb(mapped)).toEqual(universityRow);
  });

  it('defaults missing array columns to [] and builds highlights object', () => {
    const mapped = mapUniversityFromDb({ slug: 'sparse-row' });
    expect(mapped.popularPrograms).toEqual([]);
    expect(mapped.highlights).toEqual({ en: [], zh: [] });
  });

  it('maps highlights through both {en, zh} and legacy flat shapes', () => {
    const fromObject = mapUniversityToDb({ highlights: { en: ['a'], zh: ['甲'] } });
    expect(fromObject.highlights_en).toEqual(['a']);
    expect(fromObject.highlights_zh).toEqual(['甲']);
    const fromFlat = mapUniversityToDb({ highlights: ['shared'] });
    expect(fromFlat.highlights_en).toEqual(['shared']);
    expect(fromFlat.highlights_zh).toEqual(['shared']);
  });
});

describe('program mappers', () => {
  it('falls back to static data for null Cn fields via cnFallback', () => {
    const mapped = mapProgramFromDb({
      slug: 'computer-science-bsc-tsinghua',
      discipline_cn: null,
      duration_cn: null,
      intake_cn: null,
    });
    expect(mapped.disciplineCn).toBe('计算机科学');
    expect(mapped.durationCn).toBe('4年');
    expect(mapped.intakeCn).toBe('9月');
  });

  it('returns undefined for null Cn fields with no static row', () => {
    const mapped = mapProgramFromDb({ slug: 'no-such-program', discipline_cn: null });
    expect(mapped.disciplineCn).toBeUndefined();
  });

  it('prefers the DB value over the static fallback', () => {
    const mapped = mapProgramFromDb({
      slug: 'computer-science-bsc-tsinghua',
      discipline_cn: '软件工程',
    });
    expect(mapped.disciplineCn).toBe('软件工程');
  });
});

describe('scholarship mappers', () => {
  it('round-trips a representative row through fromDb → toDb', () => {
    const row: Record<string, unknown> = {
      slug: 'csc-full',
      name: 'CSC Scholarship',
      name_cn: '中国政府奖学金',
      type: 'Full',
      degree_levels: ['Bachelor'],
      eligible_regions: 'All countries',
      duration: '4 years',
      description: 'Full ride.',
      description_cn: '全额奖学金。',
      coverage: ['Tuition'],
      coverage_cn: ['学费'],
      requirements: ['IELTS 6.5'],
      requirements_cn: ['雅思6.5'],
      application_process: 'Apply via CSC portal',
      application_process_cn: '通过CSC门户申请',
      deadline: '2026-04-30',
      application_method: 'Online',
      application_method_cn: '在线',
    };
    expect(mapScholarshipToDb(mapScholarshipFromDb(row))).toEqual(row);
  });
});

describe('slugify', () => {
  it('produces lowercase kebab-case', () => {
    expect(slugify('BSc in Computer Science')).toBe('bsc-in-computer-science');
    expect(slugify('  --Weird  Name!! ')).toBe('weird-name');
  });

  it('collides on inputs that differ only in case/punctuation', () => {
    // This is the collision the bulk-import route dedupes with -2/-3.
    expect(slugify('Foo Bar')).toBe(slugify('foo-bar'));
    expect(slugify('Foo  Bar')).toBe(slugify('Foo Bar'));
  });
});

describe('slug format validation', () => {
  const validUniversity = {
    slug: 'tsinghua-university',
    name: 'Tsinghua University',
    city: 'Beijing',
    ranking: 1,
    type: 'Public',
    established: 1911,
    description: 'Top university in China.',
    image: '/img/t.jpg',
  };
  const validProgram = {
    slug: 'computer-science-bsc-tsinghua',
    name: 'BSc in Computer Science',
    universitySlug: 'tsinghua-university',
    discipline: 'Computer Science',
    description: 'CS program.',
  };
  const validScholarship = {
    slug: 'csc-full',
    name: 'CSC Scholarship',
    description: 'Full ride.',
  };

  it('accepts valid kebab-case slugs in all three schemas', () => {
    expect(universitySchema.safeParse(validUniversity).success).toBe(true);
    expect(programSchema.safeParse(validProgram).success).toBe(true);
    expect(scholarshipSchema.safeParse(validScholarship).success).toBe(true);
    expect(universitySchema.safeParse({ ...validUniversity, slug: 'a1-b2' }).success).toBe(true);
  });

  it.each(['Bad Slug', 'slug_with_underscore', '-leading', 'trailing-', '', 'UPPER'])(
    'rejects invalid slug %s',
    (slug) => {
      expect(universitySchema.safeParse({ ...validUniversity, slug }).success).toBe(false);
      expect(programSchema.safeParse({ ...validProgram, slug }).success).toBe(false);
      expect(scholarshipSchema.safeParse({ ...validScholarship, slug }).success).toBe(false);
    },
  );
});

describe('partial PUT semantics', () => {
  it('partial schema accepts a body with omitted fields', () => {
    const parsed = universitySchema.partial().safeParse({ rating: 4.5 });
    expect(parsed.success).toBe(true);
  });

  it('pickSentFields strips zod defaults for keys the client omitted', () => {
    const raw = { rating: 4.5 };
    const parsed = universitySchema.partial().parse(raw);
    // zod v4 .partial() still applies defaults — e.g. nameCn: '' —
    // so the PUT handlers must filter down to the sent keys.
    expect(parsed.nameCn).toBe('');
    const patch = pickSentFields(parsed, raw);
    expect(patch).toEqual({ rating: 4.5 });
  });

  it('pickSentFields tolerates non-object raw bodies', () => {
    const parsed = programSchema.partial().parse({});
    expect(pickSentFields(parsed, null)).toEqual({});
    expect(pickSentFields(parsed, 'nope')).toEqual({});
  });
});
