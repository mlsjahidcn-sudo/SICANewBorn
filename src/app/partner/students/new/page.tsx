'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
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
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('Student name is required.');
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
      setError(err instanceof Error ? err.message : 'Failed to save student.');
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
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Add New Student</h1>
          <p className="text-[#4B5563] mt-1">Track a new student in your pipeline</p>
        </div>
      </div>

      <Card className="rounded-none border-blue-200 bg-blue-50">
        <CardContent className="p-4 text-sm text-[#1B2A4A]">
          <strong>What this form does:</strong> creates a lead record in your
          partner CRM. Once the student signs up for the SICA platform,
          their full profile (transcripts, language scores, documents) lives
          there — not here. Use the <em>Notes</em> field for free-form context.
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
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Student Information</h2>
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
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label htmlFor="studentEmail" className="text-[#1B2A4A] mb-2 block">Email</Label>
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
                  <Label htmlFor="studentPhone" className="text-[#1B2A4A] mb-2 block">Phone</Label>
                  <Input
                    id="studentPhone"
                    name="studentPhone"
                    type="tel"
                    value={formData.studentPhone}
                    onChange={handleInputChange}
                    className="rounded-none"
                    placeholder="+1 555 0100"
                  />
                </div>
                <div>
                  <Label htmlFor="nationality" className="text-[#1B2A4A] mb-2 block">Nationality</Label>
                  <Input
                    id="nationality"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="rounded-none"
                    placeholder="e.g., USA, UK, China"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Target Program</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="targetUniversity" className="text-[#1B2A4A] mb-2 block">Target University</Label>
                  <Input
                    id="targetUniversity"
                    name="targetUniversity"
                    value={formData.targetUniversity}
                    onChange={handleInputChange}
                    className="rounded-none"
                    placeholder="e.g., Tsinghua University"
                  />
                </div>
                <div>
                  <Label htmlFor="targetProgram" className="text-[#1B2A4A] mb-2 block">Target Program</Label>
                  <Input
                    id="targetProgram"
                    name="targetProgram"
                    value={formData.targetProgram}
                    onChange={handleInputChange}
                    className="rounded-none"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-[#1B2A4A] mb-2 block">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as PartnerStudentStatus }))}
                  >
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Select status" />
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
              <Label htmlFor="notes" className="text-[#1B2A4A] mb-2 block">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="rounded-none"
                placeholder="Any additional context, follow-up steps, or free-form information..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Link href="/partner/students">
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
            {isSaving ? 'Saving…' : 'Save Student'}
          </Button>
        </div>
      </form>
    </div>
  );
}
