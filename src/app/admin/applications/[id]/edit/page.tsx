'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiFetchJson } from '@/lib/api-client';

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

interface AdminApplication {
  id: string;
  studentId: string | null;
  studentName: string;
  studentEmail: string;
  isLinked: boolean;
  university: string;
  program: string;
  degree: string;
  intake: string;
  status: string;
  source: 'Admin' | 'Partner' | 'Online';
  applicationNumber?: string;
  createdAt: string;
  notes?: string;
}

export default function AdminApplicationEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState<{
    status: string;
    university: string;
    program: string;
    degree: string;
    intake: string;
    adminNotes: string;
  }>({
    status: 'Submitted',
    university: '',
    program: '',
    degree: '',
    intake: '',
    adminNotes: '',
  });

  const [originalStatus, setOriginalStatus] = useState<string>('');

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    apiFetchJson<{ application: AdminApplication }>(`/api/admin/applications/${id}`, {
      signal: controller.signal,
    })
      .then(({ application }) => {
        setFormData({
          status: application.status,
          university: application.university,
          program: application.program,
          degree: application.degree,
          intake: application.intake,
          adminNotes: application.notes || '',
        });
        setOriginalStatus(application.status);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message || 'Failed to load application');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await apiFetchJson(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: formData.status,
          university: formData.university,
          university_name: formData.university,
          program: formData.program,
          program_name: formData.program,
          degree: formData.degree,
          intake: formData.intake,
          admin_notes: formData.adminNotes,
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
            <h3 className="text-lg font-semibold mb-2">Application Not Found</h3>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusChanged = formData.status !== originalStatus;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/admin/applications/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Application
        </Button>
        <Badge className="bg-[#1B2A4A] text-white">Edit Application</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="university">University *</Label>
              <Input
                id="university"
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program *</Label>
              <Input
                id="program"
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
              />
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

          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              rows={4}
              placeholder="Internal notes (not shown to the student)..."
            />
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
