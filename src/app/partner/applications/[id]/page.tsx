'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Trash2, Calendar, Building, BookOpen, AlertTriangle,
  Mail, Phone, Globe, Hash, Flag, Info, Copy, ClipboardCopy, RotateCcw, CheckCircle,
  User, Plus, History, FileText, Download, ExternalLink,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  getPartnerApplicationStatusLabel,
  getPartnerApplicationPriorityLabel,
  getPartnerApplicationDecisionLabel,
} from '@/lib/partner-enum-labels';
import type {
  PartnerApplication,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
  PartnerApplicationPriority,
} from '@/lib/partner-application-mapper';
import type { PartnerDocument, PartnerDocStatus } from '@/lib/partner-doc-mapper';

interface TimelineEvent {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
  actorEmail: string | null;
}

const STATUS_VARIANTS: Record<PartnerApplicationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'Draft': 'secondary',
  'Submitted': 'outline',
  'In Review': 'outline',
  'Accepted': 'default',
  'Rejected': 'destructive',
  'Withdrawn': 'outline',
};

const PRIORITY_VARIANTS: Record<PartnerApplicationPriority, string> = {
  Low: 'bg-gray-100 text-gray-700',
  Normal: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-[#9B1B30] text-white',
};

const DOC_STATUS_STYLES: Record<PartnerDocStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Verified: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function PartnerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useI18n();
  const applicationId = params.id as string;

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
  // Phase G: documents linked to this application.
  const [linkedDocs, setLinkedDocs] = useState<PartnerDocument[]>([]);
  const [linkedDocsLoading, setLinkedDocsLoading] = useState(true);

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

  // Phase G: load documents linked to this application. Separate
  // from load() so a doc mutation can refresh just this list.
  useEffect(() => {
    if (!applicationId) return;
    let cancelled = false;
    setLinkedDocsLoading(true);
    (async () => {
      try {
        const res = await apiFetchJson<{
          documents: PartnerDocument[];
          total: number;
        }>(`/api/partner/documents?partnerApplicationId=${encodeURIComponent(applicationId)}&limit=100`);
        if (!cancelled) setLinkedDocs(res.documents || []);
      } catch (err) {
        console.error('[partner/applications/:id] linked docs fetch failed:', err);
      } finally {
        if (!cancelled) setLinkedDocsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

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
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse w-48" />
        <div className="h-64 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (error && !app) {
    return (
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
    );
  }

  if (!app) return null;

  return (
    <div className="space-y-6">
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('partnerAppDetail.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('partnerAppDetail.deleteBodyFor', { student: app.studentName, university: app.university || t('partnerAppDetail.universityNotSet') })}
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
              {t('partnerAppDetail.withdrawalBody', { student: app.studentName, university: app.university || t('partnerAppDetail.universityNotSet') })}
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

      <div className="flex items-center gap-4">
        <Link href="/partner/applications" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{app.studentName}</h1>
            <Badge variant={STATUS_VARIANTS[app.status]} className="rounded-none">
              {getPartnerApplicationStatusLabel(app.status, t)}
            </Badge>
            <Badge variant="outline" className="rounded-none">
              {getPartnerApplicationDecisionLabel(app.decision, t)}
            </Badge>
            {app.priority && app.priority !== 'Normal' && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
                title={t('partnerAppDetail.priorityTitle')}
              >
                <Flag className="w-3 h-3" /> {getPartnerApplicationPriorityLabel(app.priority, t)}
              </span>
            )}
          </div>
          <p className="text-[#4B5563] mt-1 text-sm">
            {app.university && app.program
              ? `${app.university} · ${app.program}`
              : app.university || app.program || t('partnerAppDetail.pendingAssignmentHeader')}
            {app.applicationNumber && (
              <span className="ml-2 font-mono text-xs text-gray-400">
                {app.applicationNumber}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button asChild variant="outline" className="rounded-none">
            <Link href={`/partner/applications/${app.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t('partnerAppDetail.edit')}
            </Link>
          </Button>
          {/* Phase 49.3: "Clone as new application" — partners
              often submit the same student to multiple
              universities. This stores the form-ready data in
              sessionStorage and routes to /partner/applications/new
              with ?clone=1. The new-app page reads sessionStorage
              on mount and pre-fills every field except
              university/program/intake/degree/applicationNumber
              (the partner will re-pick these — that's the whole
              point of cloning). sessionStorage is per-tab and
              auto-clears on tab close, so this is safe. */}
          <Button
            variant="outline"
            className="rounded-none"
            onClick={() => handleClone()}
            disabled={cloning}
          >
            <ClipboardCopy className="mr-2 h-4 w-4" />
            {t('partnerAppDetail.clone')}
          </Button>
          {/* Phase 49.4: "Request withdrawal" — opens the
              modal with an optional reason textarea. Disabled
              when the row is already Withdrawn (no need to ask
              again). The modal posts to
              /api/partner/applications/[id]/request-withdrawal
              which inserts a 'Withdrawal Requested' timeline
              event the admin sees in the partner-application
              detail. */}
          {app.status !== 'Withdrawn' && (
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => setShowWithdrawal(true)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              {t('partnerAppDetail.requestWithdrawal')}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowDelete(true)}
            className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('partnerAppDetail.delete')}
          </Button>
        </div>
      </div>

      {/* S27: the Quick status update panel was removed. Status and
          decision are now admin-only — partners can edit the
          application's intake / academic / passport / etc. but the
          workflow transitions happen on the admin side. The
          status + decision are still visible below in the Status
          card so the partner always knows where SICA has the
          application. */}

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

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
                <Field label={t('partnerAppDetail.linkedStudentName')} value={app.studentName} />
                <Field label={t('partnerAppDetail.linkedStudentEmail')} value={app.studentEmail} />
                <Field label={t('partnerAppDetail.linkedStudentPhone')} value={app.studentPhone} />
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
            <Field label={t('partnerAppDetail.fieldIntake')} value={app.intake} />
            <Field label={t('partnerAppDetail.fieldDegree')} value={app.degree} />
            <Field label={t('partnerAppDetail.fieldApplicationNumber')} value={app.applicationNumber} mono />
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
              <UserIcon name="book" className="w-4 h-4" /> {t('partnerAppDetail.sectionStatus')}
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

      {/* S26 — extended application data. We render these as
          additional cards below the contact card so the partner can
          see everything admissions needs. Each card only renders
          if at least one field is filled in, so the page stays
          clean for sparse rows (the old partner_applications had
          none of these fields). */}

      {/* Identity & address */}
      {(app.dateOfBirth ||
        app.gender ||
        app.maritalStatus ||
        app.placeOfBirth ||
        app.currentAddress) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionIdentityAddress')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label={t('partnerAppDetail.fieldDateOfBirth')} value={app.dateOfBirth} />
            <Field label={t('partnerAppDetail.fieldGender')} value={app.gender} />
            <Field label={t('partnerAppDetail.fieldMaritalStatus')} value={app.maritalStatus} />
            <Field label={t('partnerAppDetail.fieldPlaceOfBirth')} value={app.placeOfBirth} />
            {app.currentAddress && (
              <div>
                <div className="text-[#4B5563] mb-1">{t('partnerAppDetail.fieldCurrentAddress')}</div>
                <p className="text-[#1F2937] whitespace-pre-wrap">{app.currentAddress}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Passport */}
      {(app.passportNumber || app.passportIssueDate || app.passportExpiryDate) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionPassport')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label={t('partnerAppDetail.fieldPassportNumber')} value={app.passportNumber} mono />
            <Field label={t('partnerAppDetail.fieldIssueDate')} value={app.passportIssueDate} />
            <Field label={t('partnerAppDetail.fieldExpiryDate')} value={app.passportExpiryDate} />
          </CardContent>
        </Card>
      )}

      {/* Emergency contact */}
      {(app.emergencyContactName ||
        app.emergencyContactPhone ||
        app.emergencyContactEmail ||
        app.emergencyContactRelationship) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionEmergencyContact')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label={t('partnerAppDetail.fieldName')} value={app.emergencyContactName} />
            <Field label={t('partnerAppDetail.fieldRelationship')} value={app.emergencyContactRelationship} />
            <Field label={t('partnerAppDetail.fieldPhone')} value={app.emergencyContactPhone} />
            <Field label={t('partnerAppDetail.fieldEmail')} value={app.emergencyContactEmail} />
          </CardContent>
        </Card>
      )}

      {/* Academic background */}
      {(app.highestEducation ||
        app.schoolName ||
        app.major ||
        app.gpa ||
        app.graduationYear) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionAcademic')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label={t('partnerAppDetail.fieldHighestEducation')} value={app.highestEducation} />
            <Field label={t('partnerAppDetail.fieldSchool')} value={app.schoolName} />
            <Field label={t('partnerAppDetail.fieldCountry')} value={app.schoolCountry} />
            <Field label={t('partnerAppDetail.fieldMajor')} value={app.major} />
            <Field
              label={t('partnerAppDetail.fieldGraduationYear')}
              value={app.graduationYear ? String(app.graduationYear) : null}
            />
            <Field label={t('partnerAppDetail.fieldGPA')} value={app.gpa} />
            <Field label={t('partnerAppDetail.fieldClassRank')} value={app.classRank} />
          </CardContent>
        </Card>
      )}

      {/* Language proficiency */}
      {(app.nativeLanguage ||
        app.englishTest ||
        app.englishScore ||
        app.hskLevel ||
        app.hskScore) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionLanguage')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label={t('partnerAppDetail.fieldNativeLanguage')} value={app.nativeLanguage} />
            <Field
              label={t('partnerAppDetail.fieldEnglish')}
              value={
                app.englishTest
                  ? `${app.englishTest}${app.englishScore ? ` · ${app.englishScore}` : ''}`
                  : null
              }
            />
            <Field
              label={t('partnerAppDetail.fieldHSK')}
              value={
                app.hskLevel
                  ? `${app.hskLevel}${app.hskScore ? ` · ${app.hskScore}` : ''}`
                  : null
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Application context (prior China study, funding) — Phase 52
          narrowed to just the China-history fields. The Funding
          sub-card (fundingSource/scholarshipName) was dropped from
          the partner application form in Phase 51f, so new rows
          can never populate it. Pre-51f rows still show their
          stored values via the read-side mapper, but rendering
          them here would just confuse partners ("why is there a
          field I can't edit?"). Same for the Personal Statement
          card below — Phase 51f removed the form, so we hide the
          card entirely. Read-side data is preserved on the
          PartnerApplication interface for any future restore. */}
      {(app.hasStudiedInChina !== null || app.hasAppliedChinaUni !== null) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionContext')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field
              label={t('partnerAppDetail.fieldStudiedInChinaBefore')}
              value={
                app.hasStudiedInChina === null
                  ? null
                  : app.hasStudiedInChina
                  ? t('partnerAppDetail.yes')
                  : t('partnerAppDetail.no')
              }
            />
            <Field
              label={t('partnerAppDetail.fieldAppliedToCNUniBefore')}
              value={
                app.hasAppliedChinaUni === null
                  ? null
                  : app.hasAppliedChinaUni
                  ? t('partnerAppDetail.yes')
                  : t('partnerAppDetail.no')
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Personal statement — Phase 52 hidden. The form no longer
          writes to whyProgram/careerPlan (Phase 51f removed
          Section 8 from the create/edit wizard). New rows will
          never have data; pre-51f rows keep their stored values
          but showing the card invites the "why can't I edit?"
          question. Hide the card and rely on the read-side
          PartnerApplication interface to preserve the data for
          any future restore. */}

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionNotes')}</CardTitle>
        </CardHeader>
        <CardContent>
          {app.notes ? (
            <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{app.notes}</p>
          ) : (
            <p className="text-sm text-[#4B5563] italic">{t('partnerAppDetail.noNotesYet')}</p>
          )}
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
              <Button asChild variant="outline" size="sm" className="rounded-none mt-3">
                <Link
                  href={`/partner/documents?partnerApplicationId=${encodeURIComponent(applicationId)}`}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t('partnerAppDetail.uploadDocument')}
                </Link>
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
                        <span>{formatBytes(doc.fileSize)}</span>
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
              <Button asChild variant="outline" size="sm" className="rounded-none mt-2">
                <Link
                  href={`/partner/documents?partnerApplicationId=${encodeURIComponent(applicationId)}`}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  {t('partnerAppDetail.uploadDocument')}
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function formatBytes(n: number | null | undefined): string {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className={`font-medium text-[#1F2937] ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

// Local icon shim — keeps the import block short and matches the
// pattern used elsewhere in the partner portal.
function UserIcon({ name, className }: { name: string; className?: string }) {
  // We import BookOpen statically at the top of the file and re-use
  // it here. The "name" param is a future-proofing hook for the day
  // we want to add a User icon next to student info.
  if (name === 'book') return <BookOpen className={className} />;
  return <BookOpen className={className} />;
}
