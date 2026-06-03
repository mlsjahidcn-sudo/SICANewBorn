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
import {
  PARTNER_APPLICATION_STATUSES,
  PARTNER_APPLICATION_DECISIONS,
  PartnerApplicationStatus,
  PartnerApplicationDecision,
} from '@/lib/partner-application-mapper';
import type { PartnerStudent } from '@/lib/partner-student-mapper';

interface FormData {
  studentName: string;
  university: string;
  program: string;
  status: PartnerApplicationStatus;
  decision: PartnerApplicationDecision;
  notes: string;
}

const INITIAL: FormData = {
  studentName: '',
  university: '',
  program: '',
  status: 'Draft',
  decision: 'Pending',
  notes: '',
};

export default function PartnerNewApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [students, setStudents] = useState<PartnerStudent[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load this partner's students so they can pick one to seed studentName.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetchJson<{ students: PartnerStudent[] }>(
          '/api/partner/students?limit=100',
        );
        if (cancelled) return;
        setStudents(res.students || []);
      } catch {
        // Non-fatal — user can still type a name manually
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentPick = (studentId: string) => {
    const s = students.find((x) => x.id === studentId);
    if (s) setFormData((prev) => ({ ...prev, studentName: s.studentName }));
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
        university: formData.university.trim(),
        program: formData.program.trim(),
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
                    placeholder="e.g., Tsinghua University"
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
                    placeholder="e.g., Computer Science (Master)"
                  />
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
