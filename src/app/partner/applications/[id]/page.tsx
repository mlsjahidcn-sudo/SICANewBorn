'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle, ArchiveRestore, ArrowLeft, BookOpen, Building, Calendar, CheckCircle,
  Download, ExternalLink, FileText, FileUp, Flag, History, Info, Mail, Phone, Globe,
  Plus, User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { PageContainer } from '@/components/admin/page-container';
import { ApplicationDetailHeader } from '@/components/partner/application-detail-header';
import {
  DescriptionPlaceholder,
  DescriptionRow,
} from '@/components/partner/descriptions';
import { DocumentUploadDialog } from '@/components/partner/DocumentUploadDialog';

import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { useUrlState } from '@/hooks/use-url-state';
import { ApplicationThread, useUnreadMessageCount } from '@/components/messages/application-thread';
import { formatFileSize } from '@/lib/document-viewer-origin';
import {
  getPartnerApplicationDecisionLabel,
  getPartnerApplicationPriorityLabel,
  getPartnerApplicationStatusLabel,
} from '@/lib/partner-enum-labels';
import {
  DOC_REQUEST_CATEGORY_LABEL_KEY,
  DOC_STATUS_STYLES,
  PRIORITY_VARIANTS,
  STATUS_VARIANTS,
  countDocumentsForRequest,
} from '@/lib/partner-status-styles';
import { MIN_NOTES_WHEN_UNASSIGNED } from '@/lib/partner-application-validation';
import type { PartnerApplication } from '@/lib/partner-application-mapper';
import type { PartnerDocument } from '@/lib/partner-doc-mapper';

interface TimelineEvent {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  actorEmail: string | null;
}

/** The four panes of the detail page. Bound to `?tab=` so the view is
 *  shareable and survives a refresh. */
const DETAIL_TABS = ['overview', 'file', 'documents', 'messages', 'activity'] as const;
type DetailTab = (typeof DETAIL_TABS)[number];

export default function PartnerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const applicationId = params.id as string;
  const messagesEndpoint = `/api/partner/applications/${applicationId}/messages`;
  const [unreadMessages, setUnreadMessages] = useUnreadMessageCount(messagesEndpoint);

  // Phase 52: locale-aware date formatter. The page used to
  // call `new Date(...).toLocaleDateString()` which respects
  // the browser's locale, not the chosen i18n locale. Now we
  // pass the active locale explicitly so switching to 中文
  // produces zh-CN-style dates (e.g. "2026年7月12日") instead
  // of en-US (e.g. "7/12/2026"). Used by the Status card's
  // "submitted" date and the bottom Created/Updated line.
  const localeTag = locale === 'zh' ? 'zh-CN' : 'en-US';
  const fmtDate = (iso: string | null | undefined): string => {
    if (!iso) return t('partnerCommon.placeholderDash');
    try {
      return new Date(iso).toLocaleDateString(localeTag, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return iso;
    }
  };
  const fmtDateTime = (iso: string | null | undefined): string => {
    if (!iso) return t('partnerCommon.placeholderDash');
    try {
      return new Date(iso).toLocaleString(localeTag, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  // The active pane lives in the URL (`?tab=`). `searchParams` MUST be
  // passed to `useUrlState` — the hook's window fallback returns null
  // during SSR, so the first server render and the first client render
  // would disagree and trip a hydration mismatch.
  const [activeTab, setActiveTab] = useUrlState<DetailTab>('tab', 'overview', {
    searchParams,
    coerce: (raw) =>
      (DETAIL_TABS as readonly string[]).includes(raw) ? (raw as DetailTab) : undefined,
  });

  const [app, setApp] = useState<PartnerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // Phase 49.3: disable the Clone button while we write the
  // sessionStorage entry + navigate. Prevents a partner who
  // double-clicks from creating two clone entries (only the
  // latest sessionStorage value matters, but the button
  // being grey is the visible signal).
  const [cloning, setCloning] = useState(false);
  // Phase 49.4: "Request withdrawal" — modal + busy state +
  // success banner. The actual API call goes to
  // /api/partner/applications/[id]/request-withdrawal which
  // inserts a timeline event the admin sees.
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [withdrawalReason, setWithdrawalReason] = useState('');
  const [withdrawalBusy, setWithdrawalBusy] = useState(false);
  const [withdrawalSent, setWithdrawalSent] = useState(false);
  const [withdrawalErr, setWithdrawalErr] = useState<string | null>(null);
  // Phase 1.13: most recent admin-actor on this application.
  // Surfaces "your case is being reviewed by <admin email>" so
  // the partner has a real person to follow up with.
  const [reviewer, setReviewer] = useState<{ email: string | null; at: string } | null>(null);
  // Phase F: activity timeline for this application.
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  // Phase G: documents linked to this application. Loaded lazily when
  // the Documents pane opens — the list is only relevant there.
  const [linkedDocs, setLinkedDocs] = useState<PartnerDocument[]>([]);
  const [linkedDocsLoading, setLinkedDocsLoading] = useState(false);
  // Guards against a double-fetch when the pane is opened twice.
  const linkedDocsRequested = useRef(false);
  // Phase C: the admin document-request log. Every request stays open
  // forever (`fulfilled_at` is only ever written as null), so the
  // partner's progress is DERIVED from the documents already uploaded.
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  // Inline notes editing. `notes` is the one application field a
  // partner may write (it is absent from `partnerForbiddenFields`).
  const [notesDraft, setNotesDraft] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesSavedAt, setNotesSavedAt] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const load = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    setTimelineLoading(true);
    setError(null);
    try {
      const [appRes, reviewerRes, timelineRes] = await Promise.all([
        apiFetchJson<{ application: PartnerApplication }>(
          `/api/partner/applications/${applicationId}`,
        ),
        // Fail-soft: the route returns 200 with reviewer: null
        // on no admin yet / on error, so we can just `catch` and
        // leave the reviewer state as-is. The UI shows the
        // generic "SICA Admissions Team" fallback.
        apiFetchJson<{ reviewer: { email: string | null; at: string } | null }>(
          `/api/partner/applications/${applicationId}/reviewer`,
        ).catch(() => ({ reviewer: null })),
        // Fail-soft: the timeline is a secondary surface. If it
        // errors we still render the rest of the detail page.
        apiFetchJson<{ timeline: TimelineEvent[] }>(
          `/api/partner/applications/${applicationId}/timeline`,
        ).catch(() => ({ timeline: [] })),
      ]);
      setApp(appRes.application);
      setReviewer(reviewerRes.reviewer);
      setTimeline(timelineRes.timeline || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerAppDetail.errorLoad'));
    } finally {
      setIsLoading(false);
      setTimelineLoading(false);
    }
  }, [applicationId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Seed the notes editor whenever a fresh application lands.
  useEffect(() => {
    setNotesDraft(app?.notes ?? '');
  }, [app?.id, app?.notes]);

  // Phase G: linked documents. Loaded on demand — the previous version
  // fetched all 100 rows on mount even when the partner never opened
  // the card. The ref guard makes it exactly-once per application.
  const fetchLinkedDocs = useCallback(async () => {
    if (!applicationId || linkedDocsRequested.current) return;
    linkedDocsRequested.current = true;
    setLinkedDocsLoading(true);
    try {
      const res = await apiFetchJson<{
        documents: PartnerDocument[];
        total: number;
      }>(`/api/partner/documents?partnerApplicationId=${encodeURIComponent(applicationId)}&limit=100`);
      setLinkedDocs(res.documents || []);
    } catch (err) {
      console.error('[partner/applications/:id] linked docs fetch failed:', err);
      // Allow a retry on the next activation.
      linkedDocsRequested.current = false;
    } finally {
      setLinkedDocsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (activeTab === 'documents') void fetchLinkedDocs();
  }, [activeTab, fetchLinkedDocs]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/partner/applications/${applicationId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerAppDetail.errorDelete'));
      }
      router.push('/partner/applications');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerAppDetail.errorDelete'));
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  // Phase C: restore a soft-deleted application. The PATCH route
  // already accepts `archived: false` (api/partner/applications/[id]
  // route.ts:195-201) — the detail page just had no affordance for it.
  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/partner/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerAppDetail.errorRestore'));
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerAppDetail.errorRestore'));
    } finally {
      setRestoring(false);
    }
  };

  // Phase C: save the notes inline. `notes` is not an admin-only field,
  // so the partner may write it — and it is exactly the field the API
  // requires when a university/program is left unassigned.
  const handleSaveNotes = async () => {
    setNotesSaving(true);
    setNotesError(null);
    setNotesSavedAt(false);
    try {
      const res = await apiFetch(`/api/partner/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesDraft }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerAppDetail.notesSaveFailed'));
      }
      setNotesSavedAt(true);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerAppDetail.notesSaveFailed'));
      setNotesError(err instanceof Error ? err.message : t('partnerAppDetail.notesSaveFailed'));
    } finally {
      setNotesSaving(false);
    }
  };

  // Phase 49.3: serialize the application into sessionStorage
  // and route to the new-app page with ?clone=1. The new page
  // reads the entry on mount, hydrates the form, then clears
  // it (so a refresh doesn't re-apply stale data).
  const handleClone = () => {
    if (!app) return;
    setCloning(true);
    try {
      // The fields the partner will re-pick on the clone —
      // explicitly clear them so the form opens with a blank
      // program picker. Everything else (student contact info,
      // academic background, passport, personal statement,
      // funding) carries over.
      const cloneData = {
        studentName: app.studentName,
        studentEmail: app.studentEmail ?? '',
        studentPhone: app.studentPhone ?? '',
        nationality: app.nationality ?? '',
        dateOfBirth: app.dateOfBirth ?? '',
        gender: (app.gender as string) ?? '',
        maritalStatus: (app.maritalStatus as string) ?? '',
        placeOfBirth: app.placeOfBirth ?? '',
        currentAddress: app.currentAddress ?? '',
        passportNumber: app.passportNumber ?? '',
        passportIssueDate: app.passportIssueDate ?? '',
        passportExpiryDate: app.passportExpiryDate ?? '',
        emergencyContactName: app.emergencyContactName ?? '',
        emergencyContactRelationship: (app.emergencyContactRelationship as string) ?? '',
        emergencyContactPhone: app.emergencyContactPhone ?? '',
        emergencyContactEmail: app.emergencyContactEmail ?? '',
        highestEducation: (app.highestEducation as string) ?? '',
        schoolName: app.schoolName ?? '',
        schoolCountry: app.schoolCountry ?? '',
        major: app.major ?? '',
        graduationYear: app.graduationYear ? String(app.graduationYear) : '',
        gpa: app.gpa ?? '',
        classRank: app.classRank ?? '',
        nativeLanguage: app.nativeLanguage ?? '',
        englishTest: (app.englishTest as string) ?? '',
        englishScore: app.englishScore ?? '',
        hskLevel: (app.hskLevel as string) ?? '',
        hskScore: app.hskScore ?? '',
        // university / program / intake / degree intentionally
        // blank — the partner will pick a new program.
        university: '',
        program: '',
        notInCatalog: false,
        intake: '',
        degree: '',
        hasStudiedInChina: app.hasStudiedInChina ?? false,
        hasAppliedChinaUni: app.hasAppliedChinaUni ?? false,
        fundingSource: (app.fundingSource as string) ?? '',
        scholarshipName: app.scholarshipName ?? '',
        whyProgram: app.whyProgram ?? '',
        careerPlan: app.careerPlan ?? '',
        // Notes are blank — the new app's notes should start
        // fresh. The partner can re-use the prior app's notes
        // from the detail page if they want.
        notes: '',
        // priority is per-app; default to Normal on the clone.
        priority: 'Normal' as const,
        applicationNumber: '',
        submittedAt: null,
        // Source app id so the new-app page can show a "Cloned
        // from <name>" hint (Phase 49.3 follow-up — not yet
        // surfaced in the UI but the data is here).
        _clonedFrom: app.id,
      };
      sessionStorage.setItem('partner-clone-application', JSON.stringify(cloneData));
      router.push('/partner/applications/new?clone=1');
    } catch (err) {
      console.error('[partner/applications/:id] clone failed:', err);
      setError(err instanceof Error ? err.message : t('partnerAppDetail.errorClone'));
    } finally {
      // Phase 111b: the previous version only reset cloning on the
      // error path — a successful clone + back-navigation left the
      // button stuck greyed-out. Reset in `finally` so the state
      // tracks reality regardless of outcome.
      setCloning(false);
    }
  };

  // Phase 49.4: "Request withdrawal" — POSTs to
  // /api/partner/applications/[id]/request-withdrawal with the
  // optional reason. The endpoint inserts a 'Withdrawal Requested'
  // timeline event the admin sees on the partner-application
  // detail. We then show a success banner instead of immediately
  // closing the modal — gives the partner a confirmation
  // message and time to read it.
  const handleWithdrawalSubmit = async () => {
    if (!app) return;
    setWithdrawalBusy(true);
    setWithdrawalErr(null);
    try {
      const res = await apiFetch(
        `/api/partner/applications/${applicationId}/request-withdrawal`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: withdrawalReason }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerAppDetail.errorWithdrawal'));
      }
      setWithdrawalSent(true);
      // Refresh the activity feed so the new withdrawal request
      // appears immediately.
      void load();
      // Auto-close after a short read window.
      setTimeout(() => {
        setShowWithdrawal(false);
        setWithdrawalSent(false);
        setWithdrawalReason('');
      }, 2500);
    } catch (err) {
      console.error('[partner/applications/:id] request-withdrawal failed:', err);
      setWithdrawalErr(err instanceof Error ? err.message : t('partnerAppDetail.errorWithdrawal'));
    } finally {
      setWithdrawalBusy(false);
    }
  };

  // Phase G: download a linked document via a signed URL.
  const handleDownloadDoc = async (doc: PartnerDocument) => {
    try {
      const { url } = await apiFetchJson<{ url: string; expiresAt: string }>(
        `/api/partner/documents/${doc.id}/download-url`,
        { method: 'POST' },
      );
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('[partner/applications/:id] doc download failed:', err);
      setError(err instanceof Error ? err.message : t('partnerAppDetail.errorDownloadDoc'));
    }
  };

  if (isLoading) {
    return (
      <PageContainer width="default">
        <div className="h-8 bg-gray-200 animate-pulse w-48" />
        <div className="h-64 bg-gray-200 animate-pulse" />
      </PageContainer>
    );
  }

  if (error && !app) {
    return (
      <PageContainer width="default">
        <div className="space-y-4">
          <Link href="/partner/applications" className="inline-flex items-center gap-2 text-[#1B2A4A]">
            <ArrowLeft className="w-4 h-4" /> {t('partnerAppDetail.backToApplications')}
          </Link>
          <Card className="rounded-none border-red-200 bg-red-50">
            <CardContent className="p-6 text-red-700 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">{t('partnerAppDetail.couldNotLoad')}</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (!app) return null;

  // A row with an empty value is shown explicitly as "not recorded"
  // rather than an em dash, and the card offers a route to fill it in.
  const notRecorded = t('partnerAppDetail.notRecorded');
  const row = (label: string, value: string | null | undefined, mono = false) =>
    value ? (
      <DescriptionRow key={label} label={label} value={value} mono={mono} />
    ) : (
      <DescriptionPlaceholder key={label} label={label} value={notRecorded} />
    );

  const openRequests = (app.documentsRequested ?? []).filter((r) => !r.fulfilled_at);

  const linkedLabel = [
    app.studentName ?? '',
    app.applicationNumber ?? '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <PageContainer width="default">
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('partnerAppDetail.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('partnerAppDetail.deleteBodyFor', { student: app.studentName ?? '', university: app.university || t('partnerAppDetail.universityNotSet') })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-none">
              {t('partnerAppDetail.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
            >
              {isDeleting ? t('partnerAppDetail.deleting') : t('partnerAppDetail.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Phase D: "Request withdrawal" dialog. Replaced the custom
          inline modal with the project's <Dialog> component for
          consistent focus trapping, scroll locking, and keyboard
          handling across the partner portal. */}
      <Dialog open={showWithdrawal} onOpenChange={setShowWithdrawal}>
        <DialogContent className="rounded-none max-w-md">
          <DialogHeader>
            <DialogTitle>{t('partnerAppDetail.withdrawalTitle')}</DialogTitle>
            <DialogDescription>
              {t('partnerAppDetail.withdrawalBody', { student: app.studentName ?? '', university: app.university || t('partnerAppDetail.universityNotSet') })}
            </DialogDescription>
          </DialogHeader>
          {!withdrawalSent ? (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#1B2A4A]">
                  {t('partnerAppDetail.withdrawalReasonLabel')}
                </label>
                <Textarea
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="rounded-none"
                  placeholder={t('partnerAppDetail.withdrawalReasonPlaceholder')}
                />
                <p className="text-xs text-gray-500">
                  {t('partnerAppDetail.withdrawalReasonHint', { count: withdrawalReason.length })}
                </p>
                {withdrawalErr && (
                  <p className="text-sm text-red-700">{withdrawalErr}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowWithdrawal(false);
                    setWithdrawalReason('');
                    setWithdrawalErr(null);
                  }}
                  disabled={withdrawalBusy}
                  className="rounded-none"
                >
                  {t('partnerAppDetail.cancel')}
                </Button>
                <Button
                  onClick={handleWithdrawalSubmit}
                  disabled={withdrawalBusy}
                  className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
                >
                  {withdrawalBusy ? t('partnerAppDetail.withdrawalSending') : t('partnerAppDetail.withdrawalSubmit')}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="text-sm text-green-800 flex items-center gap-2 py-2">
              <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0" />
              <p>{t('partnerAppDetail.withdrawalSent')}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ApplicationDetailHeader
        app={app}
        cloning={cloning}
        onClone={handleClone}
        onRequestWithdrawal={() => setShowWithdrawal(true)}
        onDelete={() => setShowDelete(true)}
      />

      {/* Phase C: an archived row is invisible in the list, so the
          detail page is the only place it can be restored. */}
      {app.archivedAt && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-900">
            <strong>{t('partnerAppDetail.archivedBanner')}</strong>{' '}
            {t('partnerAppDetail.archivedBannerBody', { date: fmtDate(app.archivedAt) })}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none border-amber-300 text-amber-900"
            onClick={handleRestore}
            disabled={restoring}
          >
            <ArchiveRestore className="mr-2 h-4 w-4" />
            {restoring ? t('partnerAppDetail.restoring') : t('partnerAppDetail.restore')}
          </Button>
        </div>
      )}

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DetailTab)} className="space-y-4">
        <TabsList className="rounded-none h-auto flex-wrap">
          <TabsTrigger value="overview">{t('partnerAppDetail.tabOverview')}</TabsTrigger>
          <TabsTrigger value="file">{t('partnerAppDetail.tabFile')}</TabsTrigger>
          <TabsTrigger value="documents">
            {openRequests.length > 0
              ? t('partnerAppDetail.tabDocumentsOpen', { count: openRequests.length })
              : t('partnerAppDetail.tabDocuments')}
          </TabsTrigger>
          <TabsTrigger value="messages">
            {t('appMessages.tabLabel')}
            {unreadMessages > 0 ? (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center bg-[#9B1B30] px-1.5 text-[11px] font-semibold text-white">
                {unreadMessages}
              </span>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="activity">{t('partnerAppDetail.tabActivity')}</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------- */}
        {/* Overview: who, what, where, and the admin-owned status.     */}
        {/* ---------------------------------------------------------- */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phase C: linked student card. Surfaces the partner_students
                link and gives one-click actions to the student profile or
                creating another application for the same student. */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
                  <User className="w-4 h-4" /> {t('partnerAppDetail.sectionLinkedStudent')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {app.studentId ? (
                  <>
                    <DescriptionRow label={t('partnerAppDetail.linkedStudentName')} value={app.studentName} />
                    <DescriptionRow label={t('partnerAppDetail.linkedStudentEmail')} value={app.studentEmail} />
                    <DescriptionRow label={t('partnerAppDetail.linkedStudentPhone')} value={app.studentPhone} />
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button asChild variant="outline" size="sm" className="rounded-none">
                        <Link href={`/partner/students/${app.studentId}`}>
                          {t('partnerAppDetail.viewStudentProfile')}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="rounded-none">
                        <Link href={`/partner/applications/new?studentId=${encodeURIComponent(app.studentId)}`}>
                          <Plus className="mr-1 h-3 w-3" />
                          {t('partnerAppDetail.newAppForStudent')}
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-[#4B5563]">{t('partnerAppDetail.noLinkedStudent')}</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
                  <Building className="w-4 h-4" /> {t('partnerAppDetail.sectionUniversityProgram')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldUniversity')}:</span>
                  {app.university ? (
                    <span className="font-medium text-[#1F2937]">{app.university}</span>
                  ) : (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 text-xs border border-amber-200">
                      {t('partnerAppDetail.pendingAssignment')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldProgram')}:</span>
                  {app.program ? (
                    <span className="font-medium text-[#1F2937]">{app.program}</span>
                  ) : (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 text-xs border border-amber-200">
                      {t('partnerAppDetail.pendingAssignment')}
                    </span>
                  )}
                </div>
                {/* Phase C: the API refuses to clear the university or the
                    program unless the notes carry enough text (>= 10
                    characters). Say so before the partner hits the error. */}
                {(!app.university || !app.program) && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1.5">
                    {t('partnerAppDetail.pendingAssignmentNotesHint', {
                      count: MIN_NOTES_WHEN_UNASSIGNED,
                    })}
                  </p>
                )}
                <DescriptionRow label={t('partnerAppDetail.fieldIntake')} value={app.intake} />
                <DescriptionRow label={t('partnerAppDetail.fieldDegree')} value={app.degree} />
                <DescriptionRow label={t('partnerAppDetail.fieldApplicationNumber')} value={app.applicationNumber} mono />
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> {t('partnerAppDetail.sectionStatus')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldStatus')}</span>
                  <Badge variant={STATUS_VARIANTS[app.status]} className="rounded-none">
                    {getPartnerApplicationStatusLabel(app.status, t)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldDecision')}</span>
                  <Badge variant="outline" className="rounded-none">{getPartnerApplicationDecisionLabel(app.decision, t)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldPriority')}</span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
                  >
                    <Flag className="w-3 h-3" /> {getPartnerApplicationPriorityLabel(app.priority, t)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldSubmitted')}</span>
                  <span className="text-[#1F2937]">
                    {fmtDate(app.submittedAt)}
                  </span>
                </div>
                {/* Phase 49.1: prominent "why can't I change status?" callout.
                    S27 removed the partner's ability to change status +
                    decision (admins drive the workflow). Partners were
                    left wondering why the Edit button doesn't surface
                    those fields. The old copy was a tiny gray sentence
                    at the bottom of the status card — easy to miss. This
                    callout is now a real amber notice with an Info icon,
                    explains the rule, and points at the request-withdrawal
                    action below as the partner's recourse when the admin
                    hasn't moved the status fast enough for them. */}
                <div className="flex items-start gap-2 pt-3 mt-1 border-t border-gray-100">
                  <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900">
                    <strong>{t('partnerAppDetail.statusAdminNoteTitle')}</strong>{' '}
                    {t('partnerAppDetail.statusAdminNote')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
                <Mail className="w-4 h-4" /> {t('partnerAppDetail.sectionStudentContact')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {app.studentEmail ? (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#4B5563]" />
                  <a
                    href={`mailto:${app.studentEmail}`}
                    className="text-[#1B2A4A] hover:underline"
                  >
                    {app.studentEmail}
                  </a>
                </div>
              ) : (
                <p className="text-sm text-[#4B5563] italic">{t('partnerAppDetail.noEmailOnFile')}</p>
              )}
              {app.studentPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#4B5563]" />
                  <a href={`tel:${app.studentPhone}`} className="text-[#1B2A4A] hover:underline">
                    {app.studentPhone}
                  </a>
                </div>
              )}
              {app.nationality && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#4B5563]" />
                  <span className="text-[#1F2937]">{app.nationality}</span>
                </div>
              )}
              {app.createdByEmail && (
                <div className="text-xs text-[#4B5563] pt-2 border-t border-gray-100 mt-2">
                  {t('partnerAppDetail.addedBy', { email: app.createdByEmail })}
                  {app.createdAt && (
                    <> {t('partnerAppDetail.addedOn', { date: fmtDate(app.createdAt) })}</>
                  )}
                </div>
              )}
              {/* Phase 1.13: show the most recent admin-actor on this
                  case so the partner knows who to follow up with.
                  Falls back to "SICA Admissions Team" if no admin has
                  touched the case yet. */}
              <div className="text-xs text-[#4B5563] pt-2 border-t border-gray-100 mt-2">
                <span className="font-semibold text-[#1B2A4A]">
                  {t('partnerAppDetail.assignedTo')}:
                </span>{' '}
                {reviewer?.email ? (
                  <>
                    {reviewer.email}
                    {reviewer.at && (
                      <span className="text-gray-500 ml-1">
                        ({t('partnerAppDetail.lastActivity', {
                          date: fmtDate(reviewer.at),
                        })})
                      </span>
                    )}
                  </>
                ) : (
                  <span>{t('partnerAppDetail.admissionsTeam')}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------------------------------------------------- */}
        {/* Student file: every section, always. An empty section says  */}
        {/* "not recorded" instead of silently disappearing.            */}
        {/* ---------------------------------------------------------- */}
        <TabsContent value="file">
          <div className="space-y-6">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionIdentityAddress')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {row(t('partnerAppDetail.fieldDateOfBirth'), app.dateOfBirth)}
                {row(t('partnerAppDetail.fieldGender'), app.gender)}
                {row(t('partnerAppDetail.fieldMaritalStatus'), app.maritalStatus)}
                {row(t('partnerAppDetail.fieldPlaceOfBirth'), app.placeOfBirth)}
                {app.currentAddress ? (
                  <div>
                    <div className="text-[#4B5563] mb-1">{t('partnerAppDetail.fieldCurrentAddress')}</div>
                    <p className="text-[#1F2937] whitespace-pre-wrap">{app.currentAddress}</p>
                  </div>
                ) : (
                  <DescriptionPlaceholder
                    label={t('partnerAppDetail.fieldCurrentAddress')}
                    value={notRecorded}
                  />
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionPassport')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {row(t('partnerAppDetail.fieldPassportNumber'), app.passportNumber, true)}
                {row(t('partnerAppDetail.fieldIssueDate'), app.passportIssueDate)}
                {row(t('partnerAppDetail.fieldExpiryDate'), app.passportExpiryDate)}
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionEmergencyContact')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {row(t('partnerAppDetail.fieldName'), app.emergencyContactName)}
                {row(t('partnerAppDetail.fieldRelationship'), app.emergencyContactRelationship)}
                {row(t('partnerAppDetail.fieldPhone'), app.emergencyContactPhone)}
                {row(t('partnerAppDetail.fieldEmail'), app.emergencyContactEmail)}
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionAcademic')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {row(t('partnerAppDetail.fieldHighestEducation'), app.highestEducation)}
                {row(t('partnerAppDetail.fieldSchool'), app.schoolName)}
                {row(t('partnerAppDetail.fieldCountry'), app.schoolCountry)}
                {row(t('partnerAppDetail.fieldMajor'), app.major)}
                {row(
                  t('partnerAppDetail.fieldGraduationYear'),
                  app.graduationYear ? String(app.graduationYear) : null,
                )}
                {row(t('partnerAppDetail.fieldGPA'), app.gpa)}
                {row(t('partnerAppDetail.fieldClassRank'), app.classRank)}
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionLanguage')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {row(t('partnerAppDetail.fieldNativeLanguage'), app.nativeLanguage)}
                {row(
                  t('partnerAppDetail.fieldEnglish'),
                  app.englishTest
                    ? `${app.englishTest}${app.englishScore ? ` · ${app.englishScore}` : ''}`
                    : null,
                )}
                {row(
                  t('partnerAppDetail.fieldHSK'),
                  app.hskLevel
                    ? `${app.hskLevel}${app.hskScore ? ` · ${app.hskScore}` : ''}`
                    : null,
                )}
              </CardContent>
            </Card>

            {/* Application context (prior China study) — Phase 52 narrowed
                this to just the China-history fields. The Funding
                sub-card (fundingSource/scholarshipName) was dropped from
                the partner application form in Phase 51f, so new rows can
                never populate it. Same for the Personal Statement card —
                Phase 51f removed the form, so we hide the card entirely.
                Read-side data is preserved on the PartnerApplication
                interface for any future restore. */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionContext')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {row(
                  t('partnerAppDetail.fieldStudiedInChinaBefore'),
                  app.hasStudiedInChina === null
                    ? null
                    : app.hasStudiedInChina
                    ? t('partnerAppDetail.yes')
                    : t('partnerAppDetail.no'),
                )}
                {row(
                  t('partnerAppDetail.fieldAppliedToCNUniBefore'),
                  app.hasAppliedChinaUni === null
                    ? null
                    : app.hasAppliedChinaUni
                    ? t('partnerAppDetail.yes')
                    : t('partnerAppDetail.no'),
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------- */}
        {/* Documents: what SICA asked for, and what the partner has.   */}
        {/* ---------------------------------------------------------- */}
        <TabsContent value="documents">
          <div className="space-y-6">
            {/* Phase C: the admin document-request log. Every request
                stays open (nothing ever writes `fulfilled_at`), so the
                partner's progress is derived from the documents that
                were uploaded after the request was raised. */}
            <Card className="rounded-none">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
                    <FileUp className="w-4 h-4" /> {t('partnerAppDetail.sectionRequestedDocuments')}
                  </CardTitle>
                  {openRequests.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none"
                      onClick={() => setShowUploadDialog(true)}
                      disabled={!app.studentId}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      {t('partnerAppDetail.addRequestedDocuments')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {openRequests.length === 0 ? (
                  <p className="text-xs text-[#4B5563]">
                    {t('partnerAppDetail.openRequestsNone')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wider">
                      {t('partnerAppDetail.openRequests')} ({openRequests.length})
                    </div>
                    {openRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-3 bg-amber-50 border border-amber-200"
                      >
                        <div className="flex flex-wrap gap-1 mb-1">
                          {request.categories.map((category) => (
                            <Badge key={category} variant="secondary" className="rounded-none text-xs">
                              {t(
                                `partnerAppDetail.requestCategory${DOC_REQUEST_CATEGORY_LABEL_KEY[category]}` as
                                  | 'partnerAppDetail.requestCategoryPassport'
                                  | 'partnerAppDetail.requestCategoryTranscript'
                                  | 'partnerAppDetail.requestCategoryEnglishTest'
                                  | 'partnerAppDetail.requestCategoryPhoto'
                                  | 'partnerAppDetail.requestCategoryOther',
                              )}
                            </Badge>
                          ))}
                        </div>
                        {request.message && (
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{request.message}</p>
                        )}
                        <p className="text-xs text-[#4B5563] mt-1">
                          {t('partnerAppDetail.requestedByLabel')}{' '}
                          {request.requested_by.slice(0, 8)} ·{' '}
                          {t('partnerAppDetail.requestedOnLabel')} {fmtDate(request.requested_at)}
                        </p>
                        {/* Derived evidence: documents uploaded after
                            this request that match the category. */}
                        {request.categories.map((category) => {
                          const count = countDocumentsForRequest(
                            category,
                            request.requested_at,
                            linkedDocs,
                          );
                          if (count === null) return null;
                          return (
                            <p key={`evidence-${category}`} className="text-xs text-[#4B5563] mt-1">
                              {count === 1
                                ? t('partnerAppDetail.uploadedSinceRequestOne')
                                : t('partnerAppDetail.uploadedSinceRequestOther', { count })}
                            </p>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Phase G: documents linked to this application. Partners
                often want to see which passports/transcripts/etc. are
                already attached without leaving the application view. */}
            <Card className="rounded-none">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
                    <FileText className="w-4 h-4" /> {t('partnerAppDetail.sectionDocuments')}
                  </CardTitle>
                  <Button asChild variant="outline" size="sm" className="rounded-none">
                    <Link
                      href={`/partner/documents?partnerApplicationId=${encodeURIComponent(applicationId)}`}
                      className="inline-flex items-center"
                    >
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      {t('partnerAppDetail.viewAllDocuments')}
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {linkedDocsLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
                  </div>
                ) : linkedDocs.length === 0 ? (
                  <div className="text-sm text-[#4B5563]">
                    <p>{t('partnerAppDetail.noLinkedDocuments')}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none mt-3"
                      onClick={() => setShowUploadDialog(true)}
                      disabled={!app.studentId}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      {t('partnerAppDetail.uploadDocument')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {linkedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border border-gray-100"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#1B2A4A] flex-shrink-0" />
                            <span className="font-medium text-[#1B2A4A] text-sm truncate">{doc.name}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#4B5563]">
                            <Badge className={`rounded-none ${DOC_STATUS_STYLES[doc.status]}`}>
                              {t(`partnerDocs.statusBadge.${doc.status.toLowerCase()}`)}
                            </Badge>
                            <span>
                              {t(`partnerDocs.categoryBadge.${doc.category.toLowerCase()}`)}
                            </span>
                            {doc.fileSize && (
                              <span>{formatFileSize(doc.fileSize)}</span>
                            )}
                            <span>· {fmtDate(doc.uploadedAt)}</span>
                            {doc.rejectionReason && (
                              <span className="text-red-700">· {doc.rejectionReason}</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-none h-8 w-8 p-0"
                          onClick={() => handleDownloadDoc(doc)}
                          title={t('partnerAppDetail.downloadDocument')}
                          aria-label={t('partnerAppDetail.downloadDocument')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none mt-2"
                      onClick={() => setShowUploadDialog(true)}
                      disabled={!app.studentId}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      {t('partnerAppDetail.uploadDocument')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---------------------------------------------------------- */}
        {/* Activity: what happened, plus the partner's own notes.      */}
        {/* ---------------------------------------------------------- */}
        <TabsContent value="activity">
          <div className="space-y-6">
            {/* Phase C: the notes editor. `notes` is the one
                application field a partner may write, and it is what the
                API requires when a university/program is left unassigned. */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionNotes')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  maxLength={4000}
                  rows={5}
                  className="rounded-none"
                  placeholder={t('partnerAppDetail.notesPlaceholder')}
                />
                {notesError && <p className="text-sm text-red-700">{notesError}</p>}
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none"
                    onClick={handleSaveNotes}
                    disabled={notesSaving || notesDraft === (app.notes ?? '')}
                  >
                    {notesSaving ? t('partnerAppDetail.notesSaving') : t('partnerAppDetail.saveNotes')}
                  </Button>
                  {notesSavedAt && (
                    <span className="text-xs text-green-700 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {t('partnerAppDetail.notesSaved')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4B5563] mt-4 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t('partnerAppDetail.createdOn', { date: fmtDateTime(app.createdAt) })}
                  {app.updatedAt && app.updatedAt !== app.createdAt && (
                    <>{t('partnerAppDetail.updatedOn', { date: fmtDateTime(app.updatedAt) })}</>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* Phase F: activity timeline. Shows status changes, admin
                notes, and partner withdrawal requests in chronological
                order. The feed is fail-soft: if the timeline endpoint
                errors we still render the rest of the detail page. */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
                  <History className="w-4 h-4" /> {t('partnerAppDetail.sectionActivity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelineLoading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
                  </div>
                ) : timeline.length === 0 ? (
                  <div className="text-sm text-[#4B5563] italic">
                    {t('partnerAppDetail.timelineEmpty')}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {timeline.map((event) => {
                      const dotColor =
                        event.status === 'Accepted'
                          ? 'bg-green-500'
                          : event.status === 'Rejected' || event.status === 'Withdrawn'
                          ? 'bg-red-500'
                          : event.status === 'Submitted'
                          ? 'bg-blue-500'
                          : event.status === 'Withdrawal Requested'
                          ? 'bg-amber-500'
                          : 'bg-[#1B2A4A]';
                      const actor = event.actorEmail || t('partnerAppDetail.admissionsTeam');
                      return (
                        <div key={event.id} className="flex items-start gap-4">
                          <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`} />
                          <div className="flex-1 pb-4 border-l-2 border-gray-200 pl-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                              <p className="font-semibold text-[#1B2A4A] text-sm">{getPartnerApplicationStatusLabel(event.status, t)}</p>
                              <span className="text-xs text-[#4B5563]">
                                {fmtDateTime(event.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-[#4B5563] mt-0.5">
                              {t('partnerAppDetail.timelineActor', { actor })}
                            </p>
                            {event.notes && (
                              <p className="text-sm text-[#1F2937] mt-2 whitespace-pre-wrap">
                                {event.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="messages">
          {activeTab === 'messages' ? (
            <ApplicationThread
              endpoint={messagesEndpoint}
              viewerRole="partner"
              onLoaded={() => setUnreadMessages(0)}
            />
          ) : null}
        </TabsContent>
      </Tabs>

      {/* Phase C: upload a document straight from the application, locked
          to this application and its student. */}
      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        students={[]}
        applications={[]}
        defaultStudentId={app.studentId ?? undefined}
        lockApplicationId={app.id}
        lockedLabel={linkedLabel}
        onUploaded={() => {
          setShowUploadDialog(false);
          void fetchLinkedDocs();
        }}
      />
    </PageContainer>
  );
}
