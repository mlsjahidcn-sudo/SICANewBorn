'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, MessageSquare, Calendar, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { PartnerStudent, PartnerStudentStatus } from '@/lib/partner-student-mapper';
import type { PartnerApplication } from '@/lib/partner-application-mapper';

const STATUS_VARIANTS: Record<PartnerStudentStatus, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  'New': 'secondary',
  'In Progress': 'outline',
  'Applied': 'outline',
  'Accepted': 'default',
  'Rejected': 'destructive',
};

export default function PartnerStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const studentId = params.id as string;

  const [student, setStudent] = useState<PartnerStudent | null>(null);
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudent = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ student: PartnerStudent }>(
        `/api/partner/students/${studentId}`,
      );
      setStudent(res.student);

      // Also fetch this partner's applications and filter by name match
      // Phase 1.12: use the new student_id FK instead of a soft
      // name join. Two students named "Mohammed Ali" used to
      // cross-link each other's applications.
      const apps = await apiFetchJson<{ applications: PartnerApplication[] }>(
        `/api/partner/applications?studentId=${encodeURIComponent(res.student.id)}&limit=50`,
      );
      setApplications(apps.applications || []);
    } catch (err) {
      console.error('[partner/students/:id] fetch failed:', err);
      setError(err instanceof Error ? err.message : t('partnerStudentDetail.errorLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [studentId, t]);

  useEffect(() => {
    void fetchStudent();
  }, [fetchStudent]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/students/${studentId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerStudentDetail.deleting'));
      }
      router.push('/partner/students');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerStudentDetail.deleting'));
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse w-48" />
        <div className="h-12 bg-gray-200 animate-pulse" />
        <div className="h-64 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="space-y-4">
        <Link href="/partner/students" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" /> {t('partnerStudentDetail.backToStudents')}
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">{t('partnerStudentDetail.couldNotLoad')}</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <Link href="/partner/students" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" /> {t('partnerStudentDetail.backToStudents')}
        </Link>
        <Card className="rounded-none">
          <CardContent className="p-6 text-[#4B5563]">{t('partnerStudentDetail.studentNotFound')}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">{t('partnerStudentDetail.deleteTitle')}</h3>
            <p className="text-[#4B5563] mb-6">
              {t('partnerStudentDetail.deleteBodyFor', { name: student.studentName })}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                {t('partnerStudentDetail.cancel')}
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? t('partnerStudentDetail.deleting') : t('partnerStudentDetail.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <Link href="/partner/students" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{student.studentName}</h1>
            <Badge variant={STATUS_VARIANTS[student.status]} className="rounded-none">
              {student.status}
            </Badge>
          </div>
          <p className="text-[#4B5563] mt-1 text-sm">
            {t('partnerStudentDetail.addedOn', { date: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : t('partnerCommon.placeholderDash') })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-none">
            <Link href={`/partner/students/${student.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {t('partnerStudentDetail.edit')}
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDelete(true)}
            className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('partnerStudentDetail.delete')}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="rounded-none">
          <TabsTrigger value="overview">{t('partnerStudentDetail.tabOverview')}</TabsTrigger>
          <TabsTrigger value="applications">
            {t('partnerStudentDetail.tabApplications', { count: applications.length })}
          </TabsTrigger>
          <TabsTrigger value="notes">{t('partnerStudentDetail.tabNotes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerStudentDetail.sectionContact')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label={t('partnerStudentDetail.fieldEmail')} value={student.studentEmail} t={t} />
                <Field label={t('partnerStudentDetail.fieldPhone')} value={student.studentPhone} t={t} />
                <Field label={t('partnerStudentDetail.fieldNationality')} value={student.nationality} t={t} />
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">{t('partnerStudentDetail.sectionTarget')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label={t('partnerStudentDetail.fieldUniversity')} value={student.targetUniversity} t={t} />
                <Field label={t('partnerStudentDetail.fieldProgram')} value={student.targetProgram} t={t} />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[#4B5563]">{t('partnerStudentDetail.statusLabel')}</span>
                  <Badge variant={STATUS_VARIANTS[student.status]} className="rounded-none">
                    {student.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card className="rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-[#1B2A4A]">{t('partnerStudentDetail.sectionApplications')}</CardTitle>
              <Button asChild variant="outline" className="rounded-none" size="sm">
                {/* Phase 48.2: pass ?studentId=<id> so the new
                    application form's "Pick from your students"
                    helper auto-picks this student. Saves the
                    partner a click + a scroll-to-find step. The
                    form's existing useEffect just reads
                    searchParams.get('studentId') and triggers the
                    auto-pick — no new wiring needed. */}
                <Link href={`/partner/applications/new?studentId=${student.id}`}>
                  {t('partnerStudentDetail.newApplication')}
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-sm text-[#4B5563] py-4 text-center">
                  {t('partnerStudentDetail.noApplicationsFor', { name: student.studentName })}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">{t('partnerStudentDetail.colUniversity')}</th>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">{t('partnerStudentDetail.colProgram')}</th>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">{t('partnerStudentDetail.colStatus')}</th>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">{t('partnerStudentDetail.colDecision')}</th>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">{t('partnerStudentDetail.colSubmitted')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {applications.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Link
                              href={`/partner/applications/${a.id}`}
                              className="text-[#1B2A4A] hover:underline"
                            >
                              {a.university}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-[#4B5563]">{a.program}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="rounded-none">{a.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-[#4B5563]">{a.decision}</td>
                          <td className="px-4 py-3 text-[#4B5563]">
                            {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : t('partnerCommon.placeholderDash')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-[#1B2A4A] flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> {t('partnerStudentDetail.sectionNotes')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.notes ? (
                <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{student.notes}</p>
              ) : (
                <p className="text-sm text-[#4B5563] italic">{t('partnerStudentDetail.noNotesYet')}</p>
              )}
              <p className="text-xs text-[#4B5563] mt-4 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t('partnerStudentDetail.lastUpdated', { date: student.updatedAt
                  ? new Date(student.updatedAt).toLocaleString()
                  : t('partnerCommon.placeholderDash') })}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value, t }: { label: string; value: string | null | undefined; t: (key: string) => string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className="font-medium text-[#1F2937]">{value || t('partnerCommon.placeholderDash')}</span>
    </div>
  );
}
