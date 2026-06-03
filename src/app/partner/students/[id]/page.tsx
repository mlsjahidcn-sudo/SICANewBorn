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
      // (the partner_students row doesn't have a hard FK to
      // partner_applications — we link them by studentName as a soft
      // join. The CRM-style workflow assumes one student → N apps by
      // name.)
      const apps = await apiFetchJson<{ applications: PartnerApplication[] }>(
        `/api/partner/applications?search=${encodeURIComponent(res.student.studentName)}&limit=50`,
      );
      setApplications(apps.applications || []);
    } catch (err) {
      console.error('[partner/students/:id] fetch failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load student.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void fetchStudent();
  }, [fetchStudent]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/partner/students/${studentId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      router.push('/partner/students');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
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
          <ArrowLeft className="w-4 h-4" /> Back to students
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <div>
              <p className="font-medium">Couldn't load student</p>
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
          <ArrowLeft className="w-4 h-4" /> Back to students
        </Link>
        <Card className="rounded-none">
          <CardContent className="p-6 text-[#4B5563]">Student not found.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-4">Delete Student</h3>
            <p className="text-[#4B5563] mb-6">
              Delete <strong>{student.studentName}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={isDeleting}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
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
            Added {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-none">
            <Link href={`/partner/students/${student.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDelete(true)}
            className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({applications.length})
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="Email" value={student.studentEmail} />
                <Field label="Phone" value={student.studentPhone} />
                <Field label="Nationality" value={student.nationality} />
              </CardContent>
            </Card>

            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="text-[#1B2A4A]">Target Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Field label="University" value={student.targetUniversity} />
                <Field label="Program" value={student.targetProgram} />
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[#4B5563]">Status:</span>
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
              <CardTitle className="text-[#1B2A4A]">Applications</CardTitle>
              <Button asChild variant="outline" className="rounded-none" size="sm">
                <Link href="/partner/applications/new">+ New application</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-sm text-[#4B5563] py-4 text-center">
                  No applications for {student.studentName} yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">University</th>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">Program</th>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">Status</th>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">Decision</th>
                        <th className="px-4 py-3 text-left text-[#1B2A4A]">Submitted</th>
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
                            {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '—'}
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
                <MessageSquare className="w-4 h-4" /> Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.notes ? (
                <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{student.notes}</p>
              ) : (
                <p className="text-sm text-[#4B5563] italic">No notes recorded yet.</p>
              )}
              <p className="text-xs text-[#4B5563] mt-4 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Last updated{' '}
                {student.updatedAt
                  ? new Date(student.updatedAt).toLocaleString()
                  : '—'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[#4B5563] min-w-24">{label}:</span>
      <span className="font-medium text-[#1F2937]">{value || '—'}</span>
    </div>
  );
}
