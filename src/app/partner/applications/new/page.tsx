'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  PartnerApplicationForm,
  INITIAL_FORM_DATA,
  type PartnerApplicationFormData,
} from '@/components/partner/PartnerApplicationForm';
import type { PartnerStudent } from '@/lib/partner-student-mapper';
import type { University, Program } from '@/lib/data';

export default function PartnerNewApplicationPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [formData, setFormData] =
    useState<PartnerApplicationFormData>(INITIAL_FORM_DATA);
  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Phase 1.6: per-field validation. Map of field name → error
  // message. The form renders each error inline under the
  // corresponding field. The submit handler populates this on
  // failed validation; clearing on every new attempt.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  // Phase S20: load this partner's students, plus the live university
  // and program lists. S26: this list feeds the combined program
  // picker, which is now the primary way to pick a school (university
  // is auto-filled from the picked program's universitySlug).
  useEffect(() => {
    const controller = new AbortController();
    setDataLoading(true);
    Promise.all([
      apiFetchJson<{ students: PartnerStudent[] }>('/api/partner/students?limit=100', {
        signal: controller.signal,
      }).catch(() => ({ students: [] })),
      apiFetchJson<{ universities: University[] }>('/api/universities?limit=200', {
        signal: controller.signal,
      }).catch(() => ({ universities: [] })),
      apiFetchJson<{ programs: Program[] }>('/api/programs?limit=500', {
        signal: controller.signal,
      }).catch(() => ({ programs: [] })),
    ])
      .then(([s, u, p]) => {
        if (controller.signal.aborted) return;
        setStudents(s.students || []);
        setUniversities(u.universities || []);
        setPrograms(p.programs || []);
      })
      .finally(() => {
        if (!controller.signal.aborted) setDataLoading(false);
      });
    return () => controller.abort();
  }, []);

  // Pick a saved student → auto-fill name, email, phone, nationality
  // if blank. Partners frequently track many students, so a single
  // click saves a lot of typing.
  const handleStudentPick = (studentId: string) => {
    const s = students.find((x) => x.id === studentId);
    if (!s) return;
    setFormData((prev) => ({
      ...prev,
      studentName: s.studentName || prev.studentName,
      studentEmail: prev.studentEmail || s.studentEmail || '',
      studentPhone: prev.studentPhone || s.studentPhone || '',
      nationality: prev.nationality || s.nationality || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Phase 1.6: per-field validation. We collect all field
    // errors up front so the user sees the full set at once
    // (not "fix one, submit, see the next"). We then scroll
    // to the first error and focus that field.
    const errs: Record<string, string> = {};
    if (!formData.studentName.trim()) {
      errs.studentName = t('partnerAppNew.errorStudentNameRequired');
    }
    if (!formData.university.trim()) {
      errs.university = t('partnerAppNew.errorUniversityRequired');
    }
    if (!formData.program.trim()) {
      errs.program = t('partnerAppNew.errorProgramRequired');
    }
    if (formData.passportExpiryDate &&
        formData.passportIssueDate &&
        formData.passportExpiryDate < formData.passportIssueDate) {
      errs.passportExpiryDate = t('partnerAppNew.errorPassportDateOrder');
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      // Scroll to first error and focus it
      const firstKey = Object.keys(errs)[0];
      const el = document.querySelector(`[name="${firstKey}"]`) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if ('focus' in el) (el as HTMLInputElement).focus();
      }
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        // Section 1
        studentName: formData.studentName.trim(),
        studentEmail: formData.studentEmail.trim() || undefined,
        studentPhone: formData.studentPhone.trim() || undefined,
        nationality: formData.nationality.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        placeOfBirth: formData.placeOfBirth.trim() || undefined,
        currentAddress: formData.currentAddress.trim() || undefined,
        // Section 2 — passport
        passportNumber: formData.passportNumber.trim() || undefined,
        passportIssueDate: formData.passportIssueDate || undefined,
        passportExpiryDate: formData.passportExpiryDate || undefined,
        // Section 3 — emergency contact
        emergencyContactName: formData.emergencyContactName.trim() || undefined,
        emergencyContactRelationship:
          formData.emergencyContactRelationship || undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
        emergencyContactEmail: formData.emergencyContactEmail.trim() || undefined,
        // Section 4 — academic
        highestEducation: formData.highestEducation || undefined,
        schoolName: formData.schoolName.trim() || undefined,
        schoolCountry: formData.schoolCountry.trim() || undefined,
        major: formData.major.trim() || undefined,
        graduationYear: formData.graduationYear || undefined,
        gpa: formData.gpa.trim() || undefined,
        classRank: formData.classRank.trim() || undefined,
        // Section 5 — language
        nativeLanguage: formData.nativeLanguage.trim() || undefined,
        englishTest: formData.englishTest || undefined,
        englishScore: formData.englishScore.trim() || undefined,
        hskLevel: formData.hskLevel || undefined,
        hskScore: formData.hskScore.trim() || undefined,
        // Section 6 — program & application
        university: formData.university.trim(),
        program: formData.program.trim(),
        intake: formData.intake.trim() || undefined,
        degree: formData.degree || undefined,
        hasStudiedInChina: formData.hasStudiedInChina,
        hasAppliedChinaUni: formData.hasAppliedChinaUni,
        // Section 7 — funding
        fundingSource: formData.fundingSource || undefined,
        scholarshipName: formData.scholarshipName.trim() || undefined,
        // Section 8 — personal statement
        whyProgram: formData.whyProgram.trim() || undefined,
        careerPlan: formData.careerPlan.trim() || undefined,
        // Section 9 — workflow
        // S27: status + decision are admin-only. The form doesn't
        // expose them, so we don't include them in the payload. The
        // API defaults status to 'Draft' and decision to 'Pending'
        // on insert.
        priority: formData.priority,
        notes: formData.notes.trim() || undefined,
      };
      const res = await apiFetchJson<{ application: { id: string } }>(
        '/api/partner/applications',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
      router.push(`/partner/applications/${res.application.id}`);
    } catch (err) {
      console.error('[partner/applications/new] save failed:', err);
      setError(err instanceof Error ? err.message : t('partnerAppNew.errorCreate'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24">
      {/* header */}
      <div className="flex items-center gap-4">
        <Link
          href="/partner/applications"
          className="p-2 hover:bg-gray-100 inline-flex"
        >
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerAppNew.title')}</h1>
          <p className="text-[#4B5563] mt-1 text-sm">
            {t('partnerAppNew.subtitle')}
          </p>
        </div>
      </div>

      {/* "Pick from your students" callout */}
      {students.length > 0 && (
        <Card className="rounded-none border-[#D4A853] bg-[#FAF6E8]">
          <CardContent className="p-4">
            <Label className="text-[#1B2A4A] mb-2 block text-sm font-semibold">
              {t('partnerAppNew.pickStudentTitle')}
            </Label>
            <Select onValueChange={handleStudentPick}>
              <SelectTrigger className="rounded-none bg-white">
                <SelectValue placeholder={t('partnerAppNew.pickStudentPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.studentName}
                    {s.studentEmail ? ` · ${s.studentEmail}` : ''}
                    {s.nationality ? ` · ${s.nationality}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-2">
              {t('partnerAppNew.pickStudentHint')}
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <PartnerApplicationForm
        formData={formData}
        setFormData={setFormData}
        universidades={universities}
        programs={programs}
        dataLoading={dataLoading}
        isSaving={isSaving}
        fieldErrors={fieldErrors}
        onSubmit={handleSubmit}
        submitLabel={t('partnerApps.newApplication')}
        cancelHref="/partner/applications"
        stickySubmit
      />
    </div>
  );
}
