'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Building, Mail, Phone, Globe, Hash, Flag,
  CheckCircle2, XCircle, Loader2, Link2, Pencil,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { University, Program } from '@/lib/data';
import {
  PARTNER_APPLICATION_STATUSES,
  PARTNER_APPLICATION_DECISIONS,
  PARTNER_APPLICATION_PRIORITIES,
  PartnerApplication,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
  PartnerApplicationPriority,
} from '@/lib/partner-application-mapper';

// S27: this is the only page in the system where the admin can
// change the application status / decision. The partner's
// /partner/applications/[id] page is read-only for status. The
// partner's PATCH endpoint rejects status/decision with 403.
//
// When the admin changes status here:
//   - We re-fetch the row to get the canonical server-side state
//     (auto-stamped submittedAt, etc.)
//   - We don't try to be clever with the form — the API
//     `mapPartnerApplicationToDb` accepts every field, so the
//     patch is just a flat JSON object of what's changed.

const STATUS_VARIANTS: Record<PartnerApplicationStatus, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Submitted: 'bg-blue-100 text-blue-800',
  'In Review': 'bg-yellow-100 text-yellow-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Withdrawn: 'bg-gray-100 text-gray-700',
};

const PRIORITY_VARIANTS: Record<PartnerApplicationPriority, string> = {
  Low: 'bg-gray-100 text-gray-700',
  Normal: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-[#9B1B30] text-white',
};

export default function AdminPartnerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;
  const { t } = useI18n();

  const [app, setApp] = useState<PartnerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  // Phase 54: assign university/program modal state
  const [showAssign, setShowAssign] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignCatalogLoading, setAssignCatalogLoading] = useState(false);
  const [selectedUniversitySlug, setSelectedUniversitySlug] = useState('');
  const [selectedProgramSlug, setSelectedProgramSlug] = useState('');

  // Phase 76: document-request modal state
  const [showDocRequestModal, setShowDocRequestModal] = useState(false);
  const [docRequestCategories, setDocRequestCategories] = useState<
    Array<'passport' | 'transcript' | 'english_test' | 'photo' | 'other'>
  >([]);
  const [docRequestMessage, setDocRequestMessage] = useState('');
  const [isRequestingDocs, setIsRequestingDocs] = useState(false);
  const [docRequestError, setDocRequestError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ application: PartnerApplication }>(
        `/api/admin/partner-applications/${applicationId}`,
      );
      setApp(res.application);
      setAdminNotes(res.application.notes ?? '');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load application.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const patchField = useCallback(
    async (field: 'status' | 'decision' | 'priority', value: string) => {
      if (!app) return;
      // All three fields share one save flag — the previous ternary
      // (`field === 'status' ? setIsSavingStatus : setIsSavingStatus`)
      // had identical branches (dead code).
      setIsSavingStatus(true);
      setError(null);
      try {
        const payload: Record<string, unknown> = { [field]: value };
        // Auto-stamp submittedAt when the admin flips Draft → Submitted
        // (or any Submitted-ish state) and the row doesn't have one
        // yet. Mirrors the partner wizard's logic for the partner's
        // own submissions.
        if (
          field === 'status' &&
          (value === 'Submitted' || value === 'In Review') &&
          !app.submittedAt
        ) {
          payload.submittedAt = new Date().toISOString();
        }
        const res = await apiFetchJson<{ application: PartnerApplication }>(
          `/api/admin/partner-applications/${applicationId}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          },
        );
        setApp(res.application);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Failed to update ${field} to ${value}.`,
        );
      } finally {
        setIsSavingStatus(false);
      }
    },
    [app, applicationId],
  );

  const saveNotes = useCallback(async () => {
    if (!app) return;
    setIsSavingNotes(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ application: PartnerApplication }>(
        `/api/admin/partner-applications/${applicationId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ notes: adminNotes }),
        },
      );
      setApp(res.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes.');
    } finally {
      setIsSavingNotes(false);
    }
  }, [app, applicationId, adminNotes]);

  // Phase 76: submit a new "request documents" event. Appends to
  // the documents_requested JSONB array on the server, which is
  // hydrated back into app.documentsRequested on the next load().
  const submitDocRequest = useCallback(async () => {
    if (!app) return;
    if (docRequestCategories.length === 0) return;
    setIsRequestingDocs(true);
    setDocRequestError(null);
    try {
      await apiFetchJson(
        `/api/admin/partner-applications/${applicationId}/request-documents`,
        {
          method: 'POST',
          body: JSON.stringify({
            categories: docRequestCategories,
            message: docRequestMessage || undefined,
          }),
        },
      );
      // Re-fetch the app to get the updated documents_requested array
      await load();
      setShowDocRequestModal(false);
      setDocRequestCategories([]);
      setDocRequestMessage('');
    } catch (err) {
      setDocRequestError(
        err instanceof Error ? err.message : t('adminPartnerApp.errorRequestFailed'),
      );
    } finally {
      setIsRequestingDocs(false);
    }
  }, [app, applicationId, docRequestCategories, docRequestMessage, load, t]);

  // Phase 54: open the assignment modal and load the live catalog.
  const openAssignModal = useCallback(async () => {
    setShowAssign(true);
    setAssignCatalogLoading(true);
    setSelectedUniversitySlug('');
    setSelectedProgramSlug('');
    try {
      const [u, p] = await Promise.all([
        apiFetchJson<{ universities: University[] }>('/api/universities?limit=200').catch(
          () => ({ universities: [] }),
        ),
        apiFetchJson<{ programs: Program[] }>('/api/programs?limit=500').catch(
          () => ({ programs: [] }),
        ),
      ]);
      setUniversities(u.universities || []);
      setPrograms(p.programs || []);
      // Pre-select the current university/program if they exist in the catalog.
      if (app?.university) {
        const matchedUni = (u.universities || []).find((x) => x.name === app.university);
        if (matchedUni) {
          setSelectedUniversitySlug(matchedUni.slug);
        }
      }
      if (app?.program) {
        const matchedProg = (p.programs || []).find((x) => x.name === app.program);
        if (matchedProg) {
          setSelectedProgramSlug(matchedProg.slug);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog.');
    } finally {
      setAssignCatalogLoading(false);
    }
  }, [app]);

  const closeAssignModal = useCallback(() => {
    setShowAssign(false);
    setSelectedUniversitySlug('');
    setSelectedProgramSlug('');
  }, []);

  const handleAssign = useCallback(async () => {
    if (!app || !selectedProgramSlug) return;
    const picked = programs.find((p) => p.slug === selectedProgramSlug);
    if (!picked) return;
    const uni = universities.find((u) => u.slug === picked.universitySlug);
    setAssignLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ application: PartnerApplication }>(
        `/api/admin/partner-applications/${applicationId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            university: uni?.name ?? picked.universitySlug,
            program: picked.name,
            degree: picked.degree,
            intake: picked.intake,
          }),
        },
      );
      setApp(res.application);
      closeAssignModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign university/program.');
    } finally {
      setAssignLoading(false);
    }
  }, [app, applicationId, closeAssignModal, programs, selectedProgramSlug, universities]);

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
        {/* Phase 33: the standalone Partner Pipeline list page
            is now a redirect to /admin/applications?surface=partner.
            Update the back-link here so the user lands on the
            unified partner-only view, not the redirect hop. */}
        <Link
          href="/admin/applications?surface=partner"
          className="inline-flex items-center gap-2 text-[#1B2A4A]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Partner Pipeline
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700">
            <p className="font-medium">Couldn't load application</p>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Phase 33: same redirect fix — back-link to the unified
            partner-only view, not the now-redirecting standalone
            list page. */}
        <Link
          href="/admin/applications?surface=partner"
          className="p-2 hover:bg-gray-100 inline-flex"
        >
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            {app.studentName ?? '—'}
          </h1>
          <p className="text-[#4B5563] mt-1 text-sm">
            {app.university && app.program
              ? `${app.university} · ${app.program}`
              : app.university || app.program || 'University / program not yet assigned'}
            {app.applicationNumber && (
              <span className="ml-2 font-mono text-xs text-gray-400">
                {app.applicationNumber}
              </span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {/* Phase 54: admin modal for assigning a catalog university/program
          to applications created without one. */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent className="rounded-none max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign university / program</DialogTitle>
            <DialogDescription>
              Pick a program from the live catalog. The university, degree and
              intake will be filled in automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>University</Label>
              <SearchableSelect
                value={selectedUniversitySlug}
                onChange={(value) => {
                  setSelectedUniversitySlug(value);
                  setSelectedProgramSlug('');
                }}
                options={universities.map((u) => ({
                  value: u.slug,
                  label: u.name,
                }))}
                placeholder={assignCatalogLoading ? 'Loading…' : 'Select a university'}
                emptyText="No universities found"
                searchPlaceholder="Search universities…"
                loading={assignCatalogLoading}
              />
            </div>
            <div>
              <Label>Program</Label>
              <SearchableSelect
                value={selectedProgramSlug}
                onChange={setSelectedProgramSlug}
                options={programs
                  .filter(
                    (p) =>
                      !selectedUniversitySlug || p.universitySlug === selectedUniversitySlug,
                  )
                  .map((p) => ({
                    value: p.slug,
                    label: p.name,
                    sublabel: `${p.degree} · ${p.language}`,
                  }))}
                placeholder={assignCatalogLoading ? 'Loading…' : 'Select a program'}
                emptyText={
                  selectedUniversitySlug
                    ? 'No programs for this university'
                    : 'Select a university first'
                }
                searchPlaceholder="Search programs…"
                disabled={!selectedUniversitySlug || assignCatalogLoading}
                loading={assignCatalogLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeAssignModal}
              disabled={assignLoading}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assignLoading || !selectedProgramSlug}
              className="rounded-none bg-[#1B2A4A] hover:bg-[#26345A] text-white"
            >
              {assignLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                'Save assignment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workflow control — the only place in the system that can
          move an application through the pipeline. */}
      <Card className="rounded-none border-[#1B2A4A] border-2">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Workflow
          </CardTitle>
          <p className="text-xs text-gray-500 mt-1">
            The partner can't change these — only the admin team.
          </p>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2 mt-1">
                <Select
                  value={app.status}
                  disabled={isSavingStatus}
                  onValueChange={(v) => patchField('status', v)}
                >
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_APPLICATION_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isSavingStatus && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
              <Badge
                variant="outline"
                className={`rounded-none border-0 mt-2 ${STATUS_VARIANTS[app.status]}`}
              >
                {app.status}
              </Badge>
            </div>
            <div>
              <Label>Decision</Label>
              <div className="flex items-center gap-2 mt-1">
                <Select
                  value={app.decision}
                  disabled={isSavingStatus}
                  onValueChange={(v) => patchField('decision', v)}
                >
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_APPLICATION_DECISIONS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="rounded-none mt-2">
                {app.decision}
              </Badge>
            </div>
            <div>
              <Label>Priority (partner-set)</Label>
              <div className="mt-1">
                <Select
                  value={app.priority}
                  disabled={isSavingStatus}
                  onValueChange={(v) => patchField('priority', v)}
                >
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTNER_APPLICATION_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none mt-2 ${PRIORITY_VARIANTS[app.priority]}`}
                >
                  <Flag className="w-3 h-3" /> {app.priority}
                </span>
              </div>
            </div>
          </div>
          {app.submittedAt && (
            <p className="text-xs text-gray-500">
              Submitted at: {new Date(app.submittedAt).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
              <Building className="w-4 h-4" /> University & Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">University:</span>
              {app.university ? (
                <span className="font-medium text-[#1F2937]">{app.university}</span>
              ) : (
                <Badge variant="outline" className="rounded-none border-amber-300 text-amber-700 bg-amber-50">
                  Needs assignment
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#4B5563] min-w-24">Program:</span>
              {app.program ? (
                <span className="font-medium text-[#1F2937]">{app.program}</span>
              ) : (
                <Badge variant="outline" className="rounded-none border-amber-300 text-amber-700 bg-amber-50">
                  Needs assignment
                </Badge>
              )}
            </div>
            <Field label="Intake" value={app.intake} />
            <Field label="Degree" value={app.degree} />
            <Field label="Application #" value={app.applicationNumber} mono />
            <Field
              label="Created"
              value={app.createdAt ? new Date(app.createdAt).toLocaleString() : null}
            />
            <Field
              label="Updated"
              value={app.updatedAt ? new Date(app.updatedAt).toLocaleString() : null}
            />
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openAssignModal}
                className="rounded-none"
              >
                <Pencil className="mr-2 h-3 w-3" />
                {app.university && app.program ? 'Re-assign university / program' : 'Assign university / program'}
              </Button>
            </div>
          </CardContent>
        </Card>

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
                <a
                  href={`tel:${app.studentPhone}`}
                  className="text-[#1B2A4A] hover:underline"
                >
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
            {app.applicationNumber && (
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#4B5563]" />
                <span className="font-mono text-[#1B2A4A]">
                  {app.applicationNumber}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phase A: links to the partner student record and the real
          student profile (when linked). */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Related Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#4B5563] min-w-32">Partner student:</span>
            {app.studentId ? (
              <Link
                href={`/admin/partner-students/${app.studentId}`}
                className="text-[#1B2A4A] hover:underline font-medium"
              >
                View partner student record →
              </Link>
            ) : (
              <span className="text-gray-400">Not linked to a partner student</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#4B5563] min-w-32">Student profile:</span>
            {app.linkedStudentProfileId ? (
              <Link
                href={`/admin/students/${app.linkedStudentProfileId}`}
                className="text-[#1B2A4A] hover:underline font-medium"
              >
                View student profile →
              </Link>
            ) : (
              <span className="text-gray-400">Not linked to a student profile</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Extended S26 fields (academic, language, funding, personal statement)
          shown read-only — admin can read but partner is the one who
          keeps them up to date. */}
      {(app.highestEducation || app.schoolName || app.gpa || app.englishTest || app.fundingSource) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">Application Data (S26)</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Captured by the partner. Read-only here — partner edits via
              their portal.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {app.highestEducation && (
              <Field label="Highest Education" value={app.highestEducation} />
            )}
            {app.schoolName && <Field label="School" value={app.schoolName} />}
            {app.major && <Field label="Major" value={app.major} />}
            {app.gpa && <Field label="GPA" value={app.gpa} />}
            {app.graduationYear && (
              <Field label="Graduation Year" value={String(app.graduationYear)} />
            )}
            {app.englishTest && (
              <Field
                label="English"
                value={
                  app.englishScore
                    ? `${app.englishTest} · ${app.englishScore}`
                    : app.englishTest
                }
              />
            )}
            {app.hskLevel && (
              <Field
                label="HSK"
                value={
                  app.hskScore
                    ? `${app.hskLevel} · ${app.hskScore}`
                    : app.hskLevel
                }
              />
            )}
            {app.fundingSource && (
              <Field label="Funding Source" value={app.fundingSource} />
            )}
            {app.scholarshipName && (
              <Field label="Scholarship" value={app.scholarshipName} />
            )}
            {app.hasStudiedInChina !== null && (
              <Field
                label="Studied in China before"
                value={app.hasStudiedInChina ? 'Yes' : 'No'}
              />
            )}
            {app.hasAppliedChinaUni !== null && (
              <Field
                label="Applied to CN uni before"
                value={app.hasAppliedChinaUni ? 'Yes' : 'No'}
              />
            )}
          </CardContent>
        </Card>
      )}

      {(app.whyProgram || app.careerPlan) && (
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A]">Personal Statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {app.whyProgram && (
              <div>
                <div className="text-[#4B5563] font-medium mb-1">
                  Why this program?
                </div>
                <p className="text-[#1F2937] whitespace-pre-wrap">
                  {app.whyProgram}
                </p>
              </div>
            )}
            {app.careerPlan && (
              <div>
                <div className="text-[#4B5563] font-medium mb-1">
                  Post-graduation plan
                </div>
                <p className="text-[#1F2937] whitespace-pre-wrap">
                  {app.careerPlan}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin notes — internal only. The partner has their own
          "Internal Notes" field which is separate. */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-[#1B2A4A]">Admin Notes</CardTitle>
          <p className="text-xs text-gray-500 mt-1">
            Visible to admins only. Use for internal context, decision
            rationale, or follow-up actions.
          </p>
        </CardHeader>
        <CardContent>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            className="rounded-none"
            placeholder="Internal notes — visible to admins only."
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={saveNotes}
              disabled={isSavingNotes || adminNotes === (app.notes ?? '')}
              size="sm"
              className="rounded-none bg-[#1B2A4A] hover:bg-[#26345A] text-white"
            >
              {isSavingNotes ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" /> Saving…
                </>
              ) : (
                'Save Notes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Phase 76: Documents — files uploaded by the student +
          open admin "request documents" events. Shows for all
          sources; the source badge tells admin whether this row
          came from the public form (where docs are most likely to
          be missing) or the partner portal. */}
      <Card className="rounded-none border-gray-200 mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Documents
                {app.source === 'public_form' ? (
                  <Badge className="bg-orange-100 text-orange-800 rounded-none">
                    {t('adminPartnerApp.sourceBadge')}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="rounded-none">
                    {t('adminPartnerApp.sourceBadgePartner')}
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                {t('adminPartnerApp.documentsSubtitle')}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDocRequestModal(true)}
              className="rounded-none"
            >
              {t('adminPartnerApp.requestButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Open requests */}
          {(() => {
            const openRequests = (app.documentsRequested ?? []).filter((r) => !r.fulfilled_at);
            if (openRequests.length === 0) {
              return (
                <p className="text-xs text-gray-500">
                  {t('adminPartnerApp.openRequestsNone')}
                </p>
              );
            }
            return (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#1B2A4A] uppercase tracking-wider">
                  {t('adminPartnerApp.openRequests')} ({openRequests.length})
                </div>
                {openRequests.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-amber-50 border border-amber-200"
                  >
                    <div className="flex flex-wrap gap-1 mb-1">
                      {r.categories.map((c) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          className="rounded-none text-xs"
                        >
                          {t(`adminPartnerApp.requestCategory${c.charAt(0).toUpperCase()}${c.slice(1).replace(/_([a-z])/g, (_, x) => x.toUpperCase())}` as 'adminPartnerApp.requestCategoryPassport' | 'adminPartnerApp.requestCategoryTranscript' | 'adminPartnerApp.requestCategoryEnglishTest' | 'adminPartnerApp.requestCategoryPhoto' | 'adminPartnerApp.requestCategoryOther')}
                        </Badge>
                      ))}
                    </div>
                    {r.message && (
                      <p className="text-sm text-gray-700 mt-1">{r.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {t('adminPartnerApp.requestedBy')}{' '}
                      {r.requested_by.slice(0, 8)} ·{' '}
                      {new Date(r.requested_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Fulfilled history (collapsed — small list) */}
          {(() => {
            const fulfilled = (app.documentsRequested ?? []).filter((r) => r.fulfilled_at);
            if (fulfilled.length === 0) return null;
            return (
              <div className="text-xs text-gray-500">
                {t('adminPartnerApp.fulfilledRequests')}: {fulfilled.length}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Phase 76: Document-request modal */}
      <Dialog open={showDocRequestModal} onOpenChange={setShowDocRequestModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('adminPartnerApp.requestTitle')}</DialogTitle>
            <DialogDescription>
              {t('adminPartnerApp.requestBody')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(['passport', 'transcript', 'english_test', 'photo', 'other'] as const).map(
              (cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={docRequestCategories.includes(cat)}
                    onChange={(e) => {
                      setDocRequestCategories((prev) =>
                        e.target.checked
                          ? [...prev, cat]
                          : prev.filter((c) => c !== cat),
                      );
                    }}
                  />
                  {t(
                    `adminPartnerApp.requestCategory${cat.charAt(0).toUpperCase()}${cat.slice(1).replace(/_([a-z])/g, (_, x) => x.toUpperCase())}` as 'adminPartnerApp.requestCategoryPassport' | 'adminPartnerApp.requestCategoryTranscript' | 'adminPartnerApp.requestCategoryEnglishTest' | 'adminPartnerApp.requestCategoryPhoto' | 'adminPartnerApp.requestCategoryOther',
                  )}
                </label>
              ),
            )}
            <div className="pt-2">
              <Label>{t('adminPartnerApp.requestMessage')}</Label>
              <Textarea
                value={docRequestMessage}
                onChange={(e) => setDocRequestMessage(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={t('adminPartnerApp.requestMessagePh')}
              />
            </div>
            {docRequestError && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {docRequestError}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDocRequestModal(false)}
              disabled={isRequestingDocs}
            >
              {t('adminApiKeys.cancel')}
            </Button>
            <Button
              onClick={submitDocRequest}
              disabled={
                isRequestingDocs || docRequestCategories.length === 0
              }
              className="bg-[#9B1B30] hover:bg-[#7A1526] text-white"
            >
              {isRequestingDocs ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  {t('adminPartnerApp.requestSending')}
                </>
              ) : (
                t('adminPartnerApp.requestSubmit')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs uppercase tracking-wider text-[#4B5563] font-medium">
      {children}
    </label>
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
      <span
        className={`font-medium text-[#1F2937] ${mono ? 'font-mono' : ''}`}
      >
        {value || '—'}
      </span>
    </div>
  );
}
