'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, Inbox, Filter, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

/**
 * /partner/notifications
 *
 * S30: the partner's notification inbox. Reads from
 * partner_notifications (populated by S29 when admin changes a
 * partner-app's status, and reusable for future "team invite
 * accepted" / "student added to your cohort" events).
 *
 * Features:
 *  - List of all notifications, newest first
 *  - Filter: All / Unread
 *  - "Mark all as read" button at the top
 *  - Click a row → marks it read + navigates to link_url (if any)
 *  - Refetch on mount, on visibility change, and every 30s
 *  - Empty state for new partners
 *
 * Polling cadence matches S17 (student portal) — 30s tick is
 * cheap, the bell badge reuses the unread-count endpoint.
 */

interface PartnerNotification {
  id: string;
  user_id: string;
  partner_application_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  read_at: string | null;
  link_url: string | null;
  created_at: string;
}

const TYPE_BADGE: Record<string, string> = {
  status_change: 'bg-blue-100 text-blue-700',
  team: 'bg-purple-100 text-purple-700',
  info: 'bg-gray-100 text-gray-600',
};

const TYPE_LABEL: Record<string, string> = {
  status_change: 'partnerNotif.typeStatus',
  team: 'partnerNotif.typeTeam',
  info: 'partnerNotif.typeInfo',
};

function timeAgo(t: (key: string, params?: Record<string, string | number>) => string, iso: string): string {
  const ts = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - ts) / 1000);
  if (sec < 60) return t('partnerNotif.timeJustNow');
  const min = Math.floor(sec / 60);
  if (min < 60) return t('partnerNotif.timeMinAgo', { n: min });
  const hr = Math.floor(min / 60);
  if (hr < 24) return t('partnerNotif.timeHrAgo', { n: hr });
  const day = Math.floor(hr / 24);
  if (day < 7) return t('partnerNotif.timeDayAgo', { n: day });
  return new Date(iso).toLocaleDateString();
}

export default function PartnerNotificationsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [markingAll, setMarkingAll] = useState(false);
  // Bumping this forces the main fetch useEffect to re-run. Used
  // by the manual refresh button and after mark-all-as-read.
  const [retryNonce, setRetryNonce] = useState(0);
  // Track the in-flight click so the row's navigate doesn't double-fire
  // (we mark-read first, then navigate).
  const pendingNavRef = useRef<string | null>(null);

  // -----------------------------------------------------------------
  // Main list fetch
  // -----------------------------------------------------------------
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
          notifications: PartnerNotification[];
          unreadCount: number;
        }>(`/api/partner/notifications?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!cancelled) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('partnerNotif.errorLoad'));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [filter, retryNonce, t]);

  // -----------------------------------------------------------------
  // 30s polling + window-focus refetch so the inbox stays fresh
  // without requiring a page reload. S17 used the same cadence.
  // -----------------------------------------------------------------
  useEffect(() => {
    const onFocus = () => setRetryNonce((n) => n + 1);
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => {
      // Only poll if the page is visible — saves a round-trip
      // when the partner has the tab in the background.
      if (document.visibilityState === 'visible') {
        setRetryNonce((n) => n + 1);
      }
    }, 30_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  // -----------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------
  const markRead = useCallback(async (id: string) => {
    // Optimistic update — flip is_read locally and decrement the
    // unread count, then call the API. If the API fails, the next
    // refetch will reconcile.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await apiFetch(`/api/partner/notifications/${id}`, { method: 'PATCH' });
    } catch (err) {
      // Reconcile by refetching. Don't toast — the optimistic
      // flip will be silently corrected.
      console.error('markRead failed:', err);
      setRetryNonce((n) => n + 1);
    }
  }, []);

  const markAll = useCallback(async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    try {
      await apiFetchJson<{ marked: number }>(
        '/api/partner/notifications/read-all',
        { method: 'POST' },
      );
      // Optimistic update of all currently-visible rows
      setNotifications((prev) =>
        prev.map((n) => (n.is_read ? n : { ...n, is_read: true, read_at: new Date().toISOString() })),
      );
      setUnreadCount(0);
      // Force a refetch so the count is exactly right (the API
      // may have marked rows we didn't have on the page).
      setRetryNonce((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerNotif.errorMarkAll'));
    } finally {
      setMarkingAll(false);
    }
  }, [unreadCount, t]);

  const onRowClick = useCallback(
    (n: PartnerNotification) => {
      // Mark read (fire-and-forget) and navigate if the row
      // has a link_url. We navigate synchronously so the user
      // doesn't see a delay.
      if (!n.is_read) markRead(n.id);
      if (n.link_url) {
        // Use a microtask to let the optimistic state update
        // paint first, then navigate.
        pendingNavRef.current = n.id;
        queueMicrotask(() => {
          window.location.href = n.link_url!;
        });
      }
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
            {t('partnerNotif.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('partnerNotif.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => setRetryNonce((n) => n + 1)}
            title={t('partnerNotif.refresh')}
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
              {t('partnerNotif.markAllAsRead')}
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
          {t('partnerNotif.filterAll')}
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
          {t('partnerNotif.filterUnread')}
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
            {t('partnerNotif.tryAgain')}
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && notifications.length === 0 ? (
        <Card className="rounded-none border-gray-200">
          <CardContent className="py-16 text-center">
            <Spinner size="md" className="text-[#1B2A4A] mx-auto" />
            <p className="text-sm text-gray-500 mt-3">{t('partnerNotif.loading')}</p>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="rounded-none border-gray-200">
          <CardContent className="py-16 text-center">
            <Inbox size={36} className="text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500 mt-3">
              {filter === 'unread'
                ? t('partnerNotif.emptyUnread')
                : t('partnerNotif.emptyAll')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-none border-gray-200">
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const typeClass = TYPE_BADGE[n.type] || TYPE_BADGE.info;
                const typeLabelKey = TYPE_LABEL[n.type] || n.type;
                const typeLabel = typeLabelKey.startsWith('partnerNotif.') ? t(typeLabelKey) : n.type;
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
                        {n.link_url && (
                          <span className="text-[#9B1B30]">{t('partnerNotif.viewApplication')}</span>
                        )}
                      </div>
                    </div>

                    {/* Mark-read button (visible on hover for unread rows) */}
                    {!n.is_read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(n.id);
                        }}
                        className="flex-shrink-0 text-gray-400 hover:text-[#1B2A4A] p-1 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
                        title={t('partnerNotif.markAsReadTooltip')}
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Footer hint */}
      {notifications.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {t('partnerNotif.footer', { n: notifications.length })}
        </p>
      )}
    </div>
  );
}
