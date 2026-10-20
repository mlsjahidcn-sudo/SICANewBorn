'use client';

/**
 * DocumentFilters — status chips + search box, shared by every admin
 * document list (review queue, student detail, partner-student
 * detail).
 *
 * The chips are the same set the review queue already used, so the
 * vocabulary stays consistent across the portal.
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';

export type DocumentStatusFilter = 'all' | 'Pending' | 'Verified' | 'Rejected';

const FILTERS: { value: DocumentStatusFilter; key: string }[] = [
  { value: 'all', key: 'adminDocs.filterAll' },
  { value: 'Pending', key: 'adminDocs.filterPending' },
  { value: 'Verified', key: 'adminDocs.filterVerified' },
  { value: 'Rejected', key: 'adminDocs.filterRejected' },
];

interface DocumentFiltersProps {
  status: DocumentStatusFilter;
  onStatusChange: (status: DocumentStatusFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  /** Optional per-status counts shown next to the chips. */
  counts?: Partial<Record<DocumentStatusFilter, number>>;
  className?: string;
}

export function DocumentFilters({
  status,
  onStatusChange,
  search,
  onSearchChange,
  counts,
  className,
}: DocumentFiltersProps) {
  const { t } = useI18n();

  return (
    <div className={`flex flex-col gap-3 md:flex-row md:items-center ${className ?? ''}`}>
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          const count = counts?.[filter.value];
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onStatusChange(filter.value)}
              className={`border-b-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-[#9B1B30] text-[#1B2A4A]'
                  : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-[#1B2A4A]'
              }`}
            >
              {t(filter.key)}
              {typeof count === 'number' && (
                <span className="ml-1.5 text-xs tabular-nums text-gray-400">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('adminDocs.searchPlaceholder')}
          className="rounded-none pl-9"
        />
      </div>
    </div>
  );
}
