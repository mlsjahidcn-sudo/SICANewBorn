'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Search,
  Send,
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
import { track } from '@/lib/analytics';
import {
  COUNSELLING_BOOKING_STATUSES,
  type CounsellingBooking,
  type CounsellingBookingStatus,
} from '@/lib/counselling-mapper';
import { beijingTodayStr } from '@/lib/counselling-slots';
import {
  AdminCounsellingCalendar,
  monthRangeFor,
  weekRangeFor,
  type CalendarViewMode,
} from './calendar-view';

type ListViewMode = 'list' | CalendarViewMode;

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

  // Phase 124: reschedule modal — reuses /api/counselling/slots to pick
  // a fresh candidate slot for the same booking.
  const [rescheduleBooking, setRescheduleBooking] = useState<CounsellingBooking | null>(null);
  const [rescheduleDates, setRescheduleDates] = useState<string[]>([]);
  const [rescheduleDate, setRescheduleDate] = useState<string | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<
    { start: string; label: string; available: boolean }[]
  >([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [reschedulePickedStart, setReschedulePickedStart] = useState<string | null>(null);
  const [rescheduleSaving, setRescheduleSaving] = useState(false);

  // Phase 125: admin-proposes-a-time state. Same shape as the
  // reschedule modal — picks a candidate slot from /api/counselling/slots.
  const [proposeBooking, setProposeBooking] = useState<CounsellingBooking | null>(null);
  const [proposeDates, setProposeDates] = useState<string[]>([]);
  const [proposeDate, setProposeDate] = useState<string | null>(null);
  const [proposeSlots, setProposeSlots] = useState<
    { start: string; label: string; available: boolean }[]
  >([]);
  const [proposeLoading, setProposeLoading] = useState(false);
  const [proposePickedStart, setProposePickedStart] = useState<string | null>(null);
  const [proposeSaving, setProposeSaving] = useState(false);

  // Phase 124: per-row success/error toasts mirroring Phase 11's pattern.
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; slug: string } | null>(null);

  // Phase 138: calendar view state — view toggle + Beijing-date anchor
  // for the week/month grids, plus its own range fetch (the list's
  // scope/pagination query doesn't fit a calendar).
  const [view, setView] = useState<ListViewMode>('list');
  const [calAnchor, setCalAnchor] = useState(() => beijingTodayStr(new Date()));
  const [calBookings, setCalBookings] = useState<CounsellingBooking[]>([]);
  const [calLoading, setCalLoading] = useState(false);
  const [calError, setCalError] = useState<string | null>(null);

  const loadCalendar = useCallback(async () => {
    if (view === 'list') return;
    setCalLoading(true);
    setCalError(null);
    try {
      const range = view === 'week' ? weekRangeFor(calAnchor) : monthRangeFor(calAnchor);
      const params = new URLSearchParams({
        from: range.from,
        to: range.to,
        limit: '500',
        scope: 'all',
      });
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await apiFetchJson<AdminCounsellingResponse>(`/api/admin/counselling?${params}`);
      setCalBookings(res.bookings ?? []);
    } catch (err) {
      setCalError(err instanceof Error ? err.message : t('adminCounselling.errorLoad'));
    } finally {
      setCalLoading(false);
    }
  }, [view, calAnchor, searchQuery, statusFilter, t]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

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
    if (ok) {
      setToast({ kind: 'ok', slug: `adminCounselling.toast_${status}` });
      if (status === 'Completed') {
        track('counselling_completed', { locale, reference: booking.reference });
      }
      void load(); // stats + scope membership change on any status move
    } else {
      setToast({ kind: 'err', slug: 'adminCounselling.toastError' });
    }
  };

  const handleEditSave = async () => {
    if (!editBooking) return;
    const meetingLinkChanged =
      (editMeetingLink.trim() || null) !== (editBooking.meetingLink || null);
    const ok = await patchBooking(editBooking.id, {
      meetingLink: editMeetingLink,
      adminNotes: editNotes,
    });
    if (ok) {
      setToast({
        kind: 'ok',
        slug: meetingLinkChanged
          ? 'adminCounselling.toast_meetingLinkUpdated'
          : 'adminCounselling.toast_saved',
      });
      setEditBooking(null);
      void load();
    } else {
      setToast({ kind: 'err', slug: 'adminCounselling.toastError' });
    }
  };

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Phase 124: reschedule modal helpers (also reused for Phase 125 propose).
  const loadSlotDates = useCallback(
    async (
      setDatesState: (v: string[]) => void,
      setDateState: (v: string | null | ((prev: string | null) => string | null)) => void,
      setLoading: (v: boolean) => void,
    ) => {
      setLoading(true);
      try {
        const res = await fetch('/api/counselling/slots');
        const data = (await res.json()) as { dates?: string[] };
        setDatesState(data.dates ?? []);
        setDateState((prev) => prev ?? data.dates?.[0] ?? null);
      } catch {
        setDatesState([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadSlotGrid = useCallback(
    async (
      date: string,
      setSlotsState: (v: { start: string; label: string; available: boolean }[]) => void,
      setLoading: (v: boolean) => void,
    ) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/counselling/slots?date=${encodeURIComponent(date)}`);
        const data = (await res.json()) as { slots?: { start: string; label: string; available: boolean }[] };
        setSlotsState(data.slots ?? []);
      } catch {
        setSlotsState([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!rescheduleBooking) return;
    void loadSlotDates(setRescheduleDates, setRescheduleDate, setRescheduleLoading);
  }, [rescheduleBooking, loadSlotDates]);

  useEffect(() => {
    if (!rescheduleDate) return;
    void loadSlotGrid(rescheduleDate, setRescheduleSlots, setRescheduleLoading);
  }, [rescheduleDate, loadSlotGrid]);

  // Phase 125: propose modal helpers
  useEffect(() => {
    if (!proposeBooking) return;
    void loadSlotDates(setProposeDates, setProposeDate, setProposeLoading);
  }, [proposeBooking, loadSlotDates]);

  useEffect(() => {
    if (!proposeDate) return;
    void loadSlotGrid(proposeDate, setProposeSlots, setProposeLoading);
  }, [proposeDate, loadSlotGrid]);

  const openReschedule = (booking: CounsellingBooking) => {
    setRescheduleBooking(booking);
    setReschedulePickedStart(null);
  };

  const closeReschedule = () => {
    setRescheduleBooking(null);
    setRescheduleDate(null);
    setReschedulePickedStart(null);
    setRescheduleSlots([]);
  };

  const openPropose = (booking: CounsellingBooking) => {
    setProposeBooking(booking);
    setProposePickedStart(null);
  };

  const closePropose = () => {
    setProposeBooking(null);
    setProposeDate(null);
    setProposePickedStart(null);
    setProposeSlots([]);
  };

  const handleProposeSave = async () => {
    if (!proposeBooking || !proposePickedStart) return;
    setProposeSaving(true);
    try {
      const ok = await patchBooking(proposeBooking.id, {
        proposedSlotStartIso: proposePickedStart,
      });
      if (ok) {
        setToast({ kind: 'ok', slug: 'adminCounselling.toast_Proposed' });
        closePropose();
        void load();
      } else {
        setToast({ kind: 'err', slug: 'adminCounselling.toastError' });
      }
    } finally {
      setProposeSaving(false);
    }
  };

  const handleClearProposal = async (booking: CounsellingBooking) => {
    const ok = await patchBooking(booking.id, { clearProposal: true });
    if (ok) {
      setToast({ kind: 'ok', slug: 'adminCounselling.toast_proposalCleared' });
      void load();
    } else {
      setToast({ kind: 'err', slug: 'adminCounselling.toastError' });
    }
  };

  const handleRescheduleSave = async () => {
    if (!rescheduleBooking || !reschedulePickedStart) return;
    setRescheduleSaving(true);
    try {
      const ok = await patchBooking(rescheduleBooking.id, {
        slotStartIso: reschedulePickedStart,
        status: 'Confirmed',
      });
      if (ok) {
        setToast({ kind: 'ok', slug: 'adminCounselling.toast_rescheduled' });
        track('counselling_rescheduled', { locale, reference: rescheduleBooking.reference });
        closeReschedule();
        void load();
      } else {
        setToast({ kind: 'err', slug: 'adminCounselling.toastError' });
      }
    } finally {
      setRescheduleSaving(false);
    }
  };

  const formatRescheduleDateChip = (dateStr: string): string => {
    const d = new Date(`${dateStr}T00:00:00+08:00`);
    return new Intl.DateTimeFormat(localeTag, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Shanghai',
    }).format(d);
  };

  const openEdit = (booking: CounsellingBooking) => {
    setEditBooking(booking);
    setEditMeetingLink(booking.meetingLink ?? '');
    setEditNotes(booking.adminNotes ?? '');
  };

  const statusBadge = (status: CounsellingBookingStatus) => {
    const key = `adminCounselling.status_${status.replace('-', '')}` as 'adminCounselling.status_Pending';
    if (status === 'Pending') return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{t(key)}</Badge>;
    if (status === 'Proposed') return <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">{t(key)}</Badge>;
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
            {/* Phase 138: list ↔ calendar view toggle */}
            <div className="flex border border-gray-300 h-10" role="tablist" aria-label={t('adminCounselling.viewToggleLabel')}>
              {(['list', 'week', 'month'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={view === v}
                  onClick={() => setView(v)}
                  className={`px-3 text-sm font-medium transition-colors ${
                    view === v
                      ? 'bg-[#1B2A4A] text-white'
                      : 'bg-white text-[#1B2A4A] hover:bg-gray-50'
                  }`}
                >
                  {t(`adminCounselling.view_${v}`)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {view === 'list' ? (
        <>
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
                      {b.proposedSlotStart && (
                        <div className="mt-1 inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-800 px-1.5 py-0.5 text-[10px] font-medium">
                          <Send className="h-2.5 w-2.5" />
                          {t('adminCounselling.proposingTo', { slot: formatSlot(b.proposedSlotStart) })}
                        </div>
                      )}
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
                          {b.status !== 'Cancelled' && b.status !== 'Completed' && b.status !== 'No-show' && (
                            <DropdownMenuItem onClick={() => openReschedule(b)}>
                              <CalendarPlus className="h-4 w-4 mr-2" />
                              {t('adminCounselling.actionReschedule')}
                            </DropdownMenuItem>
                          )}
                          {b.status !== 'Cancelled' && b.status !== 'Completed' && b.status !== 'No-show' && (
                            <DropdownMenuItem onClick={() => openPropose(b)}>
                              <Send className="h-4 w-4 mr-2" />
                              {t('adminCounselling.actionPropose')}
                            </DropdownMenuItem>
                          )}
                          {b.proposedSlotStart && (
                            <DropdownMenuItem onClick={() => void handleClearProposal(b)}>
                              <XCircle className="h-4 w-4 mr-2" />
                              {t('adminCounselling.actionClearProposal')}
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
        </>
      ) : (
        <div className="space-y-4">
          {calError && (
            <div className="bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {calError}
              <button className="ml-2 underline" onClick={() => setCalError(null)}>
                {t('adminCounselling.dismiss')}
              </button>
            </div>
          )}
          <AdminCounsellingCalendar
            bookings={calBookings}
            loading={calLoading}
            view={view}
            anchor={calAnchor}
            onViewChange={setView}
            onAnchorChange={setCalAnchor}
            acting={acting}
            localeTag={localeTag}
            t={t}
            formatSlot={formatSlot}
            onStatusAction={(b, s) => {
              void handleStatusAction(b, s);
              void loadCalendar();
            }}
          />
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
      {/* Reschedule dialog */}
      <Dialog open={!!rescheduleBooking} onOpenChange={(open) => !open && closeReschedule()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('adminCounselling.rescheduleTitle')}</DialogTitle>
            <DialogDescription>
              {rescheduleBooking
                ? t('adminCounselling.rescheduleBody', {
                    name: rescheduleBooking.name,
                    slot: formatSlot(rescheduleBooking.slotStart),
                  })
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                {t('adminCounselling.reschedulePickDate')}
              </label>
              {rescheduleLoading && rescheduleDates.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('adminCounselling.loading')}
                </div>
              ) : rescheduleDates.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">{t('adminCounselling.rescheduleNoSlots')}</div>
              ) : (
                <div className="flex flex-wrap gap-2 pb-1">
                  {rescheduleDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setRescheduleDate(date);
                        setReschedulePickedStart(null);
                      }}
                      className={`border px-4 py-2 text-sm font-medium transition-colors ${
                        rescheduleDate === date
                          ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                          : 'border-gray-300 bg-white text-[#1F2937] hover:border-[#9B1B30] hover:text-[#9B1B30]'
                      }`}
                    >
                      {formatRescheduleDateChip(date)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                {t('adminCounselling.reschedulePickSlot')}
              </label>
              {rescheduleLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('adminCounselling.loading')}
                </div>
              ) : rescheduleSlots.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">{t('adminCounselling.rescheduleNoSlots')}</div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-2">
                  {rescheduleSlots.map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setReschedulePickedStart(s.start)}
                      className={`border px-2 py-2.5 text-sm font-medium transition-colors ${
                        reschedulePickedStart === s.start
                          ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                          : s.available
                            ? 'border-gray-300 bg-white text-[#1F2937] hover:border-[#9B1B30] hover:text-[#9B1B30]'
                            : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeReschedule}>
              {t('adminCounselling.cancelEdit')}
            </Button>
            <Button
              className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
              onClick={handleRescheduleSave}
              disabled={!reschedulePickedStart || rescheduleSaving}
            >
              {rescheduleSaving
                ? t('adminCounselling.editSaving')
                : t('adminCounselling.rescheduleSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phase 125: Propose-time dialog (mirrors Reschedule UI but
          calls proposedSlotStartIso instead of slotStartIso) */}
      <Dialog open={!!proposeBooking} onOpenChange={(open) => !open && closePropose()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="space-y-1.5">
            <DialogTitle>{t('adminCounselling.proposeTitle')}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {proposeBooking
                ? t('adminCounselling.proposeBody', {
                    name: proposeBooking.name,
                    slot: formatSlot(proposeBooking.slotStart),
                  })
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                {t('adminCounselling.reschedulePickDate')}
              </label>
              {proposeLoading && proposeDates.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('adminCounselling.loading')}
                </div>
              ) : proposeDates.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">{t('adminCounselling.rescheduleNoSlots')}</div>
              ) : (
                <div className="flex flex-wrap gap-2 pb-1">
                  {proposeDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setProposeDate(date);
                        setProposePickedStart(null);
                      }}
                      className={`border px-4 py-2 text-sm font-medium transition-colors ${
                        proposeDate === date
                          ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                          : 'border-gray-300 bg-white text-[#1F2937] hover:border-[#9B1B30] hover:text-[#9B1B30]'
                      }`}
                    >
                      {formatRescheduleDateChip(date)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                {t('adminCounselling.proposePickSlot')}
              </label>
              {proposeLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('adminCounselling.loading')}
                </div>
              ) : proposeSlots.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">{t('adminCounselling.rescheduleNoSlots')}</div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-7 gap-2">
                  {proposeSlots.map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setProposePickedStart(s.start)}
                      className={`border px-2 py-2.5 text-sm font-medium transition-colors ${
                        proposePickedStart === s.start
                          ? 'border-[#9B1B30] bg-[#9B1B30] text-white'
                          : s.available
                            ? 'border-gray-300 bg-white text-[#1F2937] hover:border-[#9B1B30] hover:text-[#9B1B30]'
                            : 'border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closePropose}>
              {t('adminCounselling.cancelEdit')}
            </Button>
            <Button
              className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
              onClick={handleProposeSave}
              disabled={!proposePickedStart || proposeSaving}
            >
              {proposeSaving
                ? t('adminCounselling.editSaving')
                : t('adminCounselling.proposeSave')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast (Phase 124: send-status feedback) */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 text-sm border ${
            toast.kind === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {t(toast.slug)}
        </div>
      )}
    </div>
  );
}
