'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Trash2, Calendar, Building, BookOpen, AlertTriangle,
  Mail, Phone, Globe, Hash, Flag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const load = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ application: PartnerApplication }>(
        `/api/partner/applications/${applicationId}`,
      );
      setApp(res.application);
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
            <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              {t('partnerAppDetail.statusAdminNote')}
            </p>
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
