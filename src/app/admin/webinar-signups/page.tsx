'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Mail,
  MessageCircle,
  Globe,
  Megaphone,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Calendar,
  Link as LinkIcon,
  Video,
  Users,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { useUrlState } from '@/hooks/use-url-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SessionEditDialog, type SessionEditValue } from '@/components/admin/SessionEditDialog';
import { TopicEditDialog, type TopicEditValue } from '@/components/admin/TopicEditDialog';
import { WebinarStatsCards } from '@/components/admin/WebinarStatsCards';

// Phase 139 + 140 — admin surface.
// Tab 1 (default) — Registrations: list of every signup with
// per-row status flip (PATCH /api/admin/webinar-signups/[id]).
// Tab 2 — Sessions: list + add/edit/delete sessions
// (uses SessionEditDialog).
// Tab 3 — Topics: list of topics for the active session +
// add/edit/delete (uses TopicEditDialog).
// All 3 tabs share the URL via ?tab= (Phase 1.1 useUrlState).

// ============================================================================
// Shared types
// ============================================================================

type Tab = 'registrations' | 'sessions' | 'topics' | 'waitlist';

interface WebinarSignup {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  country: string | null;
  programInterests: string[];
  notes: string | null;
  sourcePage: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  status: 'Registered' | 'Attended' | 'No-Show' | 'Cancelled';
  createdAt: string;
}

interface WebinarSignupResponse {
  signups: WebinarSignup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Session {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
  sessionDate: string | null;
  sessionTime: string | null;
  durationMinutes: number;
  joinUrl: string | null;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  isActive: boolean;
  displayOrder: number;
  /** Phase 142: per-session attendee cap. DB DEFAULT 50. */
  maxAttendees: number;
  createdAt: string;
  updatedAt: string | null;
}

interface SessionsResponse {
  sessions: Session[];
}

interface Topic {
  id: string;
  sessionId: string;
  intake: 'march_2027' | 'september_2027' | 'csc' | 'other';
  degree: 'chinese_language' | 'foundation' | 'bachelor' | 'master' | 'phd' | 'csc';
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

interface TopicsResponse {
  topics: Topic[];
}

const PAGE_SIZE = 50;

// Status colors are untranslated (DB enum round-trip contract).
const STATUS_COLOR: Record<string, string> = {
  Registered: 'bg-blue-100 text-blue-800',
  Attended: 'bg-green-100 text-green-800',
  'No-Show': 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-700',
};

// All 7 program-interests values (Phase 140 expanded from 5).
const INTEREST_KEYS: Record<string, string> = {
  chinese_language: 'webinar.interests.chineseLanguage',
  foundation: 'webinar.interests.foundation',
  bachelor_march: 'webinar.interests.bachelorMarch',
  bachelor: 'webinar.interests.bachelor',
  master: 'webinar.interests.master',
  phd: 'webinar.interests.phd',
  csc: 'webinar.interests.csc',
};

const INTEREST_COLOR: Record<string, string> = {
  chinese_language: 'bg-[#D4A853]/20 text-[#1B2A4A] border-[#D4A853]/50',
  foundation: 'bg-[#1B2A4A]/10 text-[#1B2A4A] border-[#1B2A4A]/30',
  bachelor_march: 'bg-[#9B1B30]/10 text-[#9B1B30] border-[#9B1B30]/40',
  bachelor: 'bg-[#9B1B30]/10 text-[#9B1B30] border-[#9B1B30]/40',
  master: 'bg-[#9B1B30]/10 text-[#9B1B30] border-[#9B1B30]/40',
  phd: 'bg-purple-100 text-purple-800 border-purple-300',
  csc: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatWhatsappNumber(raw: string): string {
  return raw.replace(/[^\d+]/g, '');
}

// ============================================================================
// Page
// ============================================================================

export default function WebinarSignupsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useUrlState<Tab>('tab', 'registrations', {
    coerce: (raw) => {
      if (raw === 'sessions' || raw === 'topics' || raw === 'waitlist') return raw;
      return 'registrations';
    },
  });

  return (
    <div className="space-y-6">
      <Header />

      <div className="flex border-b border-gray-200">
        <TabButton current={tab} value="registrations" onClick={setTab}>
          {t('adminWebinars.tabRegistrations')}
        </TabButton>
        <TabButton current={tab} value="sessions" onClick={setTab}>
          {t('adminWebinars.tabSessions')}
        </TabButton>
        <TabButton current={tab} value="topics" onClick={setTab}>
          {t('adminWebinars.tabTopics')}
        </TabButton>
        <TabButton current={tab} value="waitlist" onClick={setTab}>
          {t('adminWebinars.tabWaitlist')}
        </TabButton>
      </div>

      {tab === 'registrations' && <RegistrationsTab />}
      {tab === 'sessions' && <SessionsTab />}
      {tab === 'topics' && <TopicsTab />}
      {tab === 'waitlist' && <WaitlistTab />}
    </div>
  );
}

function Header() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937] flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-[#1B2A4A]" />
          {t('adminWebinars.title')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{t('adminWebinars.subtitle')}</p>
      </div>
      <Badge className="bg-[#1B2A4A] text-white">
        {t('adminWebinars.colSource')}:{' '}
        <code className="ml-1 text-xs">/webinar-2027-intake-csc</code>
      </Badge>
    </div>
  );
}

function TabButton({
  current,
  value,
  onClick,
  children,
}: {
  current: Tab;
  value: Tab;
  onClick: (next: Tab) => void;
  children: React.ReactNode;
}) {
  const isActive = current === value;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        isActive
          ? 'border-[#9B1B30] text-[#9B1B30]'
          : 'border-transparent text-gray-500 hover:text-[#1B2A4A]'
      }`}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Tab 1: Registrations (Phase 139 list + Phase 140 status flip)
// ============================================================================

function RegistrationsTab() {
  const { t } = useI18n();
  const [signups, setSignups] = useState<WebinarSignup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    signup: WebinarSignup;
    next: WebinarSignup['status'];
  } | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      const res = await apiFetchJson<WebinarSignupResponse>(
        `/api/admin/webinar-signups?${params}`,
      );
      setSignups(res.signups || []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, page, t]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery, page]);

  const visible = useMemo(() => {
    if (!searchQuery) return signups;
    const q = searchQuery.toLowerCase();
    return signups.filter(
      (s) =>
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.whatsapp.toLowerCase().includes(q) ||
        (s.country?.toLowerCase().includes(q) ?? false),
    );
  }, [signups, searchQuery]);

  const subtitle = (() => {
    if (total === 0) return t('adminWebinars.subtitle');
    return t('adminWebinars.pagination', {
      from: offset + 1,
      to: Math.min(offset + signups.length, total),
      total,
    });
  })();

  const requestStatusChange = (signup: WebinarSignup, next: WebinarSignup['status']) => {
    if (next === signup.status) return;
    setPendingStatusChange({ signup, next });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    setStatusChanging(true);
    setLoadError(null);
    try {
      await apiFetchJson(`/api/admin/webinar-signups/${pendingStatusChange.signup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatusChange.next }),
      });
      setSignups((prev) =>
        prev.map((s) =>
          s.id === pendingStatusChange.signup.id
            ? { ...s, status: pendingStatusChange.next }
            : s,
        ),
      );
      setPendingStatusChange(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorUpdateStatus'));
    } finally {
      setStatusChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Phase 143: stats widget at the top — top-line numbers +
          breakdowns by status / country / interest / source.
          Polls every 30s, errors are best-effort. */}
      <WebinarStatsCards />

      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('adminWebinars.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder={t('adminWebinars.statusAll')} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('adminWebinars.statusAll')}</SelectItem>
                  <SelectItem value="Registered">{t('adminWebinars.status_Registered')}</SelectItem>
                  <SelectItem value="Attended">{t('adminWebinars.status_Attended')}</SelectItem>
                  <SelectItem value="No-Show">{t('adminWebinars.status_NoShow')}</SelectItem>
                  <SelectItem value="Cancelled">{t('adminWebinars.status_Cancelled')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-[#1B2A4A]" />
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
            {total === 0 ? t('adminWebinars.emptyAll') : t('adminWebinars.emptyFiltered')}
          </div>
        ) : (
          visible.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 p-4 hover:border-[#9B1B30]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 h-10 w-10 bg-[#9B1B30]/10 flex items-center justify-center">
                  <span className="text-[#9B1B30] font-semibold text-sm">
                    {s.firstName?.[0]}
                    {s.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1B2A4A]">
                      {s.firstName} {s.lastName}
                    </h3>
                    <Badge className={STATUS_COLOR[s.status]}>{s.status}</Badge>
                    {s.country && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {s.country}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center gap-3 flex-wrap">
                    <a
                      href={`mailto:${s.email}`}
                      className="flex items-center gap-1 text-[#1B2A4A] hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      {s.email}
                    </a>
                    <a
                      href={`https://wa.me/${formatWhatsappNumber(s.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#1B2A4A] hover:underline"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {s.whatsapp}
                    </a>
                  </div>
                  {s.programInterests.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500">
                        {t('adminWebinars.interestsLabel')}:
                      </span>
                      {s.programInterests.map((interest) => (
                        <span
                          key={interest}
                          className={`inline-block text-[11px] font-semibold px-2 py-0.5 border ${INTEREST_COLOR[interest] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}
                        >
                          {t(INTEREST_KEYS[interest] ?? 'webinar.interests.csc')}
                        </span>
                      ))}
                    </div>
                  )}
                  {s.notes && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-gray-700 bg-[#FAF6E8] border border-[#D4A853]/30 p-2">
                      <FileText className="h-3.5 w-3.5 text-[#1B2A4A] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{s.notes}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(s.createdAt)}
                    {s.utmSource && (
                      <span className="ml-2 text-gray-500">
                        · {s.utmSource}
                        {s.utmCampaign ? `/${s.utmCampaign}` : ''}
                      </span>
                    )}
                  </p>
                </div>
                {/* Phase 140: per-row status dropdown */}
                <div className="flex-shrink-0">
                  <Select
                    value={s.status}
                    onValueChange={(next) =>
                      requestStatusChange(s, next as WebinarSignup['status'])
                    }
                  >
                    <SelectTrigger className="w-36 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Registered">{t('adminWebinars.status_Registered')}</SelectItem>
                      <SelectItem value="Attended">{t('adminWebinars.status_Attended')}</SelectItem>
                      <SelectItem value="No-Show">{t('adminWebinars.status_NoShow')}</SelectItem>
                      <SelectItem value="Cancelled">{t('adminWebinars.status_Cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {t('adminWebinars.pagination', {
              from: offset + 1,
              to: Math.min(offset + PAGE_SIZE, total),
              total,
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-[#1B2A4A] text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('adminWebinars.prev')}
            </button>
            <span className="text-xs text-gray-500 px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-[#1B2A4A] text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('adminWebinars.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!pendingStatusChange}
        onOpenChange={(open) => !open && setPendingStatusChange(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminWebinars.statusChangeTo')}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusChange?.signup.firstName} {pendingStatusChange?.signup.lastName}
              {' · '}
              <Badge className={STATUS_COLOR[pendingStatusChange?.signup.status ?? '']}>
                {pendingStatusChange?.signup.status}
              </Badge>
              {' → '}
              <Badge className={STATUS_COLOR[pendingStatusChange?.next ?? '']}>
                {pendingStatusChange?.next}
              </Badge>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusChanging} className="rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={statusChanging}
              onClick={confirmStatusChange}
              className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
            >
              {statusChanging ? <Spinner size="xs" /> : t('adminWebinars.statusChanged')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// Tab 2: Sessions (Phase 140 CRUD)
// ============================================================================

function SessionsTab() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SessionEditValue | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Session | null>(null);
  // Phase 142: which row is mid-toggle (button shows spinner)
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<SessionsResponse>('/api/admin/webinar-sessions');
      setSessions(res.sessions || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

const sessionToEditValue = (s: Session): SessionEditValue => ({
  id: s.id,
  slug: s.slug,
  titleEn: s.titleEn,
  titleZh: s.titleZh,
  descriptionEn: s.descriptionEn,
  descriptionZh: s.descriptionZh,
  sessionDate: s.sessionDate,
  sessionTime: s.sessionTime,
  durationMinutes: s.durationMinutes,
  joinUrl: s.joinUrl,
  status: s.status,
  isActive: s.isActive,
  displayOrder: s.displayOrder,
  maxAttendees: s.maxAttendees ?? 50,
});

  const handleSaved = (next: SessionEditValue) => {
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === next.id);
      if (idx >= 0) {
        // Merge into the existing row so createdAt/updatedAt survive.
        const merged: Session = {
          ...prev[idx],
          slug: next.slug,
          titleEn: next.titleEn,
          titleZh: next.titleZh,
          descriptionEn: next.descriptionEn,
          descriptionZh: next.descriptionZh,
          sessionDate: next.sessionDate,
          sessionTime: next.sessionTime,
          durationMinutes: next.durationMinutes,
          joinUrl: next.joinUrl,
          status: next.status,
          isActive: next.isActive,
          displayOrder: next.displayOrder,
          maxAttendees: next.maxAttendees,
        };
        const copy = [...prev];
        copy[idx] = merged;
        // If a session was just toggled inactive, mark the rest
        // isActive=false (the server already did this — DB partial
        // unique index enforces it — but mirror locally so the
        // UI doesn't briefly show two active rows).
        if (!next.isActive) {
          copy[idx].isActive = false;
        } else {
          copy.forEach((s, i) => {
            if (i !== idx) copy[i] = { ...s, isActive: false };
          });
        }
        return copy;
      }
      // New row — createdAt/updatedAt will be filled by the next
      // list refresh; insert with empty placeholders so the
      // dialog can close cleanly without waiting on a reload.
      const now = new Date().toISOString();
      const created: Session = {
        ...sessionToEditValue(next as unknown as Session),
        createdAt: now,
        updatedAt: now,
      };
      return [...prev, created];
    });
    setEditing(null);
    setCreating(false);
  };

  // Phase 142: one-click isActive toggle. The PATCH endpoint
  // already flips the previous active row off before setting
  // the new (so the partial unique index doesn't 23505), so
  // we just mirror that locally.
  const quickToggle = async (s: Session, nextIsActive: boolean) => {
    setPendingToggleId(s.id);
    setLoadError(null);
    try {
      await apiFetchJson(`/api/admin/webinar-sessions/${s.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextIsActive }),
      });
      setSessions((prev) =>
        prev.map((row) =>
          row.id === s.id
            ? { ...row, isActive: nextIsActive }
            : { ...row, isActive: false },
        ),
      );
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorSaveSession'));
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleDelete = async (s: Session) => {
    try {
      await apiFetchJson(`/api/admin/webinar-sessions/${s.id}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((row) => row.id !== s.id));
      setPendingDelete(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorDeleteSession'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1B2A4A]">{t('adminWebinars.sessionsTitle')}</h2>
          <p className="text-sm text-gray-600">{t('adminWebinars.sessionsSubtitle')}</p>
        </div>
        <Button
          className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
          onClick={() => setCreating(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('adminWebinars.addSession')}
        </Button>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" className="text-[#1B2A4A]" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
          {t('adminWebinars.emptyAll')}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`bg-white border p-4 ${
                s.isActive ? 'border-[#9B1B30] ring-1 ring-[#9B1B30]' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1B2A4A]">
                      {s.titleEn}{' '}
                      <span className="text-gray-500 font-normal">/ {s.titleZh}</span>
                    </h3>
                    {s.isActive && (
                      <Badge className="bg-[#9B1B30] text-white">
                        {t('adminWebinars.sessionActiveBadge')}
                      </Badge>
                    )}
                    <Badge variant="outline">{s.status}</Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {s.sessionDate ? formatDate(s.sessionDate) : t('adminWebinars.sessionNoDate')}
                      {s.sessionTime && ` · ${s.sessionTime}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {s.durationMinutes} min
                    </span>
                    {/* Phase 142: capacity readout. The exact seat-holders
                        count lives on webinar_signups; the admin can
                        consult /admin/webinar-signups?tab=registrations
                        for the live number. */}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {t('adminWebinars.sessionCapacity')}{' '}
                        <span className="font-semibold text-[#1B2A4A]">
                          {s.maxAttendees}
                        </span>
                      </span>
                    </span>
                    {s.joinUrl && (
                      <a
                        href={s.joinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#1B2A4A] hover:underline truncate max-w-xs"
                      >
                        <LinkIcon className="h-3 w-3" />
                        <span className="truncate">{s.joinUrl}</span>
                      </a>
                    )}
                    {!s.joinUrl && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <LinkIcon className="h-3 w-3" />
                        {t('adminWebinars.sessionNoJoinUrl')}
                      </span>
                    )}
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5">{s.slug}</code>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(sessionToEditValue(s))}
                    className="rounded-none"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {/* Phase 142: one-click active/inactive toggle.
                      No dialog required for the most common action.
                      The PATCH endpoint already flips the previous
                      active row off before setting the new. */}
                  {s.isActive ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => quickToggle(s, false)}
                      className="rounded-none"
                      disabled={pendingToggleId === s.id}
                    >
                      {pendingToggleId === s.id ? (
                        <Spinner size="xs" />
                      ) : (
                        <Video className="h-3 w-3 mr-1" />
                      )}
                      {t('adminWebinars.sessionMarkInactive')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => quickToggle(s, true)}
                      className="rounded-none"
                      disabled={pendingToggleId === s.id}
                    >
                      {pendingToggleId === s.id ? (
                        <Spinner size="xs" />
                      ) : (
                        <Video className="h-3 w-3 mr-1" />
                      )}
                      {t('adminWebinars.sessionMakeActive')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(s)}
                    className="text-gray-400 hover:text-[#9B1B30] hover:bg-red-50 rounded-none"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SessionEditDialog
        open={editing !== null || creating}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setCreating(false);
          }
        }}
        initial={editing}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminWebinars.sessionDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminWebinars.sessionDeleteBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && handleDelete(pendingDelete)}
              className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// Tab 3: Topics (Phase 140 CRUD)
// ============================================================================

function TopicsTab() {
  const { t } = useI18n();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<TopicEditValue | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Topic | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await apiFetchJson<SessionsResponse>('/api/admin/webinar-sessions');
      setSessions(res.sessions || []);
      const active = res.sessions?.find((s) => s.isActive);
      if (active) setActiveSessionId(active.id);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorLoad'));
    }
  }, [t]);

  const loadTopics = useCallback(
    async (sessionId: string | null) => {
      if (!sessionId) {
        setTopics([]);
        return;
      }
      // We piggyback on the existing /api/webinar-sessions/[id]/topics
      // POST path; for GET, list topics via a Supabase-style fetch
      // through an admin endpoint. Since we don't have a GET
      // endpoint yet, we use the active session's id and the public
      // RLS-gated read path via the supabase client... but we're
      // client-side. Simplest: add a topics list under the session
      // endpoint. Use the existing PATCH endpoint + a new fetch via
      // the admin web path. The cleanest is to call the admin
      // session endpoint and ask for topics inline — but we don't
      // have one. We'll list via fetch to the same admin endpoint
      // by session id using a listTopics style... since the API
      // doesn't expose that, fall back to fetching topics via the
      // supabase JS client from the browser... not viable.
      //
      // Simplest correct path: use a small list endpoint scoped to
      // the active session. The session list endpoint doesn't
      // include topics. Add a parallel route: GET /api/admin/
      // webinar-sessions/[id]/topics — implemented as the list
      // half of the existing POST endpoint. For this tab we'll
      // page-fetch both sessions + topics separately.
      try {
        const res = await apiFetchJson<{ topics: Topic[] }>(
          `/api/admin/webinar-sessions/${sessionId}/topics`,
        );
        setTopics(res.topics || []);
      } catch (err) {
        setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorLoad'));
      }
    },
    [t],
  );

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      await loadSessions();
      setIsLoading(false);
    })();
  }, [loadSessions]);

  useEffect(() => {
    if (activeSessionId) loadTopics(activeSessionId);
  }, [activeSessionId, loadTopics]);

  const topicToEditValue = (row: Topic): TopicEditValue => ({
    id: row.id,
    sessionId: row.sessionId,
    intake: row.intake,
    degree: row.degree,
    titleEn: row.titleEn,
    titleZh: row.titleZh,
    bodyEn: row.bodyEn,
    bodyZh: row.bodyZh,
    displayOrder: row.displayOrder,
  });

  const handleSaved = (next: TopicEditValue) => {
    setTopics((prev) => {
      const idx = prev.findIndex((row) => row.id === next.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...next } as Topic;
        return copy;
      }
      return [...prev, { ...next, createdAt: new Date().toISOString(), updatedAt: null } as Topic];
    });
    setEditing(null);
    setCreating(false);
  };

  const handleDelete = async (row: Topic) => {
    try {
      await apiFetchJson(`/api/admin/webinar-topics/${row.id}`, { method: 'DELETE' });
      setTopics((prev) => prev.filter((r) => r.id !== row.id));
      setPendingDelete(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorDeleteTopic'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" className="text-[#1B2A4A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1B2A4A]">{t('adminWebinars.topicsTitle')}</h2>
          <p className="text-sm text-gray-600">{t('adminWebinars.topicsSubtitle')}</p>
        </div>
        <Button
          className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
          onClick={() => setCreating(true)}
          disabled={!activeSessionId}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('adminWebinars.addTopic')}
        </Button>
      </div>

      {sessions.length > 1 && (
        <Card>
          <div className="p-4">
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              Session
            </label>
            <select
              value={activeSessionId ?? ''}
              onChange={(e) => setActiveSessionId(e.target.value || null)}
              className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.titleEn} {s.isActive ? '(active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {!activeSessionId ? (
        <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
          {t('adminWebinars.topicNoTopics')}
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((row) => (
            <div
              key={row.id}
              className="bg-white border border-gray-200 p-4 hover:border-[#9B1B30]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1B2A4A]">{row.titleEn}</h3>
                    <Badge variant="outline">
                      {t(`adminWebinars.intake.${row.intake}`)}
                    </Badge>
                    <Badge variant="outline">
                      {t(`adminWebinars.degree.${row.degree}`)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{row.bodyEn}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{row.titleZh} — {row.bodyZh}</p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(topicToEditValue(row))}
                    className="rounded-none"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(row)}
                    className="text-gray-400 hover:text-[#9B1B30] hover:bg-red-50 rounded-none"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TopicEditDialog
        open={editing !== null || creating}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setCreating(false);
          }
        }}
        sessionId={activeSessionId}
        initial={editing}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminWebinars.topicDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminWebinars.topicDeleteBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && handleDelete(pendingDelete)}
              className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============================================================================
// Tab 4: Waitlist (Phase 142)
// ============================================================================

interface WaitlistEntry {
  id: string;
  sessionId: string;
  email: string;
  firstName: string;
  whatsapp: string | null;
  sourcePage: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  notes: string | null;
  createdAt: string;
}

interface WaitlistResponse {
  entries: WaitlistEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function WaitlistTab() {
  const { t } = useI18n();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<WaitlistEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / 50));

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<WaitlistResponse>(
        `/api/admin/webinar-waitlist?page=${page}&limit=50`,
      );
      setEntries(res.entries || []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.waitlistErrorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [page, t]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const deleteEntry = async (entry: WaitlistEntry) => {
    setDeleting(true);
    try {
      await apiFetchJson(`/api/admin/webinar-waitlist/${entry.id}`, { method: 'DELETE' });
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setPendingDelete(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.waitlistErrorLoad'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#1B2A4A]">{t('adminWebinars.waitlistTitle')}</h2>
          <p className="text-sm text-gray-600">{t('adminWebinars.waitlistSubtitle')}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {total}
        </Badge>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" className="text-[#1B2A4A]" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
          {t('adminWebinars.waitlistEmptyAll')}
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <div
              key={e.id}
              className="bg-white border border-gray-200 p-4 hover:border-[#9B1B30]/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[#1B2A4A]">{e.firstName}</h3>
                    <a
                      href={`mailto:${e.email}`}
                      className="text-sm text-[#1B2A4A] hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {e.email}
                    </a>
                  </div>
                  {e.whatsapp && (
                    <a
                      href={`https://wa.me/${formatWhatsappNumber(e.whatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#1B2A4A] hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      <MessageCircle className="h-3 w-3" />
                      {e.whatsapp}
                    </a>
                  )}
                  {e.notes && (
                    <p className="mt-2 text-sm text-gray-700 bg-[#FAF6E8] border border-[#D4A853]/30 p-2 line-clamp-2">
                      {e.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(e.createdAt)}
                    {e.utmSource && (
                      <span className="ml-2 text-gray-500">
                        · {e.utmSource}
                        {e.utmCampaign ? `/${e.utmCampaign}` : ''}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(e)}
                    className="text-gray-400 hover:text-[#9B1B30] hover:bg-red-50 rounded-none"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {t('adminWebinars.pagination', {
              from: (page - 1) * 50 + 1,
              to: Math.min(page * 50, total),
              total,
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-[#1B2A4A] text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('adminWebinars.prev')}
            </button>
            <span className="text-xs text-gray-500 px-2">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 bg-white text-[#1B2A4A] text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t('adminWebinars.next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminWebinars.waitlistDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminWebinars.waitlistDeleteBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={() => pendingDelete && deleteEntry(pendingDelete)}
              className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
            >
              {deleting ? <Spinner size="xs" /> : t('adminWebinars.waitlistDeleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
