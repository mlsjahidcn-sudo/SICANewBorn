'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePartnerList } from '@/hooks/use-partner-list';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import type { PartnerFee, PartnerFeeStatus } from '@/lib/partner-fee-mapper';

interface AdminPartnerFee extends PartnerFee {
  partnerName: string;
}

const feeStatuses: PartnerFeeStatus[] = [
  'Pending',
  'PendingVerification',
  'Paid',
  'Rejected',
  'Refunded',
];

export default function AdminPartnerFeesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [fees, setFees] = useState<AdminPartnerFee[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { partners, isLoading: partnersLoading } = usePartnerList();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    partnerId: '',
    studentName: '',
    amount: '',
    currency: 'CNY',
    dueDate: '',
    description: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const [verifyFee, setVerifyFee] = useState<AdminPartnerFee | null>(null);
  const [verifyAction, setVerifyAction] = useState<'Paid' | 'Rejected' | 'Pending' | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [deleteFee, setDeleteFee] = useState<AdminPartnerFee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (partnerFilter !== 'all') params.set('partner', partnerFilter);

    apiFetchJson<{ fees: AdminPartnerFee[]; total: number }>(`/api/admin/partner-fees?${params}`, {
      signal: controller.signal,
    })
      .then((d) => {
        setFees(d.fees);
        setTotal(d.total);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load partner fees');
          setFees([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, searchQuery, statusFilter, partnerFilter]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, partnerFilter, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await apiFetchJson('/api/admin/partner-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: createForm.partnerId,
          studentName: createForm.studentName,
          amount: parseFloat(createForm.amount),
          currency: createForm.currency,
          dueDate: createForm.dueDate || undefined,
          description: createForm.description || undefined,
        }),
      });
      setIsCreateOpen(false);
      setCreateForm({
        partnerId: '',
        studentName: '',
        amount: '',
        currency: 'CNY',
        dueDate: '',
        description: '',
      });
      setPage(1);
      // Trigger refetch by bumping a dependency; simplest is reload via router.refresh().
      router.refresh();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fee');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyFee || !verifyAction) return;
    setIsVerifying(true);
    try {
      await apiFetchJson(`/api/admin/partner-fees/${verifyFee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: verifyAction }),
      });
      setFees((prev) =>
        prev.map((f) => (f.id === verifyFee.id ? { ...f, status: verifyAction } : f)),
      );
      setVerifyFee(null);
      setVerifyAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fee');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFee) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/admin/partner-fees/${deleteFee.id}`, { method: 'DELETE' });
      setFees((prev) => prev.filter((f) => f.id !== deleteFee.id));
      setDeleteFee(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fee');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeVariant = (status: PartnerFeeStatus) => {
    switch (status) {
      case 'Paid':
        return 'default';
      case 'PendingVerification':
        return 'secondary';
      case 'Pending':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      case 'Refunded':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: PartnerFeeStatus) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PendingVerification':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'Pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const pendingAmount = fees
    .filter((f) => f.status === 'Pending' || f.status === 'PendingVerification')
    .reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidAmount = fees
    .filter((f) => f.status === 'Paid')
    .reduce((sum, f) => sum + (f.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Partner Service Fees</h1>
          <p className="text-gray-600">Define and verify service fees charged to partners per student</p>
        </div>
        <Button className="bg-[#9B1B30] hover:bg-[#7A1625] text-white" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Fee
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending / Awaiting Verification</CardDescription>
            <CardTitle className="text-2xl text-amber-600">¥{pendingAmount.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            From {fees.filter((f) => f.status === 'Pending' || f.status === 'PendingVerification').length} fees
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-2xl text-green-600">¥{paidAmount.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            From {fees.filter((f) => f.status === 'Paid').length} fees
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Fees</CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">Across all partners</CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by student name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <select
          value={partnerFilter}
          onChange={(e) => setPartnerFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
        >
          <option value="all">All Partners</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.company_name || p.email}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
        >
          <option value="all">All Status</option>
          {feeStatuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No partner fees found</p>
                    <p className="text-sm">Create a fee for a partner&apos;s student to get started</p>
                  </TableCell>
                </TableRow>
              ) : (
                fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div className="font-medium text-[#1B2A4A]">{fee.partnerName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{fee.studentName}</div>
                      {fee.description && <div className="text-xs text-gray-500">{fee.description}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {fee.currency === 'CNY' ? '¥' : '$'}
                        {fee.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fee.status)}
                        <Badge variant={getStatusBadgeVariant(fee.status)}>{fee.status}</Badge>
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
                          {fee.paymentProofUrl && (
                            <DropdownMenuItem asChild>
                              <a
                                href={`/api/admin/partner-fees/${fee.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </a>
                            </DropdownMenuItem>
                          )}
                          {fee.status === 'PendingVerification' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setVerifyFee(fee);
                                  setVerifyAction('Paid');
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                Verify Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setVerifyFee(fee);
                                  setVerifyAction('Rejected');
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                Reject Payment
                              </DropdownMenuItem>
                            </>
                          )}
                          {fee.status === 'Rejected' && (
                            <DropdownMenuItem
                              onClick={() => {
                                setVerifyFee(fee);
                                setVerifyAction('Pending');
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reset to Pending
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setDeleteFee(fee)}>
                            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                            Delete
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
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Partner Service Fee</DialogTitle>
            <DialogDescription>Define a custom service fee for a partner&apos;s student.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Partner</label>
              <select
                required
                value={createForm.partnerId}
                onChange={(e) => setCreateForm({ ...createForm, partnerId: e.target.value })}
                className="mt-1 h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-sm"
              >
                <option value="">Select partner</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name || p.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Student Name</label>
              <Input
                required
                value={createForm.studentName}
                onChange={(e) => setCreateForm({ ...createForm, studentName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select
                  value={createForm.currency}
                  onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                  className="mt-1 h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-sm"
                >
                  <option value="CNY">CNY</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={createForm.dueDate}
                onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
                disabled={isCreating || partnersLoading}
              >
                {isCreating ? 'Creating...' : 'Create Fee'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verify/Reject Dialog */}
      <Dialog open={!!verifyFee} onOpenChange={(open) => !open && setVerifyFee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {verifyAction === 'Paid' && 'Verify Payment'}
              {verifyAction === 'Rejected' && 'Reject Payment'}
              {verifyAction === 'Pending' && 'Reset Fee'}
            </DialogTitle>
            <DialogDescription>
              {verifyAction === 'Paid' && `Mark the fee for ${verifyFee?.studentName} as paid and verified.`}
              {verifyAction === 'Rejected' && `Reject the uploaded proof for ${verifyFee?.studentName}. The partner can re-upload.`}
              {verifyAction === 'Pending' && `Reset the fee for ${verifyFee?.studentName} to Pending so the partner can upload proof.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyFee(null)}>
              Cancel
            </Button>
            <Button
              className={
                verifyAction === 'Rejected'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#9B1B30] hover:bg-[#7A1625] text-white'
              }
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? 'Saving...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteFee} onOpenChange={(open) => !open && setDeleteFee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Fee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the fee for {deleteFee?.studentName}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFee(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
