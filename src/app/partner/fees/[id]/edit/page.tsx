'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
import type { PartnerFeeStatus } from '@/lib/partner-fee-mapper';
import { PARTNER_FEE_STATUSES } from '@/lib/partner-fee-mapper';

interface FormData {
  studentName: string;
  description: string;
  amount: string;
  currency: string;
  status: PartnerFeeStatus;
  dueDate: string;
  paidAt: string;
}

export default function PartnerEditFeePage() {
  const params = useParams();
  const router = useRouter();
  const feeId = params.id as string;

  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!feeId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ fee: import('@/lib/partner-fee-mapper').PartnerFee }>(
        `/api/partner/fees/${feeId}`,
      );
      const f = res.fee;
      setFormData({
        studentName: f.studentName,
        description: f.description ?? '',
        amount: String(f.amount),
        currency: f.currency,
        status: f.status,
        dueDate: f.dueDate ?? '',
        paidAt: f.paidAt ?? '',
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load fee.');
    } finally {
      setIsLoading(false);
    }
  }, [feeId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError(null);

    if (!formData.studentName.trim()) {
      setError('Student name is required.');
      return;
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount < 0) {
      setError('Amount must be a non-negative number.');
      return;
    }

    setIsSaving(true);
    try {
      await apiFetchJson(`/api/partner/fees/${feeId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          studentName: formData.studentName.trim(),
          description: formData.description.trim() || null,
          amount,
          currency: formData.currency.trim() || 'CNY',
          status: formData.status,
          dueDate: formData.dueDate || null,
          paidAt: formData.paidAt || null,
        }),
      });
      router.push(`/partner/fees/${feeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setIsSaving(false);
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

  if (loadError || !formData) {
    return (
      <div className="space-y-4">
        <Link href="/partner/fees" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" /> Back to fees
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700">
            <p className="font-medium">Couldn't load fee</p>
            <p className="text-sm">{loadError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/partner/fees/${feeId}`} className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Edit Fee</h1>
          <p className="text-[#4B5563] mt-1 text-sm">{formData.studentName}</p>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="rounded-none">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Fee Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="studentName" className="text-[#1B2A4A] mb-2 block">
                    Student Name <span className="text-red-600">*</span>
                  </Label>
                  <Input id="studentName" name="studentName" value={formData.studentName} onChange={handleInputChange} required className="rounded-none" />
                </div>
                <div>
                  <Label htmlFor="amount" className="text-[#1B2A4A] mb-2 block">
                    Amount <span className="text-red-600">*</span>
                  </Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0" value={formData.amount} onChange={handleInputChange} required className="rounded-none" />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-[#1B2A4A] mb-2 block">Currency</Label>
                  <Input id="currency" name="currency" value={formData.currency} onChange={handleInputChange} className="rounded-none" />
                </div>
                <div>
                  <Label htmlFor="status" className="text-[#1B2A4A] mb-2 block">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => (prev ? { ...prev, status: value as PartnerFeeStatus } : prev))
                    }
                  >
                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARTNER_FEE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate" className="text-[#1B2A4A] mb-2 block">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleInputChange} className="rounded-none" />
                </div>
                <div>
                  <Label htmlFor="paidAt" className="text-[#1B2A4A] mb-2 block">Paid At</Label>
                  <Input id="paidAt" name="paidAt" type="date" value={formData.paidAt} onChange={handleInputChange} className="rounded-none" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description" className="text-[#1B2A4A] mb-2 block">Description</Label>
                  <Input id="description" name="description" value={formData.description} onChange={handleInputChange} className="rounded-none" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Link href={`/partner/fees/${feeId}`}>
            <Button type="button" variant="outline" className="rounded-none" disabled={isSaving}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
