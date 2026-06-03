'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson } from '@/lib/api-client';
import type { PartnerFee, PartnerFeeStatus } from '@/lib/partner-fee-mapper';

const STATUS_VARIANTS: Record<PartnerFeeStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Pending': 'secondary',
  'Paid': 'default',
  'Overdue': 'destructive',
  'Refunded': 'outline',
};

export default function PartnerFeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const feeId = params.id as string;

  const [fee, setFee] = useState<PartnerFee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!feeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ fee: PartnerFee }>(`/api/partner/fees/${feeId}`);
      setFee(res.fee);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fee.');
    } finally {
      setIsLoading(false);
    }
  }, [feeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/fees/${feeId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      router.push('/partner/fees');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse w-48" />
        <div className="h-64 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (error && !fee) {
    return (
      <div className="space-y-4">
        <Link href="/partner/fees" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" /> Back to fees
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Couldn't load fee</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fee) return null;

  return (
    <div className="space-y-6">
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">Delete Fee</h3>
            <p className="text-[#4B5563] mb-6">
              Delete this fee record for <strong>{fee.studentName}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/partner/fees" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{fee.studentName}</h1>
            <Badge variant={STATUS_VARIANTS[fee.status]} className="rounded-none">
              {fee.status}
            </Badge>
          </div>
          <p className="text-[#4B5563] mt-1 text-sm">
            <DollarSign className="inline h-4 w-4 -mt-0.5" />
            {fee.amount.toLocaleString()} {fee.currency}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-none">
            <Link href={`/partner/fees/${fee.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDelete(true)}
            className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">Amount</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Amount" value={`${fee.amount.toLocaleString()} ${fee.currency}`} />
            <Field label="Status" value={fee.status} />
            <Field label="Description" value={fee.description} />
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field
              label="Due Date"
              value={fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : null}
            />
            <Field
              label="Paid At"
              value={fee.paidAt ? new Date(fee.paidAt).toLocaleDateString() : null}
            />
            <Field
              label="Created"
              value={fee.createdAt ? new Date(fee.createdAt).toLocaleString() : null}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className="font-medium text-[#1F2937]">{value || '—'}</span>
    </div>
  );
}
