'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Mail, Phone, FileText, Calendar,
  AlertCircle, Edit, RefreshCw, GraduationCap, BookOpen, FileCheck, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiFetch, apiFetchJson } from '@/lib/api-client';

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

const statusDisplay: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  Submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  'Under Review': { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  'Documents Requested': { label: 'Documents Requested', color: 'bg-purple-100 text-purple-800' },
  'Decision Made': { label: 'Decision Made', color: 'bg-orange-100 text-orange-800' },
  Accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
  Rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
  Withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
};

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [app, setApp] = useState<AdminApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'Approved' | 'Rejected' | 'Withdrawn' | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const { application } = await apiFetchJson<{ application: AdminApplication }>(
        `/api/admin/applications/${id}`,
      );
      setApp(application);
    } catch (err) {
      const e = err as { status?: number; message?: string };
      if (e.status === 404) setNotFound(true);
      else setError(e.message || 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = useCallback(
    async (newStatus: 'Approved' | 'Rejected' | 'Withdrawn') => {
      if (!app) return;
      setIsUpdating(true);
      try {
        await apiFetch(`/api/admin/applications/${app.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: newStatus }),
        });
        setApp((prev) => (prev ? { ...prev, status: newStatus } : prev));
        setConfirmAction(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status');
      } finally {
        setIsUpdating(false);
      }
    },
    [app],
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[#4B5563]">
        <RefreshCw className="w-5 h-5 inline-block animate-spin mr-2" />
        Loading application...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Application Not Found</h3>
            <p className="text-gray-500 mb-4">This application may have been deleted.</p>
            <Button onClick={() => router.push('/admin/applications')}>Back to Applications</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!app) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-4 pb-4">
          <p className="text-red-800 text-sm"><strong>Error:</strong> {error || 'Unknown error'}</p>
        </CardContent>
      </Card>
    );
  }

  const status = statusDisplay[app.status] || { label: app.status, color: 'bg-gray-100 text-gray-800' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/applications')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1F2937]">
                {app.applicationNumber || app.id.slice(0, 8)}
              </h1>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-[#4B5563] text-sm mt-1">
              {app.studentName} · {app.university} · {app.program}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            className="bg-[#1B2A4A] hover:bg-[#152138]"
            onClick={() => router.push(`/admin/applications/${app.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <p className="text-red-800 text-sm"><strong>Error:</strong> {error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#1B2A4A]" />
                Applicant Information
                {!app.isLinked && (
                  <Badge className="bg-[#9B1B30] text-white text-xs ml-2">No account yet</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Field label="Name" value={app.studentName} icon={<FileText className="w-4 h-4" />} />
                <Field label="Email" value={app.studentEmail || '—'} icon={<Mail className="w-4 h-4" />} />
                <Field label="Source" value={app.source} icon={<User2Icon className="w-4 h-4" />} />
                <Field label="Created" value={new Date(app.createdAt).toLocaleString()} icon={<Calendar className="w-4 h-4" />} />
              </div>
              {!app.isLinked && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                  This application was created for a lead who hasn't signed up yet. Once they create an account, link this application to their <code>student_profiles</code> row via the future "claim" flow.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#1B2A4A]" />
                Application Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Field label="University" value={app.university} icon={<BookOpen className="w-4 h-4" />} />
                <Field label="Program" value={app.program} icon={<BookOpen className="w-4 h-4" />} />
                <Field label="Degree" value={app.degree} />
                <Field label="Intake" value={app.intake} />
              </div>
              {app.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <div className="text-xs text-[#4B5563] mb-1">Admin Notes</div>
                    <div className="text-sm text-[#1F2937] whitespace-pre-wrap">{app.notes}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {['Submitted', 'Under Review'].includes(app.status) ? (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setConfirmAction('Approved')}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => setConfirmAction('Rejected')}
                    disabled={isUpdating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setConfirmAction('Withdrawn')}
                    disabled={isUpdating}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                </div>
              ) : (
                <div className="text-center text-sm text-[#4B5563]">
                  Current status: <Badge className={status.color}>{status.label}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>
                {confirmAction === 'Approved' && 'Approve Application'}
                {confirmAction === 'Rejected' && 'Reject Application'}
                {confirmAction === 'Withdrawn' && 'Withdraw Application'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#4B5563] mb-4">
                Change status of <strong>{app.studentName}</strong>'s application to <strong>{confirmAction}</strong>?
                This will be recorded in the audit timeline.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirmAction(null)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button
                  className={
                    confirmAction === 'Approved' ? 'bg-green-600 hover:bg-green-700' :
                    confirmAction === 'Rejected' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-gray-600 hover:bg-gray-700'
                  }
                  onClick={() => handleStatusChange(confirmAction)}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : `Confirm: ${confirmAction}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon && <span className="text-[#1B2A4A] mt-0.5">{icon}</span>}
      <div>
        <div className="text-xs text-[#4B5563]">{label}</div>
        <div className="font-medium text-[#1F2937]">{value}</div>
      </div>
    </div>
  );
}

function User2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 19a6 6 0 0 0-12 0" />
      <circle cx="8" cy="9" r="4" />
      <path d="M22 19a6 6 0 0 0-6-5 4 4 0 0 0-1 5" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
