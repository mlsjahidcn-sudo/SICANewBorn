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
  Upload,
  UserCheck,
  UserX,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

type Tab = 'registrations' | 'waitlist' | 'attended' | 'sessions' | 'topics';

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
  webinarSessionId: string | null;
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
  /** Phase 161 */
  seatCap: number | null;
  registrationStatus: 'draft' | 'open' | 'full' | 'closed';
  timezoneLabel: string;
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
      if (raw === 'sessions' || raw === 'topics' || raw === 'waitlist' || raw === 'attended') {
        return raw;
      }
      return 'registrations';
    },
  });

  // Phase 161: webinar selector — one fetch at page level, the chosen
  // id scopes the Registrations / Waitlist / Attended tabs + stats.
  // Persisted in the URL (?webinar=<uuid>) so a reload keeps context.
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedWebinarId, setSelectedWebinarId] = useUrlState<string>('webinar', '', {
    coerce: (raw) => (raw && /^[0-9a-f-]{36}$/i.test(raw) ? raw : ''),
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<SessionsResponse>('/api/admin/webinar-sessions');
        if (!cancelled) setSessions(res.sessions || []);
      } catch {
        // Selector renders its empty state; tabs still work unscoped.
      } finally {
        if (!cancelled) setSessionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Default selection: the active webinar, else the first row.
  useEffect(() => {
    if (selectedWebinarId || sessionsLoading || sessions.length === 0) return;
    const active = sessions.find((s) => s.isActive) ?? sessions[0];
    if (active) setSelectedWebinarId(active.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, sessionsLoading]);

  const selectedSession = sessions.find((s) => s.id === selectedWebinarId) ?? null;
  const audienceTabs: Tab[] = ['registrations', 'waitlist', 'attended'];

  return (
    <div className="space-y-6">
      <Header />

      {/* Phase 161: webinar selector — drives the three audience tabs. */}
      {tab !== 'sessions' && tab !== 'topics' && (
        <Card>
          <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-[#1F2937] flex items-center gap-2 whitespace-nowrap">
              <Video className="h-4 w-4 text-[#1B2A4A]" />
              {t('adminWebinars.webinarSelector')}
            </label>
            <select
              value={selectedWebinarId}
              onChange={(e) => setSelectedWebinarId(e.target.value)}
              className="flex-1 w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            >
              {sessionsLoading && (
                <option value="">{t('adminWebinars.webinarSelectorLoading')}</option>
              )}
              {!sessionsLoading && sessions.length === 0 && (
                <option value="">{t('adminWebinars.webinarSelectorEmpty')}</option>
              )}
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.titleEn} {s.isActive ? `· ${t('adminWebinars.sessionActiveBadge')}` : ''}
                </option>
              ))}
            </select>
            {selectedSession && selectedSession.seatCap !== null && (
              <Badge variant="outline" className="whitespace-nowrap">
                {t('adminWebinars.seatCapBadge', { cap: selectedSession.seatCap })}
              </Badge>
            )}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap border-b border-gray-200">
        <TabButton current={tab} value="registrations" onClick={setTab}>
          {t('adminWebinars.tabRegistrations')}
        </TabButton>
        <TabButton current={tab} value="waitlist" onClick={setTab}>
          {t('adminWebinars.tabWaitlist')}
        </TabButton>
        <TabButton current={tab} value="attended" onClick={setTab}>
          {t('adminWebinars.tabAttended')}
        </TabButton>
        <TabButton current={tab} value="sessions" onClick={setTab}>
          {t('adminWebinars.tabSessions')}
        </TabButton>
        <TabButton current={tab} value="topics" onClick={setTab}>
          {t('adminWebinars.tabTopics')}
        </TabButton>
      </div>

      {tab === 'registrations' && (
        <ExportCsvButton view="registered" webinarId={selectedWebinarId} />
      )}
      {(tab === 'waitlist' || tab === 'attended') && (
        <ExportCsvButton view={tab} webinarId={selectedWebinarId} />
      )}

      {tab === 'registrations' && <RegistrationsTab webinarId={selectedWebinarId} />}
      {tab === 'waitlist' && <WaitlistTab webinarId={selectedWebinarId} />}
      {tab === 'attended' && (
        <AttendedTab webinarId={selectedWebinarId} onChanged={() => undefined} />
      )}
      {tab === 'sessions' && <SessionsTab />}
      {tab === 'topics' && <TopicsTab />}
    </div>
  );
}

/**
 * Phase 161: CSV export button for the audience tabs. Opens the
 * export endpoint (auth via cookie) in a new tab with the current
 * tab's view + selected webinar.
 */
function ExportCsvButton({ view, webinarId }: { view: 'registered' | 'waitlist' | 'attended'; webinarId: string }) {
  const { t } = useI18n();
  const url = webinarId
    ? `/api/admin/webinar-signups/export?view=${view}&webinarId=${encodeURIComponent(webinarId)}`
    : `/api/admin/webinar-signups/export?view=${view}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white text-[#1B2A4A] text-sm font-medium hover:bg-gray-50 rounded-none w-fit"
    >
      <FileText className="h-4 w-4" />
      {t('adminWebinars.exportCsv')}
    </a>
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
        <code className="ml-1 text-xs">/webinar/[slug]</code>
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

function RegistrationsTab({ webinarId }: { webinarId: string }) {
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
      if (webinarId) params.set('webinarId', webinarId);
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
  }, [statusFilter, searchQuery, page, webinarId, t]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchQuery, webinarId]);

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
          Polls every 30s, errors are best-effort. Phase 161: scoped
          to the selected webinar. */}
      <WebinarStatsCards webinarId={webinarId || null} />

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
// Tab 2 (Phase 161): Waitlist — webinar_waitlist rows for the selected
// webinar, FIFO order, per-row delete.
// ============================================================================

interface WaitlistEntry {
  id: string;
  sessionId: string;
  email: string;
  firstName: string;
  lastName: string;
  whatsapp: string | null;
  country: string | null;
  notes: string | null;
  sourcePage: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  createdAt: string;
}

function WaitlistTab({ webinarId }: { webinarId: string }) {
  const { t } = useI18n();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WaitlistEntry | null>(null);

  const load = useCallback(async () => {
    if (!webinarId) {
      setEntries([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ waitlist: WaitlistEntry[]; total: number }>(
        `/api/admin/webinar-waitlist?webinarId=${encodeURIComponent(webinarId)}`,
      );
      setEntries(res.waitlist || []);
      setTotal(res.total ?? 0);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [webinarId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (entry: WaitlistEntry) => {
    try {
      await apiFetchJson(`/api/admin/webinar-waitlist/${entry.id}`, { method: 'DELETE' });
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setPendingDelete(null);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorLoad'));
    }
  };

  if (!webinarId) {
    return (
      <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
        {t('adminWebinars.webinarSelectorEmpty')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          {t('adminWebinars.waitlistEmpty')}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600">{t('adminWebinars.waitlistCount', { count: total })}</p>
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div key={entry.id} className="bg-white border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 h-8 w-8 bg-[#D4A853]/20 text-[#1B2A4A] font-semibold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#1B2A4A]">
                        {entry.firstName} {entry.lastName}
                      </h3>
                      {entry.country && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {entry.country}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1 flex items-center gap-3 flex-wrap">
                      <a
                        href={`mailto:${entry.email}`}
                        className="flex items-center gap-1 text-[#1B2A4A] hover:underline"
                      >
                        <Mail className="h-3 w-3" />
                        {entry.email}
                      </a>
                      {entry.whatsapp && (
                        <a
                          href={`https://wa.me/${formatWhatsappNumber(entry.whatsapp)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#1B2A4A] hover:underline"
                        >
                          <MessageCircle className="h-3 w-3" />
                          {entry.whatsapp}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(entry.createdAt)}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(entry)}
                    className="text-gray-400 hover:text-[#9B1B30] hover:bg-red-50 rounded-none flex-shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminWebinars.waitlistDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.firstName} {pendingDelete?.lastName} · {pendingDelete?.email}
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
// Tab 3 (Phase 161): Attended — Attended + No-Show rows for the selected
// webinar, Meet CSV import (match by email → Attended), and the
// one-click "everyone still Registered is now No-Show" sweep.
// ============================================================================

function AttendedTab({ webinarId }: { webinarId: string; onChanged?: () => void }) {
  const { t } = useI18n();
  const [signups, setSignups] = useState<WebinarSignup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<{
    matched: number;
    updated: number;
    notFound: string[];
  } | null>(null);
  const [sweeping, setSweeping] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const offset = (page - 1) * PAGE_SIZE;

  const load = useCallback(async () => {
    if (!webinarId) {
      setSignups([]);
      setTotal(0);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({
        group: 'attended',
        page: String(page),
        limit: String(PAGE_SIZE),
        webinarId,
      });
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
  }, [webinarId, page, t]);

  useEffect(() => {
    load();
  }, [load]);

  // Mark everyone still Registered for this webinar as No-Show.
  const markRestMissed = async () => {
    setSweeping(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ flipped: number }>(
        '/api/admin/webinar-signups/mark-missed',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webinarId }),
        },
      );
      setImportResult({ matched: res.flipped, updated: res.flipped, notFound: [] });
      await load();
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorUpdateStatus'));
    } finally {
      setSweeping(false);
    }
  };

  const setStatus = async (signup: WebinarSignup, next: WebinarSignup['status']) => {
    try {
      await apiFetchJson(`/api/admin/webinar-signups/${signup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      setSignups((prev) => prev.map((s) => (s.id === signup.id ? { ...s, status: next } : s)));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminWebinars.errorUpdateStatus'));
    }
  };

  if (!webinarId) {
    return (
      <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
        {t('adminWebinars.webinarSelectorEmpty')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">
          {t('adminWebinars.attendedCount', { count: total })}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-none bg-white"
            onClick={() => {
              setImportResult(null);
              setImportOpen(true);
            }}
          >
            <Upload className="h-4 w-4 mr-1" />
            {t('adminWebinars.importMeet')}
          </Button>
          <Button
            variant="outline"
            className="rounded-none bg-white"
            onClick={markRestMissed}
            disabled={sweeping}
          >
            {sweeping ? <Spinner size="xs" /> : <UserX className="h-4 w-4 mr-1" />}
            {t('adminWebinars.markRestMissed')}
          </Button>
        </div>
      </div>

      {importResult && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm">
          {importResult.notFound.length === 0
            ? t('adminWebinars.importResult', {
                matched: importResult.matched,
                updated: importResult.updated,
              })
            : `${t('adminWebinars.importResult', {
                matched: importResult.matched,
                updated: importResult.updated,
              })} · ${t('adminWebinars.importNotFound', {
                count: importResult.notFound.length,
              })}: ${importResult.notFound.slice(0, 5).join(', ')}${
                importResult.notFound.length > 5 ? '…' : ''
              }`}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="md" className="text-[#1B2A4A]" />
        </div>
      ) : signups.length === 0 ? (
        <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
          {t('adminWebinars.attendedEmpty')}
        </div>
      ) : (
        <div className="space-y-3">
          {signups.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-[#1B2A4A]">
                      {s.firstName} {s.lastName}
                    </h3>
                    <Badge className={STATUS_COLOR[s.status]}>{s.status}</Badge>
                  </div>
                  <a
                    href={`mailto:${s.email}`}
                    className="text-sm text-[#1B2A4A] hover:underline mt-1 inline-flex items-center gap-1"
                  >
                    <Mail className="h-3 w-3" />
                    {s.email}
                  </a>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none bg-white"
                    disabled={s.status === 'Attended'}
                    onClick={() => setStatus(s, 'Attended')}
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    {t('adminWebinars.status_Attended')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-none bg-white"
                    disabled={s.status === 'No-Show'}
                    onClick={() => setStatus(s, 'No-Show')}
                  >
                    <UserX className="h-3 w-3 mr-1" />
                    {t('adminWebinars.status_NoShow')}
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

      <MeetImportDialog
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) {
            setImportResult(null);
            void load();
          }
        }}
        webinarId={webinarId}
        onImported={(result) => setImportResult(result)}
      />
    </div>
  );
}

/**
 * Phase 161: Meet attendee CSV import. The file is parsed in the
 * browser (Meet exports are small; no multipart endpoint needed) —
 * any column whose header contains "email" is used; the deduped
 * email list is POSTed to /api/admin/webinar-signups/import-attended
 * which does the case-insensitive matching + status flips.
 */
function MeetImportDialog({
  open,
  onOpenChange,
  webinarId,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webinarId: string;
  onImported: (result: { matched: number; updated: number; notFound: string[] }) => void;
}) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      const emails = extractEmailsFromCsv(text);
      if (emails.length === 0) {
        setError(t('adminWebinars.importNoEmails'));
        return;
      }
      const res = await apiFetchJson<{ matched: number; updated: number; notFound: string[] }>(
        '/api/admin/webinar-signups/import-attended',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webinarId, emails }),
        },
      );
      onImported(res);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('adminWebinars.importFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none">
        <DialogHeader>
          <DialogTitle>{t('adminWebinars.importMeetTitle')}</DialogTitle>
          <DialogDescription>{t('adminWebinars.importMeetBody')}</DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <input
          type="file"
          accept=".csv,text/csv"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
          className="block w-full text-sm text-gray-600 border border-gray-300 px-3 py-2 bg-white file:mr-3 file:py-1.5 file:px-3 file:border-0 file:bg-[#1B2A4A] file:text-white file:text-xs file:font-semibold file:cursor-pointer rounded-none"
        />
        {busy && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Spinner size="xs" /> {t('adminWebinars.importWorking')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Pull every plausible email out of a CSV: any cell matching the
 *  email shape ( Meet exports use an "Email" / "Attendee email"
 *  column but header names drift; scanning cells is robust). */
function extractEmailsFromCsv(text: string): string[] {
  const emailRe = /[^\s@,;"']+@[^\s@,;"']+\.[^\s@,;"']+/g;
  const found = text.match(emailRe) ?? [];
  return Array.from(new Set(found.map((e) => e.toLowerCase())));
}

// ============================================================================
// Tab 4: Sessions (Phase 140 CRUD)
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
  seatCap: s.seatCap,
  registrationStatus: s.registrationStatus,
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
          seatCap: next.seatCap,
          registrationStatus: next.registrationStatus,
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
        timezoneLabel: 'Asia/Shanghai',
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
                    {/* Phase 161: cap + registration lifecycle badges */}
                    {s.seatCap !== null && (
                      <Badge variant="outline">
                        {t('adminWebinars.seatCapBadge', { cap: s.seatCap })}
                      </Badge>
                    )}
                    {s.registrationStatus && s.registrationStatus !== 'open' && (
                      <Badge variant="outline">
                        {t(`adminWebinars.regStatus.${s.registrationStatus}`)}
                      </Badge>
                    )}
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
// Phase 157: Waitlist removed — registration is uncapped. The
// WaitlistTab block + /api/webinar-waitlist + /api/admin/webinar-waitlist
// routes + the webinar_waitlist table are all removed.
// ============================================================================