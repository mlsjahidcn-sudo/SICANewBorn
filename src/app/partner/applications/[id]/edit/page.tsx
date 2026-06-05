'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
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
  FundingSource,
  EmergencyRelationship,
} from '@/lib/partner-application-mapper';
import type { University, Program } from '@/lib/data';

export default function PartnerEditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [formData, setFormData] =
    useState<PartnerApplicationFormData | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
      setFormData({
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
        intake: a.intake ?? '',
        degree: (a.degree as PartnerApplicationDegree | null) || '',
        hasStudiedInChina: a.hasStudiedInChina ?? false,
        hasAppliedChinaUni: a.hasAppliedChinaUni ?? false,

        fundingSource: (a.fundingSource as FundingSource | null) || '',
        scholarshipName: a.scholarshipName ?? '',

        whyProgram: a.whyProgram ?? '',
        careerPlan: a.careerPlan ?? '',

        // S27: status + decision are admin-only. The edit page
        // doesn't expose them; the load() just reads the current
        // values for display elsewhere (the detail page).
        priority: a.priority,
        notes: a.notes ?? '',

        applicationNumber: a.applicationNumber ?? '',
        submittedAt: a.submittedAt ?? null,
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load application.');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError(null);

    if (!formData.studentName.trim()) {
      setError('Student name is required.');
      return;
    }
    if (!formData.university.trim() || !formData.program.trim()) {
      setError('University and program are required.');
      return;
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
        // Section 7 — funding
        fundingSource: formData.fundingSource || null,
        scholarshipName: formData.scholarshipName.trim() || null,
        // Section 8 — personal statement
        whyProgram: formData.whyProgram.trim() || null,
        careerPlan: formData.careerPlan.trim() || null,
        // Section 9 — workflow
        // S27: status + decision are admin-only — the partner can
        // never change them via the edit form. We omit them from the
        // PATCH payload; the API would 403 if a partner tried
        // anyway.
        priority: formData.priority,
        notes: formData.notes.trim() || null,
        applicationNumber: formData.applicationNumber.trim() || null,
      };
      await apiFetchJson(`/api/partner/applications/${applicationId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      router.push(`/partner/applications/${applicationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
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
          <ArrowLeft className="w-4 h-4" /> Back to applications
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700">
            <p className="font-medium">Couldn't load application</p>
            <p className="text-sm">{loadError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Edit Application</h1>
          <p className="text-[#4B5563] mt-1 text-sm">
            {formData.studentName} · {formData.university}
            {formData.applicationNumber ? ` · ${formData.applicationNumber}` : ''}
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
        universities={universities}
        programs={programs}
        dataLoading={false}
        isSaving={isSaving}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        cancelHref={`/partner/applications/${applicationId}`}
      />
    </div>
  );
}
