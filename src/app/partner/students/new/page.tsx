'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  status: PartnerStudentStatus | '';
  notes: string;
}

const INITIAL: FormData = {
  studentName: '',
  studentEmail: '',
  studentPhone: '',
  nationality: '',
  targetUniversity: '',
  targetProgram: '',
  status: 'New',
  notes: '',
};

export default function PartnerAddStudentPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Phase 47.4: load the live catalog so the target-university and
  // target-program fields are searchable pickers (not free-text).
  // Free-text gave us "Tsingha University" / "Tsinghua Univ" /
  // "Tsinghua" as three different rows for the same school; the
  // catalog is the single source of truth for what's offered. The
  // picker is empty-allowed (clearValue='') so the partner can
  // skip the field if the student hasn't decided yet.
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.studentName.trim()) {
      setError(t('partnerStudentNew.errorStudentNameRequired'));
      return;
    }
    // Phase 47: client-side email format check, mirrors the server
    // check in src/lib/partner-validation.ts. type="email" gives a
    // soft browser cue but doesn't block submit on invalid values
    // — a "gmial.com" typo used to silently store and bounce when
    // SICA emailed the student. Same RFC 5322 lite regex as the
    // partner application form (Phase 23 M9).
    const trimmedEmail = formData.studentEmail.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError(t('partnerAppNew.errorStudentEmailInvalid'));
      return;
    }

    setIsSaving(true);
    try {
      // Map to the camelCase shape the API expects. Empty strings become
      // null via the mapper, so we can just send the trimmed values.
      const payload = {
        studentName: formData.studentName.trim(),
        studentEmail: formData.studentEmail.trim() || undefined,
        studentPhone: formData.studentPhone.trim() || undefined,
        nationality: formData.nationality.trim() || undefined,
        targetUniversity: formData.targetUniversity.trim() || undefined,
        targetProgram: formData.targetProgram.trim() || undefined,
        status: formData.status || undefined,
        notes: formData.notes.trim() || undefined,
      };
      await apiFetchJson<{ student: { id: string } }>('/api/partner/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push('/partner/students');
    } catch (err) {
      console.error('[partner/students/new] save failed:', err);
      setError(err instanceof Error ? err.message : t('partnerStudentNew.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/partner/students" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerStudentNew.title')}</h1>
          <p className="text-[#4B5563] mt-1">{t('partnerStudentNew.subtitle')}</p>
        </div>
      </div>

      <Card className="rounded-none border-blue-200 bg-blue-50">
        <CardContent className="p-4 text-sm text-[#1B2A4A]">
          <strong>{t('partnerStudentNew.bannerTitle')}</strong> {t('partnerStudentNew.bannerBody')}
          <em>{t('partnerStudentNew.bannerNotes')}</em>{t('partnerStudentNew.bannerBodyEnd')}
        </CardContent>
      </Card>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="rounded-none">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">{t('partnerStudentNew.sectionInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="studentName" className="text-[#1B2A4A] mb-2 block">
                    {t('partnerStudentNew.fieldStudentName')} <span className="text-red-600">{t('partnerCommon.requiredAsterisk')}</span>
                  </Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                    maxLength={200}
                    className="rounded-none"
                    placeholder={t('partnerStudentNew.fieldStudentNamePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="studentEmail" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentNew.fieldEmail')}</Label>
                  <Input
                    id="studentEmail"
                    name="studentEmail"
                    type="email"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    maxLength={200}
                    className="rounded-none"
                    placeholder={t('partnerStudentNew.fieldEmailPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="studentPhone" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentNew.fieldPhone')}</Label>
                  <Input
                    id="studentPhone"
                    name="studentPhone"
                    type="tel"
                    value={formData.studentPhone}
                    onChange={handleInputChange}
                    maxLength={50}
                    className="rounded-none"
                    placeholder={t('partnerStudentNew.fieldPhonePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentNew.fieldNationality')}</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="rounded-none"
                    placeholder={t('partnerStudentNew.fieldNationalityPlaceholder')}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">{t('partnerStudentNew.sectionTarget')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="targetUniversity" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentNew.fieldTargetUniversity')}</Label>
                  {/* Phase 47.4: SearchableSelect over the live
                      university catalog. value=name so existing
                      free-text data still works (and the API
                      keeps accepting strings). clearValue=''
                      lets the partner leave the field blank when
                      the student hasn't decided yet. */}
                  <SearchableSelect
                    value={formData.targetUniversity}
                    onChange={(v) => setFormData((prev) => ({ ...prev, targetUniversity: v }))}
                    options={universities.map((u) => ({
                      value: u.name,
                      label: u.name,
                      sublabel: u.nameCn || undefined,
                    }))}
                    placeholder={t('partnerStudentNew.fieldTargetUniversityPlaceholder')}
                    clearValue=""
                    clearLabel={t('partnerCommon.placeholderDash')}
                    loading={catalogLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="targetProgram" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentNew.fieldTargetProgram')}</Label>
                  <SearchableSelect
                    value={formData.targetProgram}
                    onChange={(v) => setFormData((prev) => ({ ...prev, targetProgram: v }))}
                    options={programs.map((p) => ({
                      value: p.name,
                      label: p.name,
                      sublabel: p.nameCn || undefined,
                    }))}
                    placeholder={t('partnerStudentNew.fieldTargetProgramPlaceholder')}
                    clearValue=""
                    clearLabel={t('partnerCommon.placeholderDash')}
                    loading={catalogLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentNew.fieldStatus')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as PartnerStudentStatus }))}
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder={t('partnerStudentNew.selectStatus')} />
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
              <Label htmlFor="notes" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentNew.fieldNotes')}</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                maxLength={4000}
                className="rounded-none"
                placeholder={t('partnerStudentNew.fieldNotesPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Link href="/partner/students">
            <Button type="button" variant="outline" className="rounded-none" disabled={isSaving}>
              {t('partnerStudentNew.cancel')}
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t('partnerStudentNew.saving') : t('partnerStudentNew.saveStudent')}
          </Button>
        </div>
      </form>
    </div>
  );
}
