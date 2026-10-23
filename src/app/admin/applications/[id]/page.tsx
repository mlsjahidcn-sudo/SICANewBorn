'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Edit, Loader2, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Field as FormField, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PageContainer } from '@/components/admin/page-container';
import { ApplicationStatusDialog, type ApplicationStatusOptions } from '@/components/admin/application-status-dialog';
import { MissingDocumentsRequest } from '@/components/admin/missing-documents-request';
import { DocumentsTab } from '../_components/documents-tab';
import { NotesTab } from '../_components/notes-tab';
import { TimelineTab } from '../_components/timeline-tab';
import { EnrollmentCard } from '../_components/enrollment-card';
import { ApplicationPaymentCard } from '../_components/application-payment-card';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { APPLICATION_STATUSES, type AdminApplication, type ApplicationStatus } from '@/lib/application-mapper';
import type { ApplicationEnrollment } from '@/lib/application-history-mapper';
import type { PaymentAggregate } from '@/lib/payment-aggregate';
import { applicationReturnTo, applicationDetailHref } from '@/lib/admin-application-navigation';
import { statusColorClass } from '@/lib/application-status';
import { useI18n } from '@/lib/i18n';
import { useUrlState } from '@/hooks/use-url-state';

interface ReviewApplication extends AdminApplication { archivedAt?: string | null }
interface DetailResponse { application: ReviewApplication; payment: PaymentAggregate | null; paymentError?: string | null }
const TAB_VALUES = ['overview', 'documents', 'notes', 'timeline'] as const;
type AppTab = (typeof TAB_VALUES)[number];

const NEXT_STEP: Record<string, { hint: string; label: string; tab?: AppTab; status?: ApplicationStatus; edit?: boolean; enrollment?: boolean }> = {
  Draft: { hint: 'draftHint', label: 'editApplication', edit: true },
  Submitted: { hint: 'submittedHint', label: 'startReview', status: 'Under Review' },
  'Under Review': { hint: 'reviewHint', label: 'reviewDocuments', tab: 'documents' },
  'Documents Requested': { hint: 'requestedHint', label: 'reviewDocuments', tab: 'documents' },
  'Decision Made': { hint: 'decisionHint', label: 'changeStatus' },
  Accepted: { hint: 'acceptedHint', label: 'reviewEnrollment', enrollment: true },
  Rejected: { hint: 'rejectedHint', label: 'reviewNotes', tab: 'notes' },
  Withdrawn: { hint: 'withdrawnHint', label: 'reopen', status: 'Submitted' },
};

export default function AdminApplicationDetailPage(): React.ReactNode {
  const { id: routeId } = useParams();
  const id = String(routeId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = applicationReturnTo(searchParams.get('returnTo'));
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useUrlState<AppTab>('tab', 'overview', {
    searchParams, coerce: raw => TAB_VALUES.includes(raw as AppTab) ? raw as AppTab : undefined,
  });
  const [visitedTabs, setVisitedTabs] = useState<Set<AppTab>>(() => new Set([activeTab]));
  const changeTab = (tab: AppTab): void => { setVisitedTabs(prev => new Set([...prev, tab])); setActiveTab(tab); };
  const [app, setApp] = useState<ReviewApplication | null>(null);
  const [payment, setPayment] = useState<PaymentAggregate | null>(null);
  const [enrollment, setEnrollment] = useState<ApplicationEnrollment | null>(null);
  const [enrollmentError, setEnrollmentError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [confirmStatus, setConfirmStatus] = useState<ApplicationStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [lifecycleError, setLifecycleError] = useState<string | null>(null);
  const [lifecyclePending, setLifecyclePending] = useState(false);
  const [resyncing, setResyncing] = useState(false);
  const [resyncNote, setResyncNote] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  // Keep navigation outside the fetch callback's dependency list: a URL-only
  // tab change must not reload the entire application or discard a note draft.
  const navigation = useRef({ router, returnTo });
  useEffect(() => { navigation.current = { router, returnTo }; }, [router, returnTo]);

  const load = useCallback(async (): Promise<void> => {
    const current = ++requestId.current;
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    setIsLoading(true); setError(null); setNotFound(false);
    try {
      const [detail, enrollmentResult] = await Promise.allSettled([
        apiFetchJson<DetailResponse>(`/api/admin/applications/${id}`, { signal: abort.signal }),
        apiFetchJson<{ enrollment: ApplicationEnrollment | null }>(`/api/admin/applications/${id}/enrollment`, { signal: abort.signal }),
      ]);
      if (current !== requestId.current || abort.signal.aborted) return;
      if (detail.status === 'rejected') throw detail.reason;
      setApp(detail.value.application);
      setSelectedStatus(detail.value.application.status);
      setPayment(detail.value.paymentError ? null : detail.value.payment ?? null);
      setEnrollmentError(enrollmentResult.status === 'rejected');
      setEnrollment(enrollmentResult.status === 'fulfilled' ? enrollmentResult.value.enrollment : null);
    } catch (failure) {
      if (current !== requestId.current || abort.signal.aborted) return;
      const detailError = failure as { status?: number; message?: string };
      if (detailError.status === 404) {
        try {
          const probe = await apiFetch(`/api/admin/partner-applications/${id}`, { signal: abort.signal });
          if (current !== requestId.current || abort.signal.aborted) return;
          if (probe.ok) {
            navigation.current.router.replace(applicationDetailHref(id, 'partner', navigation.current.returnTo));
            return;
          }
        } catch { /* Show the original not-found result. */ }
        setNotFound(true);
      } else setError(detailError.message || 'Could not load application');
    } finally {
      if (current === requestId.current && !abort.signal.aborted) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setApp(null); setVisitedTabs(new Set([activeTab])); setFeedback(null);
    void load();
    return () => { requestId.current += 1; controller.current?.abort(); };
    // Tab changes preserve the application and its in-progress note draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, load]);

  const openStatus = (status: ApplicationStatus): void => { setStatusError(null); setConfirmStatus(status); };
  const saveStatus = async (options: ApplicationStatusOptions): Promise<void> => {
    if (!app || updating) return;
    setUpdating(true); setStatusError(null);
    try {
      await apiFetchJson(`/api/admin/applications/${app.id}`, {
        method: 'PATCH', body: JSON.stringify({ status: confirmStatus, notify_applicant: options.notifyApplicant,
          applicant_note: options.applicantNote || undefined, notes: options.internalNote || undefined, internal: true }),
      });
      setApp(prev => prev ? { ...prev, status: confirmStatus ?? prev.status } : prev);
      setConfirmStatus(null); setFeedback(t('adminAppReview.statusSaved')); setRefreshKey(n => n + 1);
      await load();
    } catch (failure) { setStatusError(failure instanceof Error ? failure.message : 'Could not update status'); }
    finally { setUpdating(false); }
  };

  const saveLifecycle = async (): Promise<void> => {
    if (!app || lifecyclePending) return;
    setLifecyclePending(true); setLifecycleError(null);
    try {
      const response = await apiFetch(`/api/admin/applications/${app.id}`, app.archivedAt
        ? { method: 'PATCH', body: JSON.stringify({ action: 'restoreArchive' }) } : { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error || 'Could not save application');
      }
      setLifecycleOpen(false);
      if (app.archivedAt) { await load(); setFeedback(t('adminAppReview.recoverySaved')); }
      else router.push(returnTo);
    } catch (failure) { setLifecycleError(failure instanceof Error ? failure.message : 'Could not save application'); }
    finally { setLifecyclePending(false); }
  };

  const resync = async (): Promise<void> => {
    if (!app || resyncing) return;
    setResyncing(true); setResyncNote(null);
    try {
      const result = await apiFetchJson<{ updated: number; withUnresolved: number }>('/api/admin/applications/resync', { method: 'POST', body: JSON.stringify({ id: app.id }) });
      setResyncNote(t(result.updated > 0 ? 'adminAppReview.syncUpdated' : result.withUnresolved > 0 ? 'adminAppReview.syncUnresolved' : 'adminAppReview.syncCurrent'));
      if (result.updated > 0) await load();
    } catch (failure) { setResyncNote(failure instanceof Error ? failure.message : 'Catalog sync failed'); }
    finally { setResyncing(false); }
  };

  const back = <Button variant="ghost" className="rounded-none self-start" onClick={() => router.push(returnTo)}><ArrowLeft data-icon="inline-start" />{t('adminAppReview.back')}</Button>;
  if (isLoading && !app) return <PageContainer width="default">{back}<Skeleton className="h-24 w-full" /><div className="grid gap-5 lg:grid-cols-3"><Skeleton className="h-96 lg:col-span-2" /><Skeleton className="h-72" /></div></PageContainer>;
  if (notFound || !app) return <PageContainer width="default">{back}<Alert className="rounded-none" variant="destructive"><AlertTitle>{notFound ? 'Application not found' : t('common.error')}</AlertTitle><AlertDescription>{error}<Button variant="outline" onClick={() => void load()}>{t('common.retry')}</Button></AlertDescription></Alert></PageContainer>;

  const blocked = Boolean(app.archivedAt) || updating || isLoading;
  const next = NEXT_STEP[app.status] ?? NEXT_STEP['Under Review'];
  const date = (value: string | null | undefined): string => value && !Number.isNaN(Date.parse(value)) ? new Date(value).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : t('adminAppReview.notRecorded');
  const editHref = `/admin/applications/${app.id}/edit?${new URLSearchParams({ returnTo })}`;
  const takeNextStep = (): void => {
    if (next.edit) router.push(editHref);
    else if (next.status) openStatus(next.status);
    else if (next.tab) changeTab(next.tab);
    else document.getElementById(next.enrollment ? 'application-enrollment' : 'application-status')?.focus();
  };

  return <PageContainer width="default">
    {back}
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('adminAppReview.reviewTitle')}</p>
        <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight text-[#1B2A4A]">{app.studentName}</h1>
        <p className="mt-2 break-words text-sm text-muted-foreground">{app.university} · {app.program}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`rounded-none ${statusColorClass(app.status)}`}>{app.status}</Badge>
          <span className="font-mono text-xs text-muted-foreground">{app.applicationNumber || app.id.slice(0, 8)}</span>
          {app.intake && <span className="text-xs text-muted-foreground">{app.intake}</span>}
          <Badge variant="secondary" className="rounded-none">{app.source}</Badge>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-none" onClick={() => { void load(); setRefreshKey(n => n + 1); }} disabled={isLoading}><RefreshCw data-icon="inline-start" className={isLoading ? 'animate-spin' : ''} />{t('adminAppReview.refresh')}</Button>
        <Button className="rounded-none bg-[#1B2A4A] text-white hover:bg-[#152138]" onClick={() => router.push(editHref)} disabled={blocked}><Edit data-icon="inline-start" />{t('adminAppReview.edit')}</Button>
        <Button variant="outline" className="rounded-none" disabled={isLoading || lifecyclePending} onClick={() => { setLifecycleError(null); setLifecycleOpen(true); }}>
          {app.archivedAt ? <RotateCcw data-icon="inline-start" /> : <Trash2 data-icon="inline-start" />}{t(app.archivedAt ? 'adminAppReview.restore' : 'adminAppReview.delete')}
        </Button>
      </div>
    </header>
    {feedback && <Alert role="status" className="rounded-none"><AlertDescription>{feedback}</AlertDescription></Alert>}
    {error && <Alert variant="destructive" className="rounded-none"><AlertTitle>{t('adminAppReview.refreshFailed')}</AlertTitle><AlertDescription>{error}<Button variant="outline" size="sm" onClick={() => void load()}>{t('common.retry')}</Button></AlertDescription></Alert>}
    {app.archivedAt ? <Alert className="rounded-none"><AlertTitle>{t('adminAppReview.archived')}</AlertTitle><AlertDescription>{t('adminAppReview.archivedHint')}</AlertDescription></Alert> : <Card className="rounded-none gap-3 py-4 shadow-none border-l-2 border-l-[#9B1B30]">
      <CardHeader><CardTitle className="text-sm">{t('adminAppReview.nextStep')}</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4"><p className="max-w-prose text-sm text-muted-foreground">{t(`adminAppReview.${next.hint}`)}</p><Button variant="outline" className="rounded-none" disabled={blocked} onClick={takeNextStep}>{t(`adminAppReview.${next.label}`)}<ArrowRight data-icon="inline-end" /></Button></CardContent>
    </Card>}
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <Tabs value={activeTab} onValueChange={value => changeTab(value as AppTab)}>
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-none sm:grid-cols-4">
            {TAB_VALUES.map(tab => <TabsTrigger key={tab} className="rounded-none py-2.5" value={tab}>{t(`adminAppDetail.tab${tab === 'timeline' ? 'Timeline' : tab[0].toUpperCase() + tab.slice(1)}`)}</TabsTrigger>)}
          </TabsList>
          <TabsContent value="overview" className="mt-3 flex flex-col gap-4">
            <Card className="rounded-none gap-4 py-5 shadow-none"><CardHeader><CardTitle className="text-base">{t('adminAppReview.applicantInfo')}</CardTitle></CardHeader><CardContent className="flex flex-col gap-4">
              <dl className="grid gap-4 sm:grid-cols-2"><Field label={t('adminAppReview.name')} value={app.studentName} /><Field label={t('adminAppReview.email')} value={app.studentEmail} /><Field label={t('adminAppReview.passport')} value={app.studentPassportNumber} /><Field label={t('adminAppReview.source')} value={app.source} /></dl>
              {app.studentId ? <Link href={`/admin/students/${app.studentId}`} className="text-sm text-[#1B2A4A] underline underline-offset-4">{t('adminAppReview.viewStudent')}</Link> : <p className="text-sm text-muted-foreground">{t('adminAppReview.noProfile')}</p>}
            </CardContent></Card>
            <Card className="rounded-none gap-4 py-5 shadow-none"><CardHeader><CardTitle className="text-base">{t('adminAppReview.applicationInfo')}</CardTitle></CardHeader><CardContent className="flex flex-col gap-5">
              <dl className="grid gap-4 sm:grid-cols-2"><Field label={t('adminAppReview.university')} value={app.university} /><Field label={t('adminAppReview.program')} value={app.program} /><Field label={t('adminAppReview.degree')} value={app.degree} /><Field label={t('adminAppReview.intake')} value={app.intake} /><Field label={t('adminAppReview.decision')} value={app.decision} /><Field label={t('adminAppReview.submitted')} value={date(app.submittedAt)} /><Field label={t('adminAppReview.created')} value={date(app.createdAt)} /><Field label={t('adminAppReview.updated')} value={date(app.updatedAt)} /></dl>
              <Button variant="outline" size="sm" className="rounded-none self-start" disabled={blocked || resyncing} onClick={() => void resync()}><RefreshCw data-icon="inline-start" className={resyncing ? 'animate-spin' : ''} />{t('adminAppReview.resync')}</Button>
              {resyncNote && <p role="status" className="text-sm text-muted-foreground">{resyncNote}</p>}
              {app.personalStatement && <dl><Field label={t('adminAppReview.personalStatement')} value={app.personalStatement} /></dl>}
              {app.additionalNotes && <dl><Field label={t('adminAppReview.applicantNotes')} value={app.additionalNotes} /></dl>}
              {app.adminNotes && <dl><Field label={t('adminAppReview.studentMessage')} value={app.adminNotes} /></dl>}
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="documents" className="mt-3 flex flex-col gap-4">
            {!app.archivedAt && <div className="flex justify-end"><MissingDocumentsRequest studentName={app.studentName} studentEmail={app.studentEmail} applicationNumber={app.applicationNumber} university={app.university} program={app.program} intake={app.intake} studentHasPortal={Boolean(app.studentId)} allowPartner={app.source === 'Partner'} /></div>}
            <DocumentsTab applicationId={app.id} studentId={app.studentId} />
          </TabsContent>
          {visitedTabs.has('notes') && <TabsContent value="notes" forceMount className="mt-3 data-[state=inactive]:hidden"><NotesTab applicationId={app.id} onSaved={() => void load()} /></TabsContent>}
          <TabsContent value="timeline" className="mt-3"><TimelineTab applicationId={app.id} refreshKey={refreshKey} /></TabsContent>
        </Tabs>
      </div>
      <aside className="flex min-w-0 flex-col gap-4">
        <Card className="rounded-none gap-4 py-4 shadow-none"><CardHeader><CardTitle className="text-sm">{t('adminAppReview.status')}</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">
          <FormField><FieldLabel htmlFor="application-status" className="sr-only">{t('adminAppReview.status')}</FieldLabel><Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={blocked}><SelectTrigger id="application-status" className="w-full rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{APPLICATION_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectGroup></SelectContent></Select><FieldDescription>{t('adminAppReview.statusHint')}</FieldDescription></FormField>
          <Button className="rounded-none bg-[#9B1B30] text-white hover:bg-[#7A1526]" disabled={blocked || selectedStatus === app.status} onClick={() => openStatus(selectedStatus as ApplicationStatus)}>{t('adminAppReview.changeStatus')}</Button>
        </CardContent></Card>
        <div id="application-enrollment" tabIndex={-1}>
          {isLoading ? <Skeleton className="h-28" /> : enrollmentError ? <Alert className="rounded-none"><AlertTitle>{t('adminAppReview.enrollmentUnavailable')}</AlertTitle><AlertDescription>{t('adminAppReview.enrollmentUnknown')}<Button variant="outline" size="sm" onClick={() => void load()}>{t('common.retry')}</Button></AlertDescription></Alert> : <EnrollmentCard applicationId={app.id} status={app.archivedAt ? 'Archived' : app.status} enrollment={enrollment} onChanged={load} />}
        </div>
        {isLoading ? <Skeleton className="h-40" /> : <ApplicationPaymentCard payment={payment} onRetry={() => void load()} />}
      </aside>
    </div>
    {confirmStatus && <ApplicationStatusDialog studentName={app.studentName} university={app.university} program={app.program} currentStatus={app.status} nextStatus={confirmStatus} surface="student" pending={updating} error={statusError} onClose={() => setConfirmStatus(null)} onConfirm={saveStatus} />}
    <Dialog open={lifecycleOpen} onOpenChange={open => { if (!lifecyclePending) setLifecycleOpen(open); }}><DialogContent className="rounded-none" showCloseButton={!lifecyclePending}><DialogHeader><DialogTitle>{t(app.archivedAt ? 'adminAppReview.restore' : 'adminAppReview.delete')}</DialogTitle><DialogDescription>{t(app.archivedAt ? 'adminAppReview.restoreHint' : 'adminAppReview.deleteHint')}</DialogDescription></DialogHeader><p className="break-words text-sm">{app.studentName} · {app.university} · {app.program} · {app.intake}</p>{lifecycleError && <Alert variant="destructive" className="rounded-none"><AlertDescription>{lifecycleError}</AlertDescription></Alert>}<DialogFooter><Button variant="outline" disabled={lifecyclePending} onClick={() => setLifecycleOpen(false)}>{t('common.cancel')}</Button><Button disabled={lifecyclePending} onClick={() => void saveLifecycle()}>{lifecyclePending && <Loader2 data-icon="inline-start" className="animate-spin" />}{t(app.archivedAt ? 'adminAppReview.restore' : 'adminAppReview.delete')}</Button></DialogFooter></DialogContent></Dialog>
  </PageContainer>;
}

function Field({ label, value }: { label: string; value: string | null | undefined }): React.ReactNode {
  const { t } = useI18n();
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words whitespace-pre-wrap text-sm font-medium">{value || t('adminAppReview.notRecorded')}</dd></div>;
}
