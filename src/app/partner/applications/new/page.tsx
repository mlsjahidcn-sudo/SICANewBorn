'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [formData, setFormData] =
    useState<PartnerApplicationFormData>(INITIAL_FORM_DATA);
  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // L4: success banner shown after create, before navigation.
  // Cleared on close so the partner can create another row
  // without seeing a stale success.
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // Phase 1.6: per-field validation. Map of field name → error
  // message. The form renders each error inline under the
  // corresponding field. The submit handler populates this on
  // failed validation; clearing on every new attempt.
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  // Phase 48.2: when the partner navigates here from
  // /partner/students/[id] via the "+ New application" link,
  // we auto-pick the student by URL param. The auto-pick
  // ref is a guard so the user can clear/edit the fields
  // without us re-applying the pick on every render.
  const autoPickedRef = useRef<string | null>(null);
  // Phase 49.3: when the partner navigates here from
  // /partner/applications/[id] via the "Clone" button, the
  // detail page stored the form-ready data in sessionStorage
  // and routed us with ?clone=1. We read it on mount, merge
  // it into formData, then clear the storage entry so a
  // page refresh doesn't re-apply stale data.
  const cloneAppliedRef = useRef<boolean>(false);
  // Promotion prefill: when the partner navigates here from
  // /partner/promotions, the program slug is passed in the URL and we
  // auto-fill the university + program fields.
  const promotionPrefillRef = useRef<string | null>(null);

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

  // Phase 48.2: auto-pick the student passed via ?studentId=<id>.
  // Runs once the students list is loaded and the URL has a
  // studentId. The ref guard ensures we only run once per page
  // load, even if the data-loading effect re-fires.
  useEffect(() => {
    const studentIdFromUrl = searchParams.get('studentId');
    if (!studentIdFromUrl) return;
    if (dataLoading) return; // wait until the students list is loaded
    if (autoPickedRef.current === studentIdFromUrl) return; // already picked
    const s = students.find((x) => x.id === studentIdFromUrl);
    if (!s) return; // partner-org scope may not include this student
    autoPickedRef.current = studentIdFromUrl;
    handleStudentPick(studentIdFromUrl);
  }, [searchParams, dataLoading, students]);

  // Auto-fill university + program when the partner arrives from
  // a promoted program detail page (?programSlug=<slug>).
  useEffect(() => {
    const programSlugFromUrl = searchParams.get('programSlug');
    if (!programSlugFromUrl) return;
    if (dataLoading) return;
    if (promotionPrefillRef.current === programSlugFromUrl) return;
    const picked = programs.find((p) => p.slug === programSlugFromUrl);
    if (!picked) return;
    const uni = universities.find((u) => u.slug === picked.universitySlug);
    promotionPrefillRef.current = programSlugFromUrl;
    setFormData((prev) => ({
      ...prev,
      program: picked.name,
      university: uni?.name ?? picked.universitySlug,
    }));
  }, [searchParams, dataLoading, programs, universities]);

  // Phase 49.3: read the sessionStorage entry written by the
  // "Clone as new application" button on the application
  // detail page. Merge it into formData once, then clear the
  // entry so a refresh doesn't re-apply stale data. The
  // ref guard ensures we only apply once per page load, even
  // if this effect re-fires for other reasons.
  useEffect(() => {
    if (cloneAppliedRef.current) return;
    const isClone = searchParams.get('clone');
    if (!isClone) return;
    if (typeof window === 'undefined') return; // SSR safety
    const raw = sessionStorage.getItem('partner-clone-application');
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as Record<string, unknown>;
      // Drop the helper field before merging.
      const { _clonedFrom, ...formFields } = data;
      setFormData((prev) => ({ ...prev, ...formFields }) as typeof prev);
      cloneAppliedRef.current = true;
    } catch (err) {
      console.error('[partner/applications/new] clone parse failed:', err);
    } finally {
      // Always clear the storage entry — successful apply or
      // not, so a refresh doesn't try again with stale data.
      sessionStorage.removeItem('partner-clone-application');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitSuccess(false);

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
    // M9: email format validation. studentEmail is optional
    // (some leads are tracked by name + university first,
    // email comes later when the student signs up), but IF
    // filled it must be a real format. The <Input> is
    // type="email" so the browser does a soft check, but
    // type="email" doesn't actually block submit on invalid
    // values — only the visual cue. We add a real check
    // here so a typo'd "gmial.com" doesn't get stored and
    // cause a bounce later when SICA tries to email the
    // student. RFC 5322 lite — good enough for catch obvious
    // typos without rejecting the long tail of valid RFC
    // addresses. Trim before checking so a stray space
    // doesn't look valid.
    const trimmedEmail = formData.studentEmail.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.studentEmail = t('partnerAppNew.errorStudentEmailInvalid');
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
        // Section 7 — workflow
        // S27: status + decision are admin-only. The form doesn't
        // expose them, so we don't include them in the payload. The
        // API defaults status to 'Draft' and decision to 'Pending'
        // on insert.
        priority: formData.priority,
        // M4: partner's optional internal CRM ID. If unset,
        // the server mints one via next_partner_app_number.
        // Whitespace-only is treated as unset.
        applicationNumber: formData.applicationNumber.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };
      const res = await apiFetchJson<{ application: { id: string } }>(
        '/api/partner/applications',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
      // L4: short success toast before navigation. The
      // previous flow jumped straight to the detail page
      // with no feedback — partner wasn't sure the row
      // saved until the detail page loaded. 1500ms is
      // long enough to read, short enough to feel
      // snappy. Matches the student wizard's timing.
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push(`/partner/applications/${res.application.id}`);
      }, 1500);
    } catch (err) {
      console.error('[partner/applications/new] save failed:', err);
      setError(err instanceof Error ? err.message : t('partnerAppNew.errorCreate'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-24">
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

      {/* L4: success banner. "Draft" wording because
          partner rows always start as Draft — SICA's admin
          team is the one who moves them to Submitted /
          In Review / Accepted. Set above the form so it's
          the last thing the partner sees before the page
          navigates. The timer in handleSubmit is 1500ms;
          this card is what they're reading during that
          window. The form below is greyed-out via the
          PartnerApplicationForm's own isSaving prop so
          they can't double-submit. */}
      {submitSuccess && (
        <Card className="rounded-none border-green-300 bg-green-50">
          <CardContent className="p-4 text-sm text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-700 flex-shrink-0" />
            <div>
              <strong>{t('partnerAppNew.successTitle')}</strong>{' '}
              {t('partnerAppNew.successBody')}
            </div>
          </CardContent>
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
