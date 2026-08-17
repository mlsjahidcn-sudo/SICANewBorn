'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  PartnerApplicationForm,
  INITIAL_FORM_DATA,
  type PartnerApplicationFormData,
} from '@/components/partner/PartnerApplicationForm';
import {
  PartnerApplicationPriority,
  PartnerApplicationDegree,
  Gender,
  MaritalStatus,
  HighestEducation,
  EnglishTest,
  HskLevel,
  EmergencyRelationship,
} from '@/lib/partner-application-mapper';
import type { University, Program } from '@/lib/data';

export default function PartnerEditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const applicationId = params.id as string;

  const [formData, setFormData] =
    useState<PartnerApplicationFormData | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Phase 48.6: snapshot of the form as it was loaded from the
  // server. Used by the beforeunload guard to detect dirty
  // (the partner has typed something not yet saved) and prompt
  // the browser's native dialog on tab close / reload / back.
  // Same pattern as the partner student edit page.
  const initialFormDataRef = useRef<PartnerApplicationFormData | null>(null);

  // S26: load the application row + the university / program lists in
  // parallel so the form can pre-fill from the row and the
  // SearchableSelect can offer live options.
  const load = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [res, u, p] = await Promise.all([
        apiFetchJson<{
          application: import('@/lib/partner-application-mapper').PartnerApplication;
        }>(`/api/partner/applications/${applicationId}`),
        apiFetchJson<{ universities: University[] }>('/api/universities?limit=200').catch(
          () => ({ universities: [] }),
        ),
        apiFetchJson<{ programs: Program[] }>('/api/programs?limit=500').catch(
          () => ({ programs: [] }),
        ),
      ]);
      const a = res.application;
      setUniversities(u.universities || []);
      setPrograms(p.programs || []);
      // Phase A: derive programSlug from the stored program name so the
      // SearchableSelect can display the selected program. If the name
      // has changed or isn't in the live catalog, the picker stays empty
      // and the partner can re-select.
      const matchedProgram = (p.programs || []).find((prog) => prog.name === a.program);
      const loaded: PartnerApplicationFormData = {
        studentId: a.studentId ?? '',
        studentName: a.studentName,
        studentEmail: a.studentEmail ?? '',
        studentPhone: a.studentPhone ?? '',
        nationality: a.nationality ?? '',
        dateOfBirth: a.dateOfBirth ?? '',
        gender: (a.gender as Gender | null) || '',
        maritalStatus: (a.maritalStatus as MaritalStatus | null) || '',
        placeOfBirth: a.placeOfBirth ?? '',
        currentAddress: a.currentAddress ?? '',

        passportNumber: a.passportNumber ?? '',
        passportIssueDate: a.passportIssueDate ?? '',
        passportExpiryDate: a.passportExpiryDate ?? '',

        emergencyContactName: a.emergencyContactName ?? '',
        emergencyContactRelationship:
          (a.emergencyContactRelationship as EmergencyRelationship | null) || '',
        emergencyContactPhone: a.emergencyContactPhone ?? '',
        emergencyContactEmail: a.emergencyContactEmail ?? '',

        highestEducation: (a.highestEducation as HighestEducation | null) || '',
        schoolName: a.schoolName ?? '',
        schoolCountry: a.schoolCountry ?? '',
        major: a.major ?? '',
        graduationYear: a.graduationYear ? String(a.graduationYear) : '',
        gpa: a.gpa ?? '',
        classRank: a.classRank ?? '',

        nativeLanguage: a.nativeLanguage ?? '',
        englishTest: (a.englishTest as EnglishTest | null) || '',
        englishScore: a.englishScore ?? '',
        hskLevel: (a.hskLevel as HskLevel | null) || '',
        hskScore: a.hskScore ?? '',

        university: a.university,
        program: a.program,
        programSlug: matchedProgram?.slug ?? '',
        intake: a.intake ?? '',
        degree: (a.degree as PartnerApplicationDegree | null) || '',
        hasStudiedInChina: a.hasStudiedInChina ?? false,
        hasAppliedChinaUni: a.hasAppliedChinaUni ?? false,
        // Phase 54: derive the manual-entry mode from the loaded row.
        // If either catalog field is empty, the partner previously
        // (or currently) described the desired option in notes.
        notInCatalog: !a.university.trim() || !a.program.trim(),

        // S27: status + decision are admin-only. The edit page
        // doesn't expose them; the load() just reads the current
        // values for display elsewhere (the detail page).
        priority: a.priority,
        notes: a.notes ?? '',

        applicationNumber: a.applicationNumber ?? '',
        submittedAt: a.submittedAt ?? null,
      };
      setFormData(loaded);
      initialFormDataRef.current = loaded;
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t('partnerAppEdit.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, t]);

  useEffect(() => {
    void load();
  }, [load]);

  // Phase 48.6: beforeunload guard. Same pattern as the partner
  // student edit page — when the form is dirty (any field
  // differs from the loaded snapshot), prompt the browser's
  // native "Changes you made may not be saved" dialog on
  // tab close / reload / back.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isSaving) return;
      const initial = initialFormDataRef.current;
      if (!initial || !formData) return;
      if (JSON.stringify(initial) === JSON.stringify(formData)) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [formData, isSaving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError(null);

    if (!formData.studentName.trim()) {
      setError(t('partnerAppEdit.errorStudentNameRequired'));
      return;
    }
    // Phase 54: allow saving when the partner is describing a
    // school/program not in the catalog, but require notes.
    if (!formData.notInCatalog && (!formData.university.trim() || !formData.program.trim())) {
      setError(t('partnerAppEdit.errorUniversityProgramRequired'));
      return;
    }
    if (formData.notInCatalog) {
      const notes = formData.notes.trim();
      if (!notes) {
        setError(t('partnerAppEdit.errorNotesRequiredWhenUnassigned'));
        return;
      }
      if (notes.length < 10) {
        setError(t('partnerAppEdit.errorNotesTooShortWhenUnassigned'));
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        // Section 1
        studentName: formData.studentName.trim(),
        studentEmail: formData.studentEmail.trim() || null,
        studentPhone: formData.studentPhone.trim() || null,
        nationality: formData.nationality.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        maritalStatus: formData.maritalStatus || null,
        placeOfBirth: formData.placeOfBirth.trim() || null,
        currentAddress: formData.currentAddress.trim() || null,
        // Section 2 — passport
        passportNumber: formData.passportNumber.trim() || null,
        passportIssueDate: formData.passportIssueDate || null,
        passportExpiryDate: formData.passportExpiryDate || null,
        // Section 3 — emergency contact
        emergencyContactName: formData.emergencyContactName.trim() || null,
        emergencyContactRelationship: formData.emergencyContactRelationship || null,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || null,
        emergencyContactEmail: formData.emergencyContactEmail.trim() || null,
        // Section 4 — academic
        highestEducation: formData.highestEducation || null,
        schoolName: formData.schoolName.trim() || null,
        schoolCountry: formData.schoolCountry.trim() || null,
        major: formData.major.trim() || null,
        graduationYear: formData.graduationYear || null,
        gpa: formData.gpa.trim() || null,
        classRank: formData.classRank.trim() || null,
        // Section 5 — language
        nativeLanguage: formData.nativeLanguage.trim() || null,
        englishTest: formData.englishTest || null,
        englishScore: formData.englishScore.trim() || null,
        hskLevel: formData.hskLevel || null,
        hskScore: formData.hskScore.trim() || null,
        // Section 6 — program & application
        university: formData.university.trim(),
        program: formData.program.trim(),
        intake: formData.intake.trim() || null,
        degree: formData.degree || null,
        hasStudiedInChina: formData.hasStudiedInChina,
        hasAppliedChinaUni: formData.hasAppliedChinaUni,
        // Section 7 — workflow
        // S27: status + decision are admin-only — the partner can
        // never change them via the edit form. We omit them from the
        // PATCH payload; the API would 403 if a partner tried
        // anyway.
        priority: formData.priority,
        notes: formData.notes.trim() || null,
        // Phase 71: applicationNumber is admin-issued — the PATCH
        // API 403s it for partners. We still load it for the
        // subtitle display, but never send it back.
      };
      await apiFetchJson(`/api/partner/applications/${applicationId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      router.push(`/partner/applications/${applicationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerAppEdit.errorSave'));
    } finally {
      setIsSaving(false);
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

  if (loadError || !formData) {
    return (
      <div className="space-y-4">
        <Link
          href="/partner/applications"
          className="inline-flex items-center gap-2 text-[#1B2A4A]"
        >
          <ArrowLeft className="w-4 h-4" /> {t('partnerAppDetail.backToApplications')}
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700">
            <p className="font-medium">{t('partnerAppEdit.couldNotLoad')}</p>
            <p className="text-sm">{loadError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtitle = formData.applicationNumber
    ? t('partnerAppEdit.subtitleWithNumber', { name: formData.studentName, university: formData.university, number: formData.applicationNumber })
    : t('partnerAppEdit.subtitle', { name: formData.studentName, university: formData.university });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href={`/partner/applications/${applicationId}`}
          className="p-2 hover:bg-gray-100 inline-flex"
        >
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerAppEdit.title')}</h1>
          <p className="text-[#4B5563] mt-1 text-sm">
            {subtitle}
          </p>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <PartnerApplicationForm
        formData={formData}
        // S26: the parent state is `PartnerApplicationFormData | null`
        // so the form can render a loading skeleton until the row is
        // fetched. The form's setter is typed non-null because the
        // form is only ever rendered when `formData` is non-null
        // (the `loadError || !formData` branch above returns early).
        setFormData={setFormData as React.Dispatch<React.SetStateAction<import('@/components/partner/PartnerApplicationForm').PartnerApplicationFormData>>}
        universidades={universities}
        programs={programs}
        dataLoading={false}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        // Phase 47.5: was partnerStudentEdit.saveChanges (typo —
        // copy-pasta from the student edit form). That key lives
        // in the wrong namespace and would have rendered the
        // Chinese text on an English application-edit page.
        submitLabel={t('partnerAppEdit.saveChanges')}
        cancelHref={`/partner/applications/${applicationId}`}
      />
    </div>
  );
}
