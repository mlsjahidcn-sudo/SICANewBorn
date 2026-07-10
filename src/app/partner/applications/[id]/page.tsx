'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Trash2, Calendar, Building, BookOpen, AlertTriangle,
  Mail, Phone, Globe, Hash, Flag, Info, Copy, ClipboardCopy, RotateCcw, CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type {
  PartnerApplication,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
  PartnerApplicationPriority,
} from '@/lib/partner-application-mapper';

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

export default function PartnerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const applicationId = params.id as string;

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

  const load = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [appRes, reviewerRes] = await Promise.all([
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
      ]);
      setApp(appRes.application);
      setReviewer(reviewerRes.reviewer);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerAppDetail.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/applications/${applicationId}`, { method: 'DELETE' });
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
      const res = await fetch(
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
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">{t('partnerAppDetail.deleteTitle')}</h3>
            <p className="text-[#4B5563] mb-6">
              {t('partnerAppDetail.deleteBodyFor', { student: app.studentName, university: app.university })}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                {t('partnerAppDetail.cancel')}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? t('partnerAppDetail.deleting') : t('partnerAppDetail.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phase 49.4: "Request withdrawal" modal. Optional reason
          (capped at 1000 chars server-side). On success we
          show a confirmation banner inside the modal for 2.5s
          before auto-closing. The endpoint inserts a
          'Withdrawal Requested' timeline event the admin sees
          on the partner-application detail. */}
      {showWithdrawal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">
              {t('partnerAppDetail.withdrawalTitle')}
            </h3>
            {!withdrawalSent ? (
              <>
                <p className="text-[#4B5563] mb-4 text-sm">
                  {t('partnerAppDetail.withdrawalBody', { student: app.studentName, university: app.university })}
                </p>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                  {t('partnerAppDetail.withdrawalReasonLabel')}
                </label>
                <Textarea
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="rounded-none mb-1"
                  placeholder={t('partnerAppDetail.withdrawalReasonPlaceholder')}
                />
                <p className="text-xs text-gray-500 mb-4">
                  {t('partnerAppDetail.withdrawalReasonHint', { count: withdrawalReason.length })}
                </p>
                {withdrawalErr && (
                  <p className="text-sm text-red-700 mb-3">{withdrawalErr}</p>
                )}
                <div className="flex gap-3 justify-end">
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
                </div>
              </>
            ) : (
              <div className="text-sm text-green-800 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-700 flex-shrink-0" />
                <p>{t('partnerAppDetail.withdrawalSent')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/partner/applications" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{app.studentName}</h1>
            <Badge variant={STATUS_VARIANTS[app.status]} className="rounded-none">
              {app.status}
            </Badge>
            <Badge variant="outline" className="rounded-none">
              {app.decision}
            </Badge>
            {app.priority && app.priority !== 'Normal' && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
                title={t('partnerAppDetail.priorityTitle')}
              >
                <Flag className="w-3 h-3" /> {app.priority}
              </span>
            )}
          </div>
          <p className="text-[#4B5563] mt-1 text-sm">
            {app.university} · {app.program}
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
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
              <Building className="w-4 h-4" /> {t('partnerAppDetail.sectionUniversityProgram')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label={t('partnerAppDetail.fieldUniversity')} value={app.university} />
            <Field label={t('partnerAppDetail.fieldProgram')} value={app.program} />
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
                {app.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldDecision')}</span>
              <Badge variant="outline" className="rounded-none">{app.decision}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldPriority')}</span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
              >
                <Flag className="w-3 h-3" /> {app.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">{t('partnerAppDetail.fieldSubmitted')}</span>
              <span className="text-[#1F2937]">
                {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : t('partnerCommon.placeholderDash')}
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
                <> {t('partnerAppDetail.addedOn', { date: new Date(app.createdAt).toLocaleDateString() })}</>
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
                      date: new Date(reviewer.at).toLocaleDateString(),
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

      {/* Application context (prior China study, funding) */}
      {(app.hasStudiedInChina !== null ||
        app.hasAppliedChinaUni !== null ||
        app.fundingSource ||
        app.scholarshipName) && (
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
            <Field label={t('partnerAppDetail.fieldFundingSource')} value={app.fundingSource} />
            <Field label={t('partnerAppDetail.fieldScholarship')} value={app.scholarshipName} />
          </CardContent>
        </Card>
      )}

      {/* Personal statement */}
      {(app.whyProgram || app.careerPlan) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">{t('partnerAppDetail.sectionPersonalStatement')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {app.whyProgram && (
              <div>
                <div className="text-[#4B5563] font-medium mb-1">{t('partnerAppDetail.whyThisProgram')}</div>
                <p className="text-[#1F2937] whitespace-pre-wrap">{app.whyProgram}</p>
              </div>
            )}
            {app.careerPlan && (
              <div>
                <div className="text-[#4B5563] font-medium mb-1">{t('partnerAppDetail.careerPlan')}</div>
                <p className="text-[#1F2937] whitespace-pre-wrap">{app.careerPlan}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
            {t('partnerAppDetail.createdOn', { date: app.createdAt ? new Date(app.createdAt).toLocaleString() : t('partnerCommon.placeholderDash') })}
            {app.updatedAt && app.updatedAt !== app.createdAt && (
              <>{t('partnerAppDetail.updatedOn', { date: new Date(app.updatedAt).toLocaleString() })}</>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
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
