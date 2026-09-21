import { describe, it, expect } from 'vitest';
import { buildCounsellingIcs } from '@/lib/counselling-ics';
import { SESSION_MINUTES } from '@/lib/counselling-slots';

/** Unfold RFC 5545 folded lines so assertions can match whole content lines. */
function unfold(ics: string): string[] {
  return ics
    .replace(/\r\n /g, '')
    .split('\r\n')
    .filter((l) => l.length > 0);
}

function line(ics: string, prefix: string): string | undefined {
  return unfold(ics).find((l) => l.startsWith(prefix));
}

const BASE = {
  reference: 'CS-20260922-ABCD',
  studentName: 'Wei Zhang',
  slotStart: '2026-09-22T01:00:00.000Z',
  meetingLink: 'https://zoom.us/j/1234567890',
  locale: 'en' as const,
};

describe('buildCounsellingIcs', () => {
  it('renders DTSTART as the UTC instant and DTEND as start + SESSION_MINUTES', () => {
    const ics = buildCounsellingIcs(BASE);
    // 01:00:00Z + 10 minutes = 01:10:00Z.
    expect(line(ics, 'DTSTART:')).toBe('DTSTART:20260922T010000Z');
    expect(line(ics, 'DTEND:')).toBe('DTEND:20260922T011000Z');
    expect(SESSION_MINUTES).toBe(10);
  });

  it('accepts CRLF line endings only, with a trailing CRLF', () => {
    const ics = buildCounsellingIcs(BASE);
    expect(ics).not.toMatch(/(?<!\r)\n/);
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics).toContain('BEGIN:VCALENDAR\r\n');
  });

  it('escapes TEXT specials in the student name', () => {
    const ics = buildCounsellingIcs({ ...BASE, studentName: 'Zhang, Wei; Jr' });
    expect(line(ics, 'SUMMARY:')).toBe('SUMMARY:SICA Free Counselling Session — Zhang\\, Wei\\; Jr');
  });

  it('puts the reference in the UID and both locales in the summary', () => {
    const en = buildCounsellingIcs(BASE);
    expect(line(en, 'UID:')).toBe(`UID:${BASE.reference}@studyinchina.academy`);
    expect(line(en, 'SUMMARY:')).toContain('Free Counselling Session');

    const zh = buildCounsellingIcs({ ...BASE, locale: 'zh' });
    expect(line(zh, 'SUMMARY:')).toContain('免费留学咨询');
    expect(unfold(zh).join('\n')).toContain('预约编号：');
  });

  it('includes the meeting link in DESCRIPTION and LOCATION, falling back to Online', () => {
    const linked = buildCounsellingIcs(BASE);
    expect(unfold(linked).join('\n')).toContain(`Meeting link: ${BASE.meetingLink}`);
    expect(line(linked, 'LOCATION:')).toBe(`LOCATION:${BASE.meetingLink}`);

    const bare = buildCounsellingIcs({ ...BASE, meetingLink: null });
    expect(line(bare, 'LOCATION:')).toBe('LOCATION:Online');
    expect(unfold(bare).join('\n')).toContain('The meeting link will follow by email.');
  });

  it('folds content lines to the RFC 75-octet limit with space continuations', () => {
    const ics = buildCounsellingIcs({
      ...BASE,
      meetingLink: `https://zoom.us/j/${'9'.repeat(160)}`,
    });
    const rawLines = ics.split('\r\n').filter((l) => l.length > 0);
    for (const l of rawLines) {
      expect(Buffer.byteLength(l, 'utf8')).toBeLessThanOrEqual(75);
    }
    // Unfolding must reproduce the full DESCRIPTION value.
    const desc = line(ics, 'DESCRIPTION:');
    expect(desc).toContain(`Meeting link: https://zoom.us/j/${'9'.repeat(160)}`);
  });

  it('contains a 1-hour display alarm and STATUS:CONFIRMED', () => {
    const ics = buildCounsellingIcs(BASE);
    expect(ics).toContain('TRIGGER:-PT1H');
    expect(ics).toContain('ACTION:DISPLAY');
    expect(ics).toContain('STATUS:CONFIRMED');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics).toContain('END:VALARM');
  });
});
