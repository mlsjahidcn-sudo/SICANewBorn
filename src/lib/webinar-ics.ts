/**
 * Phase 161: RFC 5545 calendar-invite builder for webinar signups.
 *
 * Mirrors src/lib/counselling-ics.ts (Phase 123): pure string
 * generation, UTC-anchored DTSTART (every client renders it in the
 * viewer's local timezone), CRLF line endings, TEXT escaping +
 * ≤75-octet folding. The webinar landing page offers the .ics as a
 * Blob download after a successful signup ("Add to calendar").
 *
 * The meeting link is intentionally NOT embedded while staff hasn't
 * pasted it yet — the description says it arrives by email, so the
 * calendar entry never carries a stale TBA link.
 */

export interface WebinarIcsInput {
  title: string;
  /** Absolute start — Date or ISO-8601 string (webinar_sessions.session_date). */
  startsAt: Date | string;
  /** Minutes (webinar_sessions.duration_minutes). */
  durationMinutes: number;
  /** Landing-page URL (event location for online attendees). */
  pageUrl: string;
  /** Meeting link if already published, else null. */
  meetUrl: string | null;
  locale: 'en' | 'zh';
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function icsTimestamp(instant: Date): string {
  return (
    `${instant.getUTCFullYear()}` +
    `${String(instant.getUTCMonth() + 1).padStart(2, '0')}` +
    `${String(instant.getUTCDate()).padStart(2, '0')}` +
    `T${String(instant.getUTCHours()).padStart(2, '0')}` +
    `${String(instant.getUTCMinutes()).padStart(2, '0')}` +
    `${String(instant.getUTCSeconds()).padStart(2, '0')}Z`
  );
}

function foldLine(line: string): string[] {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return [line];
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    while (end > start && end < bytes.length && bytes[end] >= 0x80 && bytes[end] < 0xc0) {
      end -= 1;
    }
    parts.push(new TextDecoder().decode(bytes.slice(start, end)));
    start = end;
    limit = 74;
  }
  return parts.map((p, i) => (i === 0 ? p : ` ${p}`));
}

function push(lines: string[], line: string): void {
  for (const folded of foldLine(line)) lines.push(folded);
}

export function buildWebinarIcs(input: WebinarIcsInput): string {
  const start =
    input.startsAt instanceof Date ? input.startsAt : new Date(Date.parse(input.startsAt));
  const duration = Math.max(15, Math.floor(input.durationMinutes || 90));
  const end = new Date(start.getTime() + duration * 60 * 1000);
  const zh = input.locale === 'zh';

  const summary = zh ? `SICA 线上讲座 — ${input.title}` : `SICA Webinar — ${input.title}`;
  const description = zh
    ? [
        input.title,
        input.meetUrl ? `会议链接：${input.meetUrl}` : '会议链接将在讲座开始前通过邮件发送。',
        `讲座页面：${input.pageUrl}`,
        'SICA Study in China Academy · info@studyinchina.academy',
      ].join('\n')
    : [
        input.title,
        input.meetUrl
          ? `Join link: ${input.meetUrl}`
          : 'The join link will be emailed to you before the session starts.',
        `Webinar page: ${input.pageUrl}`,
        'SICA Study in China Academy · info@studyinchina.academy',
      ].join('\n');

  const lines: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SICA//Webinar//EN', 'CALSCALE:GREGORIAN'];
  push(lines, 'BEGIN:VEVENT');
  push(lines, `UID:${icsTimestamp(new Date())}-${encodeURIComponent(input.title)}@studyinchina.academy`);
  push(lines, `DTSTAMP:${icsTimestamp(new Date())}`);
  push(lines, `DTSTART:${icsTimestamp(start)}`);
  push(lines, `DTEND:${icsTimestamp(end)}`);
  push(lines, `SUMMARY:${escapeText(summary)}`);
  push(lines, `DESCRIPTION:${escapeText(description)}`);
  push(lines, `LOCATION:${escapeText(input.pageUrl)}`);
  push(lines, 'STATUS:CONFIRMED');
  push(lines, 'BEGIN:VALARM');
  push(lines, 'TRIGGER:-PT60M');
  push(lines, `ACTION:DISPLAY`);
  push(lines, `DESCRIPTION:${escapeText(zh ? '讲座即将开始' : 'Webinar starting soon')}`);
  push(lines, 'END:VALARM');
  push(lines, 'END:VEVENT');
  push(lines, 'END:VCALENDAR');

  return lines.join('\r\n') + '\r\n';
}
