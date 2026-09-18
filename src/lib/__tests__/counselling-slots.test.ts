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
  it('produces 18 half-hour slots from 09:00 to 17:30 Beijing', () => {
    const slots = listCandidateSlotsForDate('2026-09-19');
    expect(slots.length).toBe((DAY_END_MINUTES - 9 * 60) / 30 + 1);
    // 09:00 Beijing − 8h stays on the same UTC calendar day.
    expect(slots[0].toISOString()).toBe('2026-09-19T01:00:00.000Z');
    const last = slots[slots.length - 1];
    expect(last.toISOString()).toBe('2026-09-19T09:30:00.000Z'); // 17:30 Beijing
  });

  it('labels slots in Beijing wall-clock', () => {
    const slots = listCandidateSlotsForDate('2026-09-19');
    expect(formatBeijingLabel(slots[0])).toBe('09:00');
    expect(formatBeijingLabel(slots[slots.length - 1])).toBe('17:30');
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
    expect(isCandidateSlot(new Date('2026-09-19T01:00:00.000Z'))).toBe(true); // Sat 09:00 Beijing
    expect(isCandidateSlot(new Date('2026-09-19T01:15:00.000Z'))).toBe(false); // off-grid 09:15
    expect(isCandidateSlot(new Date('2026-09-20T01:00:00.000Z'))).toBe(false); // Sunday 09:00
    // Sat 18:00 Beijing = 10:00 UTC — past the last 17:30 slot start.
    expect(isCandidateSlot(new Date('2026-09-19T10:00:00.000Z'))).toBe(false);
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
