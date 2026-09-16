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
import { useI18n } from '@/lib/i18n';

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
  program: string;
  degree: string;
  intake: string;
  status: string;
  source: 'Admin' | 'Partner' | 'Online';
  applicationNumber?: string;
  createdAt: string;
  notes?: string;
  // Phase 109 Batch 4: surface the full set of admin-managed fields
  // from the API. The detail page already reads these; the edit page
  // can now write them too.
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
  const { t } = useI18n();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState<{
    status: string;
    priority: string;
    university: string;
    program: string;
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
    program: '',
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
    setError(null);
    setNotFound(false);
    apiFetchJson<{ application: AdminApplication }>(`/api/admin/applications/${id}`, {
      signal: controller.signal,
    })
      .then(({ application }) => {
        setFormData({
          status: application.status,
          priority: application.priority || 'Normal',
          university: application.university,
          program: application.program,
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
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // PATCH payload — only sends fields the API's whitelist accepts.
      // The server strips unknown fields; we still keep the payload
      // tight for clarity.
      await apiFetchJson(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: formData.status,
          priority: formData.priority,
          university_name: formData.university,
          program_name: formData.program,
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push(`/admin/applications/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('adminAppEdit.backToApplication')}
        </Button>
        <Badge className="bg-[#1B2A4A] text-white">{t('adminAppEdit.title')}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminAppEdit.sectionDetails')}</CardTitle>
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
    </div>
  );
}
