import { describe, it, expect } from 'vitest';
import { computeReminderWindows } from '@/lib/counselling/reminders';

describe('computeReminderWindows', () => {
  const now = new Date('2026-09-21T04:00:00.000Z');

  it('derives the 24h and 2h upper bounds from now', () => {
    const w = computeReminderWindows(now);
    expect(w.due24hUpper.toISOString()).toBe('2026-09-22T04:00:00.000Z');
    expect(w.due2hUpper.toISOString()).toBe('2026-09-21T06:00:00.000Z');
  });

  it('excludes slots at or inside 2h from the 24h window (2h owns their wording)', () => {
    const w = computeReminderWindows(now);
    // 06:00:00Z is EXACTLY 2h out — the 2h window's upper bound. The
    // 24h query uses `> skip24Below`, so this slot is claimed by the
    // 2h reminder only.
    expect(w.skip24Below.toISOString()).toBe('2026-09-21T06:00:00.000Z');
    expect(new Date('2026-09-21T06:00:00.000Z').getTime()).toBe(w.due2hUpper.getTime());
    // One minute past 2h: owned by the 24h window (gt skip24Below passes).
    expect(new Date('2026-09-21T06:01:00.000Z').getTime()).toBeGreaterThan(
      w.skip24Below.getTime(),
    );
    // One minute inside 2h: excluded from the 24h window.
    expect(new Date('2026-09-21T05:59:00.000Z').getTime()).toBeLessThan(
      w.skip24Below.getTime(),
    );
  });

  it('a slot past due2hUpper (or in the past) is never claimed', () => {
    const w = computeReminderWindows(now);
    expect(new Date('2026-09-21T06:30:00.000Z').getTime()).toBeGreaterThan(
      w.due2hUpper.getTime(),
    );
    expect(new Date('2026-09-21T03:00:00.000Z').getTime()).toBeLessThan(now.getTime());
  });
});
