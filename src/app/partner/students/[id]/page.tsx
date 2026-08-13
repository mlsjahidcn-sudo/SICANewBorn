'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, MessageSquare, Calendar, FileText, AlertTriangle, Pin, X, Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  // Phase 50c: per-event notes state. Fetched on tab open
  // (not on mount) so the page load is fast for the common
  // case where the partner lands on the Overview tab. New
  // notes added via the composer go through the API and we
  // re-fetch the list to get the canonical server response
  // (including the joined author_email).
  interface PartnerStudentNote {
    id: string;
    partnerStudentId: string;
    authorUserId: string | null;
    authorEmail: string | null;
    body: string;
    pinned: boolean;
    createdAt: string;
    updatedAt: string;
  }
  const [notes, setNotes] = useState<PartnerStudentNote[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [noteAdding, setNoteAdding] = useState(false);
  const [noteBusyId, setNoteBusyId] = useState<string | null>(null);
  const [noteDeleteId, setNoteDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStudent = useCallback(async () => {
    if (!studentId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Phase 52: parallel fetch. Was sequentially awaiting the
      // student GET, then issuing the applications query with
      // the student's id. The two are independent once we know
      // the id — the student GET gives us the id, but the
      // applications filter actually uses the URL param
      // (studentId=...) which is already in scope, so we can
      // fire both in parallel with a single studentId value.
      // Halves first-paint latency on the common case where
      // the page loads with the Applications tab active.
      const [studentRes, appsRes] = await Promise.all([
        apiFetchJson<{ student: PartnerStudent }>(
          `/api/partner/students/${studentId}`,
        ),
        apiFetchJson<{ applications: PartnerApplication[] }>(
          `/api/partner/applications?studentId=${encodeURIComponent(studentId)}&limit=50`,
        ),
      ]);
      setStudent(studentRes.student);
      // Phase 1.12: student_id FK on partner_applications
      // replaces the old soft name match (two "Mohammed Ali"
      // students used to cross-link each other's apps).
      setApplications(appsRes.applications || []);
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

  // Phase 50c: notes fetch. Lazy — only runs when the partner
  // opens the Notes tab, so the Overview load is fast. The
  // API already orders pinned-first then created_at desc.
  const fetchNotes = useCallback(async () => {
    setNotesLoading(true);
    setNotesError(null);
    try {
      const res = await apiFetchJson<{ notes: PartnerStudentNote[] }>(
        `/api/partner/students/${studentId}/notes`,
      );
      setNotes(res.notes || []);
    } catch (err) {
      setNotesError(
        err instanceof Error ? err.message : t('partnerStudentDetail.notesLoadError'),
      );
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [studentId, t]);

  // Phase 50c: handler for the composer. Optimistic add so
  // the new note appears immediately, then re-fetch to get
  // the canonical server-side row (with author_email, id,
  // timestamps). The user sees a smooth animation; the
  // server's response is the source of truth.
  const handleAddNote = async () => {
    const body = newNoteBody.trim();
    if (!body) return;
    setNoteAdding(true);
    try {
      const res = await apiFetchJson<{ note: PartnerStudentNote }>(
        `/api/partner/students/${studentId}/notes`,
        { method: 'POST', body: JSON.stringify({ body }) },
      );
      // Re-fetch to get the canonical ordering. The optimistic
      // append would be fine for a single-user app but the
      // server's pinned-first ordering depends on the full list.
      await fetchNotes();
      setNewNoteBody('');
    } catch (err) {
      setNotesError(
        err instanceof Error ? err.message : t('partnerStudentDetail.notesAddError'),
      );
    } finally {
      setNoteAdding(false);
    }
  };

  // Phase 50c: pin / unpin. Toggles the `pinned` flag server-
  // side, then re-fetches so the new ordering is canonical.
  const handleTogglePin = async (note: PartnerStudentNote) => {
    setNoteBusyId(note.id);
    try {
      await apiFetchJson(`/api/partner/student-notes/${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      await fetchNotes();
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : t('partnerStudentDetail.notesLoadError'));
    } finally {
      setNoteBusyId(null);
    }
  };

  // Phase 50c: delete. The actual DELETE call runs after the
  // AlertDialog confirms (we use the showDelete state pair —
  // the existing student-delete modal is "showDelete" + the
  // note-delete modal is "noteDeleteId").
  const handleConfirmDeleteNote = async () => {
    if (!noteDeleteId) return;
    const id = noteDeleteId;
    setNoteBusyId(id);
    try {
      const res = await fetch(`/api/partner/student-notes/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || t('partnerStudentDetail.notesLoadError'));
      }
      // Local remove + close — no need to re-fetch.
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setNotesError(err instanceof Error ? err.message : t('partnerStudentDetail.notesLoadError'));
    } finally {
      setNoteBusyId(null);
      setNoteDeleteId(null);
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
      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('partnerStudentDetail.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('partnerStudentDetail.deleteBodyFor', { name: student.studentName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="rounded-none">
              {t('partnerStudentDetail.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
            >
              {isDeleting ? t('partnerStudentDetail.deleting') : t('partnerStudentDetail.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          <Button asChild variant="outline" className="rounded-none" size="sm">
            <Link href={`/partner/applications/new?studentId=${student.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              {t('partnerStudentDetail.newApplication')}
            </Link>
          </Button>
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

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v);
        // Phase 50c: lazy-load notes on tab open. Idempotent —
        // repeated opens are cheap because fetchNotes overwrites
        // state every time.
        if (v === 'notes' && !notesLoading) {
          void fetchNotes();
        }
      }} className="space-y-4">
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
                <MessageSquare className="w-4 h-4" /> {t('partnerStudentDetail.notesTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Phase 50c: composer + activity feed. Replaces
                  the old single read-only <p> showing the legacy
                  notes column. Newest first; pinned notes rise
                  to the top via the API's order by pinned DESC. */}
              <p className="text-sm text-[#4B5563] mb-4">
                {t('partnerStudentDetail.notesHint')}
              </p>

              <div className="space-y-2 mb-4">
                <Label htmlFor="newNote" className="text-[#1B2A4A] mb-2 block">
                  {t('partnerStudentDetail.notesComposerLabel')}
                </Label>
                <Textarea
                  id="newNote"
                  value={newNoteBody}
                  onChange={(e) => setNewNoteBody(e.target.value)}
                  maxLength={4000}
                  rows={3}
                  className="rounded-none"
                  placeholder={t('partnerStudentDetail.notesComposerPlaceholder')}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {t('partnerStudentDetail.notesComposerCount', { count: newNoteBody.length })}
                  </span>
                  <Button
                    size="sm"
                    disabled={noteAdding || !newNoteBody.trim()}
                    onClick={handleAddNote}
                    className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {noteAdding
                      ? t('partnerStudentDetail.notesComposerAdding')
                      : t('partnerStudentDetail.notesComposerAdd')}
                  </Button>
                </div>
              </div>

              {notesError && (
                <p className="text-sm text-red-700 mb-3">{notesError}</p>
              )}

              {notesLoading ? (
                <p className="text-sm text-[#4B5563] py-4 text-center">…</p>
              ) : notes.length === 0 ? (
                <p className="text-sm text-[#4B5563] italic py-4 text-center">
                  {t('partnerStudentDetail.notesEmpty')}
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      className={`py-3 flex items-start gap-3 ${n.pinned ? 'bg-amber-50/40 -mx-3 px-3' : ''}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {n.pinned && (
                            <Badge variant="outline" className="rounded-none text-xs">
                              <Pin className="w-3 h-3 mr-1" /> {t('partnerStudentDetail.notesPinned')}
                            </Badge>
                          )}
                          <span className="text-xs text-[#4B5563]">
                            {n.authorEmail || t('partnerCommon.placeholderDash')}
                          </span>
                          <span className="text-xs text-gray-400">
                            · {new Date(n.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-[#1F2937] whitespace-pre-wrap break-words">
                          {n.body}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-none h-7 px-2"
                          onClick={() => handleTogglePin(n)}
                          disabled={noteBusyId === n.id}
                          title={n.pinned ? t('partnerStudentDetail.notesUnpin') : t('partnerStudentDetail.notesPin')}
                        >
                          <Pin className={`h-3.5 w-3.5 ${n.pinned ? 'text-amber-600' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-none h-7 px-2 text-red-600 hover:text-red-700"
                          onClick={() => setNoteDeleteId(n.id)}
                          disabled={noteBusyId === n.id}
                          title={t('partnerStudentDetail.notesDelete')}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-[#4B5563] mt-4 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t('partnerStudentDetail.lastUpdated', { date: student.updatedAt
                  ? new Date(student.updatedAt).toLocaleString()
                  : t('partnerCommon.placeholderDash') })}
              </p>
            </CardContent>
          </Card>

          {/* Phase 50c: per-note delete confirmation. Reuses the
              same shadcn AlertDialog the bulk-delete and status-
              change dialogs use. Two-step confirm (button click
              + dialog confirm) so a partner can't lose a note
              with a single misclick. */}
          <AlertDialog
            open={!!noteDeleteId}
            onOpenChange={(open) => { if (!open) setNoteDeleteId(null); }}
          >
            <AlertDialogContent className="rounded-none">
              <AlertDialogHeader>
                <AlertDialogTitle>{t('partnerStudentDetail.notesDeleteTitle')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('partnerStudentDetail.notesDeleteBody')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="rounded-none"
                  disabled={!!noteBusyId}
                >
                  {t('partnerAppDetail.cancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
                  disabled={!!noteBusyId}
                  onClick={handleConfirmDeleteNote}
                >
                  {t('partnerStudentDetail.notesDelete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
