'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download as DownloadIcon,
  ExternalLink,
  Loader2,
  Upload as UploadIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  STUDENT_DOC_CATEGORIES,
  type StudentDocCategory,
} from '@/lib/admin-document-categories';
import { AdminDocUploadDialog } from './admin-doc-upload-dialog';
import type { DocumentStatus, StudentDocument } from '@/lib/student-data';

interface JoinedStudent {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}
interface JoinedPartnerStudent {
  id: string;
  student_name?: string | null;
  student_email?: string | null;
}

interface AdminDocRow {
  id: string;
  name: string;
  name_cn?: string | null;
  category: string;
  status: DocumentStatus;
  file_url: string;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
  uploaded_at: string;
  verified_at?: string | null;
  verified_by?: string | null;
  rejection_reason?: string | null;
  student_id: string | null;
  partner_student_id: string | null;
  student?: JoinedStudent | null;
  partnerStudent?: JoinedPartnerStudent | null;
}

interface AdminDocsResponse {
  documents: AdminDocRow[];
  total: number;
}

const STATUS_VARIANT: Record<DocumentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Verified: 'default',
  Pending: 'outline',
  Uploaded: 'secondary',
  Rejected: 'destructive',
};

export function DocumentsTab({
  applicationId,
  studentId,
}: {
  applicationId: string;
  studentId: string | null;
}) {
  const { t } = useI18n();
  const [docs, setDocs] = useState<AdminDocRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setDocs(null);
    setError(null);
    apiFetchJson<AdminDocsResponse>(
      `/api/admin/documents?applicationId=${encodeURIComponent(applicationId)}&limit=100`,
    )
      .then((d) => {
        if (!cancelled) setDocs(d.documents || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load documents');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, reloadKey]);

  const handleStatus = async (
    doc: AdminDocRow,
    status: 'Pending' | 'Verified' | 'Rejected',
    rejectionReason?: string,
  ) => {
    setActionPending(doc.id);
    try {
      const body: Record<string, unknown> = { status };
      if (status === 'Rejected') {
        body.rejectionReason = rejectionReason || 'Rejected by admin';
      }
      await apiFetch(`/api/admin/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      setReloadKey((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionPending(null);
    }
  };

  const openSigned = async (doc: AdminDocRow) => {
    try {
      const r = await apiFetchJson<{ url: string }>(
        `/api/admin/documents/${doc.id}/download-url`,
      );
      window.open(r.url, '_blank', 'noopener');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get download URL');
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-red-600">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }
  if (docs === null) {
    return (
      <div className="flex items-center gap-2 p-4 text-gray-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }
  if (docs.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 text-gray-600">
          <span>No documents linked yet.</span>
          {studentId && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUploadDialogOpen(true)}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload on behalf of student
            </Button>
          )}
        </div>
        {studentId && (
          <AdminDocUploadDialog
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            studentId={studentId}
            applicationId={applicationId}
            onUploaded={() => setReloadKey((n) => n + 1)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {studentId && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploadDialogOpen(true)}
          >
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload on behalf of student
          </Button>
        </div>
      )}
      <ul className="divide-y divide-gray-100 border border-gray-200 rounded-none">
        {docs.map((doc) => {
          const uploader =
            doc.student?.first_name || doc.student?.last_name
              ? `Student: ${doc.student?.first_name ?? ''} ${doc.student?.last_name ?? ''}`.trim()
              : doc.partnerStudent?.student_name
                ? `Partner: ${doc.partnerStudent.student_name}`
                : 'Unknown';
          const isPdf =
            doc.file_type === 'application/pdf' || /\.pdf$/i.test(doc.file_name || '');
          return (
            <li
              key={doc.id}
              className="p-3 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-[#1F2937] truncate">
                    {doc.name}
                  </span>
                  <Badge variant={STATUS_VARIANT[doc.status]} className="rounded-none text-xs">
                    {doc.status}
                  </Badge>
                  {doc.category && STUDENT_DOC_CATEGORIES.includes(doc.category as StudentDocCategory) && (
                    <Badge variant="outline" className="rounded-none text-xs">
                      {doc.category}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span>{uploader}</span>
                  {doc.file_name && <span>· {doc.file_name}</span>}
                  <span>
                    · uploaded {new Date(doc.uploaded_at).toLocaleString()}
                  </span>
                  {doc.verified_at && (
                    <span>
                      · verified {new Date(doc.verified_at).toLocaleString()}
                    </span>
                  )}
                </div>
                {doc.status === 'Rejected' && doc.rejection_reason && (
                  <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {doc.rejection_reason}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {doc.file_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openSigned(doc)}
                    title="Open in new tab"
                  >
                    {isPdf ? (
                      <DownloadIcon className="h-4 w-4" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {doc.status !== 'Verified' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-700 border-green-200 hover:bg-green-50"
                    disabled={actionPending === doc.id}
                    onClick={() => handleStatus(doc, 'Verified')}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                {doc.status !== 'Rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-200 hover:bg-red-50"
                    disabled={actionPending === doc.id}
                    onClick={() =>
                      handleStatus(doc, 'Rejected', 'Rejected by admin')
                    }
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                )}
                {doc.status !== 'Pending' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={actionPending === doc.id}
                    onClick={() => handleStatus(doc, 'Pending')}
                    title="Move back to pending"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {studentId && (
        <AdminDocUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          studentId={studentId}
          applicationId={applicationId}
          onUploaded={() => setReloadKey((n) => n + 1)}
        />
      )}
    </div>
  );
}