'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  AlertTriangle,
  ExternalLink,
  Calendar,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { StudentFee, StudentFeeStatus } from '@/lib/student-fee-mapper';
import { currencySymbol } from '@/lib/currency';
import { FeeTimelineTab } from '../_components/timeline-tab';

interface JoinedStudent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface JoinedApplication {
  id: string;
  applicationNumber: string | null;
  universitySlug: string | null;
  programSlug: string | null;
}

type DetailFee = StudentFee & {
  student?: JoinedStudent | null;
  application?: JoinedApplication | null;
};

const STATUS_VARIANT: Record<StudentFeeStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Paid: 'default',
  Partial: 'secondary',
  Pending: 'outline',
  Overdue: 'destructive',
  Cancelled: 'outline',
};

function StatusBadge({ status }: { status: StudentFeeStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>;
}

export default function AdminFeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useI18n();
  const router = useRouter();
  const [fee, setFee] = useState<DetailFee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<StudentFeeStatus | 'cancel' | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');

  useEffect(() => {
    let cancelled = false;
    params.then(({ id }) => {
      apiFetchJson<{ fee: DetailFee }>(`/api/admin/fees/${id}`)
        .then((d) => {
          if (!cancelled) setFee(d.fee);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message || t('adminFees.detailErrorLoad'));
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [params, t]);

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/admin/fees')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('adminFees.detailBackToList')}
        </Button>
        <Card>
          <CardContent className="p-6 text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fee) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const handleAction = async (
    action: 'markPaid' | 'markPartial' | 'cancel',
    newStatus: StudentFeeStatus | null,
  ) => {
    setActionPending(action === 'cancel' ? 'cancel' : newStatus);
    try {
      if (action === 'cancel') {
        await apiFetch(`/api/admin/fees/${fee.id}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/api/admin/fees/${fee.id}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            status: newStatus,
            amount_paid:
              newStatus === 'Paid' ? fee.amount : newStatus === 'Partial' ? fee.amountPaid || 0 : 0,
          }),
        });
      }
      // Refetch to pick up server-stamped updated_at etc.
      const fresh = await apiFetchJson<{ fee: DetailFee }>(`/api/admin/fees/${fee.id}`);
      setFee(fresh.fee);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminFees.detailErrorAction'));
    } finally {
      setActionPending(null);
    }
  };

  const remaining = Math.max(0, fee.amount - (fee.amountPaid || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/fees')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('adminFees.detailBackToList')}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/admin/fees/${fee.id}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          {t('adminFees.detailEdit')}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            {currencySymbol(fee.currency)}
            {fee.amount.toLocaleString()} <span className="text-base font-normal text-gray-500">{fee.currency}</span>
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            <Hash className="h-3 w-3 inline mr-1" />
            {fee.id}
          </p>
        </div>
        <StatusBadge status={fee.status} />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'timeline')}>
        <TabsList>
          <TabsTrigger value="overview">{t('adminFees.detailTabOverview')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('adminFees.detailTabTimeline')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('adminFees.detailFeeInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label={t('adminFees.detailDescription')}>{fee.description || '—'}</Field>
                <Field label={t('adminFees.detailAmount')}>
                  {currencySymbol(fee.currency)}
                  {fee.amount.toLocaleString()} {fee.currency}
                </Field>
                <Field label={t('adminFees.detailPaid')}>
                  {currencySymbol(fee.currency)}
                  {(fee.amountPaid || 0).toLocaleString()}
                </Field>
                {remaining > 0 && fee.status !== 'Paid' && (
                  <Field label={t('adminFees.detailRemaining')}>
                    <span className="text-amber-600">
                      {currencySymbol(fee.currency)}
                      {remaining.toLocaleString()}
                    </span>
                  </Field>
                )}
                <Field label={t('adminFees.detailDueDate')}>
                  {fee.dueDate ? (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </span>
                  ) : (
                    '—'
                  )}
                </Field>
                <Field label={t('adminFees.detailPaidDate')}>
                  {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : '—'}
                </Field>
                <Field label={t('adminFees.detailPaymentMethod')}>{fee.paymentMethod || '—'}</Field>
                <Field label={t('adminFees.detailNotes')}>
                  <span className="whitespace-pre-wrap">{fee.notes || '—'}</span>
                </Field>
                <Field label={t('adminFees.detailCreatedAt')}>
                  {fee.createdAt ? new Date(fee.createdAt).toLocaleString() : '—'}
                </Field>
                <Field label={t('adminFees.detailUpdatedAt')}>
                  {fee.updatedAt ? new Date(fee.updatedAt).toLocaleString() : '—'}
                </Field>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('adminFees.detailStudent')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  {fee.student ? (
                    <>
                      <div className="font-medium text-[#1B2A4A]">
                        {fee.student.firstName} {fee.student.lastName}
                      </div>
                      <div className="text-gray-600">{fee.student.email}</div>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-1"
                        onClick={() => router.push(`/admin/students/${fee.student!.id}`)}
                      >
                        {t('adminFees.detailStudent')}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </>
                  ) : (
                    '—'
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('adminFees.detailApplication')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {fee.application ? (
                    <>
                      <div className="font-medium">
                        {fee.application.applicationNumber || fee.application.id}
                      </div>
                      {fee.application.universitySlug && (
                        <div className="text-gray-600">{fee.application.universitySlug}</div>
                      )}
                      {fee.application.programSlug && (
                        <div className="text-gray-600">{fee.application.programSlug}</div>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto mt-1"
                        onClick={() => router.push(`/admin/applications/${fee.application!.id}`)}
                      >
                        {t('adminFees.detailApplication')}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </>
                  ) : (
                    t('adminFees.detailNoApplication')
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('adminFees.detailActions')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {fee.status !== 'Paid' && fee.status !== 'Cancelled' && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={actionPending !== null}
                      onClick={() => handleAction('markPaid', 'Paid')}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {actionPending === 'Paid'
                        ? '...'
                        : t('adminFees.detailMarkPaid')}
                    </Button>
                  )}
                  {fee.status !== 'Partial' && fee.status !== 'Paid' && fee.status !== 'Cancelled' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={actionPending !== null}
                      onClick={() => handleAction('markPartial', 'Partial')}
                    >
                      {actionPending === 'Partial'
                        ? '...'
                        : t('adminFees.detailMarkPartial')}
                    </Button>
                  )}
                  {fee.status !== 'Cancelled' && (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      disabled={actionPending !== null}
                      onClick={() => handleAction('cancel', null)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {actionPending === 'cancel' ? '...' : t('adminFees.detailCancel')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>{t('adminFees.detailTabTimeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <FeeTimelineTab feeId={fee.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-gray-500 col-span-1">{label}</div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}