'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Eye, Edit, Download, Search, MoreHorizontal, Trash2, ArrowUpRight, Minus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { apiFetchJson } from '@/lib/api-client';
import type { PartnerFee, PartnerFeeStatus } from '@/lib/partner-fee-mapper';

const STATUS_VARIANTS: Record<PartnerFeeStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Pending': 'secondary',
  'Paid': 'default',
  'Overdue': 'destructive',
  'Refunded': 'outline',
};

export default function PartnerFeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [fees, setFees] = useState<PartnerFee[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '50');
      const res = await apiFetchJson<{ fees: PartnerFee[]; total: number }>(
        `/api/partner/fees${params.toString() ? `?${params}` : ''}`,
      );
      setFees(res.fees || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fees.');
      setFees([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchFees();
  }, [fetchFees]);

  const handleDelete = (id: string) => {
    setFeeToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!feeToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/fees/${feeToDelete}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      setFees((prev) => prev.filter((f) => f.id !== feeToDelete));
      setTotal((prev) => Math.max(0, prev - 1));
      setShowDeleteModal(false);
      setFeeToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats from a single unfiltered fetch on first mount.
  const [stats, setStats] = useState({
    pending: 0,
    paid: 0,
    overdue: 0,
    totalRevenue: 0,
  });
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<{ fees: PartnerFee[] }>('/api/partner/fees?limit=100');
        if (cancelled) return;
        const all = res.fees || [];
        setStats({
          pending: all.filter((f) => f.status === 'Pending').length,
          paid: all.filter((f) => f.status === 'Paid').length,
          overdue: all.filter((f) => f.status === 'Overdue').length,
          totalRevenue: all
            .filter((f) => f.status === 'Paid')
            .reduce((sum, f) => sum + (f.amount || 0), 0),
        });
      } catch {
        // non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">Delete Fee</h3>
            <p className="text-[#4B5563] mb-6">
              Are you sure you want to delete this fee record? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Fees Management</h1>
            <p className="text-[#4B5563] mt-1">Manage service charges and deposits</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-none" disabled>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]">
              <Link href="/partner/fees/new" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                New Fee
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">
              {stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              <ArrowUpRight className="inline h-4 w-4 text-green-600 mr-1" />
              Paid fees
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.pending}</div>
            <p className="text-sm text-[#4B5563] mt-1">
              <Minus className="inline h-4 w-4 text-[#4B5563] mr-1" />
              Awaiting payment
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.paid}</div>
            <p className="text-sm text-[#4B5563] mt-1">
              <Minus className="inline h-4 w-4 text-[#4B5563] mr-1" />
              Cleared
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#4B5563]">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1B2A4A]">{stats.overdue}</div>
            <p className="text-sm text-[#4B5563] mt-1">
              <Minus className="inline h-4 w-4 text-[#4B5563] mr-1" />
              Past due date
            </p>
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
              placeholder="Search fees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 rounded-none">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Due</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#1B2A4A]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/partner/fees/${fee.id}`}
                        className="font-medium text-[#1B2A4A] hover:underline"
                      >
                        {fee.studentName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">{fee.description || '—'}</td>
                    <td className="px-6 py-4 text-[#1B2A4A]">
                      {fee.amount.toLocaleString()} {fee.currency}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={STATUS_VARIANTS[fee.status]} className="rounded-none">
                        {fee.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-[#4B5563]">
                      {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '—'}
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
                            <Link href={`/partner/fees/${fee.id}`} className="flex items-center cursor-pointer">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/partner/fees/${fee.id}/edit`} className="flex items-center cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(fee.id)}
                            className="text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {fees.length === 0 && !error && !isLoading && (
            <div className="p-12 text-center">
              <div className="text-[#4B5563]">
                <p className="text-lg font-medium">No fees found</p>
                <p className="mt-1">
                  {debouncedSearch || statusFilter !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Click "New Fee" to create your first one.'}
                </p>
              </div>
            </div>
          )}

          {isLoading && fees.length === 0 && (
            <div className="p-12 text-center text-[#4B5563]">Loading…</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
