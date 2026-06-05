'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
import type {
  PartnerApplicationStatus,
  PartnerApplicationDecision,
  PartnerApplicationPriority,
  PartnerApplicationDegree,
} from '@/lib/partner-application-mapper';
import {
  PARTNER_APPLICATION_STATUSES,
  PARTNER_APPLICATION_DECISIONS,
  PARTNER_APPLICATION_PRIORITIES,
  PARTNER_APPLICATION_DEGREES,
} from '@/lib/partner-application-mapper';

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
  applicationNumber: string;
  submittedAt: string | null;
}

export default function PartnerEditApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!applicationId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiFetchJson<{
        application: import('@/lib/partner-application-mapper').PartnerApplication;
      }>(`/api/partner/applications/${applicationId}`);
      const a = res.application;
      setFormData({
        studentName: a.studentName,
        studentEmail: a.studentEmail ?? '',
        studentPhone: a.studentPhone ?? '',
        university: a.university,
        program: a.program,
        intake: a.intake ?? '',
        degree: (a.degree as PartnerApplicationDegree | null) || '',
        nationality: a.nationality ?? '',
        priority: a.priority,
        status: a.status,
        decision: a.decision,
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
        studentName: formData.studentName.trim(),
        studentEmail: formData.studentEmail.trim() || null,
        studentPhone: formData.studentPhone.trim() || null,
        university: formData.university.trim(),
        program: formData.program.trim(),
        intake: formData.intake.trim() || null,
        degree: formData.degree || null,
        nationality: formData.nationality.trim() || null,
        priority: formData.priority,
        status: formData.status,
        decision: formData.decision,
        notes: formData.notes.trim() || null,
        applicationNumber: formData.applicationNumber.trim() || null,
      };
      // Stamp submittedAt the first time status moves to Submitted/In Review
      // and the row doesn't have one yet. The server keeps an existing
      // timestamp — we just nudge it on the transition.
      if (
        (formData.status === 'Submitted' || formData.status === 'In Review') &&
        !formData.submittedAt
      ) {
        payload.submittedAt = new Date().toISOString();
      }
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
        <Link href="/partner/applications" className="inline-flex items-center gap-2 text-[#1B2A4A]">
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/partner/applications/${applicationId}`} className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Edit Application</h1>
          <p className="text-[#4B5563] mt-1 text-sm">{formData.studentName} · {formData.university}</p>
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
                  />
                </div>
                <div>
                  <Label htmlFor="university" className="text-[#1B2A4A] mb-2 block">
                    University <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    required
                    className="rounded-none"
                  />
                </div>
                <div>
                  <Label htmlFor="program" className="text-[#1B2A4A] mb-2 block">
                    Program <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="program"
                    name="program"
                    value={formData.program}
                    onChange={handleInputChange}
                    required
                    className="rounded-none"
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
                      setFormData((prev) => (prev ? {
                        ...prev,
                        degree: value === 'none' ? '' : (value as PartnerApplicationDegree),
                      } : prev))
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
                  <Label htmlFor="applicationNumber" className="text-[#1B2A4A] mb-2 block">
                    Application #
                  </Label>
                  <Input
                    id="applicationNumber"
                    name="applicationNumber"
                    value={formData.applicationNumber}
                    onChange={handleInputChange}
                    className="rounded-none font-mono"
                    placeholder="auto-assigned on submit"
                  />
                </div>
                <div>
                  <Label htmlFor="priority" className="text-[#1B2A4A] mb-2 block">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => (prev ? { ...prev, priority: value as PartnerApplicationPriority } : prev))
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
                      setFormData((prev) => (prev ? { ...prev, status: value as PartnerApplicationStatus } : prev))
                    }
                  >
                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
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
                      setFormData((prev) => (prev ? { ...prev, decision: value as PartnerApplicationDecision } : prev))
                    }
                  >
                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
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
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Link href={`/partner/applications/${applicationId}`}>
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
            {isSaving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
