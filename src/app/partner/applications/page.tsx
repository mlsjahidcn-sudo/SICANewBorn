'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Eye, Edit, MoreHorizontal, Trash2, X, Download, Flag, Mail, RefreshCw, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type {
  PartnerApplication,
  PartnerApplicationStatus,
  PartnerApplicationPriority,
} from '@/lib/partner-application-mapper';

const STATUS_VARIANTS: Record<PartnerApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Draft': 'secondary',
  'Submitted': 'outline',
  'In Review': 'outline',
  'Accepted': 'default',
  'Rejected': 'destructive',
  'Withdrawn': 'outline',
};

const PRIORITY_VARIANTS: Record<PartnerApplicationPriority, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Normal: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-[#9B1B30] text-white',
};

export default function PartnerApplicationsPage() {
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);

  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({ inReview: 0, accepted: 0, submitted: 0, urgent: 0 });
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  // Sort state — server-side sort (the API only supports 3 sortable
  // columns: student_name, created_at, updated_at). Default is
  // newest-first by created_at.
  const [sort, setSort] = useState<'created_at' | 'updated_at' | 'student_name'>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  // Phase 1.1: pagination state. We load the first page on
  // mount and let the user click "Load more" to fetch page 2+.
  // The server returns total so we know when we've hit the end.
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // Phase 1.4: bulk-action selection. We track the set of
  // selected app ids; the bulk-action bar appears at the bottom
  // of the page when at least one is selected.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ ok: number; fail: number } | null>(null);

  const toggleSelected = (id: string, on: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // Clear the selection on filter / sort change so the user
  // doesn't end up bulk-deleting rows that just scrolled out
  // of view.
  useEffect(() => {
    clearSelection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, priorityFilter, sort, order]);

  /**
   * Cycle the sort: clicking an unsorted column sorts desc; clicking
   * again flips to asc; clicking a third time clears back to the
   * default (created_at desc). The arrow next to the column header
   * shows the current state.
   */
  const handleSort = (column: 'created_at' | 'updated_at' | 'student_name') => {
    if (sort !== column) {
      setSort(column);
      setOrder('desc');
    } else if (order === 'desc') {
      setOrder('asc');
    } else {
      setSort('created_at');
      setOrder('desc');
    }
  };

  useEffect(() => {
    const tm = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(tm);
  }, [searchTerm]);

  const fetchApps = useCallback(async (opts?: { append?: boolean; page?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      params.set('sort', sort);
      params.set('order', order);
      // Phase 1.1: paginated. Default page=1 with limit=50. The
      // "Load more" button calls this with append=true + page=N+1
      // to fetch the next page and append to the existing list.
      params.set('page', String(opts?.page ?? 1));
      params.set('limit', '50');
      const res = await apiFetchJson<{
        applications: PartnerApplication[];
        total: number;
        totalPages: number;
      }>(`/api/partner/applications${params.toString() ? `?${params}` : ''}`);
      const list = res.applications || [];
      if (opts?.append) {
        setApplications((prev) => [...prev, ...list]);
      } else {
        setApplications(list);
      }
      setTotal(res.total || 0);
      // hasMore = we have less than the total loaded so far
      setHasMore(applications.length + list.length < (res.total || 0));
      setPage(opts?.page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerApps.errorLoad'));
      setApplications([]);
      setTotal(0);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, priorityFilter, sort, order, t]);

  useEffect(() => {
    void fetchApps();
  }, [fetchApps]);

  // Phase 1.1: "Load more" appends page N+1 to the existing
  // list. We track loadingMore separately so the main table
  // doesn't get a spinner overlay.
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchApps({ append: true, page: page + 1 });
    } finally {
      setLoadingMore(false);
    }
  };

  // Lightweight stats: a single unfiltered fetch on first mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<{ applications: PartnerApplication[] }>(
          '/api/partner/applications?limit=100',
        );
        if (cancelled) return;
        const apps = res.applications || [];
        setStats({
          inReview: apps.filter((a) => a.status === 'In Review' || a.status === 'Submitted').length,
          accepted: apps.filter((a) => a.status === 'Accepted').length,
          submitted: apps.filter((a) => a.status === 'Submitted').length,
          urgent: apps.filter((a) => a.priority === 'High' || a.priority === 'Urgent').length,
        });
      } catch {
        // ignore — non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDeleteApp = (id: string) => {
    setAppToDelete(id);
    setShowDeleteModal(true);
  };

  // Phase 1.4: bulk action. Per S27, partner can only do
  // priority / delete (no status, no notes). The action is
  // confirm-guarded by a modal that shows the count of selected
  // rows so the partner doesn't nuke 30 rows by accident.
  const handleBulkAction = async (
    action: 'priority' | 'delete',
    value?: string,
  ) => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    setBulkResult(null);
    try {
      const res = await apiFetchJson<{
        updated: number;
        failed: Array<{ id: string; error: string }>;
      }>('/api/partner/applications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
          value,
        }),
      });
      setBulkResult({ ok: res.updated, fail: res.failed.length });
      clearSelection();
      await fetchApps();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerApps.bulkFailed'));
    } finally {
      setBulkBusy(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      // Fetch a wide filter (no pagination cap) so the partner gets
      // everything. The export endpoint enforces its own auth + scope.
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      const res = await fetch(
        `/api/partner/applications/export${params.toString() ? `?${params}` : ''}`,
        { headers: { Accept: 'text/csv' } },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerApps.errorExportHttp', { status: res.status }));
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Pull a sensible filename from the Content-Disposition header
      // if the server set one, otherwise fall back to a default.
      const cd = res.headers.get('Content-Disposition') || '';
      const match = /filename="?([^"]+)"?/i.exec(cd);
      a.download = match?.[1] || `sica-partner-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerApps.errorExport'));
    } finally {
      setIsExporting(false);
    }
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/applications/${appToDelete}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerApps.errorDeleteHttp', { status: res.status }));
      }
      setApplications((prev) => prev.filter((a) => a.id !== appToDelete));
      setTotal((prev) => Math.max(0, prev - 1));
      setShowDeleteModal(false);
      setAppToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerApps.errorDelete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: PartnerApplicationStatus) => (
    <Badge variant={STATUS_VARIANTS[status]} className="rounded-none">{status}</Badge>
  );

  return (
    <>
    <div className="space-y-6">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1B2A4A]">{t('partnerApps.deleteTitle')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="text-[#4B5563] hover:text-[#1B2A4A] disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#4B5563] mb-6">
              {t('partnerApps.deleteBody')}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                {t('partnerApps.cancel')}
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? t('partnerApps.deleting') : t('partnerApps.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerApps.title')}</h1>
            <p className="text-[#4B5563] mt-1">{t('partnerApps.subtitle')}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={handleExport}
              disabled={isExporting || applications.length === 0}
              title={
                applications.length === 0
                  ? t('partnerApps.exportNone')
                  : t('partnerApps.exportCount', { count: applications.length })
              }
            >
              <Download className={`mr-2 h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
              {isExporting ? t('partnerApps.exporting') : t('partnerApps.export')}
            </Button>
            <Button asChild className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]">
              <Link href="/partner/applications/new" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                {t('partnerApps.newApplication')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerApps.totalApplications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{total}</div>
            <p className="text-sm text-[#4B5563] mt-1">{t('partnerApps.totalApplicationsHint')}</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerApps.inReview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.inReview}</div>
            <p className="text-sm text-[#4B5563] mt-1">{t('partnerApps.inReviewHint')}</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563] flex items-center gap-1">
              <Flag className="w-3 h-3" /> {t('partnerApps.urgentHigh')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#9B1B30]">{stats.urgent}</div>
            <p className="text-sm text-[#4B5563] mt-1">{t('partnerApps.urgentHighHint')}</p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">{t('partnerApps.accepted')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.accepted}</div>
            <p className="text-sm text-[#4B5563] mt-1">{t('partnerApps.acceptedHint')}</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4B5563]" />
            <Input
              type="text"
              placeholder={t('partnerApps.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 rounded-none">
              <SelectValue placeholder={t('partnerApps.allStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('partnerApps.allStatus')}</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="In Review">In Review</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40 rounded-none">
              <SelectValue placeholder={t('partnerApps.allPriority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('partnerApps.allPriority')}</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-4 w-10">
                    <Checkbox
                      checked={
                        applications.length > 0 &&
                        applications.every((a) => selectedIds.has(a.id))
                      }
                      // indeterminate is rendered via the standard
                      // checkbox fallback; the bulk-action bar shows
                      // the partial count either way.
                      onCheckedChange={(c) => {
                        if (c) {
                          setSelectedIds(
                            new Set(applications.map((a) => a.id)),
                          );
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                      aria-label={t('partnerApps.selectAll')}
                    />
                  </th>
                  <SortHeader
                    label={t('partnerApps.colStudent')}
                    column="student_name"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                  />
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerApps.colUniversity')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerApps.colProgram')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerApps.colStatus')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerApps.colPriority')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerApps.colDecision')}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerApps.colSubmittedBy')}</th>
                  <SortHeader
                    label={t('partnerApps.colSubmitted')}
                    column="created_at"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                  />
                  <SortHeader
                    label={t('common.updated')}
                    column="updated_at"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                  />
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">{t('partnerApps.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className={`hover:bg-gray-50 ${selectedIds.has(app.id) ? 'bg-amber-50' : ''}`}
                  >
                    <td className="px-2 py-4">
                      <Checkbox
                        checked={selectedIds.has(app.id)}
                        onCheckedChange={(c) => toggleSelected(app.id, !!c)}
                        aria-label={t('partnerApps.selectRow', { name: app.studentName })}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/partner/applications/${app.id}`}
                          className="font-medium text-[#1B2A4A] hover:underline"
                        >
                          {app.studentName}
                        </Link>
                        <div className="flex flex-col gap-0.5 mt-1 text-xs text-[#4B5563]">
                          {app.studentEmail && (
                            <a
                              href={`mailto:${app.studentEmail}`}
                              className="flex items-center gap-1 hover:text-[#9B1B30]"
                            >
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[180px]">{app.studentEmail}</span>
                            </a>
                          )}
                          {(app.intake || app.degree) && (
                            <span className="text-gray-500">
                              {app.intake || t('partnerCommon.placeholderDash')}{app.degree ? ` · ${app.degree}` : ''}
                            </span>
                          )}
                          {app.applicationNumber && (
                            <span className="font-mono text-gray-400">{app.applicationNumber}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#1B2A4A]">{app.university}</td>
                    <td className="px-6 py-4 text-[#4B5563]">{app.program}</td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4">
                      {app.priority && app.priority !== 'Normal' ? (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
                        >
                          <Flag className="w-3 h-3" /> {app.priority}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">{app.decision}</td>
                    <td className="px-6 py-4 text-[#4B5563] text-sm">
                      {app.createdByEmail || t('partnerCommon.placeholderDash')}
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : t('partnerCommon.placeholderDash')}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-none h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-none">
                          <DropdownMenuItem asChild>
                            <Link href={`/partner/applications/${app.id}`} className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              {t('partnerApps.view')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/partner/applications/${app.id}/edit`} className="flex items-center cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              {t('partnerApps.edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteApp(app.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('partnerApps.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {applications.length === 0 && !error && !isLoading && (
            <div className="p-12 text-center">
              <div className="text-[#4B5563]">
                <p className="text-lg font-medium">{t('partnerApps.emptyTitle')}</p>
                <p className="mt-1">
                  {debouncedSearch || statusFilter !== 'all'
                    ? t('partnerApps.emptyFiltered')
                    : t('partnerApps.emptyFresh')}
                </p>
              </div>
            </div>
          )}

           {isLoading && applications.length === 0 && (
             <div className="p-12 text-center text-[#4B5563]">{t('partnerApps.loading')}</div>
           )}

           {/* Phase 1.1: pagination. Renders a "Load more" button
               when we have more rows than the current page. The
               button shows a count of remaining rows so the
               user knows how much is left. */}
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
                     {t('partnerApps.loadingMore')}
                   </span>
                 ) : (
                   t('partnerApps.loadMore')
                 )}
               </Button>
               <span className="text-xs text-gray-500">
                 {t('partnerApps.loadMoreCount', {
                   shown: applications.length,
                   total: total,
                 })}
               </span>
             </div>
           )}
         </CardContent>
       </Card>
     </div>

     {/* Phase 1.4: sticky bulk-action bar. Appears at the
         bottom of the viewport when the user has at least
         one row selected. Crimson tint to match the S31
         admin pattern; per-row result toast tells the user
         how many rows were updated vs failed. */}
     {selectedIds.size > 0 && (
       <div className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-[#9B1B30] bg-white shadow-lg">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap">
           <span className="text-sm font-semibold text-[#1B2A4A]">
             {t('partnerApps.bulkSelected', { n: selectedIds.size })}
           </span>
           <div className="flex-1" />
           <Button
             size="sm"
             variant="outline"
             className="rounded-none"
             onClick={() => handleBulkAction('priority', 'High')}
             disabled={bulkBusy}
           >
             <Flag className="h-3.5 w-3.5 mr-1" /> {t('partnerApps.bulkSetHigh')}
           </Button>
           <Button
             size="sm"
             variant="outline"
             className="rounded-none"
             onClick={() => handleBulkAction('priority', 'Normal')}
             disabled={bulkBusy}
           >
             {t('partnerApps.bulkSetNormal')}
           </Button>
           <Button
             size="sm"
             variant="destructive"
             className="rounded-none"
             onClick={() => {
               if (window.confirm(t('partnerApps.bulkDeleteConfirm', { n: selectedIds.size }))) {
                 handleBulkAction('delete');
               }
             }}
             disabled={bulkBusy}
           >
             <Trash2 className="h-3.5 w-3.5 mr-1" /> {t('partnerApps.bulkDelete')}
           </Button>
           <Button
             size="sm"
             variant="ghost"
             className="rounded-none"
             onClick={clearSelection}
             disabled={bulkBusy}
           >
             {t('partnerApps.bulkCancel')}
           </Button>
         </div>
        {bulkResult && (
          <div className="bg-[#FAFAF8] border-t border-gray-200 text-xs text-[#4B5563] px-4 sm:px-6 lg:px-8 py-1.5 text-center">
            {t('partnerApps.bulkResult', { ok: bulkResult.ok, fail: bulkResult.fail })}
          </div>
        )}
      </div>
    )}
    </>
  );
}

/**
 * Sortable column header. Renders a clickable <button> inside the
 * <th> with a 3-state cycle:
 *   unsorted → desc → asc → reset to default (created_at desc).
 * The arrow icon shows the current state so the user knows what's
 * active. aria-sort reflects the state for screen readers.
 */
function SortHeader<T extends string>({
  label,
  column,
  sort,
  order,
  onSort,
}: {
  label: string;
  column: T;
  sort: T;
  order: 'asc' | 'desc';
  onSort: (column: T) => void;
}) {
  const isActive = sort === column;
  const Icon = !isActive ? ChevronsUpDown : order === 'desc' ? ChevronDown : ChevronUp;
  return (
    <th
      className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]"
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
