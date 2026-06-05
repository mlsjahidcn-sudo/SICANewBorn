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
      setError(err instanceof Error ? err.message : 'Failed to load application.');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/applications/${applicationId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      router.push('/partner/applications');
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

  if (error && !app) {
    return (
      <div className="space-y-4">
        <Link href="/partner/applications" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Couldn't load application</p>
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
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">Delete Application</h3>
            <p className="text-[#4B5563] mb-6">
              Delete application for <strong>{app.studentName}</strong> at {app.university}? This cannot be undone.
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
                title="Partner-set priority"
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
              <Building className="w-4 h-4" /> University & Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="University" value={app.university} />
            <Field label="Program" value={app.program} />
            <Field label="Intake" value={app.intake} />
            <Field label="Degree" value={app.degree} />
            <Field label="Application #" value={app.applicationNumber} mono />
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
              <UserIcon name="book" className="w-4 h-4" /> Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">Status:</span>
              <Badge variant={STATUS_VARIANTS[app.status]} className="rounded-none">
                {app.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">Decision:</span>
              <Badge variant="outline" className="rounded-none">{app.decision}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">Priority:</span>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
              >
                <Flag className="w-3 h-3" /> {app.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">Submitted:</span>
              <span className="text-[#1F2937]">
                {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
              </span>
            </div>
            <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              Status and Decision are set by SICA's admin team — you can't
              change them from the partner portal. Email SICA if you need
              a status change.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
            <Mail className="w-4 h-4" /> Student Contact
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
            <p className="text-sm text-[#4B5563] italic">No email on file.</p>
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
              Added by <span className="font-medium text-[#1B2A4A]">{app.createdByEmail}</span>
              {app.createdAt && (
                <> on {new Date(app.createdAt).toLocaleDateString()}</>
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
            <CardTitle className="text-[#1B2A4A]">Identity & Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Date of Birth" value={app.dateOfBirth} />
            <Field label="Gender" value={app.gender} />
            <Field label="Marital Status" value={app.maritalStatus} />
            <Field label="Place of Birth" value={app.placeOfBirth} />
            {app.currentAddress && (
              <div>
                <div className="text-[#4B5563] mb-1">Current Address:</div>
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
            <CardTitle className="text-[#1B2A4A]">Passport</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Passport #" value={app.passportNumber} mono />
            <Field label="Issue Date" value={app.passportIssueDate} />
            <Field label="Expiry Date" value={app.passportExpiryDate} />
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
            <CardTitle className="text-[#1B2A4A]">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Name" value={app.emergencyContactName} />
            <Field label="Relationship" value={app.emergencyContactRelationship} />
            <Field label="Phone" value={app.emergencyContactPhone} />
            <Field label="Email" value={app.emergencyContactEmail} />
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
            <CardTitle className="text-[#1B2A4A]">Academic Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Highest Education" value={app.highestEducation} />
            <Field label="School" value={app.schoolName} />
            <Field label="Country" value={app.schoolCountry} />
            <Field label="Major" value={app.major} />
            <Field
              label="Graduation Year"
              value={app.graduationYear ? String(app.graduationYear) : null}
            />
            <Field label="GPA" value={app.gpa} />
            <Field label="Class Rank" value={app.classRank} />
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
            <CardTitle className="text-[#1B2A4A]">Language Proficiency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field label="Native Language" value={app.nativeLanguage} />
            <Field
              label="English"
              value={
                app.englishTest
                  ? `${app.englishTest}${app.englishScore ? ` · ${app.englishScore}` : ''}`
                  : null
              }
            />
            <Field
              label="HSK"
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
            <CardTitle className="text-[#1B2A4A]">Application Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Field
              label="Studied in China before"
              value={
                app.hasStudiedInChina === null
                  ? null
                  : app.hasStudiedInChina
                  ? 'Yes'
                  : 'No'
              }
            />
            <Field
              label="Applied to CN uni before"
              value={
                app.hasAppliedChinaUni === null
                  ? null
                  : app.hasAppliedChinaUni
                  ? 'Yes'
                  : 'No'
              }
            />
            <Field label="Funding Source" value={app.fundingSource} />
            <Field label="Scholarship / Sponsor" value={app.scholarshipName} />
          </CardContent>
        </Card>
      )}

      {/* Personal statement */}
      {(app.whyProgram || app.careerPlan) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">Personal Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {app.whyProgram && (
              <div>
                <div className="text-[#4B5563] font-medium mb-1">Why this program?</div>
                <p className="text-[#1F2937] whitespace-pre-wrap">{app.whyProgram}</p>
              </div>
            )}
            {app.careerPlan && (
              <div>
                <div className="text-[#4B5563] font-medium mb-1">Post-graduation plan</div>
                <p className="text-[#1F2937] whitespace-pre-wrap">{app.careerPlan}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-[#1B2A4A]">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {app.notes ? (
            <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{app.notes}</p>
          ) : (
            <p className="text-sm text-[#4B5563] italic">No notes recorded yet.</p>
          )}
          <p className="text-xs text-[#4B5563] mt-4 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {app.createdAt ? new Date(app.createdAt).toLocaleString() : '—'}
            {app.updatedAt && app.updatedAt !== app.createdAt && (
              <> · Updated {new Date(app.updatedAt).toLocaleString()}</>
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
