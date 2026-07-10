'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Building, Upload, FileText, FileCheck, RefreshCw, Save, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { DocumentUploader, DocumentCategory } from '@/components/student/DocumentUploader';
import { SearchableSelect } from '@/components/ui/searchable-select';
// We keep the *static* enumerations (degreeLevels, documentTypes)
// from data.ts — those are closed taxonomies the wizard drives.
// The university + program lists are now fetched from the API so
// admin-added entries show up immediately. The intake list is
// generated at runtime from the current date (see
// Live intake catalog (Phase 50a). The dropdown is fed from
// /api/intakes?active=true which reads the database/intake_periods
// table. Admin-added intakes show up immediately; we no longer
// depend on the hardcoded getIntendedIntakes() from src/lib/data.ts.
import {
  degreeLevels,
  documentTypes,
  DegreeLevel,
  DocumentType,
  type University,
  type Program,
} from '@/lib/data';

// Form state shape — targetDegreeLevel starts as '' (unset) and narrows to
// a real DegreeLevel after the user picks one. Keeping it as a real union
// (not plain `string`) makes the .includes() check on `requiredFor` type-safe.
interface ApplicationFormData {
  targetDegreeLevel: '' | DegreeLevel;
  targetProgramSlug: string;
  targetUniversity: string;
  intendedIntake: string;
  personalStatement: string;
  additionalNotes: string;
  selectedDocuments: string[];
}

// Runtime guard for Select onValueChange payloads: the shadcn Select gives
// us `string`, but our form state expects the strict DegreeLevel union.
const isDegreeLevel = (v: string): v is DegreeLevel =>
  (degreeLevels as readonly string[]).includes(v);

/**
 * Phase S21: build a starter personal-statement paragraph from the
 * student's profile. The student is expected to rewrite this
 * before submitting — the seed just gives them a starting point
 * so they're not staring at a blank text area. Marked as
 * "from your profile" in the UI so they know it's a draft, not
 * a real statement.
 */
function buildPersonalStatementSeed(
  t: (key: string, params?: Record<string, string | number>) => string,
  prof: {
    target_degree?: string | null;
    target_field?: string | null;
    highest_education?: string | null;
    gpa?: string | null;
    english_proficiency?: string | null;
    english_score?: string | null;
  },
): string {
  const parts: string[] = [];
  if (prof.highest_education || prof.gpa) {
    const edu = prof.highest_education
      ? t('studentWizard.psCompletedMy', { level: prof.highest_education })
      : t('studentWizard.psCompletedGeneric');
    parts.push(`${edu}${prof.gpa ? t('studentWizard.psGpaSuffix', { gpa: prof.gpa }) : ''}.`);
  }
  if (prof.english_proficiency && prof.english_score) {
    parts.push(
      t('studentWizard.psEnglishLine', {
        proficiency: prof.english_proficiency,
        score: prof.english_score,
      }),
    );
  }
  if (prof.target_degree || prof.target_field) {
    const goal = [prof.target_degree, prof.target_field]
      .filter(Boolean)
      .join(' in ');
    parts.push(t('studentWizard.psApplyingTo', { goal }));
  }
  if (parts.length === 0) {
    return '';
  }
  return `${parts.join(' ')}\n\n${t('studentWizard.personalStatementDraftFooter')}`;
}

/**
 * Phase S21: small "from your profile" badge rendered next to
 * fields that were auto-prefilled from /api/student/profile. Helps
 * the student understand the value's source +1 (vs a hardcoded
 * default). The badge disappears the moment the student types
 * over the value (we remove the field from the prefilled set).
 */
function PrefillBadge({ t, children }: { t: (key: string, params?: Record<string, string | number>) => string; children?: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 ml-2 align-middle bg-[#1B2A4A]/10 text-[#1B2A4A] border border-[#1B2A4A]/20 rounded-none whitespace-nowrap"
      title={t('studentWizard.prefilledBadgeTooltip')}
    >
      <UserCircle2 className="h-3 w-3" />
      {t('studentWizard.prefilledBadgeText')}{children}
    </span>
  );
}

// data.ts DocumentType.category is the same union as student-data.ts
// DocumentCategory, but TypeScript doesn't unify across files. We trust
// the runtime values match (they do — both are 'Identity' | 'Academic' |
// 'Language' | 'Financial' | 'Recommendation' | 'Other').
const mapDocCategoryToStudentCategory = (c: string): DocumentCategory =>
  c as DocumentCategory;
// Type-only imports (we removed the mock-student-data runtime imports
// in S14.6; we keep just the types so the SyncableDocument interface
// and DocumentStatus union still resolve.)
import type { StudentDocument, DocumentStatus } from '@/lib/student-data';

// Step labels are translation keys — resolved via t() at render
// time so the step indicator flips with the locale.
const steps = [
  { id: 1, titleKey: 'studentWizard.step1.title', icon: Building },
  { id: 2, titleKey: 'studentWizard.step2.title', icon: FileCheck },
  { id: 3, titleKey: 'studentWizard.step3.title', icon: Check }
];

interface SyncableDocument {
  documentType: DocumentType;
  studentDoc?: StudentDocument;
  selected: boolean;
}

export default function StudentNewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  // Phase 1: when the student clicks "Continue Editing" on a draft
  // detail page, the link is /new?resume=<applicationId>. The wizard
  // loads the existing application and pre-fills the form, then uses
  // PUT (not POST) for both Save-as-Draft and Submit so the same
  // record is updated.
  const resumeId = searchParams.get('resume');
  const isResuming = !!resumeId;
  const [resuming, setResuming] = useState(isResuming);
  const resumeLoadStartedRef = useRef(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  // Phase S20: live university + program lists fetched from the
  // admin-managed API. The static data.ts fallback is gone for
  // these two — admin-added universities / programs now show up
  // in the wizard immediately. The page still works offline-ish: if
  // the API is unreachable we fall back to the static arrays below.
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  // Phase 50a: live intake catalog. Filled by the same
  // useEffect that loads universities + programs. Replaces
  // the static getIntendedIntakes() array — admin-added
  // intakes now show up in the Intended Intake dropdown
  // without a code change.
  const [intakes, setIntakes] = useState<{ slug: string; label: string }[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  // Phase S21: profile prefill. The student already filled out
  // their academic info on /student/profile (target degree, intake,
  // GPA, English score, etc.) — we read it once on mount and
  // pre-fill the wizard fields that match. The student can still
  // override any value; the source-of-truth is the profile, but
  // each application can diverge.
  const [profile, setProfile] = useState<{
    target_degree: string | null;
    target_intake: string | null;
    target_field: string | null;
    english_proficiency: string | null;
    english_score: string | null;
    gpa: string | null;
    highest_education: string | null;
    school_name: string | null;
  } | null>(null);
  /**
   * Which wizard fields were auto-filled from the profile. We
   * render a small "from your profile" badge next to each, and
   * remove the field from this set the moment the student types
   * over it (so the badge disappears and they know the value is
   * now theirs, not the profile's).
   */
  const [prefilledFields, setPrefilledFields] = useState<Set<keyof ApplicationFormData>>(
    new Set(),
  );
  // Track docs that were uploaded during this wizard session so we
  // can PATCH them with the new application_id after the POST
  // succeeds. Without this they're orphans (the doc was uploaded
  // before the application row existed).
  // M8: removed dead `pendingDocIds` state. Was used in an
  // older version of the wizard to track docs uploaded during
  // the session and attach them to the new application once
  // POSTed. Phase S25 replaced that with `linkOrphanDocsToApplication`
  // which re-fetches the full orphan list from the API after
  // create — simpler and covers every orphan, not just the
  // ones uploaded in this session. The old state was
  // initialized, written to, and cleared, but never read.
  const [applicationData, setApplicationData] = useState<ApplicationFormData>({
    targetDegreeLevel: '',
    targetProgramSlug: '',
    targetUniversity: '',
    intendedIntake: '',
    personalStatement: '',
    additionalNotes: '',
    selectedDocuments: []
  });

  /**
   * Phase 1: when `?resume=<id>` is set, load the existing draft and
   * pre-fill the form. The form state needs to be narrowed to
   * DegreeLevel for type-safety on the Select.
   */
  useEffect(() => {
    if (!isResuming || !resumeId || resumeLoadStartedRef.current) return;
    resumeLoadStartedRef.current = true;
    (async () => {
      try {
        const data = await apiFetchJson<{
          application: {
            id: string;
            degree: string | null;
            intake: string | null;
            personalStatement: string | null;
            additionalNotes: string | null;
            university: string;
            program: string;
          };
        }>(`/api/student/applications/${resumeId}`);
        const a = data.application;
        // Match the program by its display name to recover the slug,
        // since the API returns the name not the id. Fall back to the
        // existing form value if no match.
        const matchedProgram = programs.find(
          (p) => p.name === a.program || p.slug === a.program,
        );
        const matchedUniversity = matchedProgram
          ? universities.find((u) => u.slug === matchedProgram.universitySlug)
          : universities.find((u) => u.name === a.university);
        setApplicationData((prev) => ({
          ...prev,
          targetDegreeLevel:
            a.degree && isDegreeLevel(a.degree) ? a.degree : prev.targetDegreeLevel,
          targetProgramSlug: matchedProgram?.slug || prev.targetProgramSlug,
          targetUniversity: matchedUniversity?.slug || prev.targetUniversity,
          intendedIntake: a.intake || prev.intendedIntake,
          personalStatement: a.personalStatement || prev.personalStatement,
          additionalNotes: a.additionalNotes || prev.additionalNotes,
        }));
      } catch (err) {
        // Non-fatal: just start with an empty form. The student can
        // still create a new application.
        const e = err as { message?: string };
        setSubmitError(t('studentWizard.errorCouldNotLoadDraft', { message: e.message || t('studentAppDetail.errorUnknown') }));
      } finally {
        setResuming(false);
      }
    })();
    // We intentionally run this only on mount. resumeId is a string
    // parsed from searchParams; if the user navigates here twice we
    // don't want to re-fetch. The ref guard makes that explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase S20: programs filtered by degree + (optionally) university.
  // The university filter is optional — picking a school narrows the
  // program list, but a student can also leave it empty and see
  // Phase S23: the student wanted to see ALL programs in the
  // dropdown, not a pre-filtered subset. The wizard no longer
  // hides programs by degree level — the student picks from the
  // full list and the program picker auto-fills the rest. We
  // keep the (now unused) targetUniversity filter for backwards-
  // compat with the auto-fill path but the typical flow doesn't
  // touch it. Renamed from `filteredPrograms` to `availablePrograms`
  // so the intent is clear at call sites.
  const availablePrograms = useMemo(() => {
    let list = programs;
    if (applicationData.targetUniversity) {
      list = list.filter(
        (p) => p.universitySlug === applicationData.targetUniversity,
      );
    }
    return list;
  }, [programs, applicationData.targetUniversity]);

  const selectedProgram = availablePrograms.find(p => p.slug === applicationData.targetProgramSlug);
  const selectedUniversity = selectedProgram 
    ? universities.find((u: { slug: string }) => u.slug === selectedProgram.universitySlug)
    : null;

  // Get the current logged-in student from the auth context (real user,
  // NOT mockStudentAccounts[0]). The studentDocuments hook fetches
  // their own documents from /api/student/documents.
  const { user } = useAuth();
  const [studentDocuments, setStudentDocuments] = useState<Array<{
    id: string;
    documentTypeId: string;
    name: string;
    status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
    fileName?: string;
  }>>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Phase S20: fetch universities + programs from the API. Both
  // endpoints are public, no auth required, paginated — we pass
  // a high limit so the whole list comes back in one round-trip.
  // If the API fails we keep the empty arrays; the wizard still
  // renders but the university + program pickers will be empty
  // and the user sees an error.
  useEffect(() => {
    const controller = new AbortController();
    setDataLoading(true);
    Promise.all([
      apiFetchJson<{ universities: University[] }>('/api/universities?limit=200', {
        signal: controller.signal,
      }),
      apiFetchJson<{ programs: Program[] }>('/api/programs?limit=500', {
        signal: controller.signal,
      }),
      // Phase 50a: live intakes. Falls through silently on error
      // so the form still works if the DB is down.
      apiFetchJson<{ intakes: { slug: string; label: string }[] }>(
        '/api/intakes?active=true',
        { signal: controller.signal },
      ).catch(() => ({ intakes: [] })),
      // Phase S21: also fetch the student's profile so we can
      // pre-fill target_degree / target_intake / target_field in
      // the wizard. 404 is fine (the profile trigger may not have
      // run for older accounts) — we just don't pre-fill.
      apiFetchJson<{
        data: {
          target_degree: string | null;
          target_intake: string | null;
          target_field: string | null;
          english_proficiency: string | null;
          english_score: string | null;
          gpa: string | null;
          highest_education: string | null;
          school_name: string | null;
        } | null;
      }>('/api/student/profile', { signal: controller.signal }).catch((err) => {
        // 404 is expected for old accounts; just return null
        if (err && typeof err === 'object' && 'status' in err && (err as { status?: number }).status === 404) {
          return { data: null };
        }
        throw err;
      }),
    ])
      .then(([u, p, i, profRes]) => {
        if (controller.signal.aborted) return;
        setUniversities((u as { universities: University[] }).universities || []);
        setPrograms((p as { programs: Program[] }).programs || []);
        setIntakes(((i as { intakes?: { slug: string; label: string }[] }).intakes) || []);
        const prof = profRes?.data ?? null;
        setProfile(prof);
        // Phase S21: prefill the wizard with profile values, but
        // ONLY if the form field is still empty. This means a
        // student who resumes a draft keeps their picks (their
        // picks win); a fresh wizard pre-fills from the profile.
        if (prof) {
          setApplicationData((prev) => {
            const next = { ...prev };
            const marked: Set<keyof ApplicationFormData> = new Set();
            if (!prev.targetDegreeLevel && prof.target_degree && isDegreeLevel(prof.target_degree)) {
              next.targetDegreeLevel = prof.target_degree;
              marked.add('targetDegreeLevel');
            }
            if (!prev.intendedIntake && prof.target_intake) {
              next.intendedIntake = prof.target_intake;
              marked.add('intendedIntake');
            }
            // Personal statement gets a starter paragraph seeded
            // from the student's profile context. They can edit
            // before submitting — the seed is just a draft.
            if (!prev.personalStatement && (prof.target_field || prof.highest_education)) {
              next.personalStatement = buildPersonalStatementSeed(t, prof);
              marked.add('personalStatement');
            }
            if (marked.size > 0) {
              setPrefilledFields((cur) => {
                const merged = new Set(cur);
                marked.forEach((k) => merged.add(k));
                return merged;
              });
            }
            return next;
          });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('[student/new] failed to load universities/programs:', err);
          setUniversities([]);
          setPrograms([]);
          setIntakes([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setDataLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setDocumentsLoading(true);
    // Phase S20: the API returns { data: [...] } not { documents: [...] }.
    // The previous code looked for d.documents and got undefined, so the
    // wizard started with no docs visible even when the student had
    // uploaded some. Fixed.
    apiFetchJson<{ data: typeof studentDocuments }>('/api/student/documents', {
      signal: controller.signal,
    })
      .then((d) => setStudentDocuments(d.data || []))
      .catch(() => setStudentDocuments([]))
      .finally(() => {
        if (!controller.signal.aborted) setDocumentsLoading(false);
      });
    return () => controller.abort();
  }, [user?.id]);

  // Get syncable documents based on degree level
  const syncableDocuments = useMemo(() => {
    if (!applicationData.targetDegreeLevel) return [];
    // Narrow: after the guard, targetDegreeLevel is 'Bachelor' | 'Master' | 'PhD'
    const level = applicationData.targetDegreeLevel;

    const applicableDocs = documentTypes.filter(doc =>
      doc.requiredFor.includes(level)
    );

    return applicableDocs.map(docType => {
      const studentDoc = studentDocuments.find((sd) => sd.documentTypeId === docType.id);
      const isAutoSync = docType.category === 'Student Basic';
      const isSelected = applicationData.selectedDocuments.includes(docType.id) ||
        (isAutoSync && studentDoc && ['Uploaded', 'Verified'].includes(studentDoc.status));

      return {
        documentType: docType,
        studentDoc,
        selected: isSelected
      };
    });
  }, [applicationData.targetDegreeLevel, studentDocuments, applicationData.selectedDocuments]);

  // Per-step validation. Returns the human label of the first
  // missing required field, or null if the step is complete.
  // The Next button uses this to disable itself + the user sees
  // the error inline so they know exactly what to fix.
  const getStepError = (step: number): string | null => {
    if (step === 1) {
      if (!applicationData.targetDegreeLevel) return t('studentWizard.requiredError', { field: t('studentWizard.degreeLevelLabel').toLowerCase() });
      if (!applicationData.targetProgramSlug) return t('studentWizard.requiredError', { field: t('studentWizard.programLabel').toLowerCase() });
      if (!applicationData.intendedIntake) return t('studentWizard.requiredError', { field: t('studentWizard.intakeLabel').toLowerCase() });
    }
    if (step === 2) {
      // Step 2 is the document upload itself. We only require at
      // least one doc to be linked — submitted applications need
      // docs, but the student can attach them after Submit too in
      // the partner flow. Keeping step 2 soft means the wizard
      // can move on to Review even with no docs.
      return null;
    }
    return null;
  };
  const step1Error = getStepError(1);
  const nextBlocked = currentStep < steps.length && getStepError(currentStep) !== null;

  const handleNext = () => {
    if (currentStep < steps.length) {
      // Don't advance if the current step is invalid. The button
      // is disabled in this state but we keep a guard here too in
      // case keyboard users tab through.
      if (getStepError(currentStep) !== null) return;
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const getSelectedProgramBySlug = () =>
    programs.find((p) => p.slug === applicationData.targetProgramSlug);

  /**
   * Phase S25: after the application is created, link ALL of the
   * student's orphan documents (any document with
   * application_id = NULL) to the new application. This catches
   * the case the user kept hitting: upload a doc on
   * /student/documents, then create an application, and the doc
   * doesn't get linked. Previously we only tracked
   * pendingDocIds (docs uploaded in the wizard session) — the
   * re-fetch approach below is simpler and covers everything.
   *
   * Failures are non-fatal: if a single PATCH errors out (e.g. the
   * server returns 401 because the JWT is mid-rotation) we just
   * log it and move on. The user can always re-attach manually
   * from /student/documents.
   */
  const linkOrphanDocsToApplication = useCallback(async (applicationId: string) => {
    try {
      // Re-fetch the full doc list — the wizard's local
      // studentDocuments state is filtered by what's needed for
      // step 2, but we need every orphan. The API response shape
      // is { data: [...] } (Phase S20 fix).
      const res = await apiFetchJson<{
        data: Array<{ id: string; application_id: string | null }>;
      }>('/api/student/documents');
      const orphans = (res.data || []).filter(
        (d) => d.application_id === null || d.application_id === undefined,
      );
      if (orphans.length === 0) {
        // Nothing to do — no orphan docs to attach.
        return;
      }
      // Patch each orphan with the new application_id. We do
      // these in parallel — the PATCH is idempotent and a
      // failure on one doc doesn't block the others.
      const results = await Promise.allSettled(
        orphans.map((doc) =>
          apiFetchJson(`/api/student/documents/${doc.id}`, {
            method: 'PUT',
            body: JSON.stringify({ applicationId }),
          }),
        ),
      );
      // Refresh the local studentDocuments state so step 2 +
      // the post-submit detail page show the new link.
      setStudentDocuments((prev) =>
        prev.map((d) => {
          if (orphans.some((o) => o.id === d.id)) {
            return { ...d, documentTypeId: d.documentTypeId, name: d.name, status: d.status, fileName: d.fileName, applicationId: applicationId } as typeof d;
          }
          return d;
        }),
      );
      // Log any failures so the next refactor can address them
      const failed = results.filter((r) => r.status === 'rejected').length;
      if (failed > 0) {
        console.error(`[student/new] ${failed} of ${orphans.length} doc links failed`);
      }
    } catch (err) {
      console.error('[student/new] linkOrphanDocsToApplication failed:', err);
      // Don't throw — the application was created successfully,
      // the doc linking is best-effort. The user can re-attach
      // from /student/documents.
    }
  }, []);

  /**
   * Phase 1: save the current form state as a Draft. Available on
   * every step. POSTs with status='Draft' for a new application, or
   * PUTs status='Draft' when resuming an existing draft. The API
   * allows a Draft with just universityName + programName; other
   * fields can be filled in later.
   */
  const handleSaveAsDraft = async () => {
    if (!applicationData.targetUniversity) {
      setSubmitError(t('studentWizard.errorPickUniversity'));
      setCurrentStep(1);
      return;
    }
    if (!applicationData.targetProgramSlug) {
      setSubmitError(t('studentWizard.errorPickProgram'));
      setCurrentStep(1);
      return;
    }
    setSavingDraft(true);
    setSubmitError(null);
    try {
      const university = universities.find(
        (u: { slug: string }) => u.slug === applicationData.targetUniversity,
      );
      const program = getSelectedProgramBySlug();
      const payload = {
        universityId: applicationData.targetUniversity,
        universityName: university?.name || applicationData.targetUniversity,
        universityNameCn: university?.nameCn,
        programId: applicationData.targetProgramSlug,
        programName: program?.name || applicationData.targetProgramSlug,
        programNameCn: program?.nameCn,
        degree: applicationData.targetDegreeLevel || undefined,
        intake: applicationData.intendedIntake || undefined,
        status: 'Draft' as const,
        personalStatement: applicationData.personalStatement,
        additionalNotes: applicationData.additionalNotes,
      };
      const data = isResuming && resumeId
        ? await apiFetchJson<{ application: { id: string; applicationNumber: string | null } }>(
            `/api/student/applications/${resumeId}`,
            { method: 'PUT', body: JSON.stringify(payload) },
          )
        : await apiFetchJson<{ application: { id: string; applicationNumber: string | null } }>(
            '/api/student/applications',
            { method: 'POST', body: JSON.stringify(payload) },
          );
      setCreatedAppId(data.application.id);
      // Phase S20: link any docs uploaded during this session to the
      // (now-existing) application. Skipped on resume — those docs
      // are already linked to the resumed application.
      if (!isResuming) {
        await linkOrphanDocsToApplication(data.application.id);
      }
      setDraftSaved(true);
      // Brief delay so the success message is visible
      setTimeout(() => {
        router.push(`/student/applications/${data.application.id}`);
      }, 1000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('studentWizard.errorFailedToSaveDraft'));
      setSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const university = universities.find((u: { slug: string }) => u.slug === applicationData.targetUniversity);
      const program = getSelectedProgramBySlug();
      const payload = {
        universityId: applicationData.targetUniversity,
        universityName: university?.name || applicationData.targetUniversity,
        universityNameCn: university?.nameCn,
        programId: applicationData.targetProgramSlug,
        programName: program?.name || applicationData.targetProgramSlug,
        programNameCn: program?.nameCn,
        degree: applicationData.targetDegreeLevel,
        intake: applicationData.intendedIntake,
        status: 'Submitted' as const,
        personalStatement: applicationData.personalStatement,
        additionalNotes: applicationData.additionalNotes,
      };
      const data = isResuming && resumeId
        ? await apiFetchJson<{ application: { id: string; applicationNumber: string | null } }>(
            `/api/student/applications/${resumeId}`,
            { method: 'PUT', body: JSON.stringify(payload) },
          )
        : await apiFetchJson<{ application: { id: string; applicationNumber: string | null } }>(
            '/api/student/applications',
            { method: 'POST', body: JSON.stringify(payload) },
          );
      setCreatedAppId(data.application.id);
      // Phase S20: link any docs uploaded during this session to the
      // new application. Without this, docs uploaded in step 2 stay
      // orphans (application_id = NULL) because the application row
      // didn't exist at upload time.
      if (!isResuming) {
        await linkOrphanDocsToApplication(data.application.id);
      }
      // Brief delay so the success message is visible before navigating
      setTimeout(() => router.push('/student/applications'), 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('studentWizard.errorFailedToCreateApplication'));
      setLoading(false);
    }
  };

  const toggleDocument = (docTypeId: string, checked: boolean) => {
    setApplicationData(prev => ({
      ...prev,
      selectedDocuments: checked 
        ? [...prev.selectedDocuments, docTypeId]
        : prev.selectedDocuments.filter(id => id !== docTypeId)
    }));
  };

  const getStatusColor = (status: DocumentStatus) => {
    const colors: Record<DocumentStatus, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Uploaded': 'bg-blue-100 text-blue-800',
      'Verified': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const syncStats = useMemo(() => {
    const total = syncableDocuments.length;
    const selected = syncableDocuments.filter(d => d.selected).length;
    const available = syncableDocuments.filter(d => d.studentDoc && ['Uploaded', 'Verified'].includes(d.studentDoc.status)).length;
    return { total, selected, available };
  }, [syncableDocuments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="rounded-none">
          <Link href="/student/applications">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('studentWizard.backButton')}
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('studentWizard.pageTitle')}</h1>
          <p className="text-[#4B5563] mt-1">{t('studentWizard.pageSubtitle')}</p>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 border border-[#D4A853] bg-[#FAF6E8] text-sm text-[#1B2A4A]">
        <Save className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#9B1B30]" />
        <p>
          <strong>{t('studentWizard.saveAsDraft')}</strong> {t('studentWizard.saveBannerBody')}{' '}
          <strong>{t('studentWizard.submit')}</strong>.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-[#9B1B30] text-white' : 
                    isActive ? 'bg-[#9B1B30] text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs mt-2 ${isActive || isCompleted ? 'text-[#1B2A4A] font-medium' : 'text-gray-500'}`}>
                  {t(step.titleKey)}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 ${isCompleted ? 'bg-[#9B1B30]' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <Card className="rounded-none">
        <CardContent className="p-6">
          {/* Step 1: University & Program */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg text-[#1B2A4A]">{t('studentWizard.step1CardTitle')}</CardTitle>
              </CardHeader>

              {/* Phase S21: profile prefill banner. Shown when at
                  least one field was auto-filled from the profile.
                  The student can update the source via the profile
                  page if they want different defaults next time. */}
              {prefilledFields.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 p-3 border border-[#1B2A4A]/30 bg-[#1B2A4A]/5 rounded-none">
                  <UserCircle2 className="h-4 w-4 text-[#1B2A4A] flex-shrink-0" />
                  <p className="text-sm text-[#1B2A4A] flex-1">
                    {t(
                      prefilledFields.size === 1
                        ? 'studentWizard.prefillBannerField'
                        : 'studentWizard.prefillBannerFields',
                      { n: prefilledFields.size },
                    )}
                    {prefilledFields.has('personalStatement') && (
                      <> {t('studentWizard.prefillBannerDraftHintStart')}{' '}
                      <strong>{t('studentWizard.draftWord')}</strong>{' '}
                      {t('studentWizard.prefillBannerDraftHintEnd')}</>
                    )}
                  </p>
                  <Link
                    href="/student/profile"
                    className="text-xs font-semibold text-[#1B2A4A] hover:text-[#9B1B30] underline underline-offset-2 whitespace-nowrap"
                  >
                    {t('studentWizard.editProfileLink')}
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#1B2A4A]">
                      {t('studentWizard.degreeLevelLabel')}
                      {prefilledFields.has('targetDegreeLevel') && <PrefillBadge t={t} />}
                    </Label>
                    <Select
                      value={applicationData.targetDegreeLevel}
                      onValueChange={(value) => {
                        if (isDegreeLevel(value)) {
                          // Reset program + university when the degree
                          // level changes — old picks are now invalid
                          // for the new degree scope.
                          setApplicationData({
                            ...applicationData,
                            targetDegreeLevel: value,
                            targetProgramSlug: '',
                            targetUniversity: '',
                          });
                          // Phase S21: the student overrode the
                          // prefill — drop the badge for this field.
                          setPrefilledFields((cur) => {
                            if (!cur.has('targetDegreeLevel')) return cur;
                            const next = new Set(cur);
                            next.delete('targetDegreeLevel');
                            return next;
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder={t('studentWizard.degreeLevelPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {degreeLevels.map((level) => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Phase S22: single combined program picker. The
                      old split between "university" and "program"
                      was two pickers, two clicks, two chances to
                      mismatch. This one picker shows program name +
                      university name + university logo; the user
                      can type either a program name OR a university
                      name and the dropdown filters. Picking a
                      program auto-fills the university from
                      program.universitySlug so the rest of the
                      flow stays consistent. */}
                  <div>
                    <Label className="text-[#1B2A4A]">
                      {t('studentWizard.programLabel')}
                      {prefilledFields.has('targetProgramSlug') && <PrefillBadge t={t} />}
                    </Label>
                    <SearchableSelect
                      value={applicationData.targetProgramSlug}
                      onChange={(value) => {
                        const program = availablePrograms.find((p) => p.slug === value);
                        const university = program
                          ? universities.find((u: { slug: string }) => u.slug === program.universitySlug)
                          : null;
                        setApplicationData({
                          ...applicationData,
                          targetProgramSlug: value,
                          // Auto-fill the university from the
                          // program — saves a click and avoids the
                          // "wrong school for this program" mistake.
                          targetUniversity: university?.slug || applicationData.targetUniversity,
                        });
                      }}
                      options={availablePrograms.map((program) => {
                        const university = universities.find(
                          (u: { slug: string }) => u.slug === program.universitySlug,
                        );
                        return {
                          value: program.slug,
                          label: program.name,
                          // Phase S25: the sublabel is now visually
                          // structured so the university name
                          // always reads first and is the
                          // dominant signal — "at Tsinghua
                          // University · Master · English" reads
                          // naturally and the search filter
                          // catches the university name (cmdk
                          // does fuzzy match on `value` below).
                          sublabel: university
                            ? `at ${university.name} · ${program.degree} · ${program.language}`
                            : `${program.degree} · ${program.language}`,
                          // University logo is rendered in the
                          // picker (the SearchableSelect component
                          // shows a small circular thumbnail next
                          // to the label).
                          logo: university?.logo || undefined,
                        };
                      })}
                      placeholder={
                        dataLoading
                          ? t('studentWizard.programLoadingPlaceholder')
                          : availablePrograms.length === 0
                          ? t('studentWizard.programEmptyPlaceholder')
                          : t('studentWizard.programSearchPrompt')
                      }
                      emptyText={t('studentWizard.programEmptyText')}
                      searchPlaceholder={t('studentWizard.programSearchPlaceholder')}
                      disabled={!applicationData.targetDegreeLevel || dataLoading}
                      loading={dataLoading}
                    />
                  </div>

                  <div>
                    <Label className="text-[#1B2A4A]">
                      {t('studentWizard.intakeLabel')}
                      {prefilledFields.has('intendedIntake') && <PrefillBadge t={t} />}
                    </Label>
                    <Select
                      value={applicationData.intendedIntake}
                      onValueChange={(value) => {
                        setApplicationData({ ...applicationData, intendedIntake: value });
                        setPrefilledFields((cur) => {
                          if (!cur.has('intendedIntake')) return cur;
                          const next = new Set(cur);
                          next.delete('intendedIntake');
                          return next;
                        });
                      }}
                    >
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder={t('studentWizard.intakePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {intakes.map((intake) => (
                          <SelectItem key={intake.slug} value={intake.label}>
                            {intake.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {selectedProgram && selectedUniversity && (
                <Card className="rounded-none bg-[#F3F4F6]">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-[#1B2A4A] mb-2">{t('studentWizard.selectedProgramCardTitle')}</h3>
                    <p className="text-[#1B2A4A]">{selectedUniversity.name}</p>
                    <p className="text-gray-600">{selectedProgram.name}</p>
                    <p className="text-gray-500 text-sm mt-1">{selectedProgram.degree} • {selectedProgram.intake}</p>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <div>
                  <Label className="text-[#1B2A4A]">
                    {t('studentWizard.personalStatement')}
                    {prefilledFields.has('personalStatement') && (
                      <PrefillBadge t={t}>
                        <span className="ml-1">{t('studentWizard.prefilledBadgeEditHint')}</span>
                      </PrefillBadge>
                    )}
                  </Label>
                  <Textarea
                    placeholder={t('studentWizard.personalStatementPlaceholder')}
                    className="rounded-none mt-2"
                    rows={6}
                    value={applicationData.personalStatement}
                    onChange={(e) => {
                      setApplicationData({ ...applicationData, personalStatement: e.target.value });
                      // First keystroke after the prefilled seed —
                      // drop the badge so the student knows the
                      // draft is now theirs.
                      if (prefilledFields.has('personalStatement')) {
                        setPrefilledFields((cur) => {
                          const next = new Set(cur);
                          next.delete('personalStatement');
                          return next;
                        });
                      }
                    }}
                  />
                </div>
                <div>
                  <Label className="text-[#1B2A4A]">{t('studentWizard.additionalNotesLabel')}</Label>
                  <Textarea 
                    placeholder={t('studentWizard.additionalNotesPlaceholder')}
                    className="rounded-none mt-2"
                    rows={3}
                    value={applicationData.additionalNotes}
                    onChange={(e) => setApplicationData({...applicationData, additionalNotes: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Document Sync */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg text-[#1B2A4A]">{t('studentWizard.step2CardTitle')}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {t('studentWizard.step2CardSubtitle')}
                </p>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="rounded-none bg-[#F3F4F6]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#1B2A4A]">{syncStats.total}</p>
                    <p className="text-sm text-gray-600">{t('studentWizard.step2StatRequired')}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-none bg-[#F3F4F6]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#1B2A4A]">{syncStats.available}</p>
                    <p className="text-sm text-gray-600">{t('studentWizard.step2StatAvailable')}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-none bg-[#F3F4F6]">
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-[#9B1B30]">{syncStats.selected}</p>
                    <p className="text-sm text-gray-600">{t('studentWizard.step2StatSelected')}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                {syncableDocuments.map((doc) => (
                  <Card key={doc.documentType.id} className="rounded-none">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox 
                            id={`doc-${doc.documentType.id}`}
                            checked={doc.selected}
                            onCheckedChange={(checked) => 
                              toggleDocument(doc.documentType.id, checked as boolean)
                            }
                            className="mt-1 data-[state=checked]:bg-[#9B1B30] data-[state=checked]:border-[#9B1B30]"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <Label 
                                htmlFor={`doc-${doc.documentType.id}`}
                                className="font-medium text-[#1B2A4A] cursor-pointer"
                              >
                                {doc.documentType.name}
                              </Label>
                              {doc.studentDoc && (
                                <Badge className={`rounded-none ${getStatusColor(doc.studentDoc.status)}`}>
                                  {doc.studentDoc.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {doc.documentType.description}
                            </p>
                            {doc.studentDoc && doc.studentDoc.fileName && (
                              <p className="text-xs text-gray-500 mt-1">
                                {doc.studentDoc.fileName} 
                                {doc.studentDoc.fileName && ` (${doc.studentDoc.fileName})`}
                              </p>
                            )}
                          </div>
                        </div>
                        {!doc.studentDoc && (
                          <div className="w-64">
                            <DocumentUploader
                              documentTypeId={doc.documentType.id}
                              documentName={doc.documentType.name}
                              category={mapDocCategoryToStudentCategory(doc.documentType.category)}
                              onUploaded={(uploaded) => {
                                // Re-fetch so the doc moves from "missing" → "selected"
                                setDocumentsLoading(true);
                                apiFetchJson<{ data: Array<{ id: string; documentTypeId: string; name: string; status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected'; fileName?: string }> }>(
                                  '/api/student/documents',
                                )
                                  .then((d) => setStudentDocuments(d.data || []))
                                  .catch(() => {})
                                  .finally(() => setDocumentsLoading(false));
                                // M8: the old `pendingDocIds` tracking
                                // call is gone — linkOrphanDocsToApplication
                                // (called after POST) re-fetches every
                                // orphan and links them, so we don't
                                // need to track per-upload IDs in
                                // session state anymore.
                                console.log('[student/new] document uploaded:', uploaded.id);
                              }}
                              compact
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg text-[#1B2A4A]">{t('studentWizard.step3CardTitle')}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {t('studentWizard.step3CardSubtitle')}
                </p>
              </CardHeader>

              <div className="grid gap-6">
                <Card className="rounded-none">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-base text-[#1B2A4A]">{t('studentWizard.step3StudentInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-medium text-[#1B2A4A]">
                      {user?.user_metadata?.full_name || user?.email || t('studentWizard.step3CurrentStudent')}
                    </p>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-gray-600">{user?.user_metadata?.phone || '—'}</p>
                  </CardContent>
                </Card>

                <Card className="rounded-none">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-base text-[#1B2A4A]">{t('studentWizard.step3ProgramSelection')}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-medium text-[#1B2A4A]">{selectedUniversity?.name}</p>
                    <p className="text-gray-600">{selectedProgram?.name}</p>
                    <p className="text-gray-600">{applicationData.targetDegreeLevel} • {applicationData.intendedIntake}</p>
                  </CardContent>
                </Card>

                <Card className="rounded-none">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-base text-[#1B2A4A]">
                      {t('studentWizard.step3DocumentsLabel', { selected: syncStats.selected, total: syncStats.total })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {syncableDocuments
                        .filter(d => d.selected)
                        .map(doc => (
                          <Badge key={doc.documentType.id} className="rounded-none bg-[#F3F4F6] text-[#1B2A4A]">
                            {doc.documentType.name}
                            {doc.studentDoc && ` (${doc.studentDoc.status})`}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading || savingDraft}
              className="rounded-none"
            >
              {t('common.previous')}
            </Button>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={savingDraft || draftSaved || loading}
                className="rounded-none border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white"
                title={t('studentWizard.saveAsDraftTooltip')}
              >
                {savingDraft ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('studentWizard.saving')}
                  </>
                ) : draftSaved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('studentWizard.draftSaved')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('studentWizard.saveAsDraft')}
                  </>
                )}
              </Button>
              {currentStep < steps.length ? (
                <div className="flex flex-col items-end gap-1">
                  {nextBlocked && (
                    <span className="text-xs text-red-700 font-semibold">
                      {step1Error ?? t('studentWizard.completeFields')}
                    </span>
                  )}
                  <Button
                    onClick={handleNext}
                    disabled={savingDraft || nextBlocked}
                    title={nextBlocked ? (step1Error ?? t('studentWizard.completeFieldsShort')) : undefined}
                    className="bg-[#9B1B30] hover:bg-[#7A1525] text-white rounded-none"
                  >
                    {t('studentWizard.next')}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !!createdAppId || savingDraft}
                className="bg-[#9B1B30] hover:bg-[#7A1525] text-white rounded-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {t('studentWizard.submitting')}
                  </>
                ) : createdAppId ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('studentWizard.submitted')}
                  </>
                ) : (
                  t('studentWizard.submit')
                )}
              </Button>
              )}
            </div>
          </div>

          {submitError && (
            <div className="mt-4 p-3 border border-red-200 bg-red-50 text-red-800 text-sm rounded">
              <strong>{t('studentWizard.errorError')}</strong> {submitError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
