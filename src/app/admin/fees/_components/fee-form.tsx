'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { useStudentList } from '@/hooks/use-student-list';
import {
  STUDENT_FEE_STATUSES,
  STUDENT_FEE_TYPES,
  STUDENT_FEE_CURRENCIES,
  type StudentFeeType,
  type StudentFeeStatus,
  type StudentFeeCurrency,
} from '@/lib/student-fee-mapper';

export interface FeeFormProps {
  /** When provided, the form is in EDIT mode and prefilled. */
  feeId?: string;
  /** Override submit handler (edit mode only). */
  onSuccess?: (feeId: string) => void;
}

interface ApplicationOption {
  id: string;
  applicationNumber: string | null;
}

interface FeeDetail {
  id: string;
  studentId: string;
  applicationId?: string | null;
  feeType: StudentFeeType;
  description?: string | null;
  amount: number;
  currency: StudentFeeCurrency;
  amountPaid: number;
  dueDate?: string | null;
  paidDate?: string | null;
  status: StudentFeeStatus;
  paymentMethod?: string | null;
  notes?: string | null;
}

export function FeeForm({ feeId, onSuccess }: FeeFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const isEdit = !!feeId;

  const { students, isLoading: studentsLoading } = useStudentList();

  const [studentId, setStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [applicationId, setApplicationId] = useState<string>('');
  const [feeType, setFeeType] = useState<StudentFeeType>('Application');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<StudentFeeCurrency>('CNY');
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<string>('0');
  const [status, setStatus] = useState<StudentFeeStatus>('Pending');

  const [applications, setApplications] = useState<ApplicationOption[]>([]);
  const [loadingFee, setLoadingFee] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Load fee + initial studentId in edit mode
  useEffect(() => {
    if (!feeId) return;
    setLoadingFee(true);
    apiFetchJson<{ fee: FeeDetail }>(`/api/admin/fees/${feeId}`)
      .then((d) => {
        const f = d.fee;
        setStudentId(f.studentId);
        setApplicationId(f.applicationId || '');
        setFeeType(f.feeType);
        setAmount(String(f.amount));
        setCurrency(f.currency);
        setDueDate(f.dueDate || '');
        setDescription(f.description || '');
        setPaymentMethod(f.paymentMethod || '');
        setNotes(f.notes || '');
        setAmountPaid(String(f.amountPaid || 0));
        setStatus(f.status);
      })
      .catch((err) => {
        setError(err.message || t('adminFees.errorLoadFee'));
      })
      .finally(() => setLoadingFee(false));
  }, [feeId, t]);

  // Load applications for the selected student (only when studentId is set)
  useEffect(() => {
    if (!studentId) {
      setApplications([]);
      return;
    }
    let cancelled = false;
    apiFetchJson<{ applications: ApplicationOption[] }>(
      `/api/admin/applications?student=${studentId}&limit=100`,
    )
      .then((d) => {
        if (!cancelled) setApplications(d.applications || []);
      })
      .catch(() => {
        if (!cancelled) setApplications([]);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!studentId) errs.studentId = t('adminFees.errorStudentRequired');
    if (!feeType) errs.feeType = t('adminFees.errorTypeRequired');
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) errs.amount = t('adminFees.errorAmountPositive');
    if (!currency) errs.currency = t('adminFees.errorApplicationOwnership'); // generic i18n reuse
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        studentId,
        applicationId: applicationId || null,
        feeType,
        amount: parseFloat(amount),
        currency,
        amountPaid: parseFloat(amountPaid) || 0,
        dueDate: dueDate || null,
        description: description || null,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        status,
      };

      if (isEdit && feeId) {
        await apiFetch(`/api/admin/fees/${feeId}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSuccess(t('adminFees.updateSuccess'));
        setTimeout(() => {
          if (onSuccess) onSuccess(feeId);
          else router.push(`/admin/fees/${feeId}`);
        }, 800);
      } else {
        const result = await apiFetchJson<{ fee: { id: string } }>(`/api/admin/fees`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setSuccess(t('adminFees.createSuccess'));
        setTimeout(() => {
          if (onSuccess) onSuccess(result.fee.id);
          else router.push(`/admin/fees/${result.fee.id}`);
        }, 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminFees.errorSave'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingFee) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/admin/fees')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('adminFees.detailBackToList')}
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          {isEdit ? t('adminFees.formEditTitle') : t('adminFees.formNewTitle')}
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          {isEdit ? t('adminFees.formEditSubtitle') : t('adminFees.formNewSubtitle')}
        </p>
      </div>

      {error && (
        <Card>
          <CardContent className="p-4 text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}
      {success && (
        <Card>
          <CardContent className="p-4 text-green-600 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>{t('adminFees.detailFeeInfo')}</CardTitle>
            <CardDescription>
              {isEdit && t('adminFees.fieldStudentReadOnlyHint')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label={t('adminFees.fieldStudent')} error={fieldErrors.studentId}>
              {isEdit ? (
                <div className="h-10 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm flex items-center text-gray-700">
                  {(() => {
                    const s = students.find((x) => x.id === studentId);
                    return s
                      ? `${s.firstName} ${s.lastName} — ${s.email}`
                      : studentId;
                  })()}
                </div>
              ) : (
                <>
                  <Input
                    placeholder={t('adminFees.fieldStudentPlaceholder')}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="mb-2"
                  />
                  <select
                    value={studentId}
                    onChange={(e) => {
                      setStudentId(e.target.value);
                      setApplicationId('');
                    }}
                    className="h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-sm"
                  >
                    <option value="">—</option>
                    {(studentsLoading ? students : filteredStudents).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} — {s.email}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </Field>

            <Field label={t('adminFees.fieldApplication')} error={fieldErrors.applicationId}>
              <select
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                disabled={!studentId}
                className="h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-sm disabled:bg-gray-50"
              >
                <option value="">{t('adminFees.fieldApplicationOptional')}</option>
                {applications.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.applicationNumber || a.id}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label={t('adminFees.fieldType')} error={fieldErrors.feeType}>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as StudentFeeType)}
                  disabled={isEdit}
                  className="h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-sm disabled:bg-gray-50"
                >
                  {STUDENT_FEE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t('adminFees.fieldAmount')} error={fieldErrors.amount}>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Field>

              <Field label={t('adminFees.fieldCurrency')} error={fieldErrors.currency}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as StudentFeeCurrency)}
                  className="h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-sm"
                >
                  {STUDENT_FEE_CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label={t('adminFees.fieldAmountPaid')}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </Field>

              <Field label={t('adminFees.fieldDueDate')}>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Field>

              <Field label={t('adminFees.fieldStatus')}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StudentFeeStatus)}
                  className="h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-sm"
                >
                  {STUDENT_FEE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label={t('adminFees.fieldDescription')}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('adminFees.fieldDescriptionPlaceholder')}
                className="w-full min-h-20 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
                rows={3}
              />
            </Field>

            <Field label={t('adminFees.fieldMethod')}>
              <Input
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder={t('adminFees.fieldMethodPlaceholder')}
              />
            </Field>

            <Field label={t('adminFees.fieldNotes')}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('adminFees.fieldNotesPlaceholder')}
                className="w-full min-h-20 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
                rows={3}
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/fees')}>
            {t('adminFees.cancelFee')}
          </Button>
          <Button type="submit" className="bg-[#9B1B30] hover:bg-[#7A1625] text-white" disabled={submitting}>
            {submitting
              ? isEdit
                ? t('adminFees.savingFee')
                : t('adminFees.creatingFee')
              : t('adminFees.saveFee')}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
    </div>
  );
}