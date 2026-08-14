'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  RefreshCw,
  Link2,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  FileText,
  Eye,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArchiveRestore,
  Unlink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { PartnerStudent } from '@/lib/partner-student-mapper';
import type { PartnerStudentNote } from '@/lib/partner-student-note-mapper';
import type { PartnerApplication } from '@/lib/partner-application-mapper';

type PartnerDocument = {
  id: string;
  name: string;
  category: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  file_name?: string;
  uploaded_at: string;
};

export default function AdminPartnerStudentDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<PartnerStudent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [tabLoading, setTabLoading] = useState<{ [k: string]: boolean }>({});
  // Phase 62 (UX gap 2): partner_student_notes activity feed surfaced
  // as read-only on the admin detail page. Loaded lazily on Notes tab open.
  const [partnerNotes, setPartnerNotes] = useState<PartnerStudentNote[]>([]);
  const [partnerNotesLoaded, setPartnerNotesLoaded] = useState(false);

  const [linkDialogOpen, setLinkDialogOpen] = useState(searchParams.get('link') === 'true');
  // Phase 62 (Bug 3): unlink confirmation dialog state.
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkError, setUnlinkError] = useState<string | null>(null);
  const [existingProfileId, setExistingProfileId] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [dialogState, setDialogState] = useState<
    | { open: false }
    | { open: true; action: 'archive' | 'restore' }
  >({ open: false });
  const [actionBusy, setActionBusy] = useState(false);

  const loadStudent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const { student } = await apiFetchJson<{ student: PartnerStudent }>(
        `/api/admin/partner-students/${studentId}`,
      );
      setStudent(student);
      setNotes(student.notes || '');
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 404) setNotFound(true);
      else setError(e.message || t('adminPartnerStudentDetail.errorFailedLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [studentId, t]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const loadTab = useCallback(
    async (tab: 'applications' | 'documents') => {
      setTabLoading((prev) => ({ ...prev, [tab]: true }));
      try {
        if (tab === 'applications') {
          const { applications } = await apiFetchJson<{ applications: PartnerApplication[] }>(
            `/api/admin/partner-students/${studentId}/applications`,
          );
          setApplications(applications || []);
        } else if (tab === 'documents') {
          const { documents } = await apiFetchJson<{ documents: PartnerDocument[] }>(
            `/api/admin/partner-students/${studentId}/documents`,
          );
          setDocuments(documents || []);
        }
      } catch (err) {
        console.error(`[admin/partner-student detail] failed to load ${tab}:`, err);
      } finally {
        setTabLoading((prev) => ({ ...prev, [tab]: false }));
      }
    },
    [studentId],
  );

  const saveNotes = async () => {
    if (!student) return;
    setIsSavingNotes(true);
    try {
      const { student: updated } = await apiFetchJson<{ student: PartnerStudent }>(
        `/api/admin/partner-students/${studentId}`,
        { method: 'PATCH', body: JSON.stringify({ notes }) },
      );
      setStudent(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminPartnerStudentDetail.errorFailedSave'));
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleLinkProfile = async (mode: 'create' | 'existing') => {
    setIsLinking(true);
    setLinkError(null);
    try {
      const payload =
        mode === 'existing' ? { existingStudentProfileId: existingProfileId.trim() } : {};
      if (mode === 'existing' && !payload.existingStudentProfileId) {
        setLinkError('Please enter a student profile ID');
        setIsLinking(false);
        return;
      }
      const { student: updated } = await apiFetchJson<{ student: PartnerStudent }>(
        `/api/admin/partner-students/${studentId}/link-profile`,
        { method: 'POST', body: JSON.stringify(payload) },
      );
      setStudent(updated);
      setLinkDialogOpen(false);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Failed to link profile');
    } finally {
      setIsLinking(false);
    }
  };

  const handleStatusChange = async (nextStatus: PartnerStudent['status']) => {
    if (!student || student.status === nextStatus) return;
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      const { student: updated } = await apiFetchJson<{ student: PartnerStudent }>(
        `/api/admin/partner-students/${studentId}`,
        { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) },
      );
      setStudent(updated);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : t('adminPartnerStudentDetail.errorFailedUpdate'));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Phase 62 (Bug 3): unlink handler. Calls the same link-profile
  // endpoint with { unlink: true }; the route sets linked_student_profile_id
  // to null and the propagation trigger fans the null out to child rows
  // that were linked to this same student.
  const handleUnlink = async () => {
    if (!student?.linkedStudentProfileId) return;
    setIsUnlinking(true);
    setUnlinkError(null);
    try {
      const { student: updated } = await apiFetchJson<{ student: PartnerStudent }>(
        `/api/admin/partner-students/${studentId}/link-profile`,
        { method: 'POST', body: JSON.stringify({ unlink: true }) },
      );
      setStudent(updated);
      setUnlinkDialogOpen(false);
    } catch (err) {
      setUnlinkError(err instanceof Error ? err.message : 'Failed to unlink');
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!dialogState.open || !student) return;
    const { action } = dialogState;
    setActionBusy(true);
    setError(null);
    try {
      const { student: updated } = await apiFetchJson<{ student: PartnerStudent }>(
        `/api/admin/partner-students/${studentId}`,
        { method: 'PATCH', body: JSON.stringify({ archived: action === 'archive' }) },
      );
      setStudent(updated);
      setDialogState({ open: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('adminPartnerStudentDetail.errorFailedUpdate'));
    } finally {
      setActionBusy(false);
    }
  };

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
        <Button variant="ghost" onClick={() => router.push('/admin/partner-students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('adminPartnerStudentDetail.backToList')}
        </Button>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">{t('adminPartnerStudentDetail.notFoundTitle')}</h3>
            <p className="text-gray-500 mb-4">{t('adminPartnerStudentDetail.notFoundBody')}</p>
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
            <p className="text-red-800 text-sm">
              <strong>{t('adminPartnerStudentDetail.errorPrefix')}</strong> {error}
            </p>
            <Button size="sm" variant="outline" onClick={loadStudent} className="mt-2">
              <RefreshCw className="w-4 h-4 mr-1" /> {t('adminPartnerStudentDetail.buttonRefresh')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    New: 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Applied: 'bg-yellow-100 text-yellow-800',
    Accepted: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  const docStatusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Verified: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <AlertDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) setDialogState({ open: false });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogState.open && dialogState.action === 'archive'
                ? t('adminPartnerStudentDetail.archiveDialogTitle')
                : t('adminPartnerStudentDetail.restoreDialogTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.open && dialogState.action === 'archive'
                ? t('adminPartnerStudentDetail.archiveDialogBody')
                : t('adminPartnerStudentDetail.restoreDialogBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionBusy}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={actionBusy}
              className={
                dialogState.open && dialogState.action === 'archive'
                  ? 'bg-[#9B1B30] hover:bg-[#7a1626]'
                  : 'bg-[#1B2A4A] hover:bg-[#26345A]'
              }
            >
              {actionBusy
                ? t('common.saving')
                : dialogState.open && dialogState.action === 'archive'
                ? t('adminPartnerStudentDetail.archiveDialogConfirm')
                : t('adminPartnerStudentDetail.restoreDialogConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/partner-students')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('adminPartnerStudentDetail.backToList')}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadStudent}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('adminPartnerStudentDetail.buttonRefresh')}
          </Button>
          {student.archivedAt ? (
            <Button
              variant="outline"
              onClick={() => setDialogState({ open: true, action: 'restore' })}
            >
              <ArchiveRestore className="h-4 w-4 mr-2" />
              {t('adminPartnerStudentDetail.actionRestore')}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDialogState({ open: true, action: 'archive' })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('adminPartnerStudentDetail.actionArchive')}
            </Button>
          )}
          {!student.linkedStudentProfileId && (
            <Button className="bg-[#9B1B30] hover:bg-[#7A1526]" onClick={() => setLinkDialogOpen(true)}>
              <Link2 className="h-4 w-4 mr-2" />
              {t('adminPartnerStudentDetail.linkProfile')}
            </Button>
          )}
          {student.linkedStudentProfileId && (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 border-red-200"
              onClick={() => setUnlinkDialogOpen(true)}
            >
              <Unlink className="h-4 w-4 mr-2" />
              {t('adminPartnerStudentDetail.unlinkProfile')}
            </Button>
          )}
        </div>
      </div>

      {statusError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{statusError}</CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
              {(student.studentName?.[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{student.studentName || '—'}</h1>
                <Select
                  value={student.status}
                  onValueChange={(v) => handleStatusChange(v as PartnerStudent['status'])}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className={`w-40 ${statusColors[student.status] || 'bg-gray-100 text-gray-800'} border-0 font-medium`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">{t('partnerStudents.statusNew')}</SelectItem>
                    <SelectItem value="In Progress">{t('partnerStudents.statusInProgress')}</SelectItem>
                    <SelectItem value="Applied">{t('partnerStudents.statusApplied')}</SelectItem>
                    <SelectItem value="Accepted">{t('partnerStudents.statusAccepted')}</SelectItem>
                    <SelectItem value="Rejected">{t('partnerStudents.statusRejected')}</SelectItem>
                  </SelectContent>
                </Select>
                {student.linkedStudentProfileId ? (
                  <Link href={`/admin/students/${student.linkedStudentProfileId}`}>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {t('adminPartnerStudentDetail.linkedProfile')}
                    </Badge>
                  </Link>
                ) : (
                  <Badge variant="outline">{t('adminPartnerStudentDetail.notLinked')}</Badge>
                )}
                {student.archivedAt && (
                  <Badge variant="secondary">{t('partnerStudents.archived')}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="text-gray-400">{t('adminPartnerStudentDetail.fieldEmail')}</span>{' '}
                  {student.studentEmail || '—'}
                </div>
                <div>
                  <span className="text-gray-400">{t('adminPartnerStudentDetail.fieldPhone')}</span>{' '}
                  {student.studentPhone || '—'}
                </div>
                <div>
                  <span className="text-gray-400">{t('adminPartnerStudentDetail.fieldNationality')}</span>{' '}
                  {student.nationality || '—'}
                </div>
                <div>
                  <span className="text-gray-400">{t('adminPartnerStudentDetail.fieldCreated')}</span>{' '}
                  {new Date(student.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => {
        setActiveTab(v);
        if (v === 'applications') loadTab('applications');
        if (v === 'documents') loadTab('documents');
        // Phase 62 (UX gap 2): lazy-load the partner notes feed on first
        // open. Subsequent switches reuse the cached array.
        if (v === 'notes' && !partnerNotesLoaded) {
          setPartnerNotesLoaded(true);
          apiFetchJson<{ notes: PartnerStudentNote[] }>(
            `/api/admin/partner-students/${studentId}/notes`,
          )
            .then((res) => setPartnerNotes(res.notes || []))
            .catch((err) => {
              console.error('[admin/partner-student detail] failed to load partner notes:', err);
              setPartnerNotesLoaded(false); // retry on next switch
            });
        }
      }}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('adminPartnerStudentDetail.tabOverview')}</TabsTrigger>
          <TabsTrigger value="applications">{t('adminPartnerStudentDetail.tabApplications')}</TabsTrigger>
          <TabsTrigger value="documents">{t('adminPartnerStudentDetail.tabDocuments')}</TabsTrigger>
          <TabsTrigger value="notes">{t('adminPartnerStudentDetail.tabNotes')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-4 h-4" /> {t('adminPartnerStudentDetail.sectionPartner')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label={t('adminPartnerStudentDetail.fieldPartner')} value={student.partnerName} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('adminPartnerStudentDetail.sectionBasicInfo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <Row label={t('adminPartnerStudentDetail.fieldName')} value={student.studentName} />
                  <Row label={t('adminPartnerStudentDetail.fieldEmail')} value={student.studentEmail} />
                  <Row label={t('adminPartnerStudentDetail.fieldPhone')} value={student.studentPhone} />
                  <Row label={t('adminPartnerStudentDetail.fieldNationality')} value={student.nationality} />
                </div>
                <div className="space-y-3">
                  <Row label={t('adminPartnerStudentDetail.fieldTargetUniversity')} value={student.targetUniversity} />
                  <Row label={t('adminPartnerStudentDetail.fieldTargetProgram')} value={student.targetProgram} />
                  <Row label={t('adminPartnerStudentDetail.fieldStatus')} value={student.status} />
                  <Row label={t('adminPartnerStudentDetail.fieldUpdated')} value={new Date(student.updatedAt).toLocaleString()} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {tabLoading.applications ? (
            <div className="h-32 bg-gray-100 animate-pulse rounded" />
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                {t('adminPartnerStudentDetail.noApplications')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {app.university} · {app.program}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.degree} · {app.intake}
                        {app.applicationNumber && (
                          <span className="ml-2 font-mono text-xs">{app.applicationNumber}</span>
                        )}
                      </div>
                      <Badge className="mt-2 bg-gray-100 text-gray-800">{app.status}</Badge>
                    </div>
                    <Link href={`/admin/partner-applications/${app.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        {t('adminPartnerStudentDetail.viewApplication')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {tabLoading.documents ? (
            <div className="h-32 bg-gray-100 animate-pulse rounded" />
          ) : documents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                {t('adminPartnerStudentDetail.noDocuments')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {doc.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {doc.category} · {doc.file_name || '—'}
                      </div>
                      <Badge className={`mt-2 ${docStatusColors[doc.status] || 'bg-gray-100 text-gray-800'}`}>
                        {doc.status}
                      </Badge>
                    </div>
                    <Link href={`/admin/documents/${doc.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        {t('adminPartnerStudentDetail.viewDocument')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('adminPartnerStudentDetail.fieldNotes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('adminPartnerStudentDetail.notesPlaceholder')}
                rows={8}
              />
              <div className="flex justify-end">
                <Button onClick={saveNotes} disabled={isSavingNotes} className="bg-[#9B1B30] hover:bg-[#7A1526]">
                  {isSavingNotes ? t('common.saving') : t('adminPartnerStudentDetail.notesSave')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Phase 62 (UX gap 2): read-only partner_student_notes feed.
          // These are the activity-style notes partner staff write via
          // /partner/students/[id]. The admin can read but not write —
          // write paths stay on the partner portal (gated on team
          // membership). */}
          <Card>
            <CardHeader>
              <CardTitle>{t('adminPartnerStudentDetail.partnerNotesTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!partnerNotesLoaded ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : partnerNotes.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  {t('adminPartnerStudentDetail.partnerNotesEmpty')}
                </p>
              ) : (
                <div className="divide-y">
                  {partnerNotes.map((n) => (
                    <div key={n.id} className="py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#1B2A4A]">
                          {n.authorEmail || (n.authorUserId ? t('adminPartnerStudentDetail.partnerNotesUnknownAuthor') : t('adminPartnerStudentDetail.partnerNotesOrphanAuthor'))}
                        </span>
                        {n.pinned && (
                          <span className="text-[10px] uppercase tracking-wide bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">
                            {t('adminPartnerStudentDetail.partnerNotesPinned')}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('adminPartnerStudentDetail.linkProfile')}</DialogTitle>
            <DialogDescription>{t('adminPartnerStudentDetail.linkDialogBody')}</DialogDescription>
          </DialogHeader>
          {linkError && (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded">{linkError}</div>
          )}
          <div className="space-y-4 py-2">
            <Button
              className="w-full bg-[#9B1B30] hover:bg-[#7A1526]"
              onClick={() => handleLinkProfile('create')}
              disabled={isLinking || !student.studentEmail}
            >
              {isLinking ? t('common.saving') : t('adminPartnerStudentDetail.createProfile')}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">{t('common.or')}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="existingProfileId">{t('adminPartnerStudentDetail.existingProfileIdLabel')}</Label>
              <Input
                id="existingProfileId"
                value={existingProfileId}
                onChange={(e) => setExistingProfileId(e.target.value)}
                placeholder={t('adminPartnerStudentDetail.existingProfileIdPlaceholder')}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleLinkProfile('existing')}
                disabled={isLinking || !existingProfileId.trim()}
              >
                {isLinking ? t('common.saving') : t('adminPartnerStudentDetail.linkExisting')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 62 (Bug 3): unlink confirmation dialog. Warns that
          child applications/docs that were linked to this same
          student will be detached (rows linked to a different
          student are preserved — see the migration comment). */}
      <AlertDialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('adminPartnerStudentDetail.unlinkTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminPartnerStudentDetail.unlinkBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {unlinkError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
              {unlinkError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnlinking}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleUnlink();
              }}
              disabled={isUnlinking}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUnlinking
                ? t('adminPartnerStudentDetail.unlinking')
                : t('adminPartnerStudentDetail.unlinkConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-[#1F2937]">{value || '—'}</span>
    </div>
  );
}
