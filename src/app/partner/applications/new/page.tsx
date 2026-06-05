'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  PARTNER_APPLICATION_STATUSES,
  PARTNER_APPLICATION_DECISIONS,
  PARTNER_APPLICATION_PRIORITIES,
  PARTNER_APPLICATION_DEGREES,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
  PartnerApplicationPriority,
  PartnerApplicationDegree,
} from '@/lib/partner-application-mapper';
import type { PartnerStudent } from '@/lib/partner-student-mapper';
import type { University, Program } from '@/lib/data';

interface FormData {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  university: string;
  program: string;
  intake: string;
  degree: '' | PartnerApplicationDegree;
  nationality: string;
  priority: PartnerApplicationPriority;
  status: PartnerApplicationStatus;
  decision: PartnerApplicationDecision;
  notes: string;
}

const INITIAL: FormData = {
  studentName: '',
  studentEmail: '',
  studentPhone: '',
  university: '',
  program: '',
  intake: '',
  degree: '',
  nationality: '',
  priority: 'Normal',
  status: 'Draft',
  decision: 'Pending',
  notes: '',
};

export default function PartnerNewApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Phase S20: load this partner's students, plus the live university
  // and program lists. The university / program fields used to be
  // plain text inputs — the partner could mistype a school name and
  // ship the application to "Tsingha University". Now they pick
  // from the same list the public site uses.
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

  // Programs filtered by the picked university (if any) so the
  // partner can drill into one school without scrolling a 500-row list.
  const filteredPrograms = programs.filter(
    (p) => !formData.university || p.universitySlug === formData.university,
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentPick = (studentId: string) => {
    const s = students.find((x) => x.id === studentId);
    if (!s) return;
    setFormData((prev) => ({
      ...prev,
      studentName: s.studentName,
      // Auto-fill contact + context fields if blank, but don't clobber
      // anything the partner has already typed.
      studentEmail: prev.studentEmail || s.studentEmail || '',
      studentPhone: prev.studentPhone || s.studentPhone || '',
      nationality: prev.nationality || s.nationality || '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.studentName.trim()) {
      setError('Student name is required.');
      return;
    }
    if (!formData.university.trim()) {
      setError('University is required.');
      return;
    }
    if (!formData.program.trim()) {
      setError('Program is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        studentName: formData.studentName.trim(),
        studentEmail: formData.studentEmail.trim() || undefined,
        studentPhone: formData.studentPhone.trim() || undefined,
        university: formData.university.trim(),
        program: formData.program.trim(),
        intake: formData.intake.trim() || undefined,
        degree: formData.degree || undefined,
        nationality: formData.nationality.trim() || undefined,
        priority: formData.priority,
        status: formData.status,
        decision: formData.decision,
        notes: formData.notes.trim() || undefined,
      };
      if (formData.status === 'Submitted' || formData.status === 'In Review') {
        payload.submittedAt = new Date().toISOString();
      }
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
      setError(err instanceof Error ? err.message : 'Failed to create application.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/partner/applications" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">New Application</h1>
          <p className="text-[#4B5563] mt-1 text-sm">Track a new university application</p>
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
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Student & Program</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {students.length > 0 && (
                  <div>
                    <Label className="text-[#1B2A4A] mb-2 block">Pick from your students</Label>
                    <Select onValueChange={handleStudentPick}>
                      <SelectTrigger className="rounded-none">
                        <SelectValue placeholder="(optional) — autofill name" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.studentName} {s.studentEmail ? `(${s.studentEmail})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="studentName" className="text-[#1B2A4A] mb-2 block">
                    Student Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                    className="rounded-none"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="studentEmail" className="text-[#1B2A4A] mb-2 block">
                    Student Email
                  </Label>
                  <Input
                    id="studentEmail"
                    name="studentEmail"
                    type="email"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    className="rounded-none"
                    placeholder="student@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="studentPhone" className="text-[#1B2A4A] mb-2 block">
                    Student Phone
                  </Label>
                  <Input
                    id="studentPhone"
                    name="studentPhone"
                    type="tel"
                    value={formData.studentPhone}
                    onChange={handleInputChange}
                    className="rounded-none"
                    placeholder="+86 138 0000 0000"
                  />
                </div>
                <div>
                  <Label htmlFor="nationality" className="text-[#1B2A4A] mb-2 block">
                    Nationality
                  </Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="rounded-none"
                    placeholder="e.g., Nigeria, Brazil, Vietnam"
                  />
                </div>
                <div>
                  <Label htmlFor="university" className="text-[#1B2A4A] mb-2 block">
                    University <span className="text-red-600">*</span>
                  </Label>
                  <SearchableSelect
                    value={formData.university}
                    onChange={(value) => {
                      // The API stores university as a free-text
                      // name (partner_applications.university), not a
                      // slug, so we resolve the picked slug → name
                      // before stashing it. Keeps the API contract
                      // simple and lets the partner eventually add
                      // a school we don't yet have in the catalogue.
                      const picked = universities.find((u) => u.slug === value);
                      setFormData((prev) => ({
                        ...prev,
                        university: picked?.name ?? value,
                        // Clear the program — it was tied to the
                        // old university, and any program the
                        // partner re-picks should match the new one.
                        program: '',
                      }));
                    }}
                    options={universities.map((u) => ({
                      value: u.slug,
                      label: u.name,
                      sublabel: u.cityCn
                        ? `${u.cityCn} · #${u.ranking} in China`
                        : `#${u.ranking} in China`,
                    }))}
                    placeholder={dataLoading ? 'Loading universities…' : 'Type to search…'}
                    emptyText="No universities match"
                    searchPlaceholder="Search by name or city…"
                    disabled={dataLoading}
                    loading={dataLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="program" className="text-[#1B2A4A] mb-2 block">
                    Program <span className="text-red-600">*</span>
                  </Label>
                  <SearchableSelect
                    value={formData.program}
                    onChange={(value) => {
                      // The API stores program as a free-text name
                      // (partner_applications.program), so resolve
                      // the picked slug → name before stashing.
                      const picked = programs.find((p) => p.slug === value);
                      setFormData((prev) => ({
                        ...prev,
                        program: picked?.name ?? value,
                      }));
                    }}
                    options={filteredPrograms.map((p) => {
                      const uni = universities.find((u) => u.slug === p.universitySlug);
                      return {
                        value: p.slug,
                        label: p.name,
                        sublabel: uni
                          ? `${uni.name} · ${p.degree} · ${p.language}`
                          : `${p.degree} · ${p.language}`,
                      };
                    })}
                    placeholder={dataLoading ? 'Loading programs…' : 'Type to search…'}
                    emptyText={formData.university ? 'No programs at this school' : 'No programs match'}
                    searchPlaceholder="Search by name, school, or language…"
                    clearValue=""
                    clearLabel="(any program)"
                    disabled={dataLoading}
                    loading={dataLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="intake" className="text-[#1B2A4A] mb-2 block">Intake</Label>
                  <Input
                    id="intake"
                    name="intake"
                    value={formData.intake}
                    onChange={handleInputChange}
                    className="rounded-none"
                    placeholder="e.g., Fall 2026"
                  />
                </div>
                <div>
                  <Label htmlFor="degree" className="text-[#1B2A4A] mb-2 block">Degree</Label>
                  <Select
                    value={formData.degree || 'none'}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        degree: value === 'none' ? '' : (value as PartnerApplicationDegree),
                      }))
                    }
                  >
                    <SelectTrigger id="degree" className="rounded-none">
                      <SelectValue placeholder="(unspecified)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">(unspecified)</SelectItem>
                      {PARTNER_APPLICATION_DEGREES.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority" className="text-[#1B2A4A] mb-2 block">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value as PartnerApplicationPriority }))
                    }
                  >
                    <SelectTrigger id="priority" className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNER_APPLICATION_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" className="text-[#1B2A4A] mb-2 block">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value as PartnerApplicationStatus }))
                    }
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNER_APPLICATION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="decision" className="text-[#1B2A4A] mb-2 block">Decision</Label>
                  <Select
                    value={formData.decision}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, decision: value as PartnerApplicationDecision }))
                    }
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTNER_APPLICATION_DECISIONS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-[#1B2A4A] mb-2 block">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="rounded-none"
                placeholder="Any free-form context, follow-up steps, or admin notes..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Link href="/partner/applications">
            <Button type="button" variant="outline" className="rounded-none" disabled={isSaving}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Creating…' : 'Create Application'}
          </Button>
        </div>
      </form>
    </div>
  );
}
