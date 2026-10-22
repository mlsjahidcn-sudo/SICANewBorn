'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  buildProgramSelectOptions,
  buildUniversitySelectOptions,
} from '@/lib/catalog-select-options';
import type { Program, University } from '@/lib/data';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { PageContainer } from '@/components/admin/page-container';

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Documents Requested', label: 'Documents Requested' },
  { value: 'Decision Made', label: 'Decision Made' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Withdrawn', label: 'Withdrawn' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
] as const;

const DECISION_OPTIONS = [
  { value: '', label: '— (no decision yet)' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Waitlisted', label: 'Waitlisted' },
] as const;

interface AdminApplication {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  isLinked: boolean;
  university: string;
  /** Catalog slug from student_applications.university_id. */
  universityId?: string;
  program: string;
  /** Catalog slug from student_applications.program_id. */
  programId?: string | null;
  degree: string;
  intake: string;
  status: string;
  source: 'Admin' | 'Partner' | 'Online';
  applicationNumber?: string;
  createdAt: string;
  notes?: string;
  priority?: string;
  personalStatement?: string | null;
  additionalNotes?: string | null;
  adminNotes?: string | null;
  decision?: string | null;
  decisionDate?: string | null;
  applicantName?: string | null;
  applicantEmail?: string | null;
  applicantPhone?: string | null;
  applicantNationality?: string | null;
}

export default function AdminApplicationEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t, locale } = useI18n();
  const catalogLocale = locale === 'zh' ? 'zh' : 'en';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  /** True when the loaded row's uni/program don't resolve to the live catalog. */
  const [notInCatalog, setNotInCatalog] = useState(false);

  const [formData, setFormData] = useState<{
    status: string;
    priority: string;
    university: string;
    universitySlug: string;
    program: string;
    programSlug: string;
    degree: string;
    intake: string;
    personalStatement: string;
    additionalNotes: string;
    adminNotes: string;
    decision: string;
    decisionDate: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone: string;
    applicantNationality: string;
  }>({
    status: 'Submitted',
    priority: 'Normal',
    university: '',
    universitySlug: '',
    program: '',
    programSlug: '',
    degree: '',
    intake: '',
    personalStatement: '',
    additionalNotes: '',
    adminNotes: '',
    decision: '',
    decisionDate: '',
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    applicantNationality: '',
  });

  const [originalStatus, setOriginalStatus] = useState<string>('');
  const [isLinked, setIsLinked] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setCatalogLoading(true);
    setError(null);
    setNotFound(false);

    Promise.all([
      apiFetchJson<{ application: AdminApplication }>(`/api/admin/applications/${id}`, {
        signal: controller.signal,
      }),
      apiFetchJson<{ universities: University[] }>('/api/universities?limit=500', {
        signal: controller.signal,
      }).catch(() => ({ universities: [] as University[] })),
      apiFetchJson<{ programs: Program[] }>('/api/programs?limit=500', {
        signal: controller.signal,
      }).catch(() => ({ programs: [] as Program[] })),
    ])
      .then(([appRes, uniRes, progRes]) => {
        if (controller.signal.aborted) return;
        const application = appRes.application;
        const uniList = uniRes.universities || [];
        const progList = progRes.programs || [];
        setUniversities(uniList);
        setPrograms(progList);

        // Prefer slug (universityId / programId), fall back to display name
        // for legacy free-text rows that never stored a catalog slug.
        const matchedUni =
          (application.universityId
            ? uniList.find((u) => u.slug === application.universityId)
            : undefined) ??
          uniList.find(
            (u) =>
              u.name === application.university ||
              u.nameCn === application.university,
          );

        const matchedProgram =
          (application.programId
            ? progList.find((p) => p.slug === application.programId)
            : undefined) ??
          progList.find(
            (p) =>
              p.name === application.program ||
              p.nameCn === application.program,
          );

        const resolvedInCatalog = Boolean(matchedUni && matchedProgram);
        setNotInCatalog(!resolvedInCatalog);

        setFormData({
          status: application.status,
          priority: application.priority || 'Normal',
          university: matchedUni?.name || application.university,
          universitySlug: matchedUni?.slug || application.universityId || '',
          program: matchedProgram?.name || application.program,
          programSlug: matchedProgram?.slug || application.programId || '',
          degree: application.degree,
          intake: application.intake,
          personalStatement: application.personalStatement || '',
          additionalNotes: application.additionalNotes || '',
          adminNotes: application.adminNotes || application.notes || '',
          decision: application.decision || '',
          decisionDate: application.decisionDate
            ? application.decisionDate.slice(0, 10)
            : '',
          applicantName: application.applicantName || '',
          applicantEmail: application.applicantEmail || '',
          applicantPhone: application.applicantPhone || '',
          applicantNationality: application.applicantNationality || '',
        });
        setOriginalStatus(application.status);
        setIsLinked(application.isLinked);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message || 'Failed to load application');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setCatalogLoading(false);
        }
      });
    return () => controller.abort();
  }, [id]);

  const universityOptions = useMemo(
    () =>
      buildUniversitySelectOptions({
        universities,
        locale: catalogLocale,
      }),
    [universities, catalogLocale],
  );

  // When a university is selected, narrow programs to that school.
  // Soft degree filter: empty degree = all programs at the uni.
  const programOptions = useMemo(
    () =>
      buildProgramSelectOptions({
        programs,
        universities,
        degreeFilter: formData.degree || null,
        universitySlugFilter: formData.universitySlug || null,
        locale: catalogLocale,
        atLabel: (name) => t('partnerAppForm.programSublabelAt', { name }),
      }),
    [
      programs,
      universities,
      formData.degree,
      formData.universitySlug,
      catalogLocale,
      t,
    ],
  );

  const handleUniversityChange = (slug: string) => {
    const selected = universities.find((u) => u.slug === slug);
    setNotInCatalog(false);
    setFormData((prev) => {
      const programStillValid =
        prev.programSlug &&
        programs.some(
          (p) =>
            p.slug === prev.programSlug &&
            p.universitySlug === slug,
        );
      return {
        ...prev,
        universitySlug: slug,
        university: selected?.name || '',
        // Clear program if it doesn't belong to the newly picked uni.
        ...(programStillValid
          ? {}
          : { programSlug: '', program: '' }),
      };
    });
  };

  const handleProgramChange = (slug: string) => {
    const selected = programs.find((p) => p.slug === slug);
    setNotInCatalog(false);
    if (!selected) {
      setFormData((prev) => ({ ...prev, programSlug: slug, program: '' }));
      return;
    }
    const uni = universities.find((u) => u.slug === selected.universitySlug);
    setFormData((prev) => ({
      ...prev,
      programSlug: slug,
      program: selected.name,
      universitySlug: selected.universitySlug || prev.universitySlug,
      university: uni?.name || prev.university,
      degree: prev.degree || selected.degree || '',
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Prefer catalog display names when we have a resolved slug so
      // university_name / program_name stay in sync with the picker.
      const uniName =
        universities.find((u) => u.slug === formData.universitySlug)?.name ||
        formData.university;
      const progName =
        programs.find((p) => p.slug === formData.programSlug)?.name ||
        formData.program;

      await apiFetchJson(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: formData.status,
          priority: formData.priority,
          university_id: formData.universitySlug || formData.university,
          university_name: uniName,
          program_id: formData.programSlug || null,
          program_name: progName,
          degree: formData.degree,
          intake: formData.intake,
          personal_statement: formData.personalStatement || null,
          additional_notes: formData.additionalNotes || null,
          admin_notes: formData.adminNotes || null,
          decision: formData.decision || null,
          decision_date: formData.decisionDate || null,
          applicant_name: formData.applicantName || null,
          applicant_email: formData.applicantEmail || null,
          applicant_phone: formData.applicantPhone || null,
          applicant_nationality: formData.applicantNationality || null,
        }),
      });
      router.push(`/admin/applications/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#4B5563]">
        <Spinner size="sm" className="inline-block mr-2" />
        Loading application...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/admin/applications')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">{t('adminAppEdit.notFoundTitle')}</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusChanged = formData.status !== originalStatus;

  return (
    <PageContainer width="narrow">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/admin/applications/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('adminAppEdit.backToApplication')}
        </Button>
        <Badge className="bg-[#1B2A4A] text-white">{t('adminAppEdit.title')}</Badge>
      </div>

      {notInCatalog && (
        <Card className="rounded-none border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-800">
            <strong className="font-semibold">{t('adminAppEdit.notInCatalogTitle')}</strong>
            <p className="mt-1">{t('adminAppEdit.notInCatalogBody')}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-none border-amber-300"
              onClick={() => setNotInCatalog(false)}
            >
              {t('adminAppEdit.switchToCatalog')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('adminAppEdit.sectionDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University *</Label>
              {notInCatalog ? (
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value, universitySlug: '' })
                  }
                />
              ) : (
                <SearchableSelect
                  value={formData.universitySlug}
                  onChange={handleUniversityChange}
                  options={universityOptions}
                  loading={catalogLoading}
                  locale={catalogLocale}
                  placeholder={
                    catalogLoading ? 'Loading catalog...' : 'Search universities…'
                  }
                  emptyText="No universities match"
                  searchPlaceholder="Type a university name"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program *</Label>
              {notInCatalog ? (
                <Input
                  id="program"
                  value={formData.program}
                  onChange={(e) =>
                    setFormData({ ...formData, program: e.target.value, programSlug: '' })
                  }
                />
              ) : (
                <SearchableSelect
                  value={formData.programSlug}
                  onChange={handleProgramChange}
                  options={programOptions}
                  loading={catalogLoading}
                  locale={catalogLocale}
                  placeholder={
                    catalogLoading
                      ? 'Loading catalog...'
                      : programOptions.length === 0
                        ? formData.universitySlug
                          ? 'No programs for this university'
                          : 'Search programs…'
                        : 'Search programs or university…'
                  }
                  emptyText="No programs match"
                  searchPlaceholder="Type a program or university name"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Select
                value={formData.degree}
                onValueChange={(v) => setFormData({ ...formData, degree: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select degree" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bachelor">Bachelor</SelectItem>
                  <SelectItem value="Master">Master</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                  <SelectItem value="Chinese Language">Chinese Language</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="intake">Intake *</Label>
              <Input
                id="intake"
                value={formData.intake}
                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                placeholder="e.g., September 2026"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => setFormData({ ...formData, status: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {statusChanged && (
              <p className="text-xs text-amber-700">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Status will change from <strong>{originalStatus}</strong> to <strong>{formData.status}</strong>.
                This will be recorded in the audit timeline.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="decision">Decision</Label>
              <Select
                value={formData.decision}
                onValueChange={(v) => setFormData({ ...formData, decision: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select decision" /></SelectTrigger>
                <SelectContent>
                  {DECISION_OPTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="decisionDate">Decision date</Label>
              <Input
                id="decisionDate"
                type="date"
                value={formData.decisionDate}
                onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalStatement">Personal statement (student-visible)</Label>
            <Textarea
              id="personalStatement"
              value={formData.personalStatement}
              onChange={(e) => setFormData({ ...formData, personalStatement: e.target.value })}
              rows={5}
              maxLength={4000}
              placeholder="Personal statement shown to the student / partner / admissions team"
            />
            <p className="text-xs text-gray-500">{formData.personalStatement.length} / 4000</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalNotes">Additional notes (student-visible)</Label>
            <Textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              rows={4}
              maxLength={2000}
              placeholder="Notes the student can read"
            />
            <p className="text-xs text-gray-500">{formData.additionalNotes.length} / 2000</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin notes (admin-only)</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              rows={4}
              maxLength={4000}
              placeholder="Internal notes (not shown to the student)..."
            />
            <p className="text-xs text-gray-500">{formData.adminNotes.length} / 4000</p>
          </div>
        </CardContent>
      </Card>

      {!isLinked && (
        <Card>
          <CardHeader>
            <CardTitle>{t('adminAppEdit.applicantSection')}</CardTitle>
            <p className="text-xs text-gray-500">
              {t('adminAppEdit.applicantHint')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicantName">Name</Label>
                <Input
                  id="applicantName"
                  value={formData.applicantName}
                  onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantEmail">Email</Label>
                <Input
                  id="applicantEmail"
                  type="email"
                  value={formData.applicantEmail}
                  onChange={(e) => setFormData({ ...formData, applicantEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantPhone">Phone</Label>
                <Input
                  id="applicantPhone"
                  value={formData.applicantPhone}
                  onChange={(e) => setFormData({ ...formData, applicantPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="applicantNationality">Nationality</Label>
                <Input
                  id="applicantNationality"
                  value={formData.applicantNationality}
                  onChange={(e) => setFormData({ ...formData, applicantNationality: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-red-800 text-sm"><strong>Error:</strong> {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={() => router.push(`/admin/applications/${id}`)} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#9B1B30] hover:bg-[#7A1526]">
          {isSaving ? (
            <><Spinner size="sm" className="mr-2" /> Saving...</>
          ) : (
            <><Check className="w-4 h-4 mr-2" /> Save Changes</>
          )}
        </Button>
      </div>
    </PageContainer>
  );
}
