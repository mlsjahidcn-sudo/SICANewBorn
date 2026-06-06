'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, Inbox, Filter, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { DateGroupedList } from '@/components/ui/date-grouped-list';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

/**
 * /student/notifications
 *
 * S32: the student's notification inbox. Reads from
 * student_notifications (populated by S29 when admin changes a
 * student-app's status, and historically by S18's save-as-draft
 * + docs-requested events).
 *
 * Mirrors /partner/notifications (S30) for the student side.
 * Same shape, same filters, same optimistic update pattern, same
 * 30s polling. The student-side bell badge lives in
 * src/app/student/layout.tsx.
 *
 * Differences from the partner inbox:
 *  - No `link_url` field on student_notifications (the student
 *    portal is shorter, no need to deep-link)
 *  - No type-based filter chip for now (only status_change
 *    rows land here today; the chip would always show 0)
 *  - Title and message are in plain English (i18n not wired
 *    here yet)
 */

interface StudentNotification {
  id: string;
  student_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

const TYPE_BADGE: Record<string, string> = {
  status_change: 'bg-blue-100 text-blue-700',
  documents_requested: 'bg-orange-100 text-orange-800',
  team: 'bg-purple-100 text-purple-700',
  info: 'bg-gray-100 text-gray-600',
};

// Type → translation key. Resolved via t() at render time so the
// chip labels flip with the locale.
const TYPE_LABEL_KEY: Record<string, string> = {
  status_change: 'studentNotif.typeStatus',
  documents_requested: 'studentNotif.typeDocs',
  team: 'studentNotif.typeTeam',
  info: 'studentNotif.typeInfo',
};

// i18n-aware time-ago. Returns a translation-key-resolved
// string for any duration under a week, otherwise a localized
// date string.
function timeAgo(
  t: (key: string, params?: Record<string, string | number>) => string,
  iso: string,
): string {
  const ts = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - ts) / 1000);
  if (sec < 60) return t('studentNotif.justNow');
  const min = Math.floor(sec / 60);
  if (min < 60) return t('studentNotif.minutesAgo', { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t('studentNotif.hoursAgo', { n: hr });
  const day = Math.floor(hr / 24);
  if (day < 7) return t('studentNotif.daysAgo', { n: day });
  return new Date(iso).toLocaleDateString();
}

export default function StudentNotificationsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const pendingNavRef = useRef<string | null>(null);

  // Main list fetch
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ limit: '50' });
    if (filter === 'unread') params.set('unread', 'true');

    (async () => {
      try {
        const data = await apiFetchJson<{
          notifications: StudentNotification[];
          unreadCount: number;
        }>(`/api/student/notifications?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!cancelled) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('studentNotif.errorLoad'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [filter, retryNonce]);

  // 30s polling + window-focus refetch
  useEffect(() => {
    const onFocus = () => setRetryNonce((n) => n + 1);
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setRetryNonce((n) => n + 1);
      }
    }, 30_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await apiFetch(`/api/student/notifications/${id}`, { method: 'PATCH' });
    } catch (err) {
      console.error('markRead failed:', err);
      setRetryNonce((n) => n + 1);
    }
  }, []);

  const markAll = useCallback(async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await apiFetchJson<{ marked: number }>(
        '/api/student/notifications/read-all',
        { method: 'POST' },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.is_read ? n : { ...n, is_read: true, read_at: new Date().toISOString() })),
      );
      setUnreadCount(0);
      setRetryNonce((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('studentNotif.errorMarkAll'));
    } finally {
      setMarkingAll(false);
    }
  }, [unreadCount]);

  const onRowClick = useCallback(
    (n: StudentNotification) => {
      if (!n.is_read) markRead(n.id);
      // No link_url on student notifications today — the inbox
      // is informational. If we add deep links in a future
      // schema bump, the row click can navigate there.
    },
    [markRead],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            <Bell size={22} className="text-[#9B1B30]" />
            {t('studentNotif.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('studentNotif.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => setRetryNonce((n) => n + 1)}
            title={t('studentNotif.refreshTooltip')}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={markAll}
              disabled={markingAll}
            >
              <CheckCheck size={14} className="mr-1.5" />
              {t('studentNotif.markAllRead')}
            </Button>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-400" />
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-sm font-medium border ${
            filter === 'all'
              ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          {t('studentNotif.all')}
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-sm font-medium border flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          {t('studentNotif.unread')}
          {unreadCount > 0 && (
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold ${
                filter === 'unread' ? 'bg-white text-[#1B2A4A]' : 'bg-[#9B1B30] text-white'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRetryNonce((n) => n + 1)}
            className="text-red-700"
          >
            {t('studentNotif.tryAgain')}
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && notifications.length === 0 ? (
        <Card className="rounded-none border-gray-200">
          <CardContent className="py-16 text-center">
            <Spinner size="md" className="text-[#1B2A4A] mx-auto" />
            <p className="text-sm text-gray-500 mt-3">{t('studentNotif.loading')}</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="rounded-none border-gray-200">
          <CardContent className="py-16 text-center">
            <Inbox size={36} className="text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500 mt-3">
              {filter === 'unread' ? t('studentNotif.emptyUnread') : t('studentNotif.emptyAll')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-none border-gray-200">
          <CardContent className="p-0">
            {/*
             * Phase 1.11: date-group the inbox. We bucket each
             * notification into Today / Yesterday / This Week /
             * Earlier and render a sticky-ish section header for
             * each bucket. The groups are computed client-side
             * from the notifications list, sorted newest-first
             * (the API already orders by created_at desc).
             */}
            <DateGroupedList
              notifications={notifications}
              getDate={(n: StudentNotification) => n.created_at}
              renderItem={(n) => {
                const typeClass = TYPE_BADGE[n.type] || TYPE_BADGE.info;
                const typeLabel = TYPE_LABEL_KEY[n.type] ? t(TYPE_LABEL_KEY[n.type]) : n.type;
                return (
                  <li
                    key={n.id}
                    className={`px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      n.is_read ? 'bg-white' : 'bg-blue-50/30'
                    }`}
                    onClick={() => onRowClick(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(n);
                      }
                    }}
                  >
                    {/* Unread dot */}
                    <div className="pt-1.5 flex-shrink-0 w-2.5">
                      {!n.is_read && (
                        <div className="w-2.5 h-2.5 bg-[#9B1B30] rounded-full" />
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm ${
                            n.is_read ? 'font-normal text-gray-700' : 'font-semibold text-[#1B2A4A]'
                          }`}
                        >
                          {n.title}
                        </span>
                        <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 ${typeClass}`}>
                          {typeLabel}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${n.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>{timeAgo(t, n.created_at)}</span>
                      </div>
                    </div>

                    {/* Mark-read button (hover-only for unread rows) */}
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-[#1B2A4A] p-1 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                        title={t('studentNotif.markAsReadTooltip')}
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </li>
                );
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Footer hint */}
      {notifications.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {t('studentNotif.footer', { n: notifications.length })}
        </p>
      )}
    </div>
  );
}
