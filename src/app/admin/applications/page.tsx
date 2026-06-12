'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Eye, Trash2, MoreHorizontal, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, AlertCircle, Search, Users, Building2, UserPlus, CheckSquare, Square, X, StickyNote, Flag, Download, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { ListPageSkeleton } from '@/components/partner/skeletons';
import { useStudentList } from '@/hooks/use-student-list';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { APPLICATION_STATUSES, ApplicationStatus } from '@/lib/application-mapper';
import { parseIntakeFilter, getCanonicalCohorts } from '@/lib/intake-normalize';

interface Application {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  university: string;
  program: string;
  degree: string;
  intake: string;
  status: string;
  // S28: 'Partner CRM' is the partner_applications table;
  // 'Partner' is a student_applications row whose student's
  // source='Partner'. They share the same "Partner" tab in
  // the UI but link to different detail pages.
  source: 'Online' | 'Admin' | 'Partner' | 'Partner CRM';
  surface: 'student' | 'partner';
  applicationNumber?: string;
  // Phase 33: partner-CRM-only fields, populated for surface='partner'
  // rows and null for surface='student' rows. The unified table shows
  // these columns only when `surface === 'partner'` (driven by
  // `?surface=partner` on the URL), so the Student tab doesn't have to
  // render a wall of '—' for the partner-only columns.
  partnerPriority?: string | null;
  partnerDecision?: string | null;
  partnerOrgId?: string | null;
  partnerOrgName?: string | null;
  createdAt: string;
  notes?: string;
}

const PAGE_SIZE = 20;

/**
 * Single source of truth for how each application status is rendered:
 *   - key   = exact DB value (must match APPLICATION_STATUSES)
 *   - label = human-readable text (used in the filter dropdown + badge)
 *   - color = tailwind classes for the badge
 */
const STATUS_DISPLAY: Record<ApplicationStatus, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  Submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  'Under Review': { label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
  'Documents Requested': { label: 'Documents Needed', color: 'bg-purple-100 text-purple-800' },
  'Decision Made': { label: 'Decision Made', color: 'bg-orange-100 text-orange-800' },
  Accepted: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  Rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  Withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
};

const sourceColors: Record<string, string> = {
  'Online': 'bg-blue-100 text-blue-700',
  'Admin': 'bg-[#9B1B30] text-white',
  'Partner': 'bg-purple-100 text-purple-700',
  // S28: partner_applications rows. Visually distinct from the
  // purple 'Partner' (student source=Partner) so the admin can
  // tell at a glance which surface the row came from.
  'Partner CRM': 'bg-orange-100 text-orange-800',
};

/**
 * Tab definitions. Each tab maps to one of three sources (or "all" for
 * the unfiltered view). The page makes the same /api/admin/applications
 * call regardless of tab; only the `source` query param differs. This
 * keeps the API surface unchanged and the tab navigation near-instant
 * (just a refetch with a new filter).
 */
type SourceTab = 'all' | 'Online' | 'Partner' | 'Admin';
// S28: the Partner tab now covers BOTH surfaces — student
// applications with source='Partner' AND partner_applications
// rows (the partner's own pipeline). The breakdown shows in the
// helper text so the admin can see how many of each.
const SOURCE_TABS: { value: SourceTab; label: string; shortLabel: string; icon: React.ElementType; helper?: (counts: { partner: number; partnerCrm: number } | null) => string }[] = [
  { value: 'all',     label: 'All Applications', shortLabel: 'All',     icon: Users },
  { value: 'Online',  label: 'Student (Online)', shortLabel: 'Student', icon: Users },
  {
    value: 'Partner',
    label: 'Partner',
    shortLabel: 'Partner',
    icon: Building2,
    helper: (c) => c ? `${c.partnerCrm} CRM + ${c.partner - c.partnerCrm} student` : '',
  },
  { value: 'Admin',   label: 'Admin (Offline)',  shortLabel: 'Offline', icon: UserPlus },
];

export default function AdminApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { students } = useStudentList();

  // S34: cohort filter, sourced from the URL on mount. The
  // cohort dashboard's "View applications" link is
  //   /admin/applications?intake=2026-fall
  // and we read it here so the list opens with the cohort
  // pre-applied. The user can clear it via the active-pill
  // X button.
  const initialIntakeSlug = searchParams.get('intake');
  const initialIntake = parseIntakeFilter(initialIntakeSlug);
  // Canonical-cohort slugs + a few obvious historical
  // variants are valid; the "no-intake" bucket maps to "none".
  // Anything unparseable is treated as no filter.
  const [intakeFilter, setIntakeFilter] = useState<string | null>(
    initialIntake
      ? initialIntake.kind === 'none'
        ? 'none'
        : initialIntake.slug
      : null,
  );
  const intakeFilterLabel = (() => {
    if (!intakeFilter) return null;
    if (intakeFilter === 'none') return 'Unassigned';
    // Find the canonical cohort label that matches this slug,
    // or fall back to the raw slug uppercased.
    const c = getCanonicalCohorts().find((x) => x.slug === intakeFilter);
    if (c) return c.cohort;
    return intakeFilter;
  })();

  // Tab state — defaults to "all" so the user sees everything on first load.
  //
  // Phase 33: when the page loads with `?surface=partner`, the unified
  // list enters partner-only mode — the source tabs hide, the table
  // grows partner-specific columns (Priority / Decision / Partner org
  // / Application #), and the page title says "Partner Pipeline"
  // instead of "Applications". The Partner Pipeline sidebar link
  // now redirects here with `?surface=partner`, so deep-linking is
  // the only entry point — there's no longer a separate /admin/
  // partner-applications page to navigate from.
  const initialSurface = searchParams.get('surface');
  const [partnerOnly, setPartnerOnly] = useState<boolean>(initialSurface === 'partner');
  // Source tab: forced to 'Partner' in partnerOnly mode (the
  // API ignores source=Partner when surface=partner, but keeping
  // the state consistent makes the tab badge logic still work).
  const [activeTab, setActiveTab] = useState<SourceTab>(
    initialSurface === 'partner' ? 'Partner' : 'all',
  );

  // Retry counter — bumping it forces the main fetch useEffect to re-run
  // even if all other deps are unchanged. Used by the "Try again" button.
  const [retryNonce, setRetryNonce] = useState(0);

  // List state
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');

  // Tab badge counts
  // Phase 32: extended to also carry per-status + per-priority
  // breakdowns (from /api/admin/applications/counts) so the
  // stat cards below the header can render without a second
  // roundtrip. The shape is backward-compatible — old callers
  // reading `total` / `online` etc. still work.
  const [counts, setCounts] = useState<{
    total: number;
    online: number;
    partner: number;
    partnerCrm: number;
    offline: number;
    submitted: number;
    inReview: number;
    urgent: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    perStatusCapped: boolean;
  } | null>(null);
  const [countsError, setCountsError] = useState<string | null>(null);

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);

  // S31: bulk-selection state. The set is keyed by app id. We
  // clear it whenever the visible list changes (tab/filter/page
  // change) so a stale id from a previous page never sneaks
  // into a bulk action. Bulk actions live in a separate sticky
  // action bar that appears at the bottom of the page when 1+
  // rows are selected.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResultDialog, setBulkResultDialog] = useState<{
    open: boolean;
    action: string;
    updated: number;
    failed: Array<{ id: string; error: string }>;
  }>({ open: false, action: '', updated: 0, failed: [] });
  const [bulkNoteDialogOpen, setBulkNoteDialogOpen] = useState(false);
  const [bulkNoteText, setBulkNoteText] = useState('');
  const [bulkPriorityDialogOpen, setBulkPriorityDialogOpen] = useState(false);
  const [bulkPriority, setBulkPriority] = useState<string>('Normal');
  // S31: bulk status picker state. Default to the first selected
  // row's current status so a cohort of "Submitted" apps can be
  // moved to "Under Review" in one click.
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('Under Review');
  // Phase 32: when the result dialog has failures, the admin
  // can sort the failure list by "Errors" vs "All IDs" via a
  // small inline toggle. The dialog already only renders the
  // failed list (successes are summarized as a count), but the
  // toggle can flip between "one row per failed id" and
  // "grouped by error message" for easier scanning when many
  // rows fail with the same reason. Default 'list'.
  const [bulkResultView, setBulkResultView] = useState<'list' | 'grouped'>('list');

  // -----------------------------------------------------------------
  // Fetch the per-source counts ONCE on mount so the tab badges can
  // show numbers. Independent of the main list fetch so a slow list
  // doesn't block the badges (or vice versa).
  // -----------------------------------------------------------------
  const fetchCounts = useCallback(async () => {
    try {
      const data = await apiFetchJson<{
        total: number;
        online: number;
        partner: number;
        partnerCrm: number;
        offline: number;
        submitted: number;
        inReview: number;
        urgent: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        perStatusCapped: boolean;
      }>('/api/admin/applications/counts');
      setCounts(data);
      setCountsError(null);
    } catch (err) {
      // Counts are non-critical — show a small warning, keep the page usable
      setCountsError(err instanceof Error ? err.message : 'Failed to load counts');
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // -----------------------------------------------------------------
  // Main list fetch. Re-runs on tab change, page change, or any filter
  // change. Source is taken from activeTab (not a dropdown filter).
  // -----------------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    // Phase 33: in partnerOnly mode, surface=partner is sent so
    // the API returns only partner_applications rows (no
    // student_applications join work). This both speeds the
    // query and guarantees the partner-only columns render
    // correctly. The Partner tab badge stays accurate because
    // the counts endpoint also respects surface filtering
    // server-side.
    if (partnerOnly) {
      params.set('surface', 'partner');
    } else if (activeTab !== 'all') {
      params.set('source', activeTab);
    }
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (studentFilter !== 'all') params.set('student', studentFilter);
    if (intakeFilter) params.set('intake', intakeFilter);

    // Safety timeout — never let the page hang on a stalled network call.
    timeoutId = setTimeout(() => controller.abort(), 15_000);

    (async () => {
      try {
        const data = await apiFetchJson<{ applications: Application[]; total: number; page: number; totalPages: number }>(
          `/api/admin/applications?${params.toString()}`,
          { signal: controller.signal },
        );
        if (!cancelled) {
          setApplications(data.applications);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load applications';
          setError(message);
          setApplications([]);
          setTotal(0);
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [page, searchQuery, statusFilter, studentFilter, activeTab, intakeFilter, partnerOnly, retryNonce]);

  // Debounce search — wait 300ms after the user stops typing before firing
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when tab or filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, statusFilter, studentFilter, searchQuery, intakeFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const confirmDelete = async () => {
    if (!applicationToDelete) return;
    setIsDeleting(true);
    try {
      // S28: partner CRM rows live in a separate table and are
      // deleted via the partner admin endpoint, not the student-app
      // endpoint. Pick the right route based on surface.
      const deleteHref =
        applicationToDelete.surface === 'partner'
          ? `/api/admin/partner-applications/${applicationToDelete.id}`
          : `/api/admin/applications/${applicationToDelete.id}`;
      await apiFetch(deleteHref, { method: 'DELETE' });
      setApplications((prev) => prev.filter((a) => a.id !== applicationToDelete.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
      // Refresh counts since one just got removed
      fetchCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel application');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = (application: Application) => {
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  // S31: bulk action handlers. Each handler:
  //   1. Sets a busy flag
  //   2. POSTs the selection to /api/admin/applications/bulk
  //   3. On success, clears the selection, refetches the list +
  //      counts, and shows a result dialog
  //   4. On per-row failure, surfaces the failure list in the
  //      result dialog so the admin can retry the bad ones.
  // Implemented after `filteredApplications` is declared below
  // so they can read it without a forward reference.
  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Clear selection when the active tab or filter changes — a
  // row id from one tab might not be in the current page set,
  // and bulk-acting on it would surprise the admin.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab, statusFilter, studentFilter, searchQuery, intakeFilter]);

  // Client-side safety filter: even after the API call, double-check the
  // active source matches the row. Cheap and makes tab switching feel
  // instant if the user navigates before the refetch lands.
  //
  // S28: the "Partner" tab covers BOTH source='Partner' and
  // source='Partner CRM' (the partner_applications rows). They're
  // unified in the UI but link to different detail pages.
  const filteredApplications = applications.filter((app) => {
    const matchesSource =
      activeTab === 'all' ||
      app.source === activeTab ||
      (activeTab === 'Partner' && app.source === 'Partner CRM');
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesStudent =
      studentFilter === 'all' ||
      // Partner CRM rows have no student_id — they don't match a
      // student filter.
      (app.studentId !== null && app.studentId === studentFilter);
    const matchesSearch =
      !searchQuery ||
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.university.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesStatus && matchesStudent && matchesSearch;
  });

  // S31: bulk action handlers (continued). Now that
  // `filteredApplications` is in scope, we can implement the
  // select-all-visible toggle and the bulk runner.
  const toggleSelectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const visibleIds = filteredApplications.map((a) => a.id);
      const allSelected = visibleIds.length > 0 && visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [filteredApplications]);

  const runBulk = useCallback(
    async (action: 'status' | 'priority' | 'note' | 'delete', value?: string) => {
      if (selectedIds.size === 0) return;
      setBulkRunning(true);
      try {
        const res = await apiFetchJson<{ updated: number; failed: Array<{ id: string; error: string }> }>(
          '/api/admin/applications/bulk',
          {
            method: 'POST',
            body: JSON.stringify({ ids: Array.from(selectedIds), action, value }),
          },
        );
        setBulkResultDialog({ open: true, action, updated: res.updated, failed: res.failed || [] });
        // Clear the selection whether the action fully succeeded
        // or partially failed — the next page load is the source
        // of truth, and a stale id could re-target a row that
        // was deleted by this very call.
        setSelectedIds(new Set());
        // Refetch list + counts so the table reflects the change
        setRetryNonce((n) => n + 1);
        fetchCounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bulk action failed');
      } finally {
        setBulkRunning(false);
      }
    },
    [selectedIds, fetchCounts],
  );

  // Count for the active tab — prefer the badge count from /counts,
  // fall back to `total` from the list (which the API already filtered).
  const getActiveCount = (): number => {
    if (!counts) return total;
    switch (activeTab) {
      case 'Online':  return counts.online;
      case 'Partner': return counts.partner; // includes partnerCrm
      case 'Admin':   return counts.offline;
      default:        return counts.total;
    }
  };

  // Empty-state on first load (no data fetched yet) — show skeleton
  if (isLoading && applications.length === 0 && !error) {
    return <ListPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {/* Phase 33: in partnerOnly mode the page title flips to
              "Partner Pipeline" + subtitle surfaces that the
              table is partner-CRM only. The "All Applications"
              link is one click to escape the partner view. */}
          <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
            {partnerOnly && <Building2 className="h-6 w-6" />}
            {partnerOnly ? 'Partner Pipeline' : 'Applications'}
          </h1>
          <p className="text-[#4B5563] mt-1">
            {partnerOnly
              ? 'Applications created by partner agencies. Only admins can change status / decision.'
              : 'Manage all student applications by source'}
            {partnerOnly && (
              <>
                {' · '}
                <Link
                  href="/admin/applications"
                  className="text-[#1B2A4A] hover:underline"
                >
                  ← All Applications
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* S33: Export to CSV. Respects the current filter set
              (status, source, search, tab) so the export matches
              what the admin sees on screen. Capped at 1000 rows
              server-side; the response headers include the
              actual count. Phase 33: in partnerOnly mode the
              export also passes surface=partner. */}
          <Button
            variant="outline"
            className="rounded-none"
            onClick={() => {
              // Build a query string that mirrors the list
              // endpoint's filter semantics so the export is
              // scoped to what the admin sees.
              const params = new URLSearchParams();
              if (partnerOnly) {
                params.set('surface', 'partner');
              } else if (activeTab !== 'all') {
                params.set('source', activeTab);
              }
              if (statusFilter !== 'all') params.set('status', statusFilter);
              if (searchQuery.trim()) params.set('search', searchQuery.trim());
              if (intakeFilter) params.set('intake', intakeFilter);
              window.open(`/api/admin/applications/export?${params.toString()}`, '_blank');
            }}
            title="Download the currently visible (filtered) rows as a CSV"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
            onClick={() => router.push('/admin/applications/new')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Source tabs — hidden in partnerOnly mode (the page is
          single-purpose when deep-linked from the (now-removed)
          Partner Pipeline sidebar item). Showing tabs would
          confuse: clicking "Student" would just be a way back to
          the unified view, which the "All Applications" link in
          the header already does. */}
      {!partnerOnly && (
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Application source tabs">
          {SOURCE_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const Icon = tab.icon;
            const count =
              counts
                ? (tab.value === 'all' ? counts.total
                  : tab.value === 'Online' ? counts.online
                  // S28: the Partner tab badge now shows the
                  // combined count of student_source=Partner +
                  // partner_applications rows. The breakdown
                  // is shown in the tab label itself.
                  : tab.value === 'Partner'
                    ? counts.partner
                    : counts.offline)
                : null;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                title={tab.helper?.(counts) || tab.label}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#9B1B30] text-[#9B1B30]'
                    : 'border-transparent text-[#4B5563] hover:text-[#1B2A4A] hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.shortLabel}</span>
                {count !== null && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 text-xs font-semibold ${
                      isActive
                        ? 'bg-[#9B1B30] text-white'
                        : 'bg-gray-100 text-[#4B5563]'
                    }`}
                  >
                     {count}
                   </span>
                 )}
               </button>
             );
           })}
         </nav>
       </div>
      )}

      {/* Counts error (non-fatal — tabs still work, just no badges) */}
      {countsError && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
          Could not load tab counts: {countsError}. Tab navigation still works.
        </div>
      )}

      {/* Phase 32: at-a-glance stat cards. Mirrors the partner
          page's 4-card row so a busy admin can scan the pipeline
          without clicking into a tab. Per-status totals come from
          the same /api/admin/applications/counts endpoint the
          tab badges use, so we never re-fetch. When the pipeline
          exceeds 5000 rows on either surface, the per-status
          counts become a lower bound (the API caps the
          status/priority join at 5000) — we surface a tiny
          "5000+?" hint on the relevant cards. */}
      {counts && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] font-normal">
                Total in {SOURCE_TABS.find((t) => t.value === activeTab)?.shortLabel}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1B2A4A]">{getActiveCount()}</div>
              <p className="text-xs text-gray-500 mt-0.5">All statuses, all time</p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] font-normal">
                Awaiting Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {counts.submitted ?? 0}
                {counts.perStatusCapped && counts.submitted >= 5000 && (
                  <span className="text-xs text-amber-600 ml-1">5000+?</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Status = Submitted (both taxonomies)</p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] font-normal">
                In Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {counts.inReview ?? 0}
                {counts.perStatusCapped && counts.inReview >= 5000 && (
                  <span className="text-xs text-amber-600 ml-1">5000+?</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Under Review (student) + In Review (partner)
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider text-[#4B5563] font-normal">
                Urgent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#9B1B30]">
                {counts.urgent ?? 0}
                {counts.perStatusCapped && counts.urgent >= 5000 && (
                  <span className="text-xs text-amber-600 ml-1">5000+?</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Priority = Urgent or High</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* S34: active cohort filter pill. Set when the admin
          lands here from /admin/cohorts with ?intake=...; also
          visible if they re-applied the filter via the API. The
          X clears the pill AND removes the URL param so a
          refresh doesn't re-apply the cohort. */}
      {intakeFilter && (
        <div className="flex items-center gap-2 bg-[#9B1B30]/5 border border-[#9B1B30]/20 px-3 py-2">
          <CalendarClock className="w-4 h-4 text-[#9B1B30]" />
          <span className="text-sm text-[#1B2A4A]">
            Filtered by cohort: <strong>{intakeFilterLabel}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto rounded-none h-7 px-2 text-xs text-[#9B1B30] hover:bg-[#9B1B30]/10"
            onClick={() => {
              setIntakeFilter(null);
              // Strip the ?intake= from the URL too, so a refresh
              // doesn't re-apply the cohort. replaceState avoids
              // filling the browser back-stack.
              const url = new URL(window.location.href);
              url.searchParams.delete('intake');
              window.history.replaceState({}, '', url.toString());
            }}
          >
            <X size={14} className="mr-1" /> Clear cohort
          </Button>
          <Link
            href="/admin/cohorts"
            className="text-xs text-[#1B2A4A] hover:underline"
            title="Back to cohort overview"
          >
            ← Cohort overview
          </Link>
        </div>
      )}

      {/* Error state (fatal — the list itself failed) */}
      {error && !isLoading && applications.length === 0 && (
        <div className="border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-red-900 mb-1">Failed to load applications</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
            onClick={() => {
              setError(null);
              setRetryNonce((n) => n + 1);
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
        </div>
      )}

      {/* Filters + table (only when we have something to show or are loading) */}
      {!error || applications.length > 0 ? (
        <Card className="rounded-none border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by student name, email, or university..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="rounded-none pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger className="w-[180px] rounded-none">
                    <SelectValue placeholder="All Students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] rounded-none">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_DISPLAY[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F3F4F6] border-b border-gray-200">
                    {/* S31: select-all checkbox for the visible page.
                        Indeterminate state (—) when some-but-not-all
                        visible rows are selected. */}
                    <th className="text-left px-4 py-3 w-10">
                      <Checkbox
                        checked={
                          filteredApplications.length > 0 &&
                          filteredApplications.every((a) => selectedIds.has(a.id))
                            ? true
                            : filteredApplications.some((a) => selectedIds.has(a.id))
                            ? 'indeterminate'
                            : false
                        }
                        onChange={toggleSelectAllVisible}
                        aria-label="Select all visible"
                      />
                    </th>
                    <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Student</th>
                    {/* Phase 33: in partnerOnly mode the Source
                        column is dropped (every row is "Partner
                        CRM" by definition) and four partner-
                        specific columns are added: Partner org
                        (company name), Priority (Urgent/High/
                        Normal/Low), Decision (Accepted/Pending/
                        Rejected), and Application #. The unified
                        list previously surfaced none of these;
                        they lived only on the now-removed
                        standalone Partner Pipeline page. */}
                    {partnerOnly ? (
                      <>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Partner</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">University & Program</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Priority</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Decision</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">App #</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Status</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Created</th>
                        <th className="text-right px-6 py-3 font-semibold text-[#1B2A4A]">Actions</th>
                      </>
                    ) : (
                      <>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">University & Program</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Status</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Source</th>
                        <th className="text-left px-6 py-3 font-semibold text-[#1B2A4A]">Created</th>
                        <th className="text-right px-6 py-3 font-semibold text-[#1B2A4A]">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {isLoading && applications.length === 0 ? (
                    <tr>
                      <td colSpan={partnerOnly ? 9 : 6} className="px-6 py-12 text-center">
                        <Spinner size="md" className="text-[#1B2A4A] mx-auto" />
                      </td>
                    </tr>
                  ) : filteredApplications.length === 0 ? (
                    <tr>
                      <td colSpan={partnerOnly ? 9 : 6} className="px-6 py-12 text-center text-[#4B5563]">
                        {applications.length === 0 ? (
                          <>
                            <p>
                              No applications yet in{' '}
                              {SOURCE_TABS.find((t) => t.value === activeTab)?.label.toLowerCase() ??
                                'this view'}
                              {intakeFilter ? ` for cohort ${intakeFilterLabel}` : ''}.
                            </p>
                            <p className="text-xs mt-1">
                              {activeTab === 'all'
                                ? 'Get started by clicking "Add Application" above.'
                                : `Try the "All" tab to see applications from other sources.`}
                            </p>
                          </>
                        ) : (
                          // Phase 32: filtered-empty state. Show a
                          // one-click "Reset filters" CTA so the
                          // admin doesn't have to clear each
                          // dropdown individually after a too-narrow
                          // search. The button stays disabled when
                          // no filter is active (the helper text
                          // changes to explain that).
                          <>
                            <p>No applications match your current filters.</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 rounded-none"
                              disabled={
                                !searchInput &&
                                statusFilter === 'all' &&
                                studentFilter === 'all' &&
                                !intakeFilter
                              }
                              onClick={() => {
                                setSearchInput('');
                                setSearchQuery('');
                                setStatusFilter('all');
                                setStudentFilter('all');
                                setIntakeFilter(null);
                                // Strip the ?intake= from the URL too
                                if (typeof window !== 'undefined') {
                                  const url = new URL(window.location.href);
                                  url.searchParams.delete('intake');
                                  window.history.replaceState({}, '', url.toString());
                                }
                              }}
                            >
                              <X size={14} className="mr-1" /> Reset filters
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredApplications.map((application) => {
                      // S28: pick the right detail URL based on the
                      // surface. Partner CRM rows go to the partner
                      // admin page (where status controls live);
                      // student application rows go to the existing
                      // student-app detail page.
                      const detailsHref =
                        application.surface === 'partner'
                          ? `/admin/partner-applications/${application.id}`
                          : `/admin/applications/${application.id}`;
                      const isSelected = selectedIds.has(application.id);
                      return (
                        <tr
                          key={application.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                            isSelected ? 'bg-[#9B1B30]/5' : ''
                          }`}
                        >
                          {/* S31: per-row checkbox */}
                          <td className="px-4 py-4 w-10" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => toggleSelected(application.id)}
                              aria-label={`Select ${application.studentName || 'application'}`}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-[#1F2937]">
                                {application.studentName?.trim() ||
                                  (application.studentEmail ? application.studentEmail.split('@')[0] : '—')}
                              </div>
                              <div className="text-xs text-[#4B5563]">{application.studentEmail}</div>
                            </div>
                          </td>
                          {partnerOnly ? (
                            <>
                              {/* Phase 33: partner-only table body */}
                              <td className="px-6 py-4 text-[#4B5563]">
                                {application.partnerOrgName || '—'}
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-[#1F2937]">{application.university}</div>
                                  <div className="text-xs text-[#4B5563]">{application.program} • {application.degree}</div>
                                  <div className="text-xs text-[#6B7280] mt-1">{application.intake}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {application.partnerPriority ? (
                                  <span
                                    className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-none ${
                                      application.partnerPriority === 'Urgent'
                                        ? 'bg-[#9B1B30] text-white'
                                        : application.partnerPriority === 'High'
                                        ? 'bg-orange-100 text-orange-800'
                                        : application.partnerPriority === 'Low'
                                        ? 'bg-gray-100 text-gray-700'
                                        : 'bg-blue-50 text-blue-700'
                                    }`}
                                  >
                                    {application.partnerPriority}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">Normal</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-[#4B5563]">
                                {application.partnerDecision || '—'}
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-gray-600">
                                {application.applicationNumber || '—'}
                              </td>
                            </>
                          ) : (
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-[#1F2937]">{application.university}</div>
                                <div className="text-xs text-[#4B5563]">{application.program} • {application.degree}</div>
                                <div className="text-xs text-[#6B7280] mt-1">{application.intake}</div>
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <Badge
                              className={`${
                                STATUS_DISPLAY[application.status as ApplicationStatus]?.color ??
                                'bg-gray-100 text-gray-800'
                              } rounded-none border`}
                            >
                              {STATUS_DISPLAY[application.status as ApplicationStatus]?.label ??
                                application.status}
                            </Badge>
                          </td>
                          {!partnerOnly && (
                            <td className="px-6 py-4">
                              <Badge className={`${sourceColors[application.source]} rounded-none`}>
                                {application.source === 'Admin' ? 'Offline' : application.source}
                              </Badge>
                            </td>
                          )}
                          <td className="px-6 py-4 text-[#4B5563]">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={detailsHref}>
                                <Button variant="ghost" size="sm" className="rounded-none text-[#1B2A4A]">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="rounded-none text-[#1B2A4A]">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-none">
                                  {/* S28: partner CRM rows have no
                                      studentId, so the "View Student"
                                      shortcut is hidden for them. */}
                                  {application.surface === 'student' && application.studentId && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/admin/students/${application.studentId}`}>
                                        View Student
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem asChild>
                                    <Link href={detailsHref}>
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDelete(application)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#4B5563]">
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} of {total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application from {applicationToDelete?.studentName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className="rounded-none"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-none bg-red-600 hover:bg-red-700"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <><Spinner size="sm" className="text-white mr-2" /> Deleting…</> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* S31: sticky bulk action bar. Appears at the bottom of the
          viewport when 1+ rows are selected. Each action either
          fires immediately (delete) or opens a small confirm
          dialog (status / priority / note). The result dialog
          shows updated/failed counts so the admin knows what
          landed. */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#9B1B30] shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-[#1B2A4A]">
                {selectedIds.size} selected
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none text-gray-500 hover:text-[#1B2A4A]"
                onClick={() => setSelectedIds(new Set())}
                disabled={bulkRunning}
              >
                <X size={14} className="mr-1" /> Clear
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => {
                  // Pre-fill the picker with the first selected
                  // row's current status so the admin can edit
                  // without having to re-type.
                  const firstId = Array.from(selectedIds)[0];
                  const firstApp = applications.find((a) => a.id === firstId);
                  setBulkStatus(firstApp?.status || 'Under Review');
                  setBulkStatusDialogOpen(true);
                }}
                disabled={bulkRunning}
                title="Change status"
              >
                <RefreshCw size={14} className="mr-1.5" /> Change status
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => setBulkPriorityDialogOpen(true)}
                disabled={bulkRunning}
              >
                <Flag size={14} className="mr-1.5" /> Set priority
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => setBulkNoteDialogOpen(true)}
                disabled={bulkRunning}
              >
                <StickyNote size={14} className="mr-1.5" /> Add note
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-none text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm(`Delete ${selectedIds.size} application(s)? This cannot be undone.`)) {
                    runBulk('delete');
                  }
                }}
                disabled={bulkRunning}
              >
                <Trash2 size={14} className="mr-1.5" /> Delete
              </Button>
              {/* S33: Export selected. Opens the export endpoint
                  with the current selection as ?ids=... The
                  response is a CSV file download — we use
                  window.open in a new tab so the admin's current
                  filter / list state stays intact. */}
              <Button
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => {
                  const idsParam = Array.from(selectedIds).join(',');
                  const params = new URLSearchParams({ ids: idsParam });
                  if (intakeFilter) params.set('intake', intakeFilter);
                  window.open(
                    `/api/admin/applications/export?${params.toString()}`,
                    '_blank',
                  );
                  // Clear the selection — the export is fire-and-
                  // forget; the next page load is the source of
                  // truth and a stale id could re-target a row
                  // the admin thought was already exported.
                  setSelectedIds(new Set());
                }}
                disabled={bulkRunning}
                title={`Download ${selectedIds.size} selected row(s) as a CSV`}
              >
                <Download size={14} className="mr-1.5" /> Export selected
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* S31: bulk result dialog. Shows updated count + any per-row
          failures. For the status action the admin picked a target
          status in the picker dialog; for delete/note/priority the
          action was either obvious (delete) or applied directly. */}
      <Dialog open={bulkResultDialog.open} onOpenChange={(o) => setBulkResultDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">Bulk action complete</DialogTitle>
            <DialogDescription>
              {bulkResultDialog.action === 'status' && 'Status updated on the selected applications.'}
              {bulkResultDialog.action === 'priority' && 'Priority updated on the selected applications.'}
              {bulkResultDialog.action === 'note' && 'Note appended to the selected applications.'}
              {bulkResultDialog.action === 'delete' && 'Selected applications deleted.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckSquare size={16} className="text-green-600" />
              <span>
                <strong>{bulkResultDialog.updated}</strong> updated
              </span>
            </div>
            {bulkResultDialog.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <div className="text-sm font-semibold text-red-800 flex items-center gap-2">
                    <AlertCircle size={14} /> {bulkResultDialog.failed.length} failed
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Phase 32: toggle between "list" (one row per
                        failed id, default) and "grouped" (errors
                        bucketed by message + count). The grouped
                        view is the right call when 20+ rows fail
                        with the same reason (e.g. cross-taxonomy
                        status move); the list view is the right
                        call when every row fails for a different
                        reason. */}
                    <button
                      type="button"
                      onClick={() =>
                        setBulkResultView((v) => (v === 'list' ? 'grouped' : 'list'))
                      }
                      className="text-xs text-red-700 hover:text-red-900 underline"
                    >
                      Show as {bulkResultView === 'list' ? 'grouped' : 'list'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ids = bulkResultDialog.failed.map((f) => f.id).join('\n');
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(ids).catch(() => {
                            // best-effort
                          });
                        }
                      }}
                      className="text-xs text-red-700 hover:text-red-900 underline"
                      title="Copy all failed row IDs to clipboard"
                    >
                      Copy IDs
                    </button>
                  </div>
                </div>
                {bulkResultView === 'list' ? (
                  <ul className="space-y-1 text-xs text-red-700">
                    {bulkResultDialog.failed.map((f) => (
                      <li key={f.id} className="font-mono">
                        <span className="text-red-500">{f.id.slice(0, 8)}</span>: {f.error}
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Grouped view: bucket failures by error message
                  // and render each bucket with a count + the first
                  // 3 sample ids. Useful for cross-taxonomy
                  // bulk-status moves where every row may fail
                  // with the same "Partner-only status on student
                  // surface" reason.
                  <ul className="space-y-2 text-xs text-red-700">
                    {Object.entries(
                      bulkResultDialog.failed.reduce<Record<string, { ids: string[] }>>(
                        (acc, f) => {
                          if (!acc[f.error]) acc[f.error] = { ids: [] };
                          acc[f.error].ids.push(f.id);
                          return acc;
                        },
                        {},
                      ),
                    ).map(([err, bucket]) => (
                      <li key={err} className="border-l-2 border-red-300 pl-2">
                        <div className="font-medium text-red-800">
                          {bucket.ids.length}× {err}
                        </div>
                        <div className="text-[10px] text-red-600 font-mono mt-0.5 truncate">
                          {bucket.ids
                            .slice(0, 3)
                            .map((id) => id.slice(0, 8))
                            .join(', ')}
                          {bucket.ids.length > 3 && `, +${bucket.ids.length - 3} more`}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]"
              onClick={() => setBulkResultDialog((p) => ({ ...p, open: false }))}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* S31: bulk status picker. The admin picks a target
          status; the endpoint accepts both the 8-state student
          taxonomy and the 6-state partner taxonomy (it routes
          per surface). We show the union so the admin sees the
          full list. Cross-taxonomy writes are an error at the
          API level; in practice the admin UI shows "Partner"
          only on the Partner tab and the partner taxonomy there. */}
      <Dialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">Change status on {selectedIds.size} applications</DialogTitle>
            <DialogDescription>
              All selected applications will move to the chosen status. SICA will email the
              student (and the partner, for partner-submitted apps) and write a timeline event
              for each.
            </DialogDescription>
          </DialogHeader>
          <Select value={bulkStatus} onValueChange={setBulkStatus}>
            <SelectTrigger className="rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {/* Student taxonomy */}
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Under Review">Under Review (student)</SelectItem>
              <SelectItem value="Documents Requested">Documents Requested</SelectItem>
              <SelectItem value="Decision Made">Decision Made</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Withdrawn">Withdrawn</SelectItem>
              {/* Partner-only state (sits in the partner taxonomy;
                  no-op on student surface apps, the API returns
                  an error per row). */}
              <SelectItem value="In Review">In Review (partner)</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setBulkStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]"
              disabled={bulkRunning}
              onClick={async () => {
                const s = bulkStatus;
                setBulkStatusDialogOpen(false);
                await runBulk('status', s);
              }}
            >
              {bulkRunning ? <><Spinner size="sm" className="text-white mr-2" /> Updating…</> : 'Change status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkNoteDialogOpen} onOpenChange={setBulkNoteDialogOpen}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">Add note to {selectedIds.size} applications</DialogTitle>
            <DialogDescription>
              The note will be appended to each application's existing notes with a timestamp.
            </DialogDescription>
          </DialogHeader>
          <textarea
            value={bulkNoteText}
            onChange={(e) => setBulkNoteText(e.target.value)}
            placeholder="e.g. Wait for CSC scholarship decision before processing."
            className="w-full border border-gray-300 p-2 text-sm rounded-none min-h-[100px] focus:outline-none focus:border-[#9B1B30]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => {
                setBulkNoteDialogOpen(false);
                setBulkNoteText('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]"
              disabled={!bulkNoteText.trim() || bulkRunning}
              onClick={async () => {
                const text = bulkNoteText.trim();
                setBulkNoteDialogOpen(false);
                setBulkNoteText('');
                await runBulk('note', text);
              }}
            >
              {bulkRunning ? <><Spinner size="sm" className="text-white mr-2" /> Saving…</> : 'Add note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkPriorityDialogOpen} onOpenChange={setBulkPriorityDialogOpen}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">Set priority on {selectedIds.size} applications</DialogTitle>
          </DialogHeader>
          <Select value={bulkPriority} onValueChange={setBulkPriority}>
            <SelectTrigger className="rounded-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setBulkPriorityDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526]"
              disabled={bulkRunning}
              onClick={async () => {
                const p = bulkPriority;
                setBulkPriorityDialogOpen(false);
                await runBulk('priority', p);
              }}
            >
              {bulkRunning ? <><Spinner size="sm" className="text-white mr-2" /> Updating…</> : 'Update priority'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
