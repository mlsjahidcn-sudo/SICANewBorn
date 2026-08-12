'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { currencySymbol, type PartnerFee, type PartnerFeeStatus } from '@/lib/partner-fee-mapper';

interface PartnerFeeWithUrl extends PartnerFee {
  paymentProofDownloadUrl?: string | null;
}

export default function PartnerFeesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [fees, setFees] = useState<PartnerFeeWithUrl[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [uploadFee, setUploadFee] = useState<PartnerFeeWithUrl | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    apiFetchJson<PartnerFeeWithUrl[]>('/api/partner/service-fees', { signal: controller.signal })
      .then((d) => setFees(d))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load service fees');
          setFees([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFee || !selectedFile) return;
    setIsUploading(true);
    try {
      // 1. Get signed upload URL
      const { uploadUrl, storagePath } = await apiFetchJson<{
        uploadUrl: string;
        storagePath: string;
        token: string;
      }>(`/api/partner/service-fees/${uploadFee.id}/upload-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalFileName: selectedFile.name,
          contentType: selectedFile.type,
          size: selectedFile.size,
        }),
      });

      // 2. Upload file directly to Supabase Storage
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      });
      if (!uploadRes.ok) {
        throw new Error('File upload failed');
      }

      // 3. Update fee record with proof path and notes
      await apiFetchJson(`/api/partner/service-fees/${uploadFee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentProofUrl: storagePath, paymentNotes }),
      });

      setFees((prev) =>
        prev.map((f) =>
          f.id === uploadFee.id
            ? { ...f, status: 'PendingVerification' as PartnerFeeStatus, paymentProofUrl: storagePath, paymentNotes }
            : f,
        ),
      );
      setUploadFee(null);
      setSelectedFile(null);
      setPaymentNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload payment proof');
    } finally {
      setIsUploading(false);
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
  const paidAmount = fees.filter((f) => f.status === 'Paid').reduce((sum, f) => sum + (f.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
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
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Service Fees</h1>
        <p className="text-gray-600">View and pay service fees for your students</p>
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
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl text-amber-600">
              {fees.filter((f) => f.status === 'Pending').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">Awaiting payment</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Verification</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {fees.filter((f) => f.status === 'PendingVerification').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">Proof uploaded, awaiting SICA confirmation</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {fees.filter((f) => f.status === 'Paid').length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">Verified payments</CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
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
                  <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No service fees yet</p>
                    <p className="text-sm">SICA will add fees here for your students</p>
                  </TableCell>
                </TableRow>
              ) : (
                fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div className="font-medium text-[#1B2A4A]">{fee.studentName}</div>
                      {fee.description && <div className="text-xs text-gray-500">{fee.description}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {currencySymbol(fee.currency)}
                        {fee.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fee.status)}
                        <Badge variant={getStatusBadgeVariant(fee.status)}>{fee.status}</Badge>
                      </div>
                      {fee.status === 'Rejected' && fee.paymentNotes && (
                        <div className="text-xs text-red-600 mt-1">{fee.paymentNotes}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {['Pending', 'Rejected'].includes(fee.status) && (
                        <Button size="sm" className="bg-[#9B1B30] hover:bg-[#7A1625] text-white" onClick={() => setUploadFee(fee)}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Proof
                        </Button>
                      )}
                      {fee.status === 'PendingVerification' && (
                        <span className="text-sm text-amber-600 flex items-center justify-end gap-1">
                          <AlertCircle className="h-4 w-4" />
                          Awaiting verification
                        </span>
                      )}
                      {fee.status === 'Paid' && (
                        <span className="text-sm text-green-600 flex items-center justify-end gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upload Proof Dialog */}
      <Dialog open={!!uploadFee} onOpenChange={(open) => !open && setUploadFee(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
            <DialogDescription>
              Upload a screenshot or PDF of the offline payment for {uploadFee?.studentName}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Fee</label>
              <div className="mt-1 text-sm text-gray-600">
                {uploadFee?.studentName} — {uploadFee ? currencySymbol(uploadFee.currency) : ''}
                {uploadFee?.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Payment Screenshot / PDF</label>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500 mt-1">Max 10MB. PNG, JPG, WEBP, or PDF.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g., Bank transfer reference #12345"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadFee(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? 'Uploading...' : 'Submit Proof'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
