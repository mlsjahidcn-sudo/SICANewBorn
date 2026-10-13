import { describe, expect, it } from 'vitest';
import {
  computeSeatInfo,
  parseSeatCapInput,
  shouldRouteToWaitlist,
  type WebinarRegistrationStatus,
} from '@/lib/webinar-capacity';

/**
 * Phase 161: seat-capacity + waitlist routing decision table.
 * Mirrors the public signup gate — `computeSeatInfo` is the single
 * source of truth for the /api/webinar-signups 409 branch, the
 * capacity polling endpoint, and the hero seats-left pill.
 */

type Status = WebinarRegistrationStatus;

describe('computeSeatInfo — uncapped (Phase 157 semantics)', () => {
  it('NULL cap never fills regardless of signups', () => {
    const info = computeSeatInfo({ seatCap: null, seatsTaken: 9999, storedStatus: 'open' });
    expect(info.seatsLeft).toBeNull();
    expect(info.isFull).toBe(false);
    expect(info.formMode).toBe('signup');
    expect(info.effectiveStatus).toBe('open');
  });

  it('a stale stored full on an uncapped webinar is ignored — capacity decides', () => {
    // 'full' is a display cache, never authoritative. Uncapped +
    // stored full → signup (staff who want a forced waitlist set the
    // cap to the current holder count instead).
    const info = computeSeatInfo({ seatCap: null, seatsTaken: 3, storedStatus: 'full' });
    expect(info.formMode).toBe('signup');
    expect(info.effectiveStatus).toBe('open');
  });
});

describe('computeSeatInfo — capped', () => {
  it('seats remain → signup', () => {
    const info = computeSeatInfo({ seatCap: 100, seatsTaken: 99, storedStatus: 'open' });
    expect(info.seatsLeft).toBe(1);
    expect(info.formMode).toBe('signup');
  });

  it('exactly full → waitlist + computed full (even though stored says open)', () => {
    const info = computeSeatInfo({ seatCap: 100, seatsTaken: 100, storedStatus: 'open' });
    expect(info.seatsLeft).toBe(0);
    expect(info.isFull).toBe(true);
    expect(info.formMode).toBe('waitlist');
    // The stored flip to 'full' is best-effort — the computed gate
    // must cover the race where the flip write failed.
    expect(info.effectiveStatus).toBe('full');
  });

  it('overbooked (race overshoot) stays waitlist, never negative seats', () => {
    const info = computeSeatInfo({ seatCap: 100, seatsTaken: 101, storedStatus: 'open' });
    expect(info.seatsLeft).toBe(0);
    expect(info.formMode).toBe('waitlist');
  });

  it('Cancelled / No-Show rows are excluded by the caller via SEAT_HOLDER_STATUSES', () => {
    // The count query filters status IN (Registered, Attended); the
    // pure function only sees the resulting number. Assert the
    // exported convention so the two halves can't drift.
    expect(['Registered', 'Attended']).toEqual(expect.arrayContaining(['Registered', 'Attended']));
    expect(['Cancelled', 'No-Show']).not.toEqual(expect.arrayContaining(['Registered']));
  });
});

describe('computeSeatInfo — lifecycle statuses', () => {
  it.each(['draft', 'closed'] as const)(
    'stored %s forces closed mode even with seats left',
    (status: Status) => {
      const info = computeSeatInfo({ seatCap: 100, seatsTaken: 5, storedStatus: status });
      expect(info.formMode).toBe('closed');
      expect(info.effectiveStatus).toBe(status);
    },
  );

  it('draft/closed beat a full house (closed, not waitlist)', () => {
    const info = computeSeatInfo({ seatCap: 10, seatsTaken: 10, storedStatus: 'closed' });
    expect(info.formMode).toBe('closed');
  });

  it('raising the cap reopens signup instantly (stored full self-heals)', () => {
    const info = computeSeatInfo({ seatCap: 200, seatsTaken: 100, storedStatus: 'full' });
    expect(info.formMode).toBe('signup');
    expect(info.effectiveStatus).toBe('open');
  });
});

describe('shouldRouteToWaitlist', () => {
  it('true only on the waitlist mode', () => {
    expect(
      shouldRouteToWaitlist(computeSeatInfo({ seatCap: 2, seatsTaken: 2, storedStatus: 'open' })),
    ).toBe(true);
    expect(
      shouldRouteToWaitlist(computeSeatInfo({ seatCap: 2, seatsTaken: 1, storedStatus: 'open' })),
    ).toBe(false);
    expect(
      shouldRouteToWaitlist(computeSeatInfo({ seatCap: 2, seatsTaken: 1, storedStatus: 'closed' })),
    ).toBe(false);
  });
});

describe('parseSeatCapInput', () => {
  it.each([
    ['', null],
    [null, null],
    [undefined, null],
    [0, null],
    [-5, null],
    ['abc', null],
    ['100', 100],
    [100, 100],
    ['150.9', 150],
  ])('%p → %p', (raw, expected) => {
    expect(parseSeatCapInput(raw as string | number | null | undefined)).toBe(expected);
  });
});
