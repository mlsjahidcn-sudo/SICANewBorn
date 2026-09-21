/**
 * RFC 5545 calendar-invite builder for confirmed counselling sessions
 * (Phase 123). Pure string generation — no I/O — so the vitest suite
 * can assert the exact output and the email pipeline just base64s it
 * into a sendTextEmail attachment.
 *
 * Timezone contract matches src/lib/counselling-slots.ts: slots are
 * absolute instants, rendered here in UTC "basic" format
 * (YYYYMMDDTHHMMSSZ), which every calendar client displays in the
 * viewer's local timezone. Duration is SESSION_MINUTES.
 */

import { SESSION_MINUTES } from '@/lib/counselling-slots';

export type IcsLocale = 'en' | 'zh';

export interface CounsellingIcsInput {
  reference: string;
  studentName: string;
  /** Absolute slot start — Date or ISO-8601 string. */
  slotStart: Date | string;
  /** Meeting link (Zoom/WhatsApp), or null while the admin hasn't set one. */
  meetingLink: string | null;
  locale: IcsLocale;
}

/**
 * RFC 5545 §3.3.11 TEXT escaping: backslash first, then semicolon,
 * comma, and literal newlines.
 */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * RFC 5545 §3.1: content lines SHOULD be folded to ≤75 octets.
 * Continuation lines start with a single space. Applied byte-wise on
 * the UTF-8 encoding so multi-byte characters don't split mid-char.
 */
function foldLine(line: string): string[] {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(line);
  if (bytes.length <= 75) return [line];
  const parts: string[] = [];
  let start = 0;
  let limit = 75;
  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Walk back to a UTF-8 character boundary (continuation byte < 0x80 || >= 0xC0).
    while (end > start && end < bytes.length && bytes[end] >= 0x80 && bytes[end] < 0xc0) {
      end -= 1;
    }
    parts.push(new TextDecoder().decode(bytes.slice(start, end)));
    start = end;
    limit = 74; // continuation lines carry one extra leading space
  }
  return parts.map((p, i) => (i === 0 ? p : ` ${p}`));
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

/**
 * Build the .ics file content for one confirmed counselling session.
 * The body uses CRLF line endings per RFC 5545.
 */
export function buildCounsellingIcs(input: CounsellingIcsInput): string {
  const start =
    input.slotStart instanceof Date ? input.slotStart : new Date(Date.parse(input.slotStart));
  const end = new Date(start.getTime() + SESSION_MINUTES * 60 * 1000);
  const zh = input.locale === 'zh';
  const summary = zh
    ? `SICA 免费留学咨询 — ${input.studentName}`
    : `SICA Free Counselling Session — ${input.studentName}`;
  const descriptionLines = zh
    ? [
        `SICA 免费 10 分钟在线咨询。`,
        `预约编号：${input.reference}`,
        input.meetingLink ? `会议链接：${input.meetingLink}` : '会议链接将稍后通过邮件发送。',
        '如需改期或取消，请回复确认邮件或发邮件至 info@studyinchina.academy。',
      ]
    : [
        'Your free 10-minute online counselling session with SICA.',
        `Reference: ${input.reference}`,
        input.meetingLink ? `Meeting link: ${input.meetingLink}` : 'The meeting link will follow by email.',
        'To reschedule or cancel, reply to your confirmation email or write to info@studyinchina.academy.',
      ];
  const rawLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SICA//Study in China Academy//Counselling//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeText(`${input.reference}@studyinchina.academy`)}`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART:${icsTimestamp(start)}`,
    `DTEND:${icsTimestamp(end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(descriptionLines.join('\n'))}`,
    `LOCATION:${escapeText(input.meetingLink ?? 'Online')}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(summary)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return rawLines
    .flatMap(foldLine)
    .join('\r\n')
    .concat('\r\n');
}
