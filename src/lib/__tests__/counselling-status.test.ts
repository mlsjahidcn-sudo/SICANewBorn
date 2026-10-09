/**
 * Phase 153 (#6): the status palette is a typed `Record<CounsellingBookingStatus, …>`
 * — if a new status lands in the enum, every Record below fails the
 * build. This test asserts the keys match the enum exactly so a
 * drift (typo, missing entry) shows up here too, not just in
 * callers' type errors.
 */
import { describe, it, expect } from 'vitest';
import {
  COUNSELLING_BOOKING_STATUSES,
  type CounsellingBookingStatus,
} from '@/lib/counselling-mapper';
import {
  STATUS_BADGE_CLASS,
  STATUS_CHIP_CLASS,
  STATUS_LABEL_KEY,
} from '@/lib/counselling-status';

describe('counselling-status lookup tables', () => {
  it('STATUS_BADGE_CLASS covers every enum value with a non-empty Tailwind class', () => {
    expect(Object.keys(STATUS_BADGE_CLASS).sort()).toEqual(
      [...COUNSELLING_BOOKING_STATUSES].sort(),
    );
    for (const s of COUNSELLING_BOOKING_STATUSES) {
      expect(STATUS_BADGE_CLASS[s], `badge class for ${s}`).toMatch(/^bg-/);
    }
  });

  it('STATUS_CHIP_CLASS covers every enum value with a non-empty Tailwind class', () => {
    expect(Object.keys(STATUS_CHIP_CLASS).sort()).toEqual(
      [...COUNSELLING_BOOKING_STATUSES].sort(),
    );
    for (const s of COUNSELLING_BOOKING_STATUSES) {
      expect(STATUS_CHIP_CLASS[s], `chip class for ${s}`).toMatch(/^bg-/);
    }
  });

  it('STATUS_LABEL_KEY covers every enum value and points at adminCounselling.status_*', () => {
    expect(Object.keys(STATUS_LABEL_KEY).sort()).toEqual(
      [...COUNSELLING_BOOKING_STATUSES].sort(),
    );
    for (const s of COUNSELLING_BOOKING_STATUSES) {
      expect(STATUS_LABEL_KEY[s], `label key for ${s}`).toMatch(
        /^adminCounselling\.status_/,
      );
    }
  });

  it('No-show key uses the underscore form (matches the existing i18n slug)', () => {
    // Sanity check — the existing i18n key is `status_NoShow` (camelCase
    // after the underscore), not `status_No-show`. The Record above
    // must match the i18n namespace.
    expect(STATUS_LABEL_KEY['No-show' as CounsellingBookingStatus]).toBe(
      'adminCounselling.status_NoShow',
    );
  });
});
