'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { AdminStudent } from '@/lib/student-mapper';

const PAGE_SIZE = 20;

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

  // Fetch on mount + whenever filters or page change.
  // (Use a single effect so search/status/source/page trigger one fetch
  // each, instead of independent timers.)
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
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
  }, [page, searchQuery, statusFilter, sourceFilter, refreshToken, t]);

  // Debounce search input so we don't fire a request on every keystroke.
  // The `useEffect` above re-runs on `searchQuery` change, but we wrap
  // the setter with a 300ms debounce.
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

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colStudent')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colEmail')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colNationality')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colPhone')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colTargetDegree')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colTargetField')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colSource')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colStatus')}</TableHead>
                  <TableHead className="whitespace-nowrap">{t('adminStudents.colCreated')}</TableHead>
                  <TableHead className="text-right whitespace-nowrap">{t('adminStudents.colActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
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
