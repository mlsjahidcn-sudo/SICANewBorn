import { describe, expect, it } from 'vitest';
import {
  AdminCounsellingCalendar,
  beijingDayKey,
  beijingMinutesOfDay,
  chipInstant,
  monthRangeFor,
  weekRangeFor,
} from './calendar-view';

// Importing the component module is harmless under jsdom — the pure
// helpers below are what we're testing.

describe('weekRangeFor', () => {
  it('anchors a mid-week date to its Monday..Sunday', () => {
    expect(weekRangeFor('2026-10-08')).toEqual({ from: '2026-10-05', to: '2026-10-11' });
  });
  it('treats Sunday as the end of the week that started the previous Monday', () => {
    expect(weekRangeFor('2026-10-11')).toEqual({ from: '2026-10-05', to: '2026-10-11' });
  });
  it('passes through malformed anchors untouched (route 400s on them anyway)', () => {
    expect(weekRangeFor('junk')).toEqual({ from: 'junk', to: 'junk' });
  });
});

describe('monthRangeFor', () => {
  it('covers the month with a 6-week Monday-anchored grid', () => {
    // 2026-10-01 is a Thursday → grid starts Mon 2026-09-28
    expect(monthRangeFor('2026-10-15')).toEqual({ from: '2026-09-28', to: '2026-11-08' });
  });
});

describe('beijing day/minute math', () => {
  it('maps an instant to its Beijing calendar day', () => {
    expect(beijingDayKey('2026-10-08T01:30:00Z')).toBe('2026-10-08'); // 09:30 Beijing
  });
  it('UTC-evening instants roll into the NEXT Beijing day', () => {
    expect(beijingDayKey('2026-10-07T17:00:00Z')).toBe('2026-10-08'); // 01:00 Beijing
  });
  it('minutes-from-Beijing-midnight matches the slot grid', () => {
    expect(beijingMinutesOfDay('2026-10-08T01:30:00Z')).toBe(9 * 60 + 30);
    expect(beijingMinutesOfDay('2026-10-08T09:30:00Z')).toBe(17 * 60 + 30);
  });
});

describe('chipInstant', () => {
  const base = {
    id: 'x',
    reference: 'CS-X',
    name: 'X',
    email: 'x@x',
    phone: '+1',
    slotStart: '2026-10-08T01:30:00.000Z',
    proposedSlotStart: null,
    status: 'Pending',
  } as const;

  it('Proposed bookings render at the proposed time', () => {
    const b = { ...base, status: 'Proposed' as const, proposedSlotStart: '2026-10-08T02:00:00.000Z' };
    expect(chipInstant(b)).toBe('2026-10-08T02:00:00.000Z');
  });
  it('every other status renders at the booked time', () => {
    expect(chipInstant({ ...base, status: 'Confirmed' as const })).toBe(base.slotStart);
  });
});

describe('AdminCounsellingCalendar module', () => {
  it('exports the component', () => {
    expect(typeof AdminCounsellingCalendar).toBe('function');
  });
});
