'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, DollarSign, CheckCircle, Clock, AlertCircle, ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useStudentList } from '@/hooks/use-student-list';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  STUDENT_FEE_STATUSES,
  STUDENT_FEE_TYPES,
  type StudentFee,
  type StudentFeeStatus,
  type StudentFeeType,
} from '@/lib/student-fee-mapper';
import { currencySymbol } from '@/lib/currency';

type AdminFee = StudentFee & {
  studentName: string;
  studentEmail: string;
};

export default function AdminFeesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [fees, setFees] = useState<AdminFee[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { students, isLoading: studentsLoading } = useStudentList();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);
  const [feeToCancel, setFeeToCancel] = useState<AdminFee | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (typeFilter !== 'all') params.set('feeType', typeFilter);
    if (studentFilter !== 'all') params.set('student', studentFilter);

    apiFetchJson<{ fees: AdminFee[]; total: number; totalPages: number }>(`/api/admin/fees?${params}`, {
      signal: controller.signal,
    })
      .then((d) => {
        setFees(d.fees);
        setTotal(d.total);
        setTotalPages(d.totalPages ?? Math.ceil((d.total || 0) / 20));
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load fees');
          setFees([]);
          setTotal(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, searchQuery, statusFilter, typeFilter, studentFilter]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, studentFilter, searchQuery]);

  const confirmCancel = async () => {
    if (!feeToCancel) return;
    setIsCancelling(feeToCancel.id);
    try {
      await apiFetch(`/api/admin/fees/${feeToCancel.id}`, { method: 'DELETE' });
      setFees((prev) => prev.map((f) => (f.id === feeToCancel.id ? { ...f, status: 'Cancelled' } : f)));
      setFeeToCancel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminFees.errorCancel'));
    } finally {
      setIsCancelling(null);
    }
  };

  const getStatusBadgeVariant = (status: StudentFeeStatus) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'Partial':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Overdue':
        return 'destructive';
      case 'Cancelled':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: StudentFeeStatus) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    const matchesType = typeFilter === 'all' || fee.feeType === typeFilter;
    const matchesStudent = studentFilter === 'all' || fee.studentId === studentFilter;
    return matchesSearch && matchesStatus && matchesType && matchesStudent;
  });

  const totalRevenue = fees
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + (f.amountPaid || 0), 0);
  
  const pendingAmount = fees
    .filter(f => f.status === 'Pending' || f.status === 'Partial')
    .reduce((sum, f) => sum + (f.amount - (f.amountPaid || 0)), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>

        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('adminFees.title')}</h1>
          <p className="text-gray-600">{t('adminFees.subtitle')}</p>
        </div>
        <Button
          className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
          onClick={() => router.push('/admin/fees/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('adminFees.addFee')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('adminFees.kpiRevenue')}</CardDescription>
            <CardTitle className="text-2xl text-green-600">¥{totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center text-sm text-gray-600">
            <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
            {t('adminFees.kpiRevenueDesc')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('adminFees.kpiPendingAmount')}</CardDescription>
            <CardTitle className="text-2xl text-amber-600">¥{pendingAmount.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1 text-amber-500" />
            {t('adminFees.kpiPendingAmountDesc')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('adminFees.kpiPaidCount')}</CardDescription>
            <CardTitle className="text-2xl">
              {fees.filter(f => f.status === 'Paid').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {t('adminFees.kpiPaidCountDesc')}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('adminFees.kpiPendingCount')}</CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {fees.filter(f => f.status === 'Pending' || f.status === 'Partial').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {t('adminFees.kpiPendingCountDesc')}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('adminFees.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={studentFilter}
          onChange={(e) => setStudentFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
        >
          <option value="all">{t('adminFees.allStudents')}</option>
          {students.map(student => (
            <option key={student.id} value={student.id}>
              {student.firstName} {student.lastName}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
        >
          <option value="all">{t('adminFees.allStatus')}</option>
          {STUDENT_FEE_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
        >
          <option value="all">{t('adminFees.allTypes')}</option>
          {STUDENT_FEE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('adminFees.colStudent')}</TableHead>
                <TableHead>{t('adminFees.colType')}</TableHead>
                <TableHead>{t('adminFees.colAmount')}</TableHead>
                <TableHead>{t('adminFees.colPaid')}</TableHead>
                <TableHead>{t('adminFees.colDue')}</TableHead>
                <TableHead>{t('adminFees.colStatus')}</TableHead>
                <TableHead className="text-right">{t('adminFees.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">{t('adminFees.empty')}</p>
                    <p className="text-sm">{t('adminFees.emptyHint')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFees.map(fee => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-[#1B2A4A]">
                          {fee.studentName}
                        </div>
                        {fee.paymentMethod && (
                          <div className="text-xs text-gray-500">
                            {t('adminFees.viaPrefix')} {fee.paymentMethod}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{fee.feeType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {currencySymbol(fee.currency)}{fee.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {fee.currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={fee.amountPaid === fee.amount ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                        {currencySymbol(fee.currency)}{(fee.amountPaid || 0).toLocaleString()}
                      </div>
                      {fee.amountPaid && fee.amountPaid < fee.amount && (
                        <div className="text-xs text-amber-600">
                          {currencySymbol(fee.currency)}
                          {(fee.amount - fee.amountPaid).toLocaleString()} {t('adminFees.remaining')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '—'}
                      {fee.status === 'Overdue' && (
                        <div className="text-xs text-red-500">{t('adminFees.overdueInline')}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fee.status)}
                        <Badge variant={getStatusBadgeVariant(fee.status)}>
                          {fee.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/fees/${fee.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t('adminFees.actionView')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/fees/${fee.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('adminFees.actionEdit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('adminFees.actionDelete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardContent className="flex items-center justify-between border-t px-4 py-3 text-sm text-gray-600">
          <div>
            {t('adminFees.paginationSummary', {
              from: fees.length === 0 ? 0 : (page - 1) * 20 + 1,
              to: (page - 1) * 20 + fees.length,
              total: total.toLocaleString(),
            })}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label={t('adminFees.paginationPrev')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('adminFees.paginationPrev')}
            </Button>
            <span className="text-gray-700">
              {t('adminFees.paginationPageOf', { page, totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label={t('adminFees.paginationNext')}
            >
              {t('adminFees.paginationNext')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
