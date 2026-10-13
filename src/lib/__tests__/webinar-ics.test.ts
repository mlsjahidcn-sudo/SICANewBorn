import { describe, expect, it } from 'vitest';
import { buildWebinarIcs } from '@/lib/webinar-ics';
import { parseWebinarContent } from '@/lib/webinar-content';

/**
 * Phase 161: .ics builder + jsonb content parser tests.
 */

describe('buildWebinarIcs', () => {
  const startsAt = '2026-10-20T13:00:00.000Z'; // 21:00 Beijing

  it('anchors DTSTART/DTEND in UTC basic format and honours duration', () => {
    const ics = buildWebinarIcs({
      title: 'Study in China 2027',
      startsAt,
      durationMinutes: 90,
      pageUrl: 'https://studyinchina.academy/webinar/study-in-china-2027-top-universities',
      meetUrl: 'https://meet.google.com/abc-defg-hij',
      locale: 'en',
    });
    expect(ics).toContain('DTSTART:20261020T130000Z');
    // 90 min later = 14:30Z
    expect(ics).toContain('DTEND:20261020T143000Z');
  });

  it('carries the meeting link when published', () => {
    const ics = buildWebinarIcs({
      title: 'T',
      startsAt,
      durationMinutes: 60,
      pageUrl: 'https://example.com/w',
      meetUrl: 'https://meet.google.com/abc',
      locale: 'en',
    });
    expect(ics).toContain('https://meet.google.com/abc');
  });

  it('says the link arrives by email when meetUrl is null (never a stale TBA link)', () => {
    const ics = buildWebinarIcs({
      title: 'T',
      startsAt,
      durationMinutes: 60,
      pageUrl: 'https://example.com/w',
      meetUrl: null,
      locale: 'en',
    });
    expect(ics).not.toContain('meet.google');
    expect(ics).toContain('will be emailed');
  });

  it('escapes TEXT syntax (comma / semicolon / newline) in the summary', () => {
    const ics = buildWebinarIcs({
      title: 'A, B; C\nLine2',
      startsAt,
      durationMinutes: 60,
      pageUrl: 'https://example.com/w',
      meetUrl: null,
      locale: 'en',
    });
    const summaryLine = ics.split('\r\n').find((l) => l.startsWith('SUMMARY:'));
    expect(summaryLine).toBeDefined();
    expect(summaryLine).toContain('A\\, B\\; C\\nLine2');
  });

  it('uses CRLF line endings per RFC 5545', () => {
    const ics = buildWebinarIcs({
      title: 'T',
      startsAt,
      durationMinutes: 60,
      pageUrl: 'https://example.com/w',
      meetUrl: null,
      locale: 'en',
    });
    expect(ics).toMatch(/\r\n$/);
    expect(ics.split('\r\n')[0]).toBe('BEGIN:VCALENDAR');
    expect(ics.trimEnd().split('\r\n').pop()).toBe('END:VCALENDAR');
  });

  it('includes a 60-minute VALARM and the localized zh copy', () => {
    const ics = buildWebinarIcs({
      title: '讲座',
      startsAt,
      durationMinutes: 60,
      pageUrl: 'https://example.com/w',
      meetUrl: null,
      locale: 'zh',
    });
    expect(ics).toContain('TRIGGER:-PT60M');
    expect(ics).toContain('SICA 线上讲座');
  });
});

describe('parseWebinarContent', () => {
  const agenda = [
    { icon: 'csca', title_en: 'CSCA prep', title_zh: 'CSCA 备考', body_en: 'a', body_zh: '甲' },
  ];
  const universities = [
    {
      slug: 'scut',
      name_en: 'SCUT',
      name_zh: '华南理工',
      city_en: 'Guangzhou',
      city_zh: '广州',
      ranking_label: '985 · 211',
      english_programs_en: 'CS',
      english_programs_zh: '计算机',
      scholarship_en: 'A–D',
      scholarship_zh: 'A–D 类',
      requirements_en: 'IELTS 5.5 / TOEFL 68',
      requirements_zh: '雅思 5.5 / 托福 68',
      deadline: '2027-06-30',
      eligibility: { english: { ielts: 5.5, toefl: 68 } },
    },
  ];
  const faq = [{ q_en: 'Q', q_zh: '问', a_en: 'A', a_zh: '答' }];

  it('maps the seeded jsonb shape into typed entries', () => {
    const content = parseWebinarContent(agenda, universities, faq);
    expect(content.agenda).toHaveLength(1);
    expect(content.agenda[0].titleZh).toBe('CSCA 备考');
    expect(content.featuredUniversities[0].eligibility.english?.ielts).toBe(5.5);
    expect(content.featuredUniversities[0].deadline).toBe('2027-06-30');
    expect(content.faq[0].qEn).toBe('Q');
  });

  it('degrades every malformed input to empty lists without throwing', () => {
    const content = parseWebinarContent(null, 'not-an-array', [{ q_en: '' }]);
    expect(content.agenda).toEqual([]);
    expect(content.featuredUniversities).toEqual([]);
    // An FAQ row with no question text at all is dropped.
    expect(content.faq).toEqual([]);
  });

  it('keeps an entry whose English text is empty but Chinese is set', () => {
    const content = parseWebinarContent(
      [{ icon: 'x', title_en: '', title_zh: '中文标题', body_en: '', body_zh: '' }],
      [
        {
          ...universities[0],
          name_en: '',
          name_zh: '只有中文',
        },
      ],
      [],
    );
    expect(content.agenda[0].titleZh).toBe('中文标题');
    expect(content.featuredUniversities[0].nameZh).toBe('只有中文');
  });

  it('drops a university row with neither name', () => {
    const content = parseWebinarContent(
      [],
      [{ ...universities[0], name_en: '', name_zh: '' }],
      [],
    );
    expect(content.featuredUniversities).toEqual([]);
  });
});
