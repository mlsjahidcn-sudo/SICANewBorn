'use client';

/**
 * DocumentViewer — the shared in-app document viewer for the admin
 * portal.
 *
 * The problem this replaces
 * ------------------------
 * Opening a document used to navigate away from wherever the admin
 * was: the student detail page, the partner-student detail page or
 * the review queue. The document detail page's back button was
 * hardcoded to the global queue, and the tab state of the origin
 * page was not in the URL — so "go back" never brought the admin
 * back to the student's own document list.
 *
 * This component opens as a modal instead: the URL never changes,
 * the origin page keeps its tab, its filters and its scroll position.
 * The standalone `/admin/documents/[id]` page is kept for deep links
 * and the audit trail, and now understands a `?from=` origin so its
 * back button points at the right place.
 *
 * Features
 * --------
 * - pdf.js rendering with real zoom (50–400%), fit-width, fit-page,
 *   100%, rotation and page navigation.
 * - Image rendering with zoom + drag-to-pan.
 * - "Open in new window" + "Download" (the signed URL is already in
 *   memory, so the open is synchronous and never popup-blocked).
 * - Approve / reject-with-reason / move-to-pending, using the
 *   existing `PATCH /api/admin/documents/[id]` endpoint (which also
 *   fires the student + partner notifications).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Clock,
  FileCheck,
  FileText,
  FileX,
  GraduationCap,
  Loader2,
  User,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { DocumentPreview } from '@/components/admin/document-preview';
import { DocumentToolbar } from '@/components/admin/document-toolbar';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  clampZoom,
  DEFAULT_ZOOM,
  formatFileSize,
  originHref,
  originQuery,
  type DocumentOrigin,
} from '@/lib/document-viewer-origin';

export interface AdminViewerDocument {
  id: string;
  student_id: string | null;
  application_id: string | null;
  partner_student_id: string | null;
  partner_application_id: string | null;
  linked_student_profile_id: string | null;
  name: string;
  name_cn: string | null;
  category: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  status: 'Pending' | 'Verified' | 'Rejected' | null;
  notes: string | null;
  rejection_reason: string | null;
  uploaded_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  student: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  partnerStudent: {
    id: string;
    student_name: string | null;
    student_email: string | null;
  } | null;
}

export interface DocumentViewerProps {
  /** Whether the modal is open. */
  open: boolean;
  /** The document being viewed. Null closes the modal. */
  documentId: string | null;
  /** Where the admin opened the document from (drives the back link). */
  origin?: DocumentOrigin | null;
  onOpenChange: (open: boolean) => void;
  /** Called after a status change so the parent list can refresh. */
  onChanged?: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Verified: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function DocumentViewerInner({
  open,
  documentId,
  origin,
  onOpenChange,
  onChanged,
}: DocumentViewerProps) {
  const { t } = useI18n();
  const { addToast } = useToast();

  const [doc, setDoc] = useState<AdminViewerDocument | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Viewer state
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [rotation, setRotation] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);

  // Management state
  const [actionPending, setActionPending] = useState<'approve' | 'reject' | 'pending' | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Ref so the fetch effect doesn't restart on every state change.
  // Synced in an effect (not during render — the React Compiler's
  // `react-hooks/refs` rule flags that).
  const onChangedRef = useRef(onChanged);
  useEffect(() => {
    onChangedRef.current = onChanged;
  });

  // --- reset per document ------------------------------------------------
  useEffect(() => {
    if (!open || !documentId) return;
    setDoc(null);
    setSignedUrl(null);
    setLoadError(null);
    setLoading(true);
    setZoom(DEFAULT_ZOOM);
    setRotation(0);
    setPageNumber(1);
    setPageCount(0);
    setContentSize(null);
    setRejectOpen(false);
    setRejectReason('');
    setActionPending(null);
  }, [open, documentId]);

  // --- fetch the document + a signed URL --------------------------------
  useEffect(() => {
    if (!open || !documentId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const [docRes, urlRes] = await Promise.all([
          apiFetchJson<{ document: AdminViewerDocument }>(
            `/api/admin/documents/${documentId}`,
          ),
          apiFetchJson<{ url: string }>(
            `/api/admin/documents/${documentId}/download-url`,
          ),
        ]);
        if (cancelled) return;
        setDoc(docRes.document);
        setSignedUrl(urlRes.url);
        setLoadError(null);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Failed to load the document';
        setLoadError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, documentId]);

  // --- fit scales --------------------------------------------------------
  const fitWidthScale = useMemo(() => {
    if (!contentSize || !containerSize || contentSize.width <= 0) return DEFAULT_ZOOM;
    return clampZoom((containerSize.width - 48) / contentSize.width);
  }, [contentSize, containerSize]);

  const fitPageScale = useMemo(() => {
    if (!contentSize || !containerSize || contentSize.width <= 0) return DEFAULT_ZOOM;
    const byWidth = (containerSize.width - 48) / contentSize.width;
    const byHeight = (containerSize.height - 48) / contentSize.height;
    return clampZoom(Math.min(byWidth, byHeight));
  }, [contentSize, containerSize]);

  const applyZoom = useCallback((next: number) => {
    setZoom(clampZoom(next));
  }, []);

  // --- external open / download ------------------------------------------
  // The signed URL is already in memory, so these are synchronous and
  // never trip the browser's popup blocker.
  const openInNewWindow = useCallback(() => {
    if (!signedUrl) return;
    const win = window.open(signedUrl, '_blank', 'noopener');
    if (!win) {
      addToast(t('adminDocViewer.popupBlocked'), 'error');
    }
  }, [signedUrl, addToast, t]);

  const downloadFile = useCallback(async () => {
    if (!signedUrl) return;
    const fileName = doc?.file_name || 'document';
    try {
      const res = await fetch(signedUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Cross-origin download restrictions can block the blob path —
      // fall back to opening the file in a new tab.
      openInNewWindow();
    }
  }, [signedUrl, doc?.file_name, openInNewWindow]);

  // --- management actions -------------------------------------------------
  const applyStatus = useCallback(
    async (status: 'Verified' | 'Rejected' | 'Pending', rejectionReason?: string) => {
      if (!documentId) return;
      if (status === 'Rejected' && !rejectionReason?.trim()) {
        addToast(t('adminDocs.errorReasonRequired'), 'error');
        return;
      }
      setActionPending(status === 'Verified' ? 'approve' : status === 'Rejected' ? 'reject' : 'pending');
      try {
        await apiFetchJson(`/api/admin/documents/${documentId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            rejectionReason: status === 'Rejected' ? rejectionReason?.trim() : null,
          }),
        });
        addToast(
          status === 'Verified'
            ? t('adminDocViewer.toastApproved')
            : status === 'Rejected'
              ? t('adminDocViewer.toastRejected')
              : t('adminDocViewer.toastPending'),
          'success',
        );
        setRejectOpen(false);
        setRejectReason('');
        // Refresh the document in place so the badge + audit rows update.
        const res = await apiFetchJson<{ document: AdminViewerDocument }>(
          `/api/admin/documents/${documentId}`,
        );
        setDoc(res.document);
        onChangedRef.current?.();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        addToast(t('adminDocs.toastError', { error: message }), 'error');
      } finally {
        setActionPending(null);
      }
    },
    [documentId, addToast, t],
  );

  // --- derived ------------------------------------------------------------
  const uploaderName = useMemo(() => {
    if (!doc) return '—';
    if (doc.student) {
      return (
        [doc.student.first_name, doc.student.last_name].filter(Boolean).join(' ') ||
        doc.student.email ||
        '—'
      );
    }
    if (doc.partnerStudent) return doc.partnerStudent.student_name || '—';
    return '—';
  }, [doc]);

  const statusBadge = doc?.status ? (
    <Badge className={`rounded-none ${STATUS_STYLES[doc.status] || ''}`}>{doc.status}</Badge>
  ) : null;

  const isPdf = doc?.file_type === 'application/pdf' || /\.pdf$/i.test(doc?.file_name || '');

  /**
   * Label for the "back to where you came from" link. The student's
   * name is used when we have it, so the admin lands on "Back to
   * Amara Diallo's documents" rather than a generic string.
   */
  const originBackLabel = useMemo(() => {
    if (!origin) return '';
    const studentName = doc?.student
      ? [doc.student.first_name, doc.student.last_name].filter(Boolean).join(' ') ||
        doc.student.email ||
        ''
      : '';
    const partnerName = doc?.partnerStudent?.student_name || '';

    switch (origin.kind) {
      case 'student':
        return studentName
          ? t('adminDocViewer.backToStudentDocs', { name: studentName })
          : t('adminDocViewer.backToQueue');
      case 'partner':
        return partnerName
          ? t('adminDocViewer.backToPartnerDocs', { name: partnerName })
          : t('adminDocViewer.backToQueue');
      case 'application':
        return t('adminDocViewer.backToApplication');
      case 'queue':
      default:
        return t('adminDocViewer.backToQueue');
    }
  }, [origin, doc, t]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[92vh] w-[96vw] max-w-[96vw] flex-col gap-0 overflow-hidden rounded-none p-0 sm:max-w-[96vw]"
      >
        <DialogTitle className="sr-only">{doc?.name ?? t('adminDocViewer.title')}</DialogTitle>
        <DialogDescription className="sr-only">
          {t('adminDocViewer.description')}
        </DialogDescription>

        {/* Header */}
        <div className="flex items-start gap-3 border-b border-gray-200 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold text-[#1B2A4A]">
                {doc?.name ?? t('adminDocViewer.loading')}
              </h2>
              {statusBadge}
              {doc?.category && (
                <Badge variant="outline" className="rounded-none">
                  {doc.category}
                </Badge>
              )}
            </div>
            {doc && (
              <p className="mt-1 truncate text-xs text-[#4B5563]">
                {uploaderName}
                {doc.file_name ? ` · ${doc.file_name}` : ''}
                {doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ''}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => onOpenChange(false)}
          >
            {t('adminDocViewer.close')}
          </Button>
        </div>

        {/* Toolbar */}
        <DocumentToolbar
          zoom={zoom}
          onZoomChange={applyZoom}
          rotation={rotation}
          onRotationChange={setRotation}
          pageNumber={pageNumber}
          pageCount={pageCount}
          onPageChange={setPageNumber}
          fitWidthScale={fitWidthScale}
          fitPageScale={fitPageScale}
          onDownload={() => void downloadFile()}
          onOpenExternal={openInNewWindow}
          exportDisabled={!signedUrl}
        >
          {documentId && (
            <Button variant="outline" size="sm" className="rounded-none" asChild>
              <Link
                href={`/admin/documents/${documentId}${originQuery(origin ?? null)}`}
                onClick={() => onOpenChange(false)}
              >
                <FileText className="h-4 w-4" />
                {t('adminDocViewer.fullDetails')}
              </Link>
            </Button>
          )}
        </DocumentToolbar>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {/*
            `min-w-0` matters: a flex item's default `min-width: auto`
            stops it shrinking below its content's min-content width.
            Without it the zoomed image (which is wider than the panel)
            pushes the metadata sidebar off the right edge of the
            dialog. With it, the preview scrolls instead.
          */}
          <div className="relative min-h-0 min-w-0 flex-1">
            {loading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-white">
                <Loader2 className="h-6 w-6 animate-spin text-[#1B2A4A]" />
              </div>
            )}

            {loadError && !loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white p-8 text-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <p className="text-sm text-red-700">{loadError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => {
                    setLoadError(null);
                    setLoading(true);
                    setDoc(null);
                    setSignedUrl(null);
                  }}
                >
                  {t('adminDocViewer.retry')}
                </Button>
              </div>
            )}

            {doc && (
              <DocumentPreview
                fileType={doc.file_type}
                fileName={doc.file_name}
                url={signedUrl}
                scale={zoom}
                rotation={rotation}
                pageNumber={pageNumber}
                onPageCountChange={setPageCount}
                onPageMetrics={setContentSize}
                onContainerSize={setContainerSize}
                onNaturalSize={setContentSize}
                onOpenExternal={openInNewWindow}
                openExternalLabel={t('adminDocViewer.openInNewWindow')}
                unsupportedTitle={t('adminDocViewer.unsupportedTitle')}
                unsupportedBody={t('adminDocViewer.unsupportedBody')}
                fallbackNotice={t('adminDocViewer.fallbackNotice')}
              />
            )}
          </div>

          {/* Sidebar — metadata + management */}
          <aside className="w-full shrink-0 space-y-4 overflow-y-auto border-t border-gray-200 bg-white p-4 lg:w-80 lg:border-l lg:border-t-0">            {doc && (
              <>
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-[#1B2A4A]">
                    {t('adminDocViewer.statusLabel')}
                  </h3>
                  <div className="flex items-center gap-2">{statusBadge ?? '—'}</div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                  <MetaRow
                    label={t('adminDocViewer.categoryLabel')}
                    value={doc.category || '—'}
                  />
                  <MetaRow
                    label={t('adminDocViewer.fileLabel')}
                    value={
                      doc.file_name
                        ? `${doc.file_name}${
                            doc.file_size ? ` · ${formatFileSize(doc.file_size)}` : ''
                          }`
                        : '—'
                    }
                  />
                  <MetaRow
                    label={t('adminDocViewer.uploadedAtLabel')}
                    value={formatDateTime(doc.uploaded_at)}
                  />
                  <MetaRow
                    label={t('adminDocViewer.verifiedAtLabel')}
                    value={
                      doc.verified_at
                        ? formatDateTime(doc.verified_at)
                        : t('adminDocs.detailNotVerifiedYet')
                    }
                  />
                </div>

                {doc.rejection_reason && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-semibold text-red-700">
                      {t('adminDocs.detailRejectionReason')}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-xs text-red-600">
                      {doc.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Related records */}
                <div className="space-y-2 border-t border-gray-100 pt-3 text-xs">
                  {(doc.student || doc.linked_student_profile_id) && (
                    <Link
                      href={`/admin/students/${doc.student?.id ?? doc.linked_student_profile_id}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                    >
                      <User className="h-3.5 w-3.5" />
                      {t('adminDocViewer.studentLabel')}
                    </Link>
                  )}
                  {doc.partner_student_id && (
                    <Link
                      href={`/admin/partner-students/${doc.partner_student_id}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                    >
                      <User className="h-3.5 w-3.5" />
                      {t('adminDocViewer.partnerStudentLabel')}
                    </Link>
                  )}
                  {doc.application_id && (
                    <Link
                      href={`/admin/applications/${doc.application_id}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      {t('adminDocViewer.applicationLabel')}
                    </Link>
                  )}
                  {doc.partner_application_id && (
                    <Link
                      href={`/admin/partner-applications/${doc.partner_application_id}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      {t('adminDocViewer.applicationLabel')}
                    </Link>
                  )}
                </div>

                {/* Management */}
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <h3 className="text-sm font-bold text-[#1B2A4A]">
                    {t('adminDocViewer.actionsLabel')}
                  </h3>

                  {doc.status !== 'Verified' && (
                    <Button
                      onClick={() => void applyStatus('Verified')}
                      disabled={actionPending !== null}
                      className="w-full rounded-none bg-emerald-600 hover:bg-emerald-700"
                    >
                      {actionPending === 'approve' && (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      )}
                      <FileCheck className="mr-1 h-4 w-4" />
                      {t('adminDocs.actionApprove')}
                    </Button>
                  )}

                  {doc.status !== 'Rejected' && (
                    <Button
                      onClick={() => {
                        setRejectOpen((v) => !v);
                        setRejectReason(doc.rejection_reason || '');
                      }}
                      disabled={actionPending !== null}
                      variant="outline"
                      className="w-full rounded-none border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <FileX className="mr-1 h-4 w-4" />
                      {t('adminDocs.actionReject')}
                    </Button>
                  )}

                  {rejectOpen && (
                    <div className="space-y-2 border border-red-200 bg-red-50 p-2">
                      <label
                        htmlFor="doc-viewer-reject-reason"
                        className="block text-xs font-medium text-red-800"
                      >
                        {t('adminDocViewer.rejectReasonLabel')}
                      </label>
                      <Textarea
                        id="doc-viewer-reject-reason"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={t('adminDocs.rejectReasonPlaceholder')}
                        rows={3}
                        className="rounded-none text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-none"
                          onClick={() => {
                            setRejectOpen(false);
                            setRejectReason('');
                          }}
                          disabled={actionPending !== null}
                        >
                          {t('adminCommon.cancel')}
                        </Button>
                        <Button
                          size="sm"
                          className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
                          onClick={() => void applyStatus('Rejected', rejectReason)}
                          disabled={actionPending !== null || !rejectReason.trim()}
                        >
                          {actionPending === 'reject' && (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          )}
                          {t('adminDocViewer.rejectConfirm')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {doc.status !== 'Pending' && (
                    <Button
                      onClick={() => void applyStatus('Pending')}
                      disabled={actionPending !== null}
                      variant="outline"
                      className="w-full rounded-none"
                    >
                      {actionPending === 'pending' && (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      )}
                      <Clock className="mr-1 h-4 w-4" />
                      {t('adminDocs.actionMoveToPending')}
                    </Button>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>

        {/* Footer — back to the origin */}
        {origin && (
          <div className="border-t border-gray-200 bg-[#FAFAF8] px-4 py-2">
            <Link
              href={originHref(origin)}
              onClick={() => onOpenChange(false)}
              className="text-xs text-[#1B2A4A] hover:underline"
            >
              {originBackLabel}
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-[#4B5563]">{label}</span>
      <span className="break-all text-right font-medium text-[#1F2937]">{value}</span>
    </div>
  );
}

/**
 * Public wrapper. It brings its own ToastProvider so the viewer works
 * on any admin page regardless of whether the host wraps one.
 */
export function DocumentViewer(props: DocumentViewerProps) {
  return (
    <ToastProvider>
      <DocumentViewerInner {...props} />
    </ToastProvider>
  );
}
