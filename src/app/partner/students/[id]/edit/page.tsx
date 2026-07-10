'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  PARTNER_STUDENT_STATUSES,
  PartnerStudentStatus,
} from '@/lib/partner-student-mapper';
import type { University, Program } from '@/lib/data';

interface FormData {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  nationality: string;
  targetUniversity: string;
  targetProgram: string;
  status: PartnerStudentStatus;
  notes: string;
}

export default function PartnerEditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const studentId = params.id as string;

  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Phase 48.6: snapshot of the form as it was loaded from the
  // server, used by the beforeunload guard to detect "dirty"
  // (the partner has typed something that hasn't been saved).
  // Without this, a partner who edits 8 fields and accidentally
  // hits the browser back button loses everything. The guard
  // listens for unload events while dirty and prompts the
  // browser's native "Leave site?" dialog.
  const initialFormDataRef = useRef<FormData | null>(null);
  // Phase 47.4: live catalog for the target-university and
  // target-program pickers. Same data source the application form
  // uses, so a program added via /admin/programs shows up here
  // immediately. We also keep the previous free-text value as a
  // fallback option in the list, so any existing data that doesn't
  // match a catalog entry stays editable (and visible) rather than
  // silently disappearing into an empty select.
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setCatalogLoading(true);
    Promise.all([
      apiFetchJson<{ universities: University[] }>('/api/universities?limit=500', {
        signal: controller.signal,
      }).catch(() => ({ universities: [] })),
      apiFetchJson<{ programs: Program[] }>('/api/programs?limit=1000', {
        signal: controller.signal,
      }).catch(() => ({ programs: [] })),
    ])
      .then(([u, p]) => {
        if (controller.signal.aborted) return;
        setUniversities(u.universities || []);
        setPrograms(p.programs || []);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false);
      });
    return () => controller.abort();
  }, []);

  const loadStudent = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ student: import('@/lib/partner-student-mapper').PartnerStudent }>(
        `/api/partner/students/${studentId}`,
      );
      const s = res.student;
      const loaded: FormData = {
        studentName: s.studentName,
        studentEmail: s.studentEmail ?? '',
        studentPhone: s.studentPhone ?? '',
        nationality: s.nationality ?? '',
        targetUniversity: s.targetUniversity ?? '',
        targetProgram: s.targetProgram ?? '',
        status: s.status,
        notes: s.notes ?? '',
      };
      setFormData(loaded);
      // Phase 48.6: snapshot for the beforeunload guard. The
      // ref is set here, after the row is fetched, so the
      // guard has a stable reference to compare against.
      initialFormDataRef.current = loaded;
    } catch (err) {
      console.error('[partner/students/:id/edit] load failed:', err);
      setLoadError(err instanceof Error ? err.message : t('partnerStudentEdit.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [studentId, t]);

  useEffect(() => {
    void loadStudent();
  }, [loadStudent]);

  // Phase 48.6: beforeunload guard. Watches the form for
  // unsaved changes (deep-equal against the initial snapshot
  // stored in initialFormDataRef). When dirty, prompts the
  // browser's native "Changes you made may not be saved"
  // dialog on tab close / reload / back. The custom
  // message is ignored by most modern browsers — they
  // always show their own copy — but returning a non-empty
  // string is the standard trigger.
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isSaving) return; // mid-save: let the navigation happen
      const initial = initialFormDataRef.current;
      if (!initial || !formData) return;
      // Cheap dirty check: stringify + compare. We only
      // call this on beforeunload so the cost is fine.
      if (JSON.stringify(initial) === JSON.stringify(formData)) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [formData, isSaving]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError(null);

    if (!formData.studentName.trim()) {
      setError(t('partnerStudentEdit.errorStudentNameRequired'));
      return;
    }
    // Phase 47: client-side email format check, mirrors the server
    // check in src/lib/partner-validation.ts and the new-student
    // form. type="email" doesn't actually block submit on invalid
    // values — a "gmial.com" typo used to silently store.
    const trimmedEmail = formData.studentEmail.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t('partnerAppNew.errorStudentEmailInvalid'));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        studentName: formData.studentName.trim(),
        studentEmail: formData.studentEmail.trim() || null,
        studentPhone: formData.studentPhone.trim() || null,
        nationality: formData.nationality.trim() || null,
        targetUniversity: formData.targetUniversity.trim() || null,
        targetProgram: formData.targetProgram.trim() || null,
        status: formData.status,
        notes: formData.notes.trim() || null,
      };
      await apiFetchJson(`/api/partner/students/${studentId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      router.push(`/partner/students/${studentId}`);
    } catch (err) {
      console.error('[partner/students/:id/edit] save failed:', err);
      setError(err instanceof Error ? err.message : t('partnerStudentEdit.errorSave'));
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
        <Link href="/partner/students" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" /> {t('partnerStudentDetail.backToStudents')}
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700">
            <p className="font-medium">{t('partnerStudentEdit.couldNotLoad')}</p>
            <p className="text-sm">{loadError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/partner/students/${studentId}`} className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerStudentEdit.title')}</h1>
          <p className="text-[#4B5563] mt-1 text-sm">{formData.studentName}</p>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="rounded-none">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">{t('partnerStudentEdit.sectionInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="studentName" className="text-[#1B2A4A] mb-2 block">
                    {t('partnerStudentEdit.fieldStudentName')} <span className="text-red-600">{t('partnerCommon.requiredAsterisk')}</span>
                  </Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                    maxLength={200}
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="studentEmail" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentEdit.fieldEmail')}</Label>
                  <Input
                    id="studentEmail"
                    name="studentEmail"
                    type="email"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    maxLength={200}
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="studentPhone" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentEdit.fieldPhone')}</Label>
                  <Input
                    id="studentPhone"
                    name="studentPhone"
                    type="tel"
                    value={formData.studentPhone}
                    onChange={handleInputChange}
                    maxLength={50}
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="nationality" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentEdit.fieldNationality')}</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="rounded-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">{t('partnerStudentEdit.sectionTarget')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="targetUniversity" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentEdit.fieldTargetUniversity')}</Label>
                  {/* Phase 47.4: live catalog picker. If the existing
                      value isn't in the catalog (old free-text data),
                      we inject it as a "custom" option so it stays
                      editable and the partner can re-pick or clear
                      it explicitly — never silently lost. */}
                  <SearchableSelect
                    value={formData.targetUniversity}
                    onChange={(v) => setFormData((prev) => (prev ? { ...prev, targetUniversity: v } : prev))}
                    options={buildUniversityOptions(
                      universities,
                      formData.targetUniversity,
                    )}
                    placeholder={t('partnerStudentNew.fieldTargetUniversityPlaceholder')}
                    clearValue=""
                    clearLabel={t('partnerCommon.placeholderDash')}
                    loading={catalogLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="targetProgram" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentEdit.fieldTargetProgram')}</Label>
                  <SearchableSelect
                    value={formData.targetProgram}
                    onChange={(v) => setFormData((prev) => (prev ? { ...prev, targetProgram: v } : prev))}
                    options={buildProgramOptions(programs, formData.targetProgram)}
                    placeholder={t('partnerStudentNew.fieldTargetProgramPlaceholder')}
                    clearValue=""
                    clearLabel={t('partnerCommon.placeholderDash')}
                    loading={catalogLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentEdit.fieldStatus')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => (prev ? { ...prev, status: value as PartnerStudentStatus } : prev))
                    }
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNER_STUDENT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentEdit.fieldNotes')}</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                maxLength={4000}
                className="rounded-none"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Link href={`/partner/students/${studentId}`}>
            <Button type="button" variant="outline" className="rounded-none" disabled={isSaving}>
              {t('partnerStudentEdit.cancel')}
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t('partnerStudentEdit.saving') : t('partnerStudentEdit.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Phase 47.4: build picker options for the target-university
// SearchableSelect. If the existing value (pre-Phase 47 free-text
// data) isn't in the live catalog, we inject it as a synthetic
// "(not in catalog)" option so it stays selectable + the partner
// can re-pick or clear it explicitly. Without this, old data would
// render as an empty select on edit and the partner would have to
// guess why.
function buildUniversityOptions(
  universities: University[],
  currentValue: string,
): { value: string; label: string; sublabel?: string }[] {
  const opts = universities.map((u) => ({
    value: u.name,
    label: u.name,
    sublabel: u.nameCn || undefined,
  }));
  if (
    currentValue &&
    currentValue.trim() &&
    !universities.some((u) => u.name === currentValue)
  ) {
    opts.unshift({
      value: currentValue,
      label: currentValue,
      sublabel: '(not in catalog)',
    });
  }
  return opts;
}

function buildProgramOptions(
  programs: Program[],
  currentValue: string,
): { value: string; label: string; sublabel?: string }[] {
  const opts = programs.map((p) => ({
    value: p.name,
    label: p.name,
    sublabel: p.nameCn || undefined,
  }));
  if (
    currentValue &&
    currentValue.trim() &&
    !programs.some((p) => p.name === currentValue)
  ) {
    opts.unshift({
      value: currentValue,
      label: currentValue,
      sublabel: '(not in catalog)',
    });
  }
  return opts;
}
