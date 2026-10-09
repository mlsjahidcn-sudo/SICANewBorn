/**
 * Phase 153 (#6): single source of truth for the status palette +
 * chip colors + label keys used by the admin list, the calendar
 * chips, the lookup page, and the (eventual) timeline UI. The
 * 6-status enum already lives in `counselling-mapper.ts`; this
 * file adds the visual mappings so a new status forces every
 * consumer to add a new entry (the `Record<CounsellingBookingStatus, …>`
 * type fails compilation if a key is missing).
 *
 * The label keys stay in i18n (`adminCounselling.status*`) — this
 * file only owns the colors. Reason: i18n-test forbids empty
 * values, and these keys already exist.
 */

import type { CounsellingBookingStatus } from '@/lib/counselling-mapper';

/* ---------------------------------------------------------------- *
 * Badge colors — the 4px-wide left-border + tinted background combo
 * used in the admin list rows and the lookup status card.
 * ---------------------------------------------------------------- */

export const STATUS_BADGE_CLASS: Record<CounsellingBookingStatus, string> = {
  Pending: 'bg-gray-100 text-gray-700 border-l-4 border-gray-400',
  Proposed: 'bg-purple-50 text-purple-800 border-l-4 border-purple-500',
  Confirmed: 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500',
  Completed: 'bg-blue-50 text-blue-800 border-l-4 border-blue-500',
  Cancelled: 'bg-red-50 text-red-800 border-l-4 border-red-500',
  'No-show': 'bg-amber-50 text-amber-800 border-l-4 border-amber-500',
};

/* ---------------------------------------------------------------- *
 * Calendar chip colors — the 1.5rem-high tag that shows on the
 * week/month grid for a single booking. Subset of the badge palette;
 * No-show + Completed get muted because they're rarely the active
 * chip on the upcoming view.
 * ---------------------------------------------------------------- */

export const STATUS_CHIP_CLASS: Record<CounsellingBookingStatus, string> = {
  Pending: 'bg-gray-100 text-gray-800 border border-gray-300',
  Proposed: 'bg-purple-100 text-purple-900 border border-purple-300',
  Confirmed: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
  Completed: 'bg-blue-50 text-blue-700 border border-blue-200',
  Cancelled: 'bg-red-50 text-red-700 border border-red-200',
  'No-show': 'bg-amber-50 text-amber-700 border border-amber-200',
};

/* ---------------------------------------------------------------- *
 * Short label keys — every consumer points at `adminCounselling.status*`
 * via i18n. The keys are documented here so the consistency is
 * reviewable in one place.
 * ---------------------------------------------------------------- */

export const STATUS_LABEL_KEY: Record<CounsellingBookingStatus, string> = {
  Pending: 'adminCounselling.status_Pending',
  Proposed: 'adminCounselling.status_Proposed',
  Confirmed: 'adminCounselling.status_Confirmed',
  Completed: 'adminCounselling.status_Completed',
  Cancelled: 'adminCounselling.status_Cancelled',
  'No-show': 'adminCounselling.status_NoShow',
};
