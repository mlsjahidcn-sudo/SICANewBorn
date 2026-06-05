'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Calendar, Building, BookOpen, FileText, FileCheck, CheckCircle2,
  Clock, XCircle, AlertCircle, RefreshCw, Loader2, Filter, Upload, Eye, Download,
  User, Ban, Edit, Send, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiFetchJson } from '@/lib/api-client';
import type { StudentApplication } from '@/lib/application-mapper';

// ---------- Types ----------

type DocumentStatus = 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';

interface StudentDocument {
  id: string;
  student_id: string;
  application_id?: string;
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

interface TimelineEvent {
  id: string;
  application_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

interface DetailResponse {
  application: StudentApplication;
  documents: StudentDocument[];
  timeline: TimelineEvent[];
}

// ---------- Display config ----------

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Submitted: 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-yellow-100 text-yellow-800',
  'Documents Requested': 'bg-purple-100 text-purple-800',
  'Decision Made': 'bg-orange-100 text-orange-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Withdrawn: 'bg-gray-100 text-gray-800',
};

const statusIcons: Record<string, typeof Clock> = {
  Draft: FileText,
  Submitted: Clock,
  'Under Review': Clock,
  'Documents Requested': FileCheck,
  'Decision Made': CheckCircle2,
  Accepted: CheckCircle2,
  Rejected: XCircle,
  Withdrawn: XCircle,
};

const documentStatusColor: Record<DocumentStatus, string> = {
  Verified: 'text-green-600 bg-green-100',
  Rejected: 'text-red-600 bg-red-100',
  Uploaded: 'text-blue-600 bg-blue-100',
  Pending: 'text-gray-600 bg-gray-100',
};

const documentStatusOptions: Array<DocumentStatus | 'all'> = [
  'all',
  'Pending',
  'Uploaded',
  'Verified',
  'Rejected',
];

// ---------- Page ----------

export default function StudentApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<StudentApplication | null>(null);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDocStatus, setSelectedDocStatus] = useState<DocumentStatus | 'all'>('all');
  // Phase 1 student actions
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [resubmitOpen, setResubmitOpen] = useState(false);
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  /**
   * Phase 1: Withdraw — student-driven transition to terminal
   * Withdrawn. Allowed for Draft, Submitted, and any in-flight state
   * EXCEPT Accepted / Decision Made / Rejected / Withdrawn (terminal).
   * Backend enforces the same rules in STUDENT_STATUS_TRANSITIONS.
   */
  const canWithdraw = !!application && !['Withdrawn', 'Accepted', 'Decision Made', 'Rejected'].includes(application.status);

  /**
   * Phase 1: Resubmit — student-driven transition:
   *   Documents Requested → Under Review  (after re-uploading)
   *   Rejected             → Submitted     (second-chance flow)
   */
  const canResubmit = !!application && ['Documents Requested', 'Rejected'].includes(application.status);

  /** Phase 1: Editable draft — student can resume from /new (which
   * accepts existing applicationId) or via a dedicated edit page. */
  const isDraft = application?.status === 'Draft';

  const runStatusChange = async (
    nextStatus: 'Withdrawn' | 'Under Review' | 'Submitted',
    successMessage: string,
  ) => {
    if (!application) return;
    setActionPending(true);
    setActionError(null);
    try {
      const data = await apiFetchJson<{ application: StudentApplication }>(
        `/api/student/applications/${applicationId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      setApplication(data.application);
      // Re-fetch timeline to surface the new event
      try {
        const detail = await apiFetchJson<DetailResponse>(
          `/api/student/applications/${applicationId}`,
        );
        setTimeline(detail.timeline);
      } catch {
        // non-fatal; user will see the new event on next refresh
      }
      setActionError(null);
      // Surface a brief inline notice — using alert is fine here since
      // it's a destructive / state-changing action the user just
      // confirmed.
      // eslint-disable-next-line no-alert
      alert(successMessage);
    } catch (err) {
      const e = err as { message?: string };
      setActionError(e.message || 'Failed to update application');
    } finally {
      setActionPending(false);
    }
  };

  const handleWithdraw = async () => {
    await runStatusChange('Withdrawn', 'Your application has been withdrawn.');
    setWithdrawOpen(false);
  };

  const handleResubmit = async () => {
    // The route picks the right target status for the current
    // "Documents Requested" or "Rejected" state. We send the explicit
    // destination to keep the API contract simple.
    if (!application) return;
    const target = application.status === 'Rejected' ? 'Submitted' : 'Under Review';
    await runStatusChange(
      target,
      target === 'Submitted'
        ? 'Your application has been resubmitted for review.'
        : 'Marked as Under Review — admin will re-evaluate your updated materials.',
    );
    setResubmitOpen(false);
  };

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await apiFetchJson<DetailResponse>(`/api/student/applications/${applicationId}`);
      setApplication(data.application);
      setDocuments(data.documents);
      setTimeline(data.timeline);
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 404) setNotFound(true);
      else setError(e.message || 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-none" />
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-none" />
        </div>
        <div className="h-40 bg-gray-200 animate-pulse rounded-none" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/student/applications">
            <Button variant="ghost" className="p-0 h-auto">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1B2A4A]">Application Not Found</h2>
            <p className="text-gray-600 mt-2">This application doesn't exist or you don't have access to it.</p>
            <Link href="/student/applications" className="mt-4 inline-block">
              <Button className="bg-[#9B1B30] hover:bg-[#7A1525] text-white rounded-none">
                Back to Applications
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !application) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-800 text-sm"><strong>Error:</strong> {error || 'Unknown error'}</p>
          <Button size="sm" variant="outline" onClick={load} className="mt-2">
            <RefreshCw className="w-4 h-4 mr-1" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const StatusIcon = statusIcons[application.status] || Clock;
  const filteredDocuments = selectedDocStatus === 'all'
    ? documents
    : documents.filter((d) => d.status === selectedDocStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center space-x-4">
          <Link href="/student/applications">
            <Button variant="ghost" className="p-0 h-auto">
              <ArrowLeft className="h-5 w-5 text-[#1B2A4A]" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">
              {application.applicationNumber || 'Application'}
            </h1>
            <p className="text-gray-600 mt-1">{application.university} · {application.program}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isDraft && (
            <Link href={`/student/applications/new?resume=${applicationId}`}>
              <Button className="bg-[#1B2A4A] hover:bg-[#26345A] text-white rounded-none">
                <Edit className="h-4 w-4 mr-2" />
                Continue Editing
              </Button>
            </Link>
          )}
          {canResubmit && (
            <Button
              onClick={() => setResubmitOpen(true)}
              disabled={actionPending}
              className="bg-[#1B2A4A] hover:bg-[#26345A] text-white rounded-none"
            >
              <Send className="h-4 w-4 mr-2" />
              {application.status === 'Rejected' ? 'Resubmit Application' : 'Mark as Resubmitted'}
            </Button>
          )}
          {canWithdraw && (
            <Button
              variant="outline"
              onClick={() => setWithdrawOpen(true)}
              disabled={actionPending}
              className="rounded-none border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
            >
              <Ban className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          )}
          <Button variant="outline" onClick={load} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Admin notes banner (Phase 1 — surface what admin left for the student) */}
      {application.adminNotes && (
        <div className="flex items-start gap-3 p-4 border border-[#D4A853] bg-[#FAF6E8] rounded-none">
          <MessageSquare className="h-5 w-5 text-[#9B1B30] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1B2A4A]">Note from SICA</p>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{application.adminNotes}</p>
          </div>
        </div>
      )}

      {/* Status-driven action hint banners */}
      {isDraft && (
        <div className="flex items-start gap-3 p-3 border border-gray-300 bg-gray-50 rounded-none">
          <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            <strong>This is a draft.</strong> SICA has not received this
            application yet. Continue editing and submit it when you're
            ready.
          </p>
        </div>
      )}
      {application.status === 'Documents Requested' && (
        <div className="flex items-start gap-3 p-3 border border-purple-300 bg-purple-50 rounded-none">
          <FileCheck className="h-4 w-4 text-purple-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-purple-900">
            <strong>Action needed:</strong> SICA has requested additional
            documents. Review the note above, upload the requested
            materials, then click <strong>Mark as Resubmitted</strong>.
          </p>
        </div>
      )}
      {application.status === 'Rejected' && (
        <div className="flex items-start gap-3 p-3 border border-red-300 bg-red-50 rounded-none">
          <XCircle className="h-4 w-4 text-red-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-900">
            <strong>Application was rejected.</strong> You can review the
            feedback above and <strong>Resubmit</strong> to apply again
            with a new application record.
          </p>
        </div>
      )}

      {actionError && (
        <div className="flex items-start gap-3 p-3 border border-red-200 bg-red-50 text-red-800 text-sm rounded-none">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p><strong>Error:</strong> {actionError}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-none border-0 shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <StatusIcon className="h-5 w-5 text-[#1B2A4A]" />
              <span className="text-sm text-gray-600">Status</span>
            </div>
            <Badge className={`mt-2 rounded-none ${statusColors[application.status] || 'bg-gray-100'}`}>
              {application.status}
            </Badge>
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-[#1B2A4A]" />
              <span className="text-sm text-gray-600">University</span>
            </div>
            <p className="mt-2 font-semibold text-[#1B2A4A]">{application.university}</p>
            {application.universityNameCn && (
              <p className="text-xs text-gray-500 mt-1">{application.universityNameCn}</p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-[#1B2A4A]" />
              <span className="text-sm text-gray-600">Program</span>
            </div>
            <p className="mt-2 font-semibold text-[#1B2A4A]">{application.program}</p>
            <p className="text-xs text-gray-500 mt-1">{application.degree} · {application.intake}</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border-0 shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-[#1B2A4A]" />
              <span className="text-sm text-gray-600">Submitted</span>
            </div>
            <p className="mt-2 font-semibold text-[#1B2A4A]">
              {application.submittedAt
                ? new Date(application.submittedAt).toLocaleDateString()
                : 'Not yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F3F4F6] rounded-none p-0">
          <TabsTrigger
            value="overview"
            className="rounded-none data-[state=active]:bg-white data-[state=active]:text-[#1B2A4A] data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-none data-[state=active]:bg-white data-[state=active]:text-[#1B2A4A] data-[state=active]:shadow-sm"
          >
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger
            value="timeline"
            className="rounded-none data-[state=active]:bg-white data-[state=active]:text-[#1B2A4A] data-[state=active]:shadow-sm"
          >
            Timeline
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card className="rounded-none border-0 shadow">
            <CardHeader className="border-b border-gray-200">
              <CardTitle className="text-lg font-semibold text-[#1B2A4A]">Application Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Degree Level</Label>
                  <p className="font-medium text-[#1B2A4A]">{application.degree}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Intake</Label>
                  <p className="font-medium text-[#1B2A4A]">{application.intake}</p>
                </div>
              </div>
              {application.personalStatement && (
                <div>
                  <Label className="text-gray-600">Personal Statement</Label>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{application.personalStatement}</p>
                </div>
              )}
              {application.additionalNotes && (
                <div>
                  <Label className="text-gray-600">Additional Notes</Label>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap">{application.additionalNotes}</p>
                </div>
              )}
              {!application.personalStatement && !application.additionalNotes && (
                <p className="text-sm text-gray-500">No notes added yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="mt-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#1B2A4A]" />
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <Select
                  value={selectedDocStatus}
                  onValueChange={(value) => {
                    if (documentStatusOptions.includes(value as DocumentStatus | 'all')) {
                      setSelectedDocStatus(value as DocumentStatus | 'all');
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px] rounded-none">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Uploaded">Uploaded</SelectItem>
                    <SelectItem value="Verified">Verified</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="bg-[#9B1B30] hover:bg-[#7A1525] text-white rounded-none"
                disabled
                title="Document upload flow is not yet wired (admin needs a UI for it)"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {filteredDocuments.length === 0 ? (
              <Card className="rounded-none border-0 shadow">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">No Documents Found</h3>
                  <p className="text-gray-600">
                    {selectedDocStatus === 'all'
                      ? 'No documents have been uploaded yet.'
                      : `No documents with status "${selectedDocStatus}".`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredDocuments.map((doc) => {
                const color = documentStatusColor[doc.status] || 'text-gray-600 bg-gray-100';
                const Icon = doc.status === 'Verified' ? CheckCircle2
                  : doc.status === 'Rejected' ? XCircle
                  : doc.status === 'Uploaded' ? FileCheck
                  : Clock;
                return (
                  <Card key={doc.id} className="rounded-none border-0 shadow hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-none ${color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h3 className="font-semibold text-[#1B2A4A]">{doc.name}</h3>
                              <Badge className={`rounded-none ${color}`}>{doc.status}</Badge>
                              <Badge variant="outline" className="rounded-none text-xs">{doc.category}</Badge>
                            </div>
                            {doc.file_name && (
                              <p className="text-sm text-gray-600">{doc.file_name}</p>
                            )}
                            <p className="text-sm text-gray-500">
                              Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                            {doc.verified_at && (
                              <p className="text-sm text-green-600">
                                Verified: {new Date(doc.verified_at).toLocaleDateString()}
                              </p>
                            )}
                            {doc.status === 'Rejected' && doc.rejection_reason && (
                              <p className="text-sm text-red-600 mt-2">Reason: {doc.rejection_reason}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {doc.file_url && (
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" className="p-0 h-auto text-[#1B2A4A]">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                          {doc.file_url && (
                            <a href={doc.file_url} download>
                              <Button variant="ghost" className="p-0 h-auto text-[#1B2A4A]">
                                <Download className="h-4 w-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="mt-6">
          <Card className="rounded-none border-0 shadow">
            <CardContent className="p-6">
              {timeline.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No timeline events yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timeline.map((event) => {
                    const dotColor =
                      event.status === 'Accepted' ? 'bg-green-500' :
                      event.status === 'Rejected' ? 'bg-red-500' :
                      event.status === 'Submitted' ? 'bg-blue-500' :
                      'bg-[#1B2A4A]';
                    return (
                      <div key={event.id} className="flex items-start space-x-4">
                        <div className={`mt-1 w-3 h-3 rounded-full ${dotColor}`} />
                        <div className="flex-1 pb-4 border-l-2 border-gray-200 pl-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <p className="font-semibold text-[#1B2A4A]">{event.status}</p>
                            <span className="text-sm text-gray-500">
                              {new Date(event.created_at).toLocaleString()}
                            </span>
                          </div>
                          {event.notes && <p className="text-gray-600 mt-1">{event.notes}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Withdraw confirmation dialog */}
      <AlertDialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1B2A4A]">
              Withdraw this application?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Once withdrawn, this application is final and cannot be
              reactivated. You'll need to create a brand new application
              to apply to {application.university} again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionPending} className="rounded-none">
              Keep Application
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleWithdraw();
              }}
              disabled={actionPending}
              className="bg-red-600 hover:bg-red-700 text-white rounded-none"
            >
              {actionPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                'Yes, Withdraw'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resubmit confirmation dialog */}
      <AlertDialog open={resubmitOpen} onOpenChange={setResubmitOpen}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1B2A4A]">
              {application.status === 'Rejected'
                ? 'Resubmit this application?'
                : 'Mark as Resubmitted?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {application.status === 'Rejected'
                ? 'Resubmitting will create a fresh review cycle for SICA. The original rejection reason is preserved on your timeline.'
                : 'SICA will be notified that your requested documents have been re-uploaded and the application is back in the review queue.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionPending} className="rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleResubmit();
              }}
              disabled={actionPending}
              className="bg-[#9B1B30] hover:bg-[#7A1525] text-white rounded-none"
            >
              {actionPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : application.status === 'Rejected' ? (
                'Resubmit Application'
              ) : (
                'Mark as Resubmitted'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
