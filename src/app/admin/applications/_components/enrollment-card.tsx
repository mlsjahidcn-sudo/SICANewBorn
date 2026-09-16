'use client';

/**
 * Phase 107 / Batch 3 — Enrollment card + Mark-Enrolled dialog.
 *
 * Renders three states:
 *   1. status !== 'Accepted' OR already-enrolled: read-only summary card
 *   2. status === 'Accepted' + not enrolled: button to open the dialog
 *   3. enrolled: read-only summary card with deposit / visa / arrival
 *
 * Admin-only. Uses useI18n() for all chrome.
 */

import React, { useState } from 'react';
import { GraduationCap, CheckCircle2, Loader2, AlertCircle, Calendar, DollarSign, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { ApplicationEnrollment } from '@/lib/application-history-mapper';

const VISA_STATUSES = [
  'Not Started',
  'Documents Pending',
  'Submitted',
  'Approved',
  'Rejected',
] as const;

const CURRENCIES = ['CNY', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'HKD', 'SGD', 'AUD', 'CAD'] as const;

const NOTES_MAX = 2000;

interface EnrollmentCardProps {
  applicationId: string;
  status: string;
  /** Pre-fetched enrollment row (admin detail page renders this on mount). */
  enrollment: ApplicationEnrollment | null;
  /** Reload callback so the parent re-pulls the row after a successful POST. */
  onChanged: () => void | Promise<void>;
}

export function EnrollmentCard({
  applicationId,
  status,
  enrollment,
  onChanged,
}: EnrollmentCardProps) {
  const { t } = useI18n();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAccepted = status === 'Accepted';
  const isEnrolled = !!enrollment;

  if (isEnrolled && enrollment) {
    return (
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            {t('adminAppDetail.enrollmentCardTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label={t('adminAppDetail.enrollmentEnrolledAt')} value={new Date(enrollment.enrolledAt).toLocaleString()} />
          <Row label={t('adminAppDetail.enrollmentDeposit')} value={formatMoney(enrollment.depositAmount, enrollment.depositCurrency)} />
          <Row label={t('adminAppDetail.enrollmentDepositPaidAt')} value={enrollment.depositPaidAt ? new Date(enrollment.depositPaidAt).toLocaleString() : '—'} />
          <Row label={t('adminAppDetail.enrollmentVisa')} value={enrollment.visaStatus} />
          <Row label={t('adminAppDetail.enrollmentArrival')} value={enrollment.arrivalDate ?? '—'} />
          {enrollment.notes && <Row label={t('adminAppDetail.enrollmentNotes')} value={enrollment.notes} />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <GraduationCap className="h-4 w-4 text-[#1B2A4A]" />
          {t('adminAppDetail.enrollmentCardTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isAccepted ? (
          <div className="space-y-2">
            <p className="text-sm text-[#4B5563]">{t('adminAppDetail.enrollmentNotYet')}</p>
            <Button
              size="sm"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                setError(null);
                setDialogOpen(true);
              }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {t('adminAppDetail.enrollmentMarkBtn')}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-[#4B5563]">{t('adminAppDetail.enrollmentNotYet')}</p>
        )}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
      {dialogOpen && (
        <MarkEnrolledDialog
          applicationId={applicationId}
          onClose={() => setDialogOpen(false)}
          onEnrolled={async () => {
            setDialogOpen(false);
            await onChanged();
          }}
          onError={(msg) => setError(msg)}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div className="text-xs text-[#4B5563] col-span-1">{label}</div>
      <div className="col-span-2 text-[#1F2937]">{value}</div>
    </div>
  );
}

function formatMoney(amount: number | null, currency: string | null): string {
  if (amount === null) return '—';
  const c = currency ?? 'CNY';
  return `${c} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

interface MarkEnrolledDialogProps {
  applicationId: string;
  onClose: () => void;
  onEnrolled: () => void | Promise<void>;
  onError: (msg: string) => void;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
}

function MarkEnrolledDialog({
  applicationId,
  onClose,
  onEnrolled,
  onError,
  submitting,
  setSubmitting,
}: MarkEnrolledDialogProps) {
  const { t } = useI18n();
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositCurrency, setDepositCurrency] = useState<string>('CNY');
  const [depositPaidAt, setDepositPaidAt] = useState<string>('');
  const [visaStatus, setVisaStatus] = useState<string>('Not Started');
  const [arrivalDate, setArrivalDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [internal, setInternal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await apiFetchJson(`/api/admin/applications/${applicationId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({
          deposit_amount: depositAmount || null,
          deposit_currency: depositCurrency,
          deposit_paid_at: depositPaidAt || null,
          visa_status: visaStatus,
          arrival_date: arrivalDate || null,
          notes: notes || null,
          internal,
        }),
      });
      await onEnrolled();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('common.error');
      // Map known 409 to a clearer message.
      if (msg.includes('already enrolled') || msg.includes('ALREADY_ENROLLED')) {
        onError(t('adminAppDetail.enrollmentAlreadyEnrolled'));
      } else if (msg.toLowerCase().includes('accepted')) {
        onError(t('adminAppDetail.enrollmentErrorNotAccepted'));
      } else {
        onError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4"
      >
        <h2 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          {t('adminAppDetail.enrollmentDialogTitle')}
        </h2>
        <p className="text-sm text-[#4B5563]">{t('adminAppDetail.enrollmentDialogBody')}</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-gray-700 block mb-1">
              {t('adminAppDetail.enrollmentFieldDepositAmount')}
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-700 block mb-1">
              {t('adminAppDetail.enrollmentFieldDepositCurrency')}
            </Label>
            <Select value={depositCurrency} onValueChange={setDepositCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-700 block mb-1">
            {t('adminAppDetail.enrollmentFieldDepositPaidAt')}
          </Label>
          <Input
            type="date"
            value={depositPaidAt}
            onChange={(e) => setDepositPaidAt(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-700 block mb-1">
            {t('adminAppDetail.enrollmentFieldVisaStatus')}
          </Label>
          <Select value={visaStatus} onValueChange={setVisaStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISA_STATUSES.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-700 block mb-1">
            {t('adminAppDetail.enrollmentFieldArrivalDate')}
          </Label>
          <Input
            type="date"
            value={arrivalDate}
            onChange={(e) => setArrivalDate(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-700 block mb-1">
            {t('adminAppDetail.enrollmentFieldNotes')}
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, NOTES_MAX))}
            rows={3}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {notes.length}/{NOTES_MAX}
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={internal}
            onChange={(e) => setInternal(e.target.checked)}
            className="mt-1"
          />
          <span className="text-[#1F2937]">{t('adminAppDetail.enrollmentFieldInternal')}</span>
        </label>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            {t('adminAppDetail.enrollmentSubmit')}
          </Button>
        </div>
      </form>
    </div>
  );
}