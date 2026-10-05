import { describe, expect, it } from 'vitest';
import { buildOccupancySet, toEpochMs } from './occupancy';

const T0 = '2026-10-06T01:30:00.000Z'; // 09:30 Beijing
const T1 = '2026-10-06T02:00:00.000Z'; // 10:00 Beijing

describe('toEpochMs', () => {
  it('normalizes Z and +00:00 forms to the same epoch ms', () => {
    expect(toEpochMs(T0)).toBe(toEpochMs('2026-10-06T01:30:00.000+00:00'));
    expect(toEpochMs(T0)).toBe(Date.parse(T0));
  });
  it('returns null for null / empty / invalid', () => {
    expect(toEpochMs(null)).toBeNull();
    expect(toEpochMs(undefined)).toBeNull();
    expect(toEpochMs('')).toBeNull();
    expect(toEpochMs('not-a-date')).toBeNull();
  });
});

describe('buildOccupancySet', () => {
  it('unions live bookings and proposals into epoch-ms keys', () => {
    const set = buildOccupancySet(
      [{ slot_start: T0 }],
      [{ proposed_slot_start: '2026-10-06T02:00:00.000+00:00' }],
    );
    expect(set.has(Date.parse(T0))).toBe(true);
    expect(set.has(Date.parse(T1))).toBe(true);
    expect(set.size).toBe(2);
  });

  it('ignores null rows and invalid strings', () => {
    const set = buildOccupancySet(
      [{ slot_start: null }, {}, { slot_start: 'junk' }],
      [{ proposed_slot_start: null }],
    );
    expect(set.size).toBe(0);
  });

  it('dedupes the same instant across both sources (booking + proposal on one slot)', () => {
    const set = buildOccupancySet([{ slot_start: T0 }], [{ proposed_slot_start: T0 }]);
    expect(set.size).toBe(1);
  });
});
