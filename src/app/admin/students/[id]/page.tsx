'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit, AlertCircle, FileText, FileCheck, FileX, Clock, Loader2,
  Plus, Mail, ChevronRight, RefreshCw, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { apiFetchJson } from '@/lib/api-client';
import type { AdminStudent } from '@/lib/student-mapper';

type DocumentStatus = 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';
type ApplicationStatus =
  | 'Draft' | 'Submitted' | 'Under Review' | 'Documents Requested'
  | 'Decision Made' | 'Accepted' | 'Rejected' | 'Withdrawn';

interface StudentDocument {
  id: string;
  student_id: string;
  document_type_id: string;
  name: string;
  category: string;
  file_url: string;
  file_name?: string;
  status: DocumentStatus;
  uploaded_at: string;
  verified_at?: string;
  rejection_reason?: string;
}

interface StudentApplication {
  id: string;
  student_id: string;
  program_id?: string;
  university_slug?: string;
  status: ApplicationStatus;
  target_degree?: string;
  target_intake?: string;
  created_at: string;
  application_number?: string;
}

interface ActivityEvent {
  id: string;
  type: 'profile' | 'application' | 'notification';
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-gray-100 text-gray-800',
  Pending: 'bg-yellow-100 text-yellow-800',
  Suspended: 'bg-red-100 text-red-800',
};

const docStatusColor: Record<DocumentStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Uploaded: 'bg-blue-100 text-blue-800',
  Verified: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const appStatusColor: Record<ApplicationStatus, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Submitted: 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  'Documents Requested': 'bg-purple-100 text-purple-800',
  'Decision Made': 'bg-orange-100 text-orange-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Withdrawn: 'bg-gray-100 text-gray-800',
};

export default function AdminStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<AdminStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [tabLoading, setTabLoading] = useState<{ [k: string]: boolean }>({});

  // Load student
  const loadStudent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const { student } = await apiFetchJson<{ student: AdminStudent }>(
        `/api/admin/students/${studentId}`,
      );
      setStudent(student);
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 404) setNotFound(true);
      else setError(e.message || 'Failed to load student');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  // Load a tab's data lazily
  const loadTab = useCallback(
    async (tab: 'documents' | 'applications' | 'activity') => {
      setTabLoading((prev) => ({ ...prev, [tab]: true }));
      try {
        if (tab === 'documents') {
          const { documents } = await apiFetchJson<{ documents: StudentDocument[] }>(
            `/api/admin/students/${studentId}/documents`,
          );
          setDocuments(documents);
        } else if (tab === 'applications') {
          const { applications } = await apiFetchJson<{ applications: StudentApplication[] }>(
            `/api/admin/students/${studentId}/applications`,
          );
          setApplications(applications);
        } else if (tab === 'activity') {
          const { activity } = await apiFetchJson<{ activity: ActivityEvent[] }>(
            `/api/admin/students/${studentId}/activity`,
          );
          setActivity(activity);
        }
      } catch (err) {
        // Tab errors are non-fatal — just log
        console.error(`[admin/student detail] failed to load ${tab}:`, err);
      } finally {
        setTabLoading((prev) => ({ ...prev, [tab]: false }));
      }
    },
    [studentId],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => router.push('/admin/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Student Not Found</h3>
            <p className="text-gray-500 mb-4">This student may have been deleted or doesn't exist.</p>
            <Button onClick={() => router.push('/admin/students')}>
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-red-800 text-sm"><strong>Error:</strong> {error || 'Unknown error'}</p>
            <Button size="sm" variant="outline" onClick={loadStudent} className="mt-2">
              <RefreshCw className="w-4 h-4 mr-1" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${student.firstName} ${student.lastName}`.trim() || '—';
  const sourceLabel = student.isOffline
    ? 'Offline Student'
    : student.source === 'Partner'
      ? 'Partner'
      : 'Online';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadStudent}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            className="bg-[#9B1B30] hover:bg-[#7A1526]"
            onClick={() => router.push(`/admin/students/${studentId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Student
          </Button>
        </div>
      </div>

      {/* Banner */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
              {(student.firstName?.[0] || '?').toUpperCase()}
              {(student.lastName?.[0] || '').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                <Badge className={student.isOffline ? 'bg-[#9B1B30] text-white' : 'bg-[#1B2A4A] text-white'}>
                  {sourceLabel}
                </Badge>
                <Badge className={statusColors[student.status] || 'bg-gray-100 text-gray-800'}>
                  {student.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div><span className="text-gray-400">Email:</span> {student.email}</div>
                <div><span className="text-gray-400">Phone:</span> {student.phone || '—'}</div>
                <div><span className="text-gray-400">Nationality:</span> {student.nationality || '—'}</div>
                <div><span className="text-gray-400">Created:</span> {new Date(student.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" onValueChange={(v) => {
        if (v === 'documents') loadTab('documents');
        if (v === 'applications') loadTab('applications');
        if (v === 'activity') loadTab('activity');
      }}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Student Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Basic Info</h4>
                  <div className="space-y-3 text-sm">
                    <Row label="First Name" value={student.firstName} />
                    <Row label="Last Name" value={student.lastName} />
                    <Row label="Date of Birth" value={student.dateOfBirth} />
                    <Row label="Nationality" value={student.nationality} />
                    <Row label="Gender" value={student.extra?.gender as string | undefined} />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Contact</h4>
                  <div className="space-y-3 text-sm">
                    <Row label="Email" value={student.email} />
                    <Row label="Phone" value={student.phone} />
                    <Row label="WhatsApp" value={student.extra?.whatsapp as string | undefined} />
                    <Row label="Address" value={student.extra?.address as string | undefined} />
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div>
                <h4 className="font-semibold mb-4">Study Target</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3 text-sm">
                    <Row label="Target Degree" value={student.targetDegree} />
                    <Row label="Target Intake" value={student.targetIntake} />
                    <Row label="Source" value={student.source} />
                  </div>
                  <div className="space-y-3 text-sm">
                    <Row label="HSK Level" value={student.extra?.hskLevel as string | undefined} />
                    <Row label="IELTS" value={student.extra?.ieltsScore as string | undefined} />
                    <Row label="TOEFL" value={student.extra?.toeflScore as string | undefined} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {tabLoading.documents ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents uploaded yet.</p>
                  <p className="text-xs mt-1">Documents are added by the student via the student portal.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-4 py-3">
                      {doc.status === 'Verified' ? (
                        <FileCheck className="h-5 w-5 text-green-600" />
                      ) : doc.status === 'Rejected' ? (
                        <FileX className="h-5 w-5 text-red-600" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.category} • {doc.file_name || 'no file'} • uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                        {doc.rejection_reason && (
                          <p className="text-xs text-red-600 mt-1">Rejected: {doc.rejection_reason}</p>
                        )}
                      </div>
                      <Badge className={docStatusColor[doc.status] || 'bg-gray-100'}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {tabLoading.applications ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No applications yet for this student.</p>
                  <p className="text-xs mt-1">Applications are created via the student portal or the partner portal.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {applications.map((app) => (
                    <div key={app.id} className="flex items-center gap-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {app.application_number || app.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {app.target_degree || '—'} • {app.target_intake || '—'} • {app.university_slug || '—'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Created {new Date(app.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={appStatusColor[app.status as ApplicationStatus] || 'bg-gray-100'}>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes — admin-only internal notes (student_notes table) */}
        <TabsContent value="notes" className="space-y-6">
          <NotesTab studentId={studentId} />
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              {tabLoading.activity ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : activity.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No activity yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border-l-4 border-[#1B2A4A] bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{event.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.type} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value || '—'}</span>
    </div>
  );
}

// NotesTab is defined below — kept after the main component for readability.

interface StudentNote {
  id: string;
  student_id: string;
  author_id?: string;
  author_name?: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

function NotesTab({ studentId }: { studentId: string }) {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newBody, setNewBody] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { notes } = await apiFetchJson<{ notes: StudentNote[] }>(
        `/api/admin/students/${studentId}/notes`,
      );
      setNotes(notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!newBody.trim()) return;
    setIsPosting(true);
    setError(null);
    try {
      await apiFetchJson(`/api/admin/students/${studentId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body: newBody, is_pinned: isPinned }),
      });
      setNewBody('');
      setIsPinned(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      await apiFetchJson(`/api/admin/students/${studentId}/notes/${noteId}`, {
        method: 'DELETE',
      });
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleTogglePin = async (note: StudentNote) => {
    try {
      await apiFetchJson(`/api/admin/students/${studentId}/notes/${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_pinned: !note.is_pinned }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Textarea
            placeholder="Add an internal note about this student..."
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            rows={3}
            disabled={isPosting}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded"
              />
              Pin to top
            </label>
            <Button
              onClick={handleAdd}
              disabled={isPosting || !newBody.trim()}
              className="bg-[#1B2A4A] hover:bg-[#152138]"
              size="sm"
            >
              {isPosting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-3 pb-3">
            <p className="text-red-800 text-sm"><strong>Error:</strong> {error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No notes yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              Internal notes are admin-only. Students never see these.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className={note.is_pinned ? 'border-[#9B1B30] border-2' : ''}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <span className="font-medium text-gray-700">{note.author_name || 'Admin'}</span>
                      <span>•</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                      {note.is_pinned && (
                        <Badge className="bg-[#9B1B30] text-white text-xs">Pinned</Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePin(note)}
                      title={note.is_pinned ? 'Unpin' : 'Pin'}
                    >
                      {note.is_pinned ? '📌' : '📍'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
