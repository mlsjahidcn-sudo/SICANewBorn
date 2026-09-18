'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal,
  Search,
  UserX,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  COUNSELLING_BOOKING_STATUSES,
  type CounsellingBooking,
  type CounsellingBookingStatus,
} from '@/lib/counselling-mapper';

interface AdminCounsellingResponse {
  bookings: CounsellingBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    pending: number;
    confirmedUpcoming: number;
    completed: number;
    total: number;
  };
}

type Scope = 'upcoming' | 'past' | 'all';
const SCOPES: Scope[] = ['upcoming', 'past', 'all'];
const STATUS_FILTERS = ['all', ...COUNSELLING_BOOKING_STATUSES] as const;

type ConfirmAction = 'Cancelled' | 'No-show';

export default function AdminCounsellingPage() {
  const { t, locale } = useI18n();
  const localeTag = locale === 'zh' ? 'zh-CN' : 'en-US';

  const [bookings, setBookings] = useState<CounsellingBooking[]>([]);
  const [stats, setStats] = useState<AdminCounsellingResponse['stats'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scope, setScope] = useState<Scope>('upcoming');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [editBooking, setEditBooking] = useState<CounsellingBooking | null>(null);
  const [editMeetingLink, setEditMeetingLink] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ booking: CounsellingBooking; action: ConfirmAction } | null>(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', scope });
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await apiFetchJson<AdminCounsellingResponse>(`/api/admin/counselling?${params}`);
      setBookings(res.bookings ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
      setStats(res.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminCounselling.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [page, scope, searchQuery, statusFilter, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, scope]);

  const formatSlot = (iso: string): string => {
    return new Intl.DateTimeFormat(localeTag, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Shanghai',
    }).format(new Date(iso));
  };

  const patchBooking = async (id: string, body: Record<string, unknown>): Promise<boolean> => {
    setActing(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ booking: CounsellingBooking }>(
        `/api/admin/counselling/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      setBookings((prev) => prev.map((b) => (b.id === id ? res.booking : b)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminCounselling.errorUpdate'));
      return false;
    } finally {
      setActing(false);
    }
  };

  const handleStatusAction = async (booking: CounsellingBooking, status: CounsellingBookingStatus) => {
    const ok = await patchBooking(booking.id, { status });
    if (ok) void load(); // stats + scope membership change on any status move
  };

  const handleEditSave = async () => {
    if (!editBooking) return;
    const ok = await patchBooking(editBooking.id, {
      meetingLink: editMeetingLink,
      adminNotes: editNotes,
    });
    if (ok) {
      setEditBooking(null);
      void load();
    }
  };

  const openEdit = (booking: CounsellingBooking) => {
    setEditBooking(booking);
    setEditMeetingLink(booking.meetingLink ?? '');
    setEditNotes(booking.adminNotes ?? '');
  };

  const statusBadge = (status: CounsellingBookingStatus) => {
    const key = `adminCounselling.status_${status.replace('-', '')}` as 'adminCounselling.status_Pending';
    if (status === 'Pending') return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{t(key)}</Badge>;
    if (status === 'Confirmed') return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{t(key)}</Badge>;
    if (status === 'Completed') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{t(key)}</Badge>;
    if (status === 'Cancelled') return <Badge variant="secondary">{t(key)}</Badge>;
    return <Badge variant="outline" className="text-red-600 border-red-300">{t(key)}</Badge>;
  };

  const statCards = stats
    ? [
        { label: t('adminCounselling.statPending'), value: stats.pending, accent: 'text-amber-600' },
        { label: t('adminCounselling.statConfirmedUpcoming'), value: stats.confirmedUpcoming, accent: 'text-blue-600' },
        { label: t('adminCounselling.statCompleted'), value: stats.completed, accent: 'text-green-600' },
        { label: t('adminCounselling.statTotal'), value: stats.total, accent: 'text-[#1B2A4A]' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-[#1B2A4A]" />
          {t('adminCounselling.title')}
        </h1>
        <p className="text-gray-600">{t('adminCounselling.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            {t('adminCounselling.dismiss')}
          </button>
        </div>
      )}

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label}>
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${card.accent}`}>{card.value}</div>
                <div className="text-xs text-gray-500 mt-1">{card.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('adminCounselling.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 border border-gray-300 bg-white text-sm"
              aria-label={t('adminCounselling.filterStatus')}
            >
              {STATUS_FILTERS.map((value) => (
                <option key={value} value={value}>
                  {value === 'all'
                    ? t('adminCounselling.statusAll')
                    : t(`adminCounselling.status_${value.replace('-', '')}` as 'adminCounselling.status_Pending')}
                </option>
              ))}
            </select>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              className="h-10 px-3 border border-gray-300 bg-white text-sm"
              aria-label={t('adminCounselling.filterScope')}
            >
              {SCOPES.map((value) => (
                <option key={value} value={value}>
                  {t(`adminCounselling.scope_${value}` as 'adminCounselling.scope_upcoming')}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('adminCounselling.colSlot')}</TableHead>
                <TableHead>{t('adminCounselling.colStudent')}</TableHead>
                <TableHead>{t('adminCounselling.colContact')}</TableHead>
                <TableHead>{t('adminCounselling.colTopic')}</TableHead>
                <TableHead>{t('adminCounselling.colStatus')}</TableHead>
                <TableHead className="text-right">{t('adminCounselling.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    {t('adminCounselling.loading')}
                  </TableCell>
                </TableRow>
              ) : bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    <CalendarClock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">{t('adminCounselling.emptyTitle')}</p>
                    <p className="text-sm">{t('adminCounselling.emptyBody')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>
                      <div className="font-medium text-[#1B2A4A] whitespace-nowrap">{formatSlot(b.slotStart)}</div>
                      <div className="text-xs text-gray-400 font-mono">{b.reference}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-[#1B2A4A]">{b.name}</div>
                      <div className="text-xs text-gray-500">
                        {[b.country, b.educationLevel ? t(`counselling.edu_${b.educationLevel}` as 'counselling.edu_high_school') : null]
                          .filter(Boolean)
                          .join(' · ') || '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${b.email}`} className="text-sm text-[#1B2A4A] hover:text-[#9B1B30]">
                        {b.email}
                      </a>
                      <div className="text-xs text-gray-500">{b.phone}</div>
                      {b.meetingLink && (
                        <a
                          href={b.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-[#9B1B30] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t('adminCounselling.meetingLinkLabel')}
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="text-sm text-gray-600 truncate" title={b.topic ?? undefined}>
                        {b.topic ?? '—'}
                      </div>
                      {b.adminNotes && (
                        <div className="text-xs text-gray-400 truncate mt-0.5" title={b.adminNotes}>
                          {b.adminNotes}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(b.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={acting}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {b.status === 'Pending' && (
                            <DropdownMenuItem onClick={() => void handleStatusAction(b, 'Confirmed')}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {t('adminCounselling.actionConfirm')}
                            </DropdownMenuItem>
                          )}
                          {b.status === 'Confirmed' && (
                            <DropdownMenuItem onClick={() => void handleStatusAction(b, 'Completed')}>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              {t('adminCounselling.actionComplete')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEdit(b)}>
                            {t('adminCounselling.actionEdit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {b.status !== 'Cancelled' && (
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({ booking: b, action: 'Cancelled' })}
                              className="text-red-600 focus:text-red-600"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              {t('adminCounselling.actionCancel')}
                            </DropdownMenuItem>
                          )}
                          {b.status === 'Confirmed' && (
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({ booking: b, action: 'No-show' })}
                              className="text-red-600 focus:text-red-600"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              {t('adminCounselling.actionNoShow')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {t('adminCounselling.pagination', {
              from: (page - 1) * 20 + 1,
              to: Math.min(page * 20, total),
              total,
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t('adminCounselling.prev')}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              {t('adminCounselling.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editBooking} onOpenChange={(open) => !open && setEditBooking(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('adminCounselling.editTitle')}</DialogTitle>
            <DialogDescription>
              {editBooking ? `${editBooking.name} · ${formatSlot(editBooking.slotStart)}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('adminCounselling.editMeetingLink')}
              </label>
              <Input
                value={editMeetingLink}
                onChange={(e) => setEditMeetingLink(e.target.value)}
                placeholder="https://zoom.us/j/…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {t('adminCounselling.editNotes')}
              </label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
                maxLength={2000}
                className="w-full border border-gray-300 px-3 py-2 text-sm bg-white focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBooking(null)}>
              {t('adminCounselling.cancelEdit')}
            </Button>
            <Button
              className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
              onClick={handleEditSave}
              disabled={editSaving || acting}
            >
              {editSaving || acting ? t('adminCounselling.editSaving') : t('adminCounselling.editSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel / No-show confirmation */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === 'Cancelled'
                ? t('adminCounselling.cancelTitle')
                : t('adminCounselling.noShowTitle')}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === 'Cancelled'
                ? t('adminCounselling.cancelBody')
                : t('adminCounselling.noShowBody')}
              {' '}
              {confirmAction?.booking.name
                ? t('adminCounselling.confirmTarget', { name: confirmAction.booking.name })
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              {t('adminCounselling.cancelEdit')}
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={acting}
              onClick={async () => {
                if (!confirmAction) return;
                const ok = await patchBooking(confirmAction.booking.id, {
                  status: confirmAction.action,
                });
                setConfirmAction(null);
                if (ok) void load();
              }}
            >
              {confirmAction?.action === 'Cancelled'
                ? t('adminCounselling.cancelConfirm')
                : t('adminCounselling.noShowConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
