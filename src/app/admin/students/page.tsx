'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  Clock,
  CheckCircle2,
  RefreshCw,
  Download,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { AdminStudent } from '@/lib/student-mapper';

const PAGE_SIZE = 20;

type StudentSortField = 'created_at' | 'updated_at' | 'first_name' | 'last_name';

export default function AdminStudentsPage() {
  const { t } = useI18n();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<AdminStudent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Phase 85 — student delete refactor. The single suspend dialog was
  // replaced with a 2-step "Manage student" flow:
  //   step=manage  → show Suspend + Delete-permanently buttons
  //   step=delete  → reveal an email-typed-to-confirm second step
  const [manageStep, setManageStep] = useState<'manage' | 'delete'>('manage');
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  // Incremented by the refresh button — included in the fetch effect's
  // deps so refresh actually re-fetches (the old setPage((p) => p) was
  // always a React no-op).
  const [refreshToken, setRefreshToken] = useState(0);

  // Phase 122a: server-side sort. The API has supported sort/order
  // since the beginning — the page just never sent them. Default is
  // newest-first, matching the previous fixed behavior.
  const [sort, setSort] = useState<StudentSortField>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Phase 122a: bulk status management (S31 parity for students).
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState<string>('Active');
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkResultDialog, setBulkResultDialog] = useState<{
    open: boolean;
    updated: number;
    failed: Array<{ id: string; error: string }>;
  }>({ open: false, updated: 0, failed: [] });

  // Phase 122a: CSV export via the server endpoint (same authed
  // download path as admin applications). X-Truncated surfaces the
  // 1000-row cap.
  const [isExporting, setIsExporting] = useState(false);
  const [exportTruncated, setExportTruncated] = useState(false);

  // Fetch on mount + whenever filters, sort, or page change.
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sort,
      order,
    });
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (sourceFilter !== 'all') params.set('source', sourceFilter);

    apiFetchJson<{ students: AdminStudent[]; total: number; page: number; totalPages: number }>(
      `/api/admin/students?${params.toString()}`,
      { signal: controller.signal },
    )
      .then((data) => {
        setStudents(data.students);
        setTotal(data.total);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || t('adminStudents.errorFailedLoad'));
          setStudents([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [page, searchQuery, statusFilter, sourceFilter, sort, order, refreshToken, t]);

  // Debounce search input so we don't fire a request on every keystroke.
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset to page 1 when filters change (otherwise the user is stuck
  // on a page that no longer exists after a filter narrows the list)
  useEffect(() => {
    setPage(1);
  }, [statusFilter, sourceFilter, searchQuery]);

  // Phase 122a: clear the bulk selection when the visible row set
  // changes — a selected id from another page/filter would otherwise
  // be bulk-acted on invisibly.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [statusFilter, sourceFilter, searchQuery, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /**
   * Phase 122a: cycle the sort — clicking an unsorted column sorts
   * desc; clicking again flips to asc; clicking a third time clears
   * back to the default (created_at desc). Matches the partner lists.
   */
  const handleSort = (column: StudentSortField) => {
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

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const allSelected = students.length > 0 && students.every((s) => prev.has(s.id));
      if (allSelected) return new Set();
      return new Set(students.map((s) => s.id));
    });
  }, []);

  const runBulkStatus = async () => {
    if (selectedIds.size === 0) return;
    setBulkBusy(true);
    try {
      const res = await apiFetchJson<{
        updated: number;
        failed: Array<{ id: string; error: string }>;
      }>('/api/admin/students/bulk', {
        method: 'POST',
        body: JSON.stringify({ ids: Array.from(selectedIds), action: 'status', value: bulkStatusValue }),
      });
      setBulkConfirmOpen(false);
      setBulkResultDialog({ open: true, updated: res.updated, failed: res.failed || [] });
      setSelectedIds(new Set());
      setRefreshToken((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminStudents.bulkFailed'));
      setBulkConfirmOpen(false);
    } finally {
      setBulkBusy(false);
    }
  };

  // Phase 122a: export the filtered list through the server endpoint.
  // A plain link can't send the Authorization header (requireAdmin
  // reads the bearer token), so route through apiFetch + a Blob
  // download — the same path as admin/partner applications.
  const handleExportCsv = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const params = new URLSearchParams({ sort, order });
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (sourceFilter !== 'all') params.set('source', sourceFilter);
      const res = await apiFetch(
        `/api/admin/students/export?${params.toString()}`,
        { headers: { Accept: 'text/csv' } },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename="?([^"]+)"?/i);
      a.download = match?.[1] || `sica-students-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportTruncated(res.headers.get('X-Truncated') === 'true');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminStudents.errorExportFailed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteStudent = (student: AdminStudent) => {
    setStudentToDelete(student);
    setManageStep('manage');
    setConfirmEmailInput('');
    setDeleteDialogOpen(true);
  };

  const closeManageDialog = () => {
    if (isDeleting) return;
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
    setManageStep('manage');
    setConfirmEmailInput('');
  };

  const confirmSuspendStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      // apiFetchJson throws on non-2xx — the old apiFetch call never
      // checked res.ok, so a failed suspend still removed the row
      // from the UI while the DB stayed untouched.
      await apiFetchJson(`/api/admin/students/${studentToDelete.id}`, { method: 'DELETE' });
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setTotal((prev) => Math.max(0, prev - 1));
      closeManageDialog();
      setRefreshToken((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminStudents.errorFailedDelete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmHardDeleteStudent = async () => {
    if (!studentToDelete) return;
    const expected = (studentToDelete.email ?? '').trim().toLowerCase();
    const provided = confirmEmailInput.trim().toLowerCase();
    if (!expected || expected !== provided) {
      setError(t('adminStudents.errorEmailMismatch'));
      return;
    }
    setIsDeleting(true);
    try {
      await apiFetchJson(`/api/admin/students/${studentToDelete.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ action: 'delete', confirmEmail: confirmEmailInput }),
      });
      setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));
      setTotal((prev) => Math.max(0, prev - 1));
      closeManageDialog();
      setRefreshToken((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminStudents.errorFailedDelete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const refresh = () => {
    setRefreshToken((n) => n + 1);
  };

  // Status badges keep their DB enum values (Active / Inactive /
  // Pending / Suspended) as-is — translating them would break the
  // round-trip with the DB and the /api/admin/students?status= filter.
  // Color-only changes are also intentionally omitted so the badge
  // stays visually scannable across locales.
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      case 'Inactive': return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
      case 'Pending': return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{status}</Badge>;
      case 'Suspended': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{status}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  // Source badges also keep DB enum values untranslated.
  const getSourceBadge = (student: AdminStudent) => {
    if (student.isOffline || student.source === 'Admin') {
      return (
        <Badge className="bg-[#9B1B30]/10 text-[#9B1B30] hover:bg-[#9B1B30]/10">
          {t('adminStudents.badgeOffline')}
        </Badge>
      );
    }
    switch (student.source) {
      case 'Partner':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{student.source}</Badge>;
      case 'Online':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{student.source}</Badge>;
      default:
        return <Badge>{student.source}</Badge>;
    }
  };

  // Stats: real DB counts (not the page slice). The 4 cards show total +
  // active + pending + offline; suspended/inactive are still returned
  // by the endpoint for any future card addition.
  // Brief 0-flash while the stats fetch is in flight is acceptable.
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    inactive: number;
    offline: number;
  }>({ total: 0, active: 0, pending: 0, suspended: 0, inactive: 0, offline: 0 });

  useEffect(() => {
    const controller = new AbortController();
    // Bug fix: was raw `fetch()` which doesn't attach the Supabase
    // Bearer token, so requireAdmin 401'd the call and the cards
    // silently stayed at 0. apiFetchJson attaches the token from
    // supabase.auth.getSession() automatically.
    apiFetchJson<{
      total: number;
      active: number;
      pending: number;
      suspended: number;
      inactive: number;
      offline: number;
    }>('/api/admin/students/stats', { signal: controller.signal })
      .then((data) => {
        setStats({
          total: Number(data.total) || 0,
          active: Number(data.active) || 0,
          pending: Number(data.pending) || 0,
          suspended: Number(data.suspended) || 0,
          inactive: Number(data.inactive) || 0,
          offline: Number(data.offline) || 0,
        });
      })
      .catch((err: { name?: string }) => {
        if (err?.name === 'AbortError') return;
        console.error('[admin-students] stats fetch failed', err);
      });
    return () => controller.abort();
  }, [refreshToken]);

  const allVisibleSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id));
  const someVisibleSelected = students.some((s) => selectedIds.has(s.id));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">{t('adminStudents.title')}</h1>
          <p className="text-[#4B5563] text-sm mt-1">
            {t('adminStudents.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {t('adminStudents.buttonRefresh')}
          </Button>
          <Button variant="outline" onClick={handleExportCsv} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? t('adminStudents.exporting') : t('adminStudents.exportCsv')}
          </Button>
          <Link href="/admin/students/new">
            <Button className="bg-[#9B1B30] hover:bg-[#7A1526]">
              <Plus className="w-4 h-4 mr-2" />
              {t('adminStudents.buttonAddOfflineStudent')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-red-800 text-sm">
              <strong>{t('adminStudents.errorPrefix')}</strong> {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Phase 122a: export truncation banner. Set when the server
          reports X-Truncated — the download succeeded but hit the
          1000-row cap, so the admin should narrow the filters. */}
      {exportTruncated && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4 flex items-center justify-between gap-3">
            <p className="text-amber-800 text-sm">{t('adminStudents.exportTruncated')}</p>
            <Button variant="ghost" size="sm" onClick={() => setExportTruncated(false)}>
              ✕
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[#4B5563]">{t('adminStudents.statTotal')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[#1B2A4A]" />
              <div className="text-3xl font-bold text-[#1F2937]">{stats.total}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[#4B5563]">{t('adminStudents.statActive')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
              <div className="text-3xl font-bold text-[#1F2937]">{stats.active}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[#4B5563]">{t('adminStudents.statPending')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="text-3xl font-bold text-[#1F2937]">{stats.pending}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-[#4B5563]">{t('adminStudents.statOffline')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-[#9B1B30]" />
              <div className="text-3xl font-bold text-[#1F2937]">{stats.offline}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('adminStudents.searchPlaceholder')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('adminStudents.filterStatusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminStudents.filterAllStatus')}</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('adminStudents.filterSourcePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminStudents.filterAllSources')}</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
                <SelectItem value="Online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                ? t('adminStudents.emptyFiltered')
                : t('adminStudents.emptyNone')}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 px-2">
              <Table>
                <TableHeader>
                <TableRow>
                  {/* Phase 122a: bulk selection column */}
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        allVisibleSelected
                          ? true
                          : someVisibleSelected
                          ? 'indeterminate'
                          : false
                      }
                      onCheckedChange={toggleSelectAllVisible}
                      aria-label={t('adminStudents.selectAllVisible')}
                    />
                  </TableHead>
                  <SortableHeader
                    label={t('adminStudents.colStudent')}
                    column="last_name"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                  />
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colEmail')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colNationality')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colPhone')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colTargetDegree')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colTargetField')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colSource')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colStatus')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colApps')}</TableHead>
                  <SortableHeader
                    label={t('adminStudents.colCreated')}
                    column="created_at"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                  />
                  <TableHead className="text-right whitespace-nowrap">{t('adminStudents.colActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} className={selectedIds.has(student.id) ? 'bg-[#9B1B30]/5' : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(student.id)}
                        onCheckedChange={() => toggleSelected(student.id)}
                        aria-label={t('adminStudents.selectRow', {
                          name:
                            [student.firstName, student.lastName].filter(Boolean).join(' ').trim() ||
                            student.email,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 min-w-[160px]">
                        <div className="w-10 h-10 bg-[#1B2A4A] rounded-full flex items-center justify-center text-white font-medium shrink-0">
                          {(student.firstName?.[0] || student.email?.[0] || '?').toUpperCase()}
                          {(student.lastName?.[0] || '').toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-[#1F2937]">
                            {student.firstName || student.lastName
                              ? `${student.firstName} ${student.lastName}`.trim()
                              : student.email || '—'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#4B5563] whitespace-nowrap">{student.email}</TableCell>
                    <TableCell className="text-[#4B5563] whitespace-nowrap">{student.nationality || '—'}</TableCell>
                    <TableCell className="text-[#4B5563] whitespace-nowrap">{student.phone || '—'}</TableCell>
                    <TableCell className="text-[#4B5563] whitespace-nowrap">{student.targetDegree || '—'}</TableCell>
                    <TableCell className="text-[#4B5563] whitespace-nowrap">{student.targetField || '—'}</TableCell>
                    <TableCell>{getSourceBadge(student)}</TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      {/* Phase 122a: application count across both
                          surfaces (student + partner CRM via the Phase A
                          bridge). Links to the detail page's Applications
                          tab. */}
                      {student.applicationCount ? (
                        <Link
                          href={`/admin/students/${student.id}?tab=applications`}
                          className="inline-flex items-center justify-center min-w-[1.75rem] px-2 py-0.5 text-xs font-semibold bg-[#1B2A4A] text-white hover:bg-[#243560]"
                        >
                          {student.applicationCount}
                        </Link>
                      ) : (
                        <span className="text-sm text-[#4B5563]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#4B5563] whitespace-nowrap">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/students/${student.id}`} className="flex items-center cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              {t('adminStudents.actionView')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/students/${student.id}/edit`} className="flex items-center cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              {t('adminStudents.actionEdit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => handleDeleteStudent(student)}
                            disabled={student.status === 'Suspended'}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {student.status === 'Suspended'
                              ? t('adminStudents.actionAlreadySuspended')
                              : t('adminStudents.actionDelete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && total > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                {t('adminStudents.paginationShowing', {
                  from: (page - 1) * PAGE_SIZE + 1,
                  to: Math.min(page * PAGE_SIZE, total),
                  total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  {t('adminStudents.paginationPrev')}
                </Button>
                <span className="text-sm text-gray-600">
                  {t('adminStudents.paginationPageOf', { page, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  {t('adminStudents.paginationNext')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 122a: sticky bulk action bar — mirrors the S31 pattern
          on admin applications. Only "Set status" for now: bulk
          hard-delete is deliberately not offered (the single-row flow
          guards it behind a type-the-email confirmation that would be
          defeated by batch apply). */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#9B1B30] shadow-lg">
          <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-[#1F2937]">
              <CheckSquare className="w-4 h-4 text-[#9B1B30]" />
              {t('adminStudents.bulkSelected', { count: selectedIds.size })}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={bulkStatusValue} onValueChange={setBulkStatusValue}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Button
                className="bg-[#1B2A4A] hover:bg-[#243560]"
                onClick={() => setBulkConfirmOpen(true)}
                disabled={bulkBusy}
              >
                {t('adminStudents.bulkApplyStatus')}
              </Button>
              <Button variant="ghost" onClick={() => setSelectedIds(new Set())} disabled={bulkBusy}>
                {t('adminStudents.bulkClear')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 122a: bulk status confirmation dialog */}
      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('adminStudents.bulkConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('adminStudents.bulkConfirmBody', { count: selectedIds.size, status: bulkStatusValue })}
            </DialogDescription>
          </DialogHeader>
          {bulkStatusValue === 'Suspended' && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3">
              {t('adminStudents.bulkSuspendHint')}
            </p>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBulkConfirmOpen(false)} disabled={bulkBusy}>
              {t('common.cancel')}
            </Button>
            <Button
              className={bulkStatusValue === 'Suspended' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1B2A4A] hover:bg-[#243560]'}
              onClick={runBulkStatus}
              disabled={bulkBusy}
            >
              {bulkBusy ? t('adminStudents.bulkWorking') : t('adminStudents.bulkConfirmButton')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phase 122a: bulk result dialog */}
      <Dialog open={bulkResultDialog.open} onOpenChange={(o) => setBulkResultDialog((p) => ({ ...p, open: o }))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('adminStudents.bulkResultTitle')}</DialogTitle>
            <DialogDescription>{t('adminStudents.bulkResultBody')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span>
                <strong>{bulkResultDialog.updated}</strong> {t('adminStudents.bulkResultUpdated')}
              </span>
            </div>
            {bulkResultDialog.failed.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-3 max-h-60 overflow-y-auto">
                <div className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4" /> {bulkResultDialog.failed.length} {t('adminStudents.bulkResultFailed')}
                </div>
                <ul className="space-y-1 text-xs text-red-700">
                  {bulkResultDialog.failed.map((f) => (
                    <li key={f.id} className="font-mono">
                      <span className="text-red-500">{f.id.slice(0, 8)}</span>: {f.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setBulkResultDialog({ open: false, updated: 0, failed: [] })}>
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Student Dialog (Phase 85 — 2-step suspend / hard delete) */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeManageDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {manageStep === 'delete'
                ? t('adminStudents.hardDeleteDialogTitle', {
                    name:
                      [studentToDelete?.firstName, studentToDelete?.lastName].filter(Boolean).join(' ').trim() ||
                      studentToDelete?.email ||
                      '',
                  })
                : t('adminStudents.manageDialogTitle')}
            </DialogTitle>
            <DialogDescription>
              {manageStep === 'delete'
                ? t('adminStudents.hardDeleteDialogBody')
                : t('adminStudents.manageDialogBody')}
            </DialogDescription>
          </DialogHeader>

          {studentToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded">
                <div className="w-10 h-10 bg-[#1B2A4A] rounded-full flex items-center justify-center text-white font-medium">
                  {(studentToDelete.firstName?.[0] || '?').toUpperCase()}
                  {(studentToDelete.lastName?.[0] || '').toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-[#1F2937]">
                    {studentToDelete.firstName} {studentToDelete.lastName}
                  </div>
                  <div className="text-sm text-[#4B5563]">{studentToDelete.email}</div>
                </div>
              </div>

              {manageStep === 'delete' && (
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium text-[#1F2937]" htmlFor="hard-delete-confirm-email">
                    {t('adminStudents.hardDeleteConfirmLabel')}
                  </label>
                  <Input
                    id="hard-delete-confirm-email"
                    value={confirmEmailInput}
                    onChange={(e) => setConfirmEmailInput(e.target.value)}
                    placeholder={t('adminStudents.hardDeleteConfirmPlaceholder')}
                    disabled={isDeleting}
                    autoComplete="off"
                  />
                  <p className="text-xs text-[#4B5563]">{studentToDelete.email}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                if (manageStep === 'delete') {
                  setManageStep('manage');
                  setConfirmEmailInput('');
                } else {
                  closeManageDialog();
                }
              }}
              disabled={isDeleting}
            >
              {manageStep === 'delete' ? t('adminStudents.buttonSuspend') : t('common.cancel')}
            </Button>
            {manageStep === 'manage' ? (
              <>
                <Button
                  className="bg-[#1B2A4A] hover:bg-[#243560] text-white"
                  onClick={confirmSuspendStudent}
                  disabled={isDeleting || studentToDelete?.status === 'Suspended'}
                >
                  {isDeleting
                    ? t('adminStudents.suspendDialogSubmitting')
                    : t('adminStudents.buttonSuspend')}
                </Button>
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => setManageStep('delete')}
                  disabled={isDeleting}
                >
                  {t('adminStudents.buttonHardDelete')}
                </Button>
              </>
            ) : (
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmHardDeleteStudent}
                disabled={
                  isDeleting ||
                  !studentToDelete ||
                  confirmEmailInput.trim().toLowerCase() !==
                    (studentToDelete.email ?? '').trim().toLowerCase()
                }
              >
                {isDeleting
                  ? t('adminStudents.suspendDialogSubmitting')
                  : t('adminStudents.buttonHardDelete')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Phase 122a: clickable sort header. Same 3-state cycle as the
 * partner lists (unsorted → desc → asc → default). Renders inside the
 * shadcn Table so styles stay consistent with the surrounding table.
 */
function SortableHeader({
  label,
  column,
  sort,
  order,
  onSort,
}: {
  label: string;
  column: StudentSortField;
  sort: StudentSortField;
  order: 'asc' | 'desc';
  onSort: (column: StudentSortField) => void;
}) {
  const isActive = sort === column;
  const Icon = !isActive ? ChevronsUpDown : order === 'desc' ? ChevronDown : ChevronUp;
  return (
    <TableHead
      className="whitespace-nowrap"
      aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-[#9B1B30] transition-colors focus:outline-none focus:ring-2 focus:ring-[#9B1B30] focus:ring-offset-1"
      >
        {label}
        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#9B1B30]' : 'text-gray-400'}`} />
      </button>
    </TableHead>
  );
}
