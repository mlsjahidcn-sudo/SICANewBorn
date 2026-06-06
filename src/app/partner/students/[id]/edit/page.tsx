'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  PARTNER_STUDENT_STATUSES,
  PartnerStudentStatus,
} from '@/lib/partner-student-mapper';

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

  const loadStudent = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{ student: import('@/lib/partner-student-mapper').PartnerStudent }>(
        `/api/partner/students/${studentId}`,
      );
      const s = res.student;
      setFormData({
        studentName: s.studentName,
        studentEmail: s.studentEmail ?? '',
        studentPhone: s.studentPhone ?? '',
        nationality: s.nationality ?? '',
        targetUniversity: s.targetUniversity ?? '',
        targetProgram: s.targetProgram ?? '',
        status: s.status,
        notes: s.notes ?? '',
      });
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
                  <Input
                    id="targetUniversity"
                    name="targetUniversity"
                    value={formData.targetUniversity}
                    onChange={handleInputChange}
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="targetProgram" className="text-[#1B2A4A] mb-2 block">{t('partnerStudentEdit.fieldTargetProgram')}</Label>
                  <Input
                    id="targetProgram"
                    name="targetProgram"
                    value={formData.targetProgram}
                    onChange={handleInputChange}
                    className="rounded-none"
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
