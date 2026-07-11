'use client';

/**
 * /partner/documents — the partner portal's document management index.
 *
 * Single-page (index) for the partner Documents surface. Lists every
 * document the calling partner has uploaded (or that admin has
 * uploaded on their behalf), with filters, search, sort, and a
 * sticky bottom bulk-action bar mirroring the Phase 1.4 partner
 * applications pattern.
 *
 * Features (mirrors the brief):
 *   - Header with title + "Upload documents" primary button
 *   - Filter bar: status chips with per-status counts, category
 *     dropdown, student SearchableSelect, application SearchableSelect,
 *     debounced search input
 *   - Table: checkbox + name (with file-type icon) + student + category
 *     badge + status badge + uploaded_at + actions
 *   - Pagination via "Load more" (matches Phase 1.1)
 *   - Sticky bottom bulk-action bar (Delete | Move to app | Unlink)
 *   - Empty / loading / error states everywhere a list renders
 *   - Fragment wrapper so the sticky bulk bar is a sibling of the
 *     card (Phase 1.4 trick)
 *
 * URL-synced filter state via useUrlState so refresh-survives
 * filters, shareable URLs, and browser back/forward all work.
 *
 * Reads `?applicationId=<id>` from the URL to support the
 * /partner/documents?applicationId=<id> deep link the API
 * track surfaces in partner_notifications.link_url.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Trash2,
  Download,
  Edit,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X,
  FileText,
  FileCheck,
  FileX,
  Clock,
  Link2,
  AlertCircle,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { useUrlState } from '@/hooks/use-url-state';
import {
  PARTNER_DOC_CATEGORIES,
  PARTNER_DOC_STATUSES,
  type PartnerDocCategory,
  type PartnerDocStatus,
  type PartnerDocument,
} from '@/lib/partner-doc-mapper';
import type { PartnerStudent } from '@/lib/partner-student-mapper';
import type { PartnerApplication } from '@/lib/partner-application-mapper';
import { track } from '@/lib/analytics';
import { DocumentUploadDialog } from '@/components/partner/DocumentUploadDialog';
import { DocumentEditDialog } from '@/components/partner/DocumentEditDialog';
import { DocumentDeleteDialog } from '@/components/partner/DocumentDeleteDialog';

// ----- helpers ------------------------------------------------------------

function formatBytes(n: number | null | undefined): string {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

const STATUS_STYLES: Record<PartnerDocStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Verified: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<PartnerDocStatus, React.ElementType> = {
  Pending: Clock,
  Verified: FileCheck,
  Rejected: FileX,
};

interface DocsResponse {
  documents: PartnerDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

// ----- sortable header ----------------------------------------------------

type SortColumn = 'uploaded_at' | 'name' | 'status';

function SortHeader({
  label,
  column,
  sort,
  order,
  onSort,
}: {
  label: string;
  column: SortColumn;
  sort: SortColumn;
  order: 'asc' | 'desc';
  onSort: (column: SortColumn) => void;
}) {
  const isActive = sort === column;
  const Icon = !isActive ? ChevronsUpDown : order === 'desc' ? ChevronDown : ChevronUp;
  return (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]"
      aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-[#9B1B30] transition-colors focus:outline-none focus:ring-2 focus:ring-[#9B1B30] focus:ring-offset-1"
      >
        {label}
        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#9B1B30]' : 'text-gray-400'}`} />
      </button>
    </th>
  );
}

// ----- page ---------------------------------------------------------------

export default function PartnerDocumentsPage() {
  const { t, locale } = useI18n();
  const searchParams = useSearchParams();

  // The brief asks for status chips with per-status counts. We
  // track the current filter via useUrlState so the URL stays
  // shareable, and we keep a separate unfiltered tally for the
  // chip badges.
  const [statusFilter, setStatusFilter] = useUrlState<PartnerDocStatus | 'all'>(
    'status',
    'all' as PartnerDocStatus | 'all',
    {
      searchParams,
      coerce: (raw) => {
        if (raw === 'all') return 'all' as const;
        if ((PARTNER_DOC_STATUSES as readonly string[]).includes(raw)) {
          return raw as PartnerDocStatus;
        }
        return undefined;
      },
    },
  );
  const [categoryFilter, setCategoryFilter] = useUrlState<PartnerDocCategory | 'all'>(
    'category',
    'all' as PartnerDocCategory | 'all',
    {
      searchParams,
      coerce: (raw) => {
        if (raw === 'all') return 'all' as const;
        if ((PARTNER_DOC_CATEGORIES as readonly string[]).includes(raw)) {
          return raw as PartnerDocCategory;
        }
        return undefined;
      },
    },
  );
  const [studentFilter, setStudentFilter] = useUrlState('partnerStudentId', '' as string, {
    searchParams,
  });
  const [applicationFilter, setApplicationFilter] = useUrlState('partnerApplicationId', '' as string, {
    searchParams,
  });

  // The `?applicationId=` link from the partner notification
  // surfaces a deep-link into the partner Documents page. We
  // initialize the applicationFilter from that param and clear
  // it from the URL after first read so a refresh doesn't
  // surprise the user.
  const initFromQuery = useRef(true);
  useEffect(() => {
    if (!initFromQuery.current) return;
    initFromQuery.current = false;
    const fromQuery = searchParams.get('applicationId');
    if (fromQuery && !applicationFilter) {
      setApplicationFilter(fromQuery);
    }
  }, [searchParams, applicationFilter, setApplicationFilter]);

  // Debounced search — local state for the input, debounced
  // effect syncs to the URL state.
  const [searchInput, setSearchInput] = useState('');
  const [searchFilter, setSearchFilter] = useUrlState('search', '' as string, {
    searchParams,
    debounceMs: 600,
  });
  useEffect(() => {
    const tm = setTimeout(() => {
      // Compare via JSON.stringify to avoid spurious writes —
      // useUrlState already guards against value-equal updates.
      setSearchFilter(searchInput.trim());
    }, 600);
    return () => clearTimeout(tm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Sync search input from URL on first mount (e.g. deep link
  // with ?search=foo pre-populates the input).
  useEffect(() => {
    if (searchFilter && !searchInput) {
      setSearchInput(searchFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sort
  const [sort, setSort] = useUrlState<SortColumn>(
    'sort',
    'uploaded_at' as SortColumn,
    {
      searchParams,
      coerce: (raw) => {
        if (raw === 'name' || raw === 'status' || raw === 'uploaded_at') return raw;
        return undefined;
      },
    },
  );
  const [order, setOrder] = useUrlState<'asc' | 'desc'>(
    'order',
    'desc' as 'asc' | 'desc',
    {
      searchParams,
      coerce: (raw) => (raw === 'asc' || raw === 'desc' ? raw : undefined),
    },
  );
  const handleSort = (column: SortColumn) => {
    if (sort !== column) {
      setSort(column);
      setOrder('desc');
    } else if (order === 'desc') {
      setOrder('asc');
    } else {
      setSort('uploaded_at');
      setOrder('desc');
    }
  };

  // Data
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reference data for pickers
  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [applications, setApplications] = useState<PartnerApplication[]>([]);

  // Per-status totals (for the chip badges). Fetched via an
  // unfiltered `limit=100` sweep on first mount; the API doesn't
  // expose a per-status count endpoint. We refresh on every
  // successful upload/delete.
  const [statusCounts, setStatusCounts] = useState<Record<PartnerDocStatus | 'all', number>>({
    all: 0,
    Pending: 0,
    Verified: 0,
    Rejected: 0,
  });

  // Selection (Phase 1.4 pattern)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ ok: number; fail: number } | null>(null);
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);
  const [bulkMoveAppId, setBulkMoveAppId] = useState<string>('');
  // Phase 52: shadcn AlertDialog-driven bulk-delete confirmation.
  // Replaces the old window.confirm() call which (a) was
  // inconsistent with the partner applications list (which uses
  // AlertDialog), (b) froze the JS thread, and (c) rendered
  // poorly on iOS Safari. The actual delete is still handled by
  // handleBulk('delete') below.
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // Dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<PartnerDocument | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<PartnerDocument | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  // Tiny self-managed toast
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const tm = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(tm);
  }, [toast]);
  const showToast = (msg: string) => setToast(msg);

  // Reset selection when filters / sort change so the user
  // doesn't bulk-delete rows that just scrolled out of view.
  useEffect(() => {
    setSelectedIds(new Set());
    setBulkResult(null);
    setPage(1);
  }, [statusFilter, categoryFilter, studentFilter, applicationFilter, searchFilter, sort, order]);

  // Fetch reference data once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [studentsRes, appsRes] = await Promise.all([
          apiFetchJson<{ students: PartnerStudent[] }>('/api/partner/students?limit=200').catch(
            () => ({ students: [] as PartnerStudent[] }),
          ),
          apiFetchJson<{ applications: PartnerApplication[] }>(
            '/api/partner/applications?limit=200',
          ).catch(() => ({ applications: [] as PartnerApplication[] })),
        ]);
        if (cancelled) return;
        setStudents(studentsRes.students || []);
        setApplications(appsRes.applications || []);
      } catch {
        // non-fatal — empty lists still let the page render
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchDocs = useCallback(
    async (opts?: { append?: boolean; page?: number }) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (categoryFilter !== 'all') params.set('category', categoryFilter);
        if (studentFilter) params.set('partnerStudentId', studentFilter);
        if (applicationFilter) params.set('partnerApplicationId', applicationFilter);
        if (searchFilter) params.set('search', searchFilter);
        params.set('sort', sort);
        params.set('order', order);
        const usePage = opts?.page ?? 1;
        params.set('page', String(usePage));
        params.set('limit', String(PAGE_SIZE));
        const res = await apiFetchJson<DocsResponse>(
          `/api/partner/documents${params.toString() ? `?${params}` : ''}`,
        );
        const list = res.documents || [];
        if (opts?.append) {
          setDocuments((prev) => [...prev, ...list]);
        } else {
          setDocuments(list);
        }
        setTotal(res.total || 0);
        // hasMore = we have less than the total loaded so far
        const loaded = opts?.append
          ? (documents.length + list.length)
          : list.length;
        setHasMore(loaded < (res.total || 0));
        setPage(usePage);
      } catch (err) {
        console.error('[partner/documents] fetch failed:', err);
        setError(err instanceof Error ? err.message : t('partnerDocs.errorLoad'));
        setDocuments([]);
        setTotal(0);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [statusFilter, categoryFilter, studentFilter, applicationFilter, searchFilter, sort, order, t],
  );

  useEffect(() => {
    void fetchDocs();
  }, [fetchDocs]);

  // Refresh the status chip counts on first mount + after any
  // mutation. Single unfiltered sweep (the API doesn't paginate
  // by status, so we walk the full set).
  const refreshStatusCounts = useCallback(async () => {
    try {
      const res = await apiFetchJson<DocsResponse>(
        '/api/partner/documents?limit=100',
      );
      const docs = res.documents || [];
      const next: Record<PartnerDocStatus | 'all', number> = {
        all: res.total || docs.length,
        Pending: 0,
        Verified: 0,
        Rejected: 0,
      };
      for (const d of docs) {
        next[d.status] = (next[d.status] || 0) + 1;
      }
      setStatusCounts(next);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    void refreshStatusCounts();
  }, [refreshStatusCounts]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchDocs({ append: true, page: page + 1 });
    } finally {
      setLoadingMore(false);
    }
  };

  // Selection helpers (Phase 1.4 pattern)
  const toggleSelected = (id: string, on: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulk = async (
    action: 'delete' | 'move-to-application' | 'unlink-from-application',
    applicationId?: string,
  ) => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    setBulkResult(null);
    try {
      const res = await apiFetchJson<{
        updated: number;
        failed: Array<{ id: string; error: string }>;
      }>('/api/partner/documents/bulk', {
        method: 'POST',
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
          applicationId,
        }),
      });
      setBulkResult({ ok: res.updated, fail: res.failed.length });
      // GA — partner delete (also fires for the bulk delete)
      if (action === 'delete') {
        try {
          track('partner_document_delete', {
            locale,
            count: Array.from(selectedIds).length,
          });
        } catch {
          // non-fatal
        }
      }
      clearSelection();
      setBulkMoveOpen(false);
      setBulkMoveAppId('');
      await fetchDocs();
      void refreshStatusCounts();
    } catch (err) {
      console.error('[partner/documents] bulk failed:', err);
      setError(err instanceof Error ? err.message : t('partnerDocs.errors.uploadFailed'));
    } finally {
      setBulkBusy(false);
    }
  };

  const confirmBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setShowBulkDelete(true);
  };

  const handleDownload = async (doc: PartnerDocument) => {
    try {
      const { url } = await apiFetchJson<{ url: string; expiresAt: string }>(
        `/api/partner/documents/${doc.id}/download-url`,
        { method: 'POST' },
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('[partner/documents] download failed:', err);
      // Phase 52: dedicated download-error key (was reusing
      // uploadFailed, which read wrong in context).
      setError(err instanceof Error ? err.message : t('partnerDocs.errors.downloadFailed'));
    }
  };

  // S29-style single delete (via the dialog). The dialog wraps
  // the actual DELETE call + storage cleanup (per the API track
  // — partner DELETE removes both the row + the storage object).
  const handleSingleDelete = async (doc: PartnerDocument) => {
    setDeleteDoc(doc);
    setDeleteOpen(true);
  };

  const handleEdit = (doc: PartnerDocument) => {
    setEditDoc(doc);
    setEditOpen(true);
  };

  // GA: page view (fires once on mount; refetches on filter change
  // intentionally do not re-fire — only the initial mount counts).
  const pageViewFired = useRef(false);
  useEffect(() => {
    if (pageViewFired.current) return;
    pageViewFired.current = true;
    try {
      track('partner_documents_page_view', {
        locale,
        filter_status: statusFilter === 'all' ? null : statusFilter,
      });
    } catch {
      // non-fatal
    }
  }, [locale, statusFilter]);

  // The current application filter, in a typed way for the
  // SearchableSelect.
  const applicationFilterValue = applicationFilter || '__none__';
  const studentFilterValue = studentFilter || '__none__';

  const hasAnyFilter =
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    studentFilter !== '' ||
    applicationFilter !== '' ||
    searchFilter !== '';

  // The application picker inside the bulk-move dialog uses the
  // same options as the page filter.
  const appOptions = applications.map((a) => ({
    value: a.id,
    label: a.university,
    sublabel: a.program || a.applicationNumber || undefined,
  }));
  const studentOptions = students.map((s) => ({
    value: s.id,
    label: s.studentName,
    sublabel: s.studentEmail || undefined,
  }));

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
                <FolderOpen className="h-6 w-6" />
                {t('partnerDocs.title')}
              </h1>
              <p className="text-[#4B5563] mt-1">{t('partnerDocs.subtitle')}</p>
            </div>
            <Button
              className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              onClick={() => setUploadOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('partnerDocs.uploadButton')}
            </Button>
          </div>
        </div>

        {/* Status filter chips with per-status counts */}
        <div className="flex flex-wrap gap-2">
          {(['all', ...PARTNER_DOC_STATUSES] as const).map((s) => {
            const active = statusFilter === s;
            const count = statusCounts[s] || 0;
            const labelKey =
              s === 'all' ? 'partnerDocs.filterAll' : `partnerDocs.statusBadge.${s.toLowerCase()}`;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors inline-flex items-center gap-1 ${
                  active
                    ? 'border-[#9B1B30] text-[#1B2A4A]'
                    : 'border-transparent text-gray-500 hover:text-[#1B2A4A] hover:border-gray-200'
                }`}
              >
                {t(labelKey)}
                <span
                  className={`text-xs ${
                    active ? 'text-[#1B2A4A]' : 'text-gray-400'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary filters row: category + student + application + search */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <Select
            value={categoryFilter === 'all' ? 'all' : categoryFilter}
            onValueChange={(v) => setCategoryFilter(v as PartnerDocCategory | 'all')}
          >
            <SelectTrigger className="w-44 rounded-none">
              <SelectValue placeholder={t('partnerDocs.filterCategory')} />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="all">{t('partnerDocs.filterCategoryAll')}</SelectItem>
              {PARTNER_DOC_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {t(`partnerDocs.categoryBadge.${c.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="w-full md:w-56">
            <SearchableSelect
              value={studentFilterValue}
              onChange={(v) => setStudentFilter(v === '__none__' ? '' : v)}
              options={studentOptions}
              placeholder={t('partnerDocs.filterStudentAll')}
              emptyText={t('partnerDocs.filterStudentAll')}
              searchPlaceholder={t('partnerDocs.filterSearch')}
              clearValue="__none__"
              clearLabel={t('partnerDocs.filterStudentAll')}
            />
          </div>
          <div className="w-full md:w-56">
            <SearchableSelect
              value={applicationFilterValue}
              onChange={(v) => setApplicationFilter(v === '__none__' ? '' : v)}
              options={appOptions}
              placeholder={t('partnerDocs.filterApplicationAll')}
              emptyText={t('partnerDocs.filterApplicationAll')}
              searchPlaceholder={t('partnerDocs.filterSearch')}
              clearValue="__none__"
              clearLabel={t('partnerDocs.filterApplicationAll')}
            />
          </div>
          <div className="flex-1 relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('partnerDocs.filterSearch')}
              className="rounded-none pl-9"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1B2A4A]"
                aria-label={t('partnerDocs.bulkBar.clearSelection')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Active-filter pill row (clear all) */}
        {hasAnyFilter && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#4B5563]">
            <span className="text-xs uppercase tracking-wider font-semibold">
              {t('partnerDocs.filterAll')}:
            </span>
            {statusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 text-xs font-medium rounded-none"
              >
                {t(`partnerDocs.statusBadge.${statusFilter.toLowerCase()}`)}
                <X className="h-3 w-3" />
              </button>
            )}
            {categoryFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 text-xs font-medium rounded-none"
              >
                {t(`partnerDocs.categoryBadge.${categoryFilter.toLowerCase()}`)}
                <X className="h-3 w-3" />
              </button>
            )}
            {studentFilter && (
              <button
                type="button"
                onClick={() => setStudentFilter('')}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 text-xs font-medium rounded-none"
              >
                {students.find((s) => s.id === studentFilter)?.studentName || studentFilter.slice(0, 8)}
                <X className="h-3 w-3" />
              </button>
            )}
            {applicationFilter && (
              <button
                type="button"
                onClick={() => setApplicationFilter('')}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 text-xs font-medium rounded-none"
              >
                {applications.find((a) => a.id === applicationFilter)?.university || applicationFilter.slice(0, 8)}
                <X className="h-3 w-3" />
              </button>
            )}
            {searchFilter && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearchFilter('');
                }}
                className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-0.5 text-xs font-medium rounded-none"
              >
                “{searchFilter}”
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setStudentFilter('');
                setApplicationFilter('');
                setSearchInput('');
                setSearchFilter('');
              }}
              className="ml-1 text-[#9B1B30] hover:underline text-xs font-semibold"
            >
              {t('partnerDocs.emptyReset')}
            </button>
          </div>
        )}

        {error && (
          <Card className="rounded-none border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </CardContent>
          </Card>
        )}

        <Card className="rounded-none">
          <CardContent className="p-0">
            {isLoading && documents.length === 0 ? (
              <div className="p-12 flex justify-center">
                <RefreshCw className="w-6 h-6 text-[#4B5563] animate-spin" />
              </div>
            ) : documents.length === 0 ? (
              <div className="p-12 text-center">
                <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-[#1B2A4A] font-medium">
                  {hasAnyFilter ? t('partnerDocs.emptyFiltered') : t('partnerDocs.emptyTitle')}
                </p>
                <p className="text-sm text-[#4B5563] mt-1">
                  {hasAnyFilter ? t('partnerDocs.emptyBody') : t('partnerDocs.emptyBody')}
                </p>
                {hasAnyFilter && (
                  <Button
                    variant="outline"
                    className="rounded-none mt-4"
                    onClick={() => {
                      setStatusFilter('all');
                      setCategoryFilter('all');
                      setStudentFilter('');
                      setApplicationFilter('');
                      setSearchInput('');
                      setSearchFilter('');
                    }}
                  >
                    {t('partnerDocs.emptyReset')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 w-10">
                        <Checkbox
                          checked={
                            documents.length > 0 &&
                            documents.every((d) => selectedIds.has(d.id))
                          }
                          onCheckedChange={(c) => {
                            if (c) {
                              setSelectedIds(new Set(documents.map((d) => d.id)));
                            } else {
                              setSelectedIds(new Set());
                            }
                          }}
                          aria-label={t('partnerDocs.bulkBar.clearSelection')}
                        />
                      </th>
                      <SortHeader
                        label={t('partnerDocs.columnName')}
                        column="name"
                        sort={sort}
                        order={order}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                        {t('partnerDocs.columnStudent')}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                        {t('partnerDocs.columnCategory')}
                      </th>
                      <SortHeader
                        label={t('partnerDocs.columnStatus')}
                        column="status"
                        sort={sort}
                        order={order}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                        {t('partnerDocs.columnLinkedApp')}
                      </th>
                      <SortHeader
                        label={t('partnerDocs.columnUploaded')}
                        column="uploaded_at"
                        sort={sort}
                        order={order}
                        onSort={handleSort}
                      />
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                        {t('partnerDocs.columnActions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {documents.map((doc) => {
                      const StatusIcon = STATUS_ICONS[doc.status];
                      const isSelected = selectedIds.has(doc.id);
                      return (
                        <tr
                          key={doc.id}
                          className={`hover:bg-gray-50 ${isSelected ? 'bg-amber-50' : ''}`}
                        >
                          <td className="px-2 py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(c) => toggleSelected(doc.id, !!c)}
                              aria-label={doc.name}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-[#1B2A4A] flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="font-medium text-[#1B2A4A] truncate">
                                  {doc.name}
                                </div>
                                {(doc.fileName || doc.fileSize) && (
                                  <div className="text-xs text-[#4B5563] mt-0.5 truncate">
                                    {doc.fileName}
                                    {doc.fileSize ? ` · ${formatBytes(doc.fileSize)}` : ''}
                                  </div>
                                )}
                                {doc.status === 'Rejected' && doc.rejectionReason && (
                                  <div className="text-xs text-red-700 mt-1 max-w-xs truncate" title={doc.rejectionReason}>
                                    {doc.rejectionReason}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#4B5563]">
                            {doc.partnerStudent?.name || '—'}
                          </td>
                          <td className="px-4 py-3 text-[#4B5563]">
                            {t(`partnerDocs.categoryBadge.${doc.category.toLowerCase()}`)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`rounded-none ${STATUS_STYLES[doc.status]}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {t(`partnerDocs.statusBadge.${doc.status.toLowerCase()}`)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-[#4B5563] text-sm">
                            {doc.partnerApplication ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700">
                                <Link2 className="h-3 w-3" />
                                {doc.partnerApplication.university || '—'}
                              </span>
                            ) : (
                              <span className="text-gray-400 inline-flex items-center gap-1">
                                <Link2 className="h-3 w-3" />
                                {t('partnerDocs.unlinked')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-[#4B5563] text-sm">
                            {formatDate(doc.uploadedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-none h-8 w-8 p-0"
                                onClick={() => handleDownload(doc)}
                                title={t('partnerDocs.downloadButton')}
                                aria-label={t('partnerDocs.downloadButton')}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-none h-8 w-8 p-0"
                                onClick={() => handleEdit(doc)}
                                title={t('partnerDocs.editButton')}
                                aria-label={t('partnerDocs.editButton')}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-none h-8 w-8 p-0 text-red-600 hover:text-red-800"
                                onClick={() => handleSingleDelete(doc)}
                                title={t('partnerDocs.deleteButton')}
                                aria-label={t('partnerDocs.deleteButton')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination (Phase 1.1 — Load more) */}
            {!isLoading && hasMore && (
              <div className="flex flex-col items-center gap-1 py-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      {t('partnerDocs.loadMoreBusy')}
                    </span>
                  ) : (
                    t('partnerDocs.loadMore')
                  )}
                </Button>
                <span className="text-xs text-gray-500">
                  {t('partnerDocs.loadMoreCount', { shown: documents.length, total })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result footer (count + total) */}
        {!isLoading && documents.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            {t('partnerDocs.totalLabel', { count: total })}
          </div>
        )}
      </div>

      {/* Sticky bulk-action bar (Phase 1.4 pattern). Appears as a
          sibling of the page card, not a child — that's the
          Phase 1.4 trick from the partner applications page so
          it can sit fixed at the bottom of the viewport. */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-[#9B1B30] bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-[#1B2A4A]">
              {t('partnerDocs.bulkBar.selectedCount', { n: selectedIds.size })}
            </span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={() => setBulkMoveOpen(true)}
              disabled={bulkBusy}
            >
              <ArrowRight className="h-3.5 w-3.5 mr-1" />
              {t('partnerDocs.bulkBar.moveToApp')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-none"
              onClick={() => handleBulk('unlink-from-application')}
              disabled={bulkBusy}
            >
              <Link2 className="h-3.5 w-3.5 mr-1" />
              {t('partnerDocs.bulkBar.unlinkFromApp')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-none"
              onClick={confirmBulkDelete}
              disabled={bulkBusy}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              {t('partnerDocs.bulkBar.deleteSelected')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-none"
              onClick={clearSelection}
              disabled={bulkBusy}
            >
              {t('partnerDocs.bulkBar.clearSelection')}
            </Button>
          </div>
          {bulkResult && (
            <div className="bg-[#FAFAF8] border-t border-gray-200 text-xs text-[#4B5563] px-4 sm:px-6 lg:px-8 py-1.5 text-center">
              {t('partnerDocs.bulkBar.result', { ok: bulkResult.ok, fail: bulkResult.fail })}
            </div>
          )}
        </div>
      )}

      {/* Bulk move dialog — picks the target application then
          issues the bulk move-to-application call. */}
      <Dialog open={bulkMoveOpen} onOpenChange={(o) => {
        if (!o && bulkBusy) return;
        setBulkMoveOpen(o);
        if (!o) setBulkMoveAppId('');
      }}>
        <DialogContent className="rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">
              {t('partnerDocs.bulkBar.moveToApp')}
            </DialogTitle>
            <DialogDescription>
              {t('partnerDocs.bulkBar.selectedCount', { n: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-[#1B2A4A] mb-2 block">
              {t('partnerDocs.bulkBar.chooseApp')}
            </Label>
            <SearchableSelect
              value={bulkMoveAppId || '__none__'}
              onChange={(v) => setBulkMoveAppId(v === '__none__' ? '' : v)}
              options={appOptions}
              placeholder={t('partnerDocs.bulkBar.chooseApp')}
              emptyText={t('partnerDocs.filterApplicationAll')}
              searchPlaceholder={t('partnerDocs.filterSearch')}
              clearValue="__none__"
              clearLabel={t('partnerDocs.uploadDialog.partnerApplicationNone')}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBulkMoveOpen(false);
                setBulkMoveAppId('');
              }}
              disabled={bulkBusy}
              className="rounded-none"
            >
              {t('partnerDocs.deleteDialog.cancel')}
            </Button>
            <Button
              onClick={() => handleBulk('move-to-application', bulkMoveAppId)}
              disabled={bulkBusy || !bulkMoveAppId}
              className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
            >
              {t('partnerDocs.bulkBar.moveToApp')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload dialog */}
      <DocumentUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        students={students}
        applications={applications}
        onUploaded={() => {
          void fetchDocs();
          void refreshStatusCounts();
        }}
        onShowToast={showToast}
      />

      {/* Edit dialog */}
      <DocumentEditDialog
        doc={editDoc}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditDoc(null);
        }}
        applications={applications}
        onSaved={() => {
          void fetchDocs();
        }}
        onShowToast={showToast}
      />

      {/* Delete dialog */}
      <DocumentDeleteDialog
        doc={deleteDoc}
        open={deleteOpen}
        onOpenChange={(o) => {
          setDeleteOpen(o);
          if (!o) setDeleteDoc(null);
        }}
        onDeleted={() => {
          // Optimistic local remove + refresh.
          setDocuments((prev) => prev.filter((d) => d.id !== deleteDoc?.id));
          setTotal((prev) => Math.max(0, prev - 1));
          void fetchDocs();
          void refreshStatusCounts();
        }}
        onShowToast={showToast}
      />

      {/* Phase 52: bulk-delete AlertDialog. Replaces the old
          window.confirm() with the project's shadcn AlertDialog
          for consistency with the partner applications list and
          to fix the iOS Safari rendering + JS-thread-freeze
          issues that Phase 48.5 already cited when fixing the
          same pattern elsewhere. The destructive action still
          runs through handleBulk('delete') so the per-row
          failure report + GA tracking stay in one place. */}
      <AlertDialog open={showBulkDelete} onOpenChange={setShowBulkDelete}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('partnerDocs.bulkBar.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('partnerDocs.bulkBar.deleteBody', { n: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkBusy} className="rounded-none">
              {t('partnerDocs.deleteDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={bulkBusy}
              className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              onClick={() => {
                setShowBulkDelete(false);
                void handleBulk('delete');
              }}
            >
              {t('partnerDocs.bulkBar.deleteAction', { n: selectedIds.size })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Inline self-managed toast (top-right, 3.5s) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 z-50 bg-[#1B2A4A] text-white px-4 py-2 text-sm shadow-lg rounded-none max-w-md"
        >
          {toast}
        </div>
      )}
    </>
  );
}
