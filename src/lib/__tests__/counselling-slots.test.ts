import { describe, expect, it } from 'vitest';
import {
  beijingTodayStr,
  beijingWallToUtc,
  formatBeijingLabel,
  isCandidateSlot,
  isCounsellingEducationLevel,
  isSlotWithinLeadWindow,
  isWorkingBeijingDate,
  listBookableDates,
  listCandidateSlotsForDate,
  parseSlotInstant,
  utcToBeijingDateStr,
  DAY_END_MINUTES,
  DAY_START_MINUTES,
  SESSION_MINUTES,
} from '../counselling-slots';

// 2026-09-19 is a Saturday. 2026-09-20 is the following Sunday.
// A fixed "now" of 2026-09-19T02:00:00Z = 10:00 Beijing time keeps
// every assertion deterministic.

describe('beijing wall-clock ↔ UTC conversion', () => {
  it('converts Beijing 09:00 to 01:00 UTC the same calendar day', () => {
    const slot = beijingWallToUtc('2026-09-19', 9 * 60);
    expect(slot?.toISOString()).toBe('2026-09-19T01:00:00.000Z');
  });

  it('returns null for a malformed date string', () => {
    expect(beijingWallToUtc('not-a-date', 540)).toBeNull();
    expect(beijingWallToUtc('2026-13-01', 540)).toBeNull();
  });

  it('shifts calendar date across the +08 boundary', () => {
    // 2026-09-18T17:00:00Z is already 2026-09-19 01:00 Beijing.
    expect(utcToBeijingDateStr(new Date('2026-09-18T17:00:00Z'))).toBe('2026-09-19');
    // 16:00 UTC is exactly Beijing midnight → next day.
    expect(utcToBeijingDateStr(new Date('2026-09-19T16:00:00Z'))).toBe('2026-09-20');
    // 15:59 UTC is 23:59 Beijing → same day.
    expect(utcToBeijingDateStr(new Date('2026-09-19T15:59:00Z'))).toBe('2026-09-19');
  });

  it('derives Beijing today from an absolute instant', () => {
    expect(beijingTodayStr(new Date('2026-09-19T02:00:00Z'))).toBe('2026-09-19');
    expect(beijingTodayStr(new Date('2026-09-18T16:30:00Z'))).toBe('2026-09-19');
  });
});

describe('working days and bookable dates', () => {
  it('accepts Mon–Sat and rejects Sunday + fake dates', () => {
    expect(isWorkingBeijingDate('2026-09-19')).toBe(true); // Saturday
    expect(isWorkingBeijingDate('2026-09-20')).toBe(false); // Sunday
    expect(isWorkingBeijingDate('2026-09-21')).toBe(true); // Monday
    expect(isWorkingBeijingDate('2026-02-30')).toBe(false); // calendar rollover
    expect(isWorkingBeijingDate('garbage')).toBe(false);
  });

  it('lists 12 working days across a 14-day horizon (2 Sundays)', () => {
    const now = new Date('2026-09-19T02:00:00Z');
    const dates = listBookableDates(now);
    expect(dates.length).toBe(12);
    expect(dates[0]).toBe('2026-09-19');
    expect(dates).not.toContain('2026-09-20');
    expect(dates).not.toContain('2026-09-27');
    expect(dates[dates.length - 1]).toBe('2026-10-02');
  });
});

describe('candidate slot grid', () => {
  it('produces 20 half-hour slots from 14:00 to 23:30 Beijing', () => {
    const slots = listCandidateSlotsForDate('2026-09-19');
    // 14:00→23:30 is 570 minutes = 19 gaps, so 20 starts.
    expect(slots.length).toBe(20);
    expect(slots.length).toBe((DAY_END_MINUTES - DAY_START_MINUTES) / 30 + 1);
    // 14:00 Beijing − 8h = 06:00 UTC, same UTC calendar day.
    expect(slots[0].toISOString()).toBe('2026-09-19T06:00:00.000Z');
    const last = slots[slots.length - 1];
    expect(last.toISOString()).toBe('2026-09-19T15:30:00.000Z'); // 23:30 Beijing
  });

  it('labels slots in Beijing wall-clock', () => {
    const slots = listCandidateSlotsForDate('2026-09-19');
    expect(formatBeijingLabel(slots[0])).toBe('14:00');
    expect(formatBeijingLabel(slots[slots.length - 1])).toBe('23:30');
  });

  it('opens at 14:00 Beijing — no morning slot exists', () => {
    // Phase 185 (2026-10-17): the window moved from 09:00-17:30 to
    // 14:00-24:00. 09:00 and 13:00 Beijing must no longer be offered.
    expect(formatBeijingLabel(listCandidateSlotsForDate('2026-09-19')[0])).not.toBe('09:00');
    const labels = listCandidateSlotsForDate('2026-09-19').map(formatBeijingLabel);
    expect(labels).not.toContain('09:00');
    expect(labels).not.toContain('13:30');
  });

  it('never lets a session cross into the next Beijing day', () => {
    // The last start is 23:30, not 24:00, so a 10-minute session always
    // finishes before midnight and stays on the calendar date the
    // student picked.
    const slots = listCandidateSlotsForDate('2026-09-19');
    const last = slots[slots.length - 1];
    expect(last.getTime() + SESSION_MINUTES * 60_000).toBeLessThan(
      beijingWallToUtc('2026-09-20', 0)!.getTime()
    );
  });

  it('returns no slots on a closed day', () => {
    expect(listCandidateSlotsForDate('2026-09-20')).toEqual([]);
  });
});

describe('lead-time window', () => {
  const now = new Date('2026-09-19T02:00:00Z'); // 10:00 Beijing

  it('rejects a slot only 1h ahead', () => {
    expect(isSlotWithinLeadWindow(now, new Date('2026-09-19T03:00:00Z'))).toBe(false);
  });

  it('accepts a slot 2.5h ahead', () => {
    expect(isSlotWithinLeadWindow(now, new Date('2026-09-19T04:30:00Z'))).toBe(true);
  });
});

describe('slot parsing and membership', () => {
  it('accepts minute-aligned ISO instants', () => {
    const parsed = parseSlotInstant('2026-09-18T01:00:00.000Z');
    expect(parsed?.toISOString()).toBe('2026-09-18T01:00:00.000Z');
  });

  it('rejects seconds/millis offsets, non-strings and garbage', () => {
    expect(parseSlotInstant('2026-09-18T01:00:30.000Z')).toBeNull();
    expect(parseSlotInstant('2026-09-18T01:00:00.500Z')).toBeNull();
    expect(parseSlotInstant(12345)).toBeNull();
    expect(parseSlotInstant(null)).toBeNull();
    expect(parseSlotInstant('tomorrow 9am')).toBeNull();
  });

  it('confirms on-grid slots and rejects off-grid / closed-day / after-hours', () => {
    expect(isCandidateSlot(new Date('2026-09-19T06:00:00.000Z'))).toBe(true); // Sat 14:00 Beijing
    expect(isCandidateSlot(new Date('2026-09-19T06:15:00.000Z'))).toBe(false); // off-grid 14:15
    expect(isCandidateSlot(new Date('2026-09-20T06:00:00.000Z'))).toBe(false); // Sunday 14:00
    // Sat 00:30 Beijing = 16:30 UTC the previous day — after the last
    // 23:30 start, so it belongs to no bookable day.
    expect(isCandidateSlot(new Date('2026-09-19T16:30:00.000Z'))).toBe(false);
  });

  it('rejects every slot before 14:00 Beijing — the morning is closed', () => {
    // This is the server-side security boundary for the new window: a
    // tampered payload asking for 09:00 or 13:00 must not book.
    for (const hour of [0, 8, 9, 12, 13]) {
      // Beijing H:00 == (H-8):00 UTC. For H<8 the UTC day rolls forward.
      const utcDay = hour < 8 ? '2026-09-20' : '2026-09-19';
      const utcHour = (hour + 24 - 8) % 24;
      const instant = new Date(`${utcDay}T${String(utcHour).padStart(2, '0')}:00:00.000Z`);
      expect(isCandidateSlot(instant), `${hour}:00 Beijing must not be bookable`).toBe(false);
    }
  });
});

describe('education level closed set', () => {
  it('accepts listed values and rejects everything else', () => {
    expect(isCounsellingEducationLevel('high_school')).toBe(true);
    expect(isCounsellingEducationLevel('master_graduate')).toBe(true);
    expect(isCounsellingEducationLevel('phd')).toBe(false);
    expect(isCounsellingEducationLevel(42)).toBe(false);
    expect(isCounsellingEducationLevel(null)).toBe(false);
  });
});
