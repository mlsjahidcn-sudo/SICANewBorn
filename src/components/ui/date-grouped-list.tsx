'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';

/**
 * Phase 1.11: date-grouped list. Buckets items by calendar day
 * (Today / Yesterday / This Week / Earlier) and renders a thin
 * section header per bucket. Used by the Student + Partner
 * notification inboxes.
 *
 * Renders each group as a <section> with a header bar, then a
 * <ul> of items. The items themselves are passed in via
 * `renderItem` so the caller controls the row markup (and
 * can keep the existing badge / mark-read / click-row logic
 * that lives in the parent).
 *
 * Pure client-side — the caller is expected to pass an array
 * already sorted newest-first (the API orders by created_at
 * desc).
 */

export type DateGroup = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

export function groupOf(iso: string): DateGroup {
  const d = new Date(iso);
  const now = new Date();
  // Compare calendar days in local time. We zero out the time so
  // "today" is "any time today" not "last 24 hours".
  const dayOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const today = dayOf(now);
  const that = dayOf(d);
  const diffDays = Math.round((today - that) / 86_400_000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return 'thisWeek';
  return 'earlier';
}

const GROUP_ORDER: DateGroup[] = ['today', 'yesterday', 'thisWeek', 'earlier'];

const GROUP_LABEL_KEY: Record<DateGroup, string> = {
  today: 'studentNotif.groupToday',
  yesterday: 'studentNotif.groupYesterday',
  thisWeek: 'studentNotif.groupThisWeek',
  earlier: 'studentNotif.groupEarlier',
};

export interface DateGroupedListProps<T> {
  notifications: T[];
  getDate: (n: T) => string;
  renderItem: (n: T) => React.ReactNode;
}

export function DateGroupedList<T>({
  notifications,
  renderItem,
  getDate,
}: DateGroupedListProps<T>) {
  const { t } = useI18n();
  // Bucket by group
  const groups: Record<DateGroup, T[]> = { today: [], yesterday: [], thisWeek: [], earlier: [] };
  for (const n of notifications) {
    groups[groupOf(getDate(n))].push(n);
  }
  return (
    <div>
      {GROUP_ORDER.map((g) => {
        const items = groups[g];
        if (items.length === 0) return null;
        return (
          <section key={g}>
            <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#4B5563] bg-[#FAFAF8] border-b border-gray-100">
              {t(GROUP_LABEL_KEY[g])} · {items.length}
            </div>
            <ul className="divide-y divide-gray-100">{items.map((n) => renderItem(n))}</ul>
          </section>
        );
      })}
    </div>
  );
}
