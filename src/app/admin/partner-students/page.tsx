'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Eye,
  Link2,
  Trash2,
  ArchiveRestore,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  FolderOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { PartnerStudent, PartnerStudentStatus } from '@/lib/partner-student-mapper';

interface PartnerOrg {
  id: string;
  company_name: string;
}

const STATUS_VARIANTS: Record<PartnerStudentStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  'New': 'secondary',
  'In Progress': 'outline',
  'Applied': 'outline',
  'Accepted': 'default',
  'Rejected': 'destructive',
};

function statusLabel(t: (key: string) => string, status: PartnerStudentStatus): string {
  const keys: Record<PartnerStudentStatus, string> = {
    'New': 'partnerStudents.statusNew',
    'In Progress': 'partnerStudents.statusInProgress',
    'Applied': 'partnerStudents.statusApplied',
    'Accepted': 'partnerStudents.statusAccepted',
    'Rejected': 'partnerStudents.statusRejected',
  };
  return t(keys[status] || status);
}

export default function AdminPartnerStudentsPage() {
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [archivedFilter, setArchivedFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [partners, setPartners] = useState<PartnerOrg[]>([]);

  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sort, setSort] = useState<'created_at' | 'updated_at' | 'student_name'>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [dialogState, setDialogState] = useState<
    | { open: false }
    | { open: true; action: 'archive' | 'restore'; student: PartnerStudent }
  >({ open: false });
  const [actionBusy, setActionBusy] = useState(false);

  // Debounce search input
  useEffect(() => {
    const tm = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(tm);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, archivedFilter, partnerFilter, sort, order]);

  // Load partner orgs for the filter dropdown
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<{ partners: PartnerOrg[] }>('/api/admin/partners?status=all');
        if (!cancelled) setPartners(res.partners || []);
      } catch (err) {
        console.error('[admin/partner-students] partners fetch failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (archivedFilter === 'archived') params.set('archived', 'only');
      else if (archivedFilter === 'all') params.set('archived', 'true');
      if (partnerFilter !== 'all') params.set('partnerId', partnerFilter);
      params.set('sort', sort);
      params.set('order', order);
      params.set('page', String(page));
      params.set('limit', '20');
      const res = await apiFetchJson<{
        students: PartnerStudent[];
        total: number;
        totalPages: number;
      }>(`/api/admin/partner-students?${params.toString()}`);
      setStudents(res.students || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('[admin/partner-students] fetch failed:', err);
      setError(err instanceof Error ? err.message : t('adminPartnerStudents.errorFailedLoad'));
      setStudents([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, archivedFilter, partnerFilter, sort, order, page, t]);

  useEffect(() => {
    void fetchStudents();
  }, [fetchStudents]);

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

  const handleConfirmAction = async () => {
    if (!dialogState.open) return;
    const { action, student } = dialogState;
    setActionBusy(true);
    try {
      const res = await fetch(`/api/admin/partner-students/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: action === 'archive' }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('adminPartnerStudents.errorFailedUpdate'));
      }
      await fetchStudents();
      setDialogState({ open: false });
    } catch (err) {
      console.error('[admin/partner-students] action failed:', err);
      setError(err instanceof Error ? err.message : t('adminPartnerStudents.errorFailedUpdate'));
    } finally {
      setActionBusy(false);
    }
  };

  const linkedCount = students.filter((s) => s.linkedStudentProfileId).length;
  const archivedCount = students.filter((s) => s.archivedAt).length;

  const fromCount = total === 0 ? 0 : (page - 1) * 20 + 1;
  const toCount = Math.min(page * 20, total);

  return (
    <div className="space-y-6">
      <AlertDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) setDialogState({ open: false });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogState.open && dialogState.action === 'archive'
                ? t('adminPartnerStudents.archiveDialogTitle')
                : t('adminPartnerStudents.restoreDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.open && dialogState.action === 'archive'
                ? t('adminPartnerStudents.archiveDialogBody')
                : t('adminPartnerStudents.restoreDialogBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionBusy}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={actionBusy}
              className={
                dialogState.open && dialogState.action === 'archive'
                  ? 'bg-[#9B1B30] hover:bg-[#7a1626]'
                  : 'bg-[#1B2A4A] hover:bg-[#26345A]'
              }
            >
              {actionBusy
                ? t('adminPartnerStudents.buttonRefresh')
                : dialogState.open && dialogState.action === 'archive'
                ? t('adminPartnerStudents.archiveDialogConfirm')
                : t('adminPartnerStudents.restoreDialogConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              {t('adminPartnerStudents.title')}
            </h1>
            <p className="text-[#4B5563] mt-1">{t('adminPartnerStudents.subtitle')}</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchStudents}
            disabled={isLoading}
            className="rounded-md"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {t('adminPartnerStudents.buttonRefresh')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">
              {t('adminPartnerStudents.statTotal')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">
              {t('adminPartnerStudents.statLinked')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{linkedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">
              {t('adminPartnerStudents.statArchived')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{archivedCount}</div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('adminPartnerStudents.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-md"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 rounded-md">
            <SelectValue placeholder={t('adminPartnerStudents.filterStatusPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('adminPartnerStudents.filterAllStatus')}</SelectItem>
            <SelectItem value="New">{t('partnerStudents.statusNew')}</SelectItem>
            <SelectItem value="In Progress">{t('partnerStudents.statusInProgress')}</SelectItem>
            <SelectItem value="Applied">{t('partnerStudents.statusApplied')}</SelectItem>
            <SelectItem value="Accepted">{t('partnerStudents.statusAccepted')}</SelectItem>
            <SelectItem value="Rejected">{t('partnerStudents.statusRejected')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={archivedFilter} onValueChange={(v) => setArchivedFilter(v as typeof archivedFilter)}>
          <SelectTrigger className="w-44 rounded-md">
            <SelectValue placeholder={t('adminPartnerStudents.filterArchivedPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('adminPartnerStudents.filterActiveOnly')}</SelectItem>
            <SelectItem value="archived">{t('adminPartnerStudents.filterArchivedOnly')}</SelectItem>
            <SelectItem value="all">{t('adminPartnerStudents.filterAllArchived')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={partnerFilter} onValueChange={setPartnerFilter}>
          <SelectTrigger className="w-56 rounded-md">
            <SelectValue placeholder={t('adminPartnerStudents.filterPartnerAll')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('adminPartnerStudents.filterPartnerAll')}</SelectItem>
            {partners.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <SortHeader
                    label={t('adminPartnerStudents.colStudent')}
                    column="student_name"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                    {t('adminPartnerStudents.colPartner')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                    {t('adminPartnerStudents.colEmail')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                    {t('adminPartnerStudents.colPhone')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                    {t('adminPartnerStudents.colStatus')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                    {t('adminPartnerStudents.colApplications')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                    {t('adminPartnerStudents.colDocuments')}
                  </th>
                  <SortHeader
                    label={t('adminPartnerStudents.colCreated')}
                    column="created_at"
                    sort={sort}
                    order={order}
                    onSort={handleSort}
                  />
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
                    {t('adminPartnerStudents.colActions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && students.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-[#4B5563]">
                      {t('adminPartnerStudents.buttonRefresh')}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-[#4B5563]">
                      <p className="text-lg font-medium">
                        {debouncedSearch || statusFilter !== 'all' || archivedFilter !== 'active' || partnerFilter !== 'all'
                          ? t('adminPartnerStudents.emptyFiltered')
                          : t('adminPartnerStudents.emptyNone')}
                      </p>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/partner-students/${student.id}`}
                          className="font-medium text-[#1B2A4A] hover:underline"
                        >
                          {student.studentName}
                        </Link>
                        {student.linkedStudentProfileId ? (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {t('adminPartnerStudents.linkedBadge')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {t('adminPartnerStudents.notLinkedBadge')}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#4B5563]">{student.partnerName || '—'}</td>
                      <td className="px-4 py-3 text-sm text-[#4B5563]">{student.studentEmail || '—'}</td>
                      <td className="px-4 py-3 text-sm text-[#4B5563]">{student.studentPhone || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANTS[student.status]} className="rounded-none">
                          {statusLabel(t, student.status)}
                        </Badge>
                        {student.archivedAt && (
                          <span className="ml-2 text-xs text-gray-500 italic">
                            ({t('partnerStudents.archived')})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#4B5563]">{student.applicationCount ?? 0}</td>
                      <td className="px-4 py-3 text-sm text-[#4B5563]">{student.documentCount ?? 0}</td>
                      <td className="px-4 py-3 text-sm text-[#4B5563]">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Link href={`/admin/partner-students/${student.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Link href={`/admin/partner-students/${student.id}?link=true`}>
                              <Link2 className="h-4 w-4" />
                            </Link>
                          </Button>
                          {student.archivedAt ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setDialogState({ open: true, action: 'restore', student })}
                            >
                              <ArchiveRestore className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => setDialogState({ open: true, action: 'archive', student })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-[#4B5563]">
                {t('adminPartnerStudents.paginationShowing', {
                  from: fromCount,
                  to: toCount,
                  total,
                })}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
                >
                  {t('adminPartnerStudents.paginationPrev')}
                </Button>
                <span className="text-sm text-[#4B5563]">
                  {t('adminPartnerStudents.paginationPageOf', { page, total: totalPages })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isLoading}
                >
                  {t('adminPartnerStudents.paginationNext')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

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
    <th className="px-4 py-3 text-left text-sm font-semibold text-[#1B2A4A]">
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
