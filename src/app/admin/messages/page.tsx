'use client';

/**
 * /admin/messages — every application conversation in one place.
 * "Waiting for reply" (default) lists conversations whose latest student or
 * partner messages no admin has read yet, oldest-waiting first. Clicking a
 * row opens the application on its Messages section.
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Inbox, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageContainer } from '@/components/admin/page-container';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { AdminMessageInboxRow } from '@/app/api/admin/messages/route';

type Filter = 'waiting' | 'all';

interface InboxResponse {
  conversations: AdminMessageInboxRow[];
  total: number;
  page: number;
  totalPages: number;
}

const PAGE_SIZE = 25;

function threadHref(row: AdminMessageInboxRow): string {
  return row.surface === 'student'
    ? `/admin/applications/${row.applicationId}?tab=messages`
    : `/admin/partner-applications/${row.applicationId}#messages`;
}

export default function AdminMessagesPage() {
  const { t, locale } = useI18n();
  const [filter, setFilter] = useState<Filter>('waiting');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<InboxResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Time of the last load, used for "waiting 3 h" labels (render must stay pure).
  const [loadedAt, setLoadedAt] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<InboxResponse>(
        `/api/admin/messages?filter=${filter}&page=${page}&limit=${PAGE_SIZE}`,
      );
      setData(res);
      setLoadedAt(Date.now());
    } catch (err) {
      setError(err instanceof ApiError && err.message ? err.message : t('adminMessages.errorLoad'));
    } finally {
      setLoading(false);
    }
  }, [filter, page, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const relativeWait = (iso: string | null): string => {
    if (!iso) return '';
    const minutes = Math.max(0, Math.round((loadedAt - Date.parse(iso)) / 60_000));
    if (minutes < 60) return t('adminMessages.waitingMinutes', { count: minutes });
    const hours = Math.round(minutes / 60);
    if (hours < 48) return t('adminMessages.waitingHours', { count: hours });
    return t('adminMessages.waitingDays', { count: Math.round(hours / 24) });
  };

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  const senderText = (row: AdminMessageInboxRow): string =>
    row.lastSenderRole === 'admin'
      ? t('appMessages.sicaTeam')
      : row.surface === 'partner'
        ? row.partnerName || t('appMessages.partner')
        : row.personName || t('appMessages.student');

  const conversations = data?.conversations ?? [];

  return (
    <PageContainer width="default">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('adminMessages.title')}</h1>
            <p className="mt-1 text-sm text-[#4B5563]">{t('adminMessages.subtitle')}</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-none self-start" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            {t('adminMessages.refresh')}
          </Button>
        </div>

        <div className="flex gap-2" role="tablist" aria-label={t('adminMessages.filterLabel')}>
          {(['waiting', 'all'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={`border px-3 py-1.5 text-sm ${
                filter === f
                  ? 'border-[#1B2A4A] bg-[#1B2A4A] text-white'
                  : 'border-gray-300 bg-white text-[#4B5563] hover:border-[#1B2A4A]'
              }`}
            >
              {f === 'waiting' ? t('adminMessages.filterWaiting') : t('adminMessages.filterAll')}
            </button>
          ))}
        </div>

        {error ? (
          <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : loading && !data ? (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
            {t('appMessages.loading')}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 border border-gray-200 bg-white px-6 py-12 text-center">
            <Inbox size={28} className="text-[#9CA3AF]" aria-hidden="true" />
            <p className="text-sm font-medium text-[#1F2937]">
              {filter === 'waiting' ? t('adminMessages.emptyWaiting') : t('adminMessages.emptyAll')}
            </p>
            {filter === 'waiting' ? (
              <p className="text-xs text-[#6B7280]">{t('adminMessages.emptyWaitingHint')}</p>
            ) : null}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 border border-gray-200 bg-white">
            {conversations.map((row) => (
              <li key={`${row.surface}-${row.applicationId}`}>
                <Link
                  href={threadHref(row)}
                  className="flex flex-col gap-2 px-4 py-3 hover:bg-[#FAFAF8] sm:flex-row sm:items-start sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#1B2A4A]">
                        {row.personName || t('adminMessages.unnamedStudent')}
                      </span>
                      <Badge variant="outline" className="rounded-none text-[11px]">
                        {row.surface === 'partner'
                          ? row.partnerName || t('appMessages.partner')
                          : t('adminMessages.directStudent')}
                      </Badge>
                      {row.applicationNumber ? (
                        <span className="font-mono text-xs text-[#6B7280]">{row.applicationNumber}</span>
                      ) : null}
                    </div>
                    {row.university || row.program ? (
                      <p className="mt-0.5 truncate text-xs text-[#4B5563]">
                        {[row.university, row.program].filter(Boolean).join(' · ')}
                      </p>
                    ) : null}
                    <p className="mt-1.5 line-clamp-2 text-sm text-[#1F2937]">
                      <span className="font-medium">{senderText(row)}:</span> {row.lastBody}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                    <span className="text-xs text-[#6B7280]">{formatDate(row.lastAt)}</span>
                    {row.unreadCount > 0 ? (
                      <>
                        <span className="inline-flex min-w-5 items-center justify-center bg-[#9B1B30] px-1.5 text-[11px] font-semibold text-white">
                          {t('adminMessages.unreadCount', { count: row.unreadCount })}
                        </span>
                        <span className="text-xs text-amber-700">{relativeWait(row.oldestUnreadAt)}</span>
                      </>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {data && data.totalPages > 1 ? (
          <div className="flex items-center justify-between text-sm text-[#4B5563]">
            <span>{t('adminMessages.pageOf', { page: data.page, total: data.totalPages })}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-none" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                {t('adminMessages.prev')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                disabled={page >= data.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('adminMessages.next')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
