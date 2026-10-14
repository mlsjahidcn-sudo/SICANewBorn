/**
 * webinar-brief-sanitize.test.ts
 *
 * Phase 163: vitest cases for the AI-generated webinar brief
 * sanitizer. Pure functions — no network, no Supabase. Validates
 * the 11 hard rules from `webinar-brief-prompt.ts` are enforced
 * by the sanitizer even when the model ignores them.
 *
 * Pattern: mirrors Phase 128+ `university-refine-sanitize.test.ts`
 * — extract JSON, normalise, validate per-field.
 */
import { describe, it, expect } from 'vitest';
import {
  extractRawModelInput,
  normalizeBriefPayload,
} from '@/lib/ai/webinar-brief-sanitize';

const ALLOWED_SLUGS = [
  'south-china-university-of-technology',
  'university-of-electronic-science-and-technology-of-china',
  'harbin-institute-of-technology-shenzhen',
  'sichuan-university',
  'nanjing-university-of-aeronautics-and-astronautics',
];

describe('extractRawModelInput', () => {
  it('returns null for empty input', () => {
    expect(extractRawModelInput('')).toBeNull();
    expect(extractRawModelInput('   ')).toBeNull();
  });

  it('strips markdown fences + parses bare JSON', () => {
    const raw = '```json\n{"titleEn":"Hello"}\n```';
    expect(extractRawModelInput(raw)).toEqual({ titleEn: 'Hello' });
  });

  it('strips prose before the first { and after the last }', () => {
    const raw = `Here is the brief you requested:
{"titleEn": "Hello", "titleZh": "你好"}
Hope this helps!`;
    expect(extractRawModelInput(raw)).toEqual({
      titleEn: 'Hello',
      titleZh: '你好',
    });
  });

  it('repairs trailing commas before }', () => {
    const raw = `{"titleEn":"Hello",}`;
    expect(extractRawModelInput(raw)).toEqual({ titleEn: 'Hello' });
  });

  it('returns null when no JSON envelope is present', () => {
    expect(extractRawModelInput('Sorry, I cannot help with that.')).toBeNull();
  });
});

describe('normalizeBriefPayload — slug whitelist', () => {
  it('drops invented slugs and surfaces a warning', () => {
    const parsed = {
      titleEn: 'Test',
      titleZh: '测试',
      featuredUniversities: [
        {
          slug: 'invented-university-of-test',
          topics: {
            program: { titleEn: 'X', titleZh: 'Y', bodyEn: 'Z', bodyZh: 'Z' },
          },
        },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result).not.toBeNull();
    expect(result!.featuredUniversities).toHaveLength(0);
    expect(result!.warnings.some((w) => w.includes('invented-university-of-test'))).toBe(true);
  });

  it('accepts every slug in the input set', () => {
    const parsed = {
      titleEn: 'OK',
      titleZh: '好的',
      featuredUniversities: ALLOWED_SLUGS.map((slug) => ({
        slug,
        topics: {
          program: { titleEn: 'P', titleZh: '项目', bodyEn: 'B', bodyZh: 'B' },
        },
      })),
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result).not.toBeNull();
    expect(result!.featuredUniversities.map((u) => u.slug)).toEqual(ALLOWED_SLUGS);
  });

  it('dedupes a slug that appears twice in the model output', () => {
    const parsed = {
      titleEn: 'X',
      titleZh: 'X',
      featuredUniversities: [
        { slug: ALLOWED_SLUGS[0], topics: { program: { titleEn: 'a', titleZh: 'a', bodyEn: 'a', bodyZh: 'a' } } },
        { slug: ALLOWED_SLUGS[0], topics: { program: { titleEn: 'b', titleZh: 'b', bodyEn: 'b', bodyZh: 'b' } } },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.featuredUniversities).toHaveLength(1);
    expect(result!.warnings.some((w) => w.includes('twice'))).toBe(true);
  });
});

describe('normalizeBriefPayload — pricing scrub (Hard rule #6)', () => {
  it('strips $99 from a body field', () => {
    const parsed = {
      titleEn: 'X',
      titleZh: 'X',
      featuredUniversities: [
        {
          slug: ALLOWED_SLUGS[0],
          topics: {
            program: {
              titleEn: 'Programs',
              titleZh: '开设项目',
              bodyEn: 'Tuition $99 per application',
              bodyZh: '申请费用 $99',
            },
          },
        },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.featuredUniversities[0].topics.program!.bodyEn).not.toContain('$99');
    expect(result!.featuredUniversities[0].topics.program!.bodyZh).not.toContain('$99');
    expect(result!.warnings.some((w) => w.includes('stripped SICA pricing'))).toBe(true);
  });

  it('strips "free service" patterns', () => {
    const parsed = {
      titleEn: 'X',
      titleZh: 'X',
      featuredUniversities: [
        {
          slug: ALLOWED_SLUGS[0],
          topics: {
            program: {
              titleEn: 'Programs',
              titleZh: '开设项目',
              bodyEn: 'SICA offers this free service',
              bodyZh: 'SICA 提供 free service',
            },
          },
        },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.featuredUniversities[0].topics.program!.bodyEn.toLowerCase()).not.toContain('free service');
  });
});

describe('normalizeBriefPayload — parallel en/zh fallback (Hard rule #5)', () => {
  it('fills empty en from zh when only zh is present', () => {
    const parsed = {
      titleEn: 'X',
      titleZh: 'X',
      featuredUniversities: [
        {
          slug: ALLOWED_SLUGS[0],
          topics: {
            program: { titleEn: 'Programs', titleZh: '开设项目', bodyEn: '', bodyZh: '中文' },
          },
        },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.featuredUniversities[0].topics.program!.bodyEn).toBe('中文');
    expect(result!.featuredUniversities[0].topics.program!.bodyZh).toBe('中文');
  });

  it('fills empty zh from en when only en is present', () => {
    const parsed = {
      titleEn: 'X',
      titleZh: 'X',
      featuredUniversities: [
        {
          slug: ALLOWED_SLUGS[0],
          topics: {
            program: { titleEn: 'Programs', titleZh: '开设项目', bodyEn: 'English only', bodyZh: '' },
          },
        },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.featuredUniversities[0].topics.program!.bodyZh).toBe('English only');
  });

  it('marks topics with both empty as dropped via warning', () => {
    const parsed = {
      titleEn: 'X',
      titleZh: 'X',
      featuredUniversities: [
        {
          slug: ALLOWED_SLUGS[0],
          topics: {
            program: { titleEn: 'Programs', titleZh: '开设项目', bodyEn: '', bodyZh: '' },
          },
        },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.warnings.some((w) => w.includes('both empty'))).toBe(true);
  });
});

describe('normalizeBriefPayload — kind whitelist', () => {
  it('drops unknown topic kinds with a warning', () => {
    const parsed = {
      titleEn: 'X',
      titleZh: 'X',
      featuredUniversities: [
        {
          slug: ALLOWED_SLUGS[0],
          topics: {
            program: { titleEn: 'a', titleZh: 'a', bodyEn: 'a', bodyZh: 'a' },
            scholarship: { titleEn: 'a', titleZh: 'a', bodyEn: 'a', bodyZh: 'a' },
            timing: { titleEn: 'a', titleZh: 'a', bodyEn: 'a', bodyZh: 'a' },
            requirement: { titleEn: 'a', titleZh: 'a', bodyEn: 'a', bodyZh: 'a' },
            garbage: { titleEn: 'g', titleZh: 'g', bodyEn: 'g', bodyZh: 'g' },
          },
        },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    // 'garbage' is dropped from the typed Record — only valid
    // kinds remain on the resulting topic map. The warning is
    // emitted so the admin can see "AI invented a kind we don't
    // support" without us silently storing it.
    expect(result!.warnings.some((w) => w.includes('garbage'))).toBe(true);
    const remainingKeys = Object.keys(result!.featuredUniversities[0].topics);
    expect(remainingKeys).not.toContain('garbage');
    expect(remainingKeys).toEqual(
      expect.arrayContaining(['program', 'scholarship', 'timing', 'requirement']),
    );
  });
});

describe('normalizeBriefPayload — title/description fallback', () => {
  it('mirrors titleZh into titleEn when titleEn is empty', () => {
    const parsed = {
      titleEn: '',
      titleZh: '中文标题',
      descriptionEn: '',
      descriptionZh: '中文简介',
      featuredUniversities: [],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.titleEn).toBe('中文标题');
    expect(result!.titleZh).toBe('中文标题');
    expect(result!.descriptionEn).toBe('中文简介');
    expect(result!.descriptionZh).toBe('中文简介');
  });

  it('returns null when every field is empty and no universities are present', () => {
    expect(normalizeBriefPayload({}, ALLOWED_SLUGS)).toBeNull();
  });
});

describe('normalizeBriefPayload — length caps', () => {
  it('clips titleEn to 90 chars', () => {
    const longTitle = 'A'.repeat(200);
    const parsed = { titleEn: longTitle, titleZh: 'X', featuredUniversities: [] };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.titleEn.length).toBeLessThanOrEqual(90);
  });

  it('clips titleZh to 30 chars', () => {
    const longTitle = 'A'.repeat(200);
    const parsed = { titleEn: 'X', titleZh: longTitle, featuredUniversities: [] };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.titleZh.length).toBeLessThanOrEqual(30);
  });
});

describe('normalizeBriefPayload — input-shape tolerance', () => {
  it('accepts the snake_case alias shape', () => {
    const parsed = {
      title_en: 'Engineering + CS',
      title_zh: '工程与计算机',
      universities: [
        {
          university_slug: ALLOWED_SLUGS[0],
          sections: {
            program: { body_en: 'a', body_zh: 'b', title_en: 'Programs', title_zh: '开设项目' },
          },
        },
      ],
    };
    const result = normalizeBriefPayload(parsed, ALLOWED_SLUGS);
    expect(result!.titleEn).toBe('Engineering + CS');
    expect(result!.titleZh).toBe('工程与计算机');
    expect(result!.featuredUniversities).toHaveLength(1);
    expect(result!.featuredUniversities[0].slug).toBe(ALLOWED_SLUGS[0]);
  });
});