'use client';

/**
 * Phase 2: /admin/documents/[id] — single document review.
 * Shows the student, the file, the application link (if any),
 * and the three action buttons: Approve / Reject / Move back
 * to Pending. Reject requires a reason — the same reason is
 * surfaced in the student's portal + notification inbox.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileCheck,
  FileX,
  Clock,
  ExternalLink,
  AlertCircle,
  Loader2,
  GraduationCap,
  Mail,
  User,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

type DocStatus = 'Pending' | 'Verified' | 'Rejected';

interface StudentRef {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface AdminDocument {
  id: string;
  student_id: string | null;
  application_id: string | null;
  document_type_id: string;
  name: string;
  name_cn: string | null;
  category: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  status: DocStatus | null;
  notes: string | null;
  rejection_reason: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  student: StudentRef | null;
}

const STATUS_STYLES: Record<DocStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Verified: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<DocStatus, React.ElementType> = {
  Pending: Clock,
  Verified: FileCheck,
  Rejected: FileX,
};

function fullName(s: StudentRef | null | undefined): string {
  if (!s) return '—';
  return [s.first_name, s.last_name].filter(Boolean).join(' ') || s.email || '—';
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function AdminDocumentDetailInner() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { addToast } = useToast();
  const docId = params.id as string;

  const [doc, setDoc] = useState<AdminDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<null | 'approve' | 'reject' | 'pending'>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ document: AdminDocument }>(
        `/api/admin/documents/${docId}`,
      );
      setDoc(res.document);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load document';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    void fetchDoc();
  }, [fetchDoc]);

  const submit = async (
    status: 'Verified' | 'Rejected' | 'Pending',
    rejectionReason?: string,
  ) => {
    if (status === 'Rejected' && !rejectionReason?.trim()) {
      addToast(t('adminDocs.errorReasonRequired'), 'error');
      return;
    }
    setSubmitting(status === 'Verified' ? 'approve' : status === 'Rejected' ? 'reject' : 'pending');
    try {
      await apiFetchJson(`/api/admin/documents/${docId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          rejectionReason: status === 'Rejected' ? rejectionReason?.trim() : null,
        }),
      });
      addToast(
        status === 'Verified'
          ? '✓ Approved'
          : status === 'Rejected'
            ? '✗ Rejected'
            : '↩ Moved to pending',
        'success',
      );
      setRejectOpen(false);
      setRejectReason('');
      await fetchDoc();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addToast(t('adminDocs.toastError', { error: msg }), 'error');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="space-y-4">
        <Link href="/admin/documents" className="inline-flex items-center gap-2 text-[#1B2A4A]">
          <ArrowLeft className="w-4 h-4" />
          {t('adminDocs.detailBackToList')}
        </Link>
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-6 text-red-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">{error || 'Document not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatusIcon = doc.status ? STATUS_ICONS[doc.status] : Clock;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/documents" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{doc.name}</h1>
          <p className="text-sm text-[#4B5563] mt-1">{doc.category}</p>
        </div>
        {doc.status && (
          <Badge className={`rounded-none ${STATUS_STYLES[doc.status]}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {doc.status}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Student card */}
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-[#1B2A4A] text-base">
                {t('adminDocs.detailStudent')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#4B5563]" />
                <span className="text-[#4B5563] min-w-24">Name:</span>
                <span className="font-medium text-[#1F2937]">{fullName(doc.student)}</span>
              </div>
              {doc.student?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#4B5563]" />
                  <span className="text-[#4B5563] min-w-24">Email:</span>
                  <a
                    href={`mailto:${doc.student.email}`}
                    className="font-medium text-[#1B2A4A] hover:underline"
                  >
                    {doc.student.email}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Document + file preview */}
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-[#1B2A4A] text-base">
                {t('adminDocs.detailDocument')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-[#4B5563] block mb-1">{t('adminDocs.detailFileUrl')}</span>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1B2A4A] hover:underline break-all inline-flex items-center gap-1"
                >
                  {doc.file_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {doc.file_type?.startsWith('image/') && (
                <div className="border border-gray-200 p-2 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={doc.file_url}
                    alt={doc.name}
                    className="max-w-full max-h-96 mx-auto"
                  />
                </div>
              )}
              {doc.file_type === 'application/pdf' && (
                <div className="border border-gray-200 bg-gray-50">
                  <iframe
                    src={doc.file_url}
                    title={doc.name}
                    className="w-full h-[500px]"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-none"
                >
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    {t('adminDocs.detailOpenFile')}
                  </a>
                </Button>
                {doc.file_name && (
                  <span className="text-xs text-[#4B5563]">
                    {doc.file_name}
                    {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)} KB` : ''}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Application link */}
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-[#1B2A4A] text-base">
                {t('adminDocs.detailApplication')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doc.application_id ? (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="w-4 h-4 text-[#4B5563]" />
                  <span className="text-[#1F2937]">{t('adminDocs.detailLinkedToApp')}</span>
                  <Link
                    href={`/admin/applications?search=${doc.application_id}`}
                    className="text-[#1B2A4A] hover:underline font-mono text-xs"
                  >
                    {doc.application_id.slice(0, 8)}…
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                  <FileText className="w-4 h-4" />
                  {t('adminDocs.detailUnlinked')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rejection reason display (read-only when already rejected) */}
          {doc.status === 'Rejected' && doc.rejection_reason && (
            <Card className="rounded-none border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 text-base">
                  {t('adminDocs.detailRejectionReason')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700 whitespace-pre-wrap">
                  {doc.rejection_reason}
                </p>
                <p className="text-xs text-red-600 mt-3 italic">
                  {t('adminDocs.detailRejectionNote')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar — actions + audit info */}
        <div className="space-y-4">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-[#1B2A4A] text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {doc.status !== 'Verified' && (
                <Button
                  onClick={() => submit('Verified')}
                  disabled={submitting !== null}
                  className="w-full rounded-none bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting === 'approve' && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  <FileCheck className="w-4 h-4 mr-1" />
                  {t('adminDocs.actionApprove')}
                </Button>
              )}
              {doc.status !== 'Rejected' && (
                <Button
                  onClick={() => { setRejectOpen(true); setRejectReason(doc.rejection_reason || ''); }}
                  disabled={submitting !== null}
                  variant="outline"
                  className="w-full rounded-none border-red-300 text-red-700 hover:bg-red-50"
                >
                  <FileX className="w-4 h-4 mr-1" />
                  {t('adminDocs.actionReject')}
                </Button>
              )}
              {doc.status !== 'Pending' && (
                <Button
                  onClick={() => submit('Pending')}
                  disabled={submitting !== null}
                  variant="outline"
                  className="w-full rounded-none"
                >
                  {submitting === 'pending' && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  <Clock className="w-4 h-4 mr-1" />
                  {t('adminDocs.actionMoveToPending')}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-[#1B2A4A] text-base">Audit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-[#4B5563]">
              <div>
                <span className="block">{t('adminDocs.detailUploadedAt')}</span>
                <span className="text-[#1F2937] font-medium">{formatDate(doc.uploaded_at)}</span>
              </div>
              <div>
                <span className="block">{t('adminDocs.detailVerifiedAt')}</span>
                <span className="text-[#1F2937] font-medium">
                  {doc.verified_at ? formatDate(doc.verified_at) : t('adminDocs.detailNotVerifiedYet')}
                </span>
              </div>
              {doc.verified_by && (
                <div>
                  <span className="block">{t('adminDocs.detailVerifiedBy')}</span>
                  <span className="text-[#1F2937] font-mono">{doc.verified_by.slice(0, 8)}…</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject dialog */}
      {rejectOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-md w-full mx-4 border border-gray-200">
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">
              {t('adminDocs.actionReject')}
            </h3>
            <p className="text-sm text-[#4B5563] mb-4">
              {t('adminDocs.confirmReject')}
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('adminDocs.rejectReasonPlaceholder')}
              rows={3}
              className="rounded-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => { setRejectOpen(false); setRejectReason(''); }}
                disabled={submitting !== null}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button
                onClick={() => submit('Rejected', rejectReason)}
                disabled={submitting !== null || !rejectReason.trim()}
                className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
              >
                {submitting === 'reject' && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                {t('adminDocs.actionReject')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDocumentDetailPage() {
  return (
    <ToastProvider>
      <AdminDocumentDetailInner />
    </ToastProvider>
  );
}
