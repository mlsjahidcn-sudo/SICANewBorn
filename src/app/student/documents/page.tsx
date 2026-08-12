'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { FileText, FileUp, Upload, CheckCircle2, Clock, XCircle, Trash2, Link2, ExternalLink, FileCheck, X, Eye, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { documentTypes, DocumentCategory } from '@/lib/student-data';
import { DocumentUploader, DocumentCategory as DocCat, UploadedDocument } from '@/components/student/DocumentUploader';
import { createStudentDocDownloadUrl } from '@/lib/storage-client';
import type { StudentApplication } from '@/lib/application-mapper';

// Shape of a single row from `student_documents` as returned by
// /api/student/documents. The API returns raw DB rows (snake_case).
interface DbStudentDocument {
  id: string;
  name: string;
  category: string;
  status: string;
  document_type_id?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  uploaded_at?: string;
  // Phase S20: documents can be linked to an application via this FK.
  // When null, the doc is "floating" — it doesn't belong to any
  // application yet. The user can re-link from this page.
  application_id?: string | null;
  // Admin-set free text explaining why a doc was rejected. Only
  // populated when status='Rejected'. We render this prominently
  // under the doc so the student knows what to fix.
  rejection_reason?: string | null;
}

const CATEGORIES: Array<'All' | DocumentCategory> = [
  'All',
  'Identity',
  'Academic',
  'Language',
  'Financial',
  'Recommendation',
  'Other',
];

export default function StudentDocumentsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  // ?applicationId=<id> comes in from the application detail
  // "Upload Document" button. We pre-filter the docs list to that
  // application and show a clear "filter active" banner with an X
  // to clear it. The actual list filter happens after both
  // documents AND applications have loaded (we need the app's
  // friendly name for the banner).
  const filterApplicationId = searchParams.get('applicationId');

  const [isLoading, setIsLoading] = useState(true);
  // Phase 4C: read filter/sort state from URL so the student can
  // bookmark or refresh without losing their view.
  const [activeCategory, setActiveCategory] = useState<'All' | DocumentCategory>(
    (searchParams.get('category') as DocumentCategory) || 'All',
  );
  const [activeStatus, setActiveStatus] = useState<'all' | 'Pending' | 'Uploaded' | 'Verified' | 'Rejected'>(
    (searchParams.get('status') as 'all' | 'Pending' | 'Uploaded' | 'Verified' | 'Rejected') || 'all',
  );
  const [sortKey, setSortKey] = useState<'uploaded_at' | 'name' | 'status'>(
    (searchParams.get('sort') as 'uploaded_at' | 'name' | 'status') || 'uploaded_at',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc',
  );
  const [documents, setDocuments] = useState<DbStudentDocument[]>([]);
  // Phase S20: fetch the student's applications so each doc row
  // can show its "Linked to" app + offer a re-link dropdown.
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Per-doc re-link state. We track which doc is currently being
  // re-linked so the dropdown can show a "saving…" affordance.
  const [linkingId, setLinkingId] = useState<string | null>(null);
  // Phase 4C: styled delete confirmation + preview + re-upload.
  const [docToDelete, setDocToDelete] = useState<DbStudentDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DbStudentDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reuploadId, setReuploadId] = useState<string | null>(null);

  // Upload panel state
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<DocumentCategory>('Identity');

  // Resolved name of the filtered application, if any. Falls back
  // to the bare id when the app isn't loaded yet (rare race).
  const filteredApplication = useMemo(
    () => applications.find((a) => a.id === filterApplicationId) ?? null,
    [applications, filterApplicationId],
  );

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Phase S20: load docs AND applications in parallel. The
      // applications list drives the per-doc "Link to application"
      // dropdown on each row.
      const [docsRes, appsRes] = await Promise.all([
        apiFetchJson<{ data: DbStudentDocument[] }>('/api/student/documents'),
        apiFetchJson<{ applications: StudentApplication[] }>(
          '/api/student/applications?limit=50',
        ),
      ]);
      setDocuments(docsRes.data || []);
      setApplications(appsRes.applications || []);
    } catch (err) {
      console.error('[student/documents] fetch failed:', err);
      setError(err instanceof Error ? err.message : t('studentDocs.errorFetch'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  // Phase 4C: keep URL query params in sync with filters/sort.
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeCategory === 'All') params.delete('category');
    else params.set('category', activeCategory);
    if (activeStatus === 'all') params.delete('status');
    else params.set('status', activeStatus);
    if (sortKey === 'uploaded_at') params.delete('sort');
    else params.set('sort', sortKey);
    if (sortOrder === 'desc') params.delete('order');
    else params.set('order', sortOrder);
    const newQuery = params.toString();
    const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
    router.replace(newUrl, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeStatus, sortKey, sortOrder]);

  /**
   * Phase S20: link (or unlink) a doc to an application. We do a
   * optimistic local update so the dropdown reflects the change
   * immediately, then PATCH the server. On failure we roll back.
   */
  const handleLinkDoc = async (docId: string, applicationId: string | null) => {
    const previous = documents.find((d) => d.id === docId)?.application_id ?? null;
    setLinkingId(docId);
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, application_id: applicationId } : d)),
    );
    try {
      await apiFetchJson(`/api/student/documents/${docId}`, {
        method: 'PUT',
        body: JSON.stringify({ applicationId }),
      });
    } catch (err) {
      // Roll back on failure
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, application_id: previous } : d)),
      );
      setError(err instanceof Error ? err.message : t('studentDocs.errorLink'));
    } finally {
      setLinkingId(null);
    }
  };

  const handleUploaded = (doc: UploadedDocument) => {
    // Optimistic prepend so the doc appears immediately. The
    // application_id is whatever the uploader had at the time of
    // upload (usually null for docs uploaded on this page, set
    // to the new app id for docs uploaded in the wizard).
    setDocuments((prev) => [
      {
        id: doc.id,
        name: doc.name,
        category: doc.storagePath, // unused — will be re-normalized below
        status: doc.status,
        document_type_id: doc.documentTypeId,
        file_url: doc.storagePath,
        file_name: doc.fileName,
        file_type: doc.fileType,
        file_size: doc.fileSize,
        uploaded_at: new Date().toISOString(),
        application_id: null, // re-linkable from the row
      } as DbStudentDocument,
      ...prev,
    ]);
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    const id = docToDelete.id;
    setDocToDelete(null);
    try {
      const res = await fetch(`/api/student/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('studentDocs.errorDelete'));
    }
  };

  const handleDownload = async (doc: DbStudentDocument) => {
    if (!doc.file_url) return;
    try {
      const { downloadUrl } = await createStudentDocDownloadUrl(doc.file_url);
      if (!downloadUrl) throw new Error(t('studentDocs.errorDownloadUrl'));
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('studentDocs.errorDownload'));
    }
  };

  // Phase 4C: inline preview modal. Resolves a signed URL for the
  // document and shows it in a Dialog (image/PDF) or a download
  // fallback for other file types.
  const openPreview = async (doc: DbStudentDocument) => {
    if (!doc.file_url) return;
    setPreviewDoc(doc);
    setPreviewUrl(null);
    try {
      const { downloadUrl } = await createStudentDocDownloadUrl(doc.file_url);
      setPreviewUrl(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('studentDocs.errorPreview'));
      setPreviewDoc(null);
    }
  };

  // Phase 4C: re-upload shortcut for rejected docs. Shows the
  // DocumentUploader inline; when the new file lands, we delete the
  // old rejected row so the student sees one clean entry.
  const handleReuploaded = async (doc: DbStudentDocument, uploaded: UploadedDocument) => {
    setReuploadId(null);
    try {
      await fetch(`/api/student/documents/${doc.id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('[student/documents] failed to delete old rejected doc:', err);
    }
    handleUploaded(uploaded);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; labelKey: string }> = {
      'Pending': { variant: 'outline', labelKey: 'studentDocs.statusBadgePending' },
      'Verified': { variant: 'default', labelKey: 'studentDocs.statusBadgeVerified' },
      'Rejected': { variant: 'destructive', labelKey: 'studentDocs.statusBadgeRejected' },
    };
    const config = variants[status] || { variant: 'outline' as const, labelKey: '' };
    return <Badge variant={config.variant} className="rounded-none">{config.labelKey ? t(config.labelKey) : status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Verified':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded-none w-48" />
        <div className="h-12 bg-gray-200 animate-pulse rounded-none" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  // Apply both filters: the URL ?applicationId= filter (when set),
  // the category chip filter, the status filter, and the sort key.
  // Category and status are independent — the student can combine
  // "Identity" + "Verified" to see only verified ID docs.
  const filteredDocuments = documents
    .filter((d) => {
      if (filterApplicationId && d.application_id !== filterApplicationId) return false;
      if (activeCategory !== 'All' && d.category !== activeCategory) return false;
      if (activeStatus !== 'all' && d.status !== activeStatus) return false;
      return true;
    })
    // Phase 1.10: client-side sort. We sort on the already-filtered
    // set so the user sees a stable order. uploaded_at needs a
    // null guard (some rows may not have it).
    .slice()
    .sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'uploaded_at') {
        av = a.uploaded_at ?? '';
        bv = b.uploaded_at ?? '';
      } else if (sortKey === 'name') {
        av = a.name.toLowerCase();
        bv = b.name.toLowerCase();
      } else if (sortKey === 'status') {
        av = a.status;
        bv = b.status;
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortOrder === 'asc' ? cmp : -cmp;
    });

  // Available document types in the picker — by current category
  const availableDocTypes = documentTypes.filter((dt) => dt.category === pickerCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('studentDocs.title')}</h1>
          <p className="text-[#4B5563] mt-1">{t('studentDocs.subtitle')}</p>
        </div>
        <Button
          variant="default"
          onClick={() => setShowUploadPanel((s) => !s)}
          className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
        >
          <Upload className="mr-2 h-4 w-4" />
          {showUploadPanel ? t('common.close') : t('studentDocs.upload')}
        </Button>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      {showUploadPanel && (
        <Card className="rounded-none border-[#1B2A4A]/30">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">{t('studentDocs.uploadNewTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={pickerCategory === c ? 'default' : 'outline'}
                  onClick={() => setPickerCategory(c as DocumentCategory)}
                  className="rounded-none"
                >
                  {c}
                </Button>
              ))}
            </div>

            {availableDocTypes.length === 0 ? (
              <p className="text-sm text-[#4B5563]">{t('studentDocs.noDocTypesInCategory')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableDocTypes.map((dt) => (
                  <DocumentUploader
                    key={dt.id}
                    documentTypeId={dt.id}
                    documentName={dt.name}
                    documentNameCn={undefined}
                    category={pickerCategory as DocCat}
                    onUploaded={(doc) => {
                      handleUploaded(doc);
                      // Don't auto-close — let the user upload several
                    }}
                    compact
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            className="rounded-none"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
        {filterApplicationId && (
          <Link
            href="/student/documents"
            className="ml-2 inline-flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-800 px-2.5 py-1 text-xs font-semibold rounded-none hover:bg-amber-100"
            title={t('studentDocs.filteredToApp')}
          >
            <X className="h-3 w-3" />
            {filteredApplication
              ? t('studentDocs.filteredToAppUniversity', { university: filteredApplication.university ?? filteredApplication.id.slice(0, 8) })
              : t('studentDocs.filteredToApp')}
          </Link>
        )}
      </div>

      {/* Phase 1.10: status filter + sort dropdowns. Sit on a second
          row so the category chips stay readable. Both are
          client-side and combine freely with the category chip. */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Label className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
          {t('common.status')}:
        </Label>
        <Select value={activeStatus} onValueChange={(v) => setActiveStatus(v as typeof activeStatus)}>
          <SelectTrigger className="w-[140px] rounded-none h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="all">{t('studentDocs.statusAll')}</SelectItem>
            <SelectItem value="Pending">{t('studentDocs.statusPending')}</SelectItem>
            <SelectItem value="Uploaded">{t('studentDocs.statusUploaded')}</SelectItem>
            <SelectItem value="Verified">{t('studentDocs.statusVerified')}</SelectItem>
            <SelectItem value="Rejected">{t('studentDocs.statusRejected')}</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-[#4B5563] mx-1">·</span>
        <Label className="text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
          {t('studentDocs.sortBy')}:
        </Label>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as typeof sortKey)}>
          <SelectTrigger className="w-[160px] rounded-none h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="uploaded_at">{t('studentDocs.sortByDate')}</SelectItem>
            <SelectItem value="name">{t('studentDocs.sortByName')}</SelectItem>
            <SelectItem value="status">{t('studentDocs.sortByStatus')}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          className="rounded-none h-8"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          title={t('studentDocs.toggleSortOrder')}
        >
          {sortOrder === 'desc' ? '↓' : '↑'}
        </Button>
      </div>

      <div className="space-y-4">
        {filteredDocuments.map((doc) => {
          // Phase S20: find the linked application (if any) so we
          // can show a quick link and let the user re-link from
          // here. Documents uploaded before the wizard existed —
          // or before an application existed — land here as
          // orphans with application_id = null.
          const linkedApp = doc.application_id
            ? applications.find((a) => a.id === doc.application_id)
            : null;
          const isLinking = linkingId === doc.id;
          return (
            <Card key={doc.id} className="rounded-none">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="bg-[#1B2A4A]/10 p-3 rounded-none">
                    <FileText className="h-6 w-6 text-[#1B2A4A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium text-[#1B2A4A]">{doc.name}</h3>
                      {getStatusBadge(doc.status)}
                      {/* Phase S20: "Linked to" badge — green if linked
                          to an app, gold/orange if orphan. Helps the
                          student spot floating docs that need
                          attention before submission. */}
                      {linkedApp ? (
                        <Link
                          href={`/student/applications/${linkedApp.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-none hover:bg-green-100"
                          title={t('studentDocs.openApp')}
                        >
                          <FileCheck className="h-3 w-3" />
                          {t('studentDocs.linkedTo', { app: linkedApp.university })}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-none"
                          title={t('studentDocs.unlinkedTitle')}
                        >
                          <Link2 className="h-3 w-3" />
                          {t('studentDocs.unlinked')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#4B5563] mt-1">
                      {doc.category}
                      {doc.file_size ? ` • ${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                      {doc.file_name ? ` • ${doc.file_name}` : ''}
                    </p>
                    {doc.uploaded_at && (
                      <p className="text-xs text-[#4B5563] mt-1">
                        {t('studentDocs.uploadedLabel')} {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    )}
                    {doc.status === 'Rejected' && doc.rejection_reason && (
                      <p className="text-sm text-red-700 mt-2 bg-red-50 border border-red-200 px-2 py-1 rounded-none">
                        <span className="font-semibold">{t('studentDocs.rejectedLabel')}</span>{' '}
                        {doc.rejection_reason}
                      </p>
                    )}

                    {/* Phase S20: re-link dropdown. Lets the user
                        retroactively attach an orphan doc to an
                        app, or move a doc from one app to another. */}
                    {applications.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Label
                          htmlFor={`link-${doc.id}`}
                          className="text-xs text-[#4B5563] font-normal"
                        >
                          {linkedApp ? t('studentDocs.moveToLabel') : t('studentDocs.linkTo')}
                        </Label>
                        <Select
                          value={doc.application_id ?? 'none'}
                          onValueChange={(value) =>
                            handleLinkDoc(
                              doc.id,
                              value === 'none' ? null : value,
                            )
                          }
                          disabled={isLinking}
                        >
                          <SelectTrigger
                            id={`link-${doc.id}`}
                            className="h-8 text-xs rounded-none min-w-[200px]"
                          >
                            <SelectValue placeholder={t('studentDocs.unlinkedValue')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              {t('studentDocs.unlinkedDesc')}
                            </SelectItem>
                            {applications.map((a) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.university} · {a.program}
                                {a.applicationNumber ? ` · ${a.applicationNumber}` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isLinking && (
                          <span className="text-xs text-gray-500">{t('studentDocs.savingEllipsis')}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getStatusIcon(doc.status)}
                    {doc.file_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPreview(doc)}
                        className="rounded-none"
                        aria-label={t('studentDocs.preview')}
                        title={t('studentDocs.preview')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {doc.file_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="rounded-none"
                        aria-label={t('studentDocs.download')}
                        title={t('studentDocs.download')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {doc.status === 'Rejected' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReuploadId(reuploadId === doc.id ? null : doc.id)}
                        className="rounded-none text-amber-700 hover:text-amber-900"
                        aria-label={t('studentDocs.reupload')}
                        title={t('studentDocs.reupload')}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocToDelete(doc)}
                      className="rounded-none text-red-600 hover:text-red-800"
                      aria-label={t('studentDocs.delete')}
                      title={t('studentDocs.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && !error && (
        <Card className="rounded-none">
          <CardContent className="p-12 text-center">
            <FileUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1B2A4A] mb-2">{t('studentDocs.empty')}</h3>
            <p className="text-[#4B5563] mb-6">{t('studentDocs.emptyCta')}</p>
            <Button
              onClick={() => setShowUploadPanel(true)}
              className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
            >
              <Upload className="mr-2 h-4 w-4" />
              {t('studentDocs.upload')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Phase 4C: inline re-upload panel for rejected docs. */}
      {reuploadId && (() => {
        const doc = documents.find((d) => d.id === reuploadId);
        if (!doc || !doc.document_type_id) return null;
        const docType = documentTypes.find((dt) => dt.id === doc.document_type_id);
        return (
          <Card className="rounded-none border-amber-300 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-base text-[#1B2A4A]">
                {t('studentDocs.reuploadTitle', { name: doc.name })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUploader
                documentTypeId={doc.document_type_id}
                documentName={docType?.name || doc.name}
                category={(doc.category as DocCat) || 'Other'}
                onUploaded={(uploaded) => handleReuploaded(doc, uploaded)}
                compact
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReuploadId(null)}
                className="mt-3 rounded-none"
              >
                {t('common.cancel')}
              </Button>
            </CardContent>
          </Card>
        );
      })()}

      {/* Phase 4C: preview dialog. */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl rounded-none">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">
              {previewDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            {!previewUrl && (
              <div className="h-64 flex items-center justify-center text-gray-500">
                {t('studentDocs.previewLoading')}
              </div>
            )}
            {previewUrl && previewDoc?.file_type?.startsWith('image/') && (
              <img
                src={previewUrl}
                alt={previewDoc.name}
                className="max-h-[70vh] w-auto mx-auto border"
              />
            )}
            {previewUrl && previewDoc?.file_type === 'application/pdf' && (
              <iframe
                src={previewUrl}
                title={previewDoc.name}
                className="w-full h-[70vh] border"
              />
            )}
            {previewUrl && previewDoc?.file_type &&
              !previewDoc.file_type.startsWith('image/') &&
              previewDoc.file_type !== 'application/pdf' && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">{t('studentDocs.previewUnsupported')}</p>
                <Button onClick={() => previewDoc && handleDownload(previewDoc)}>
                  {t('studentDocs.download')}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Phase 4C: styled delete confirmation. */}
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#1B2A4A]">{t('studentDocs.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('studentDocs.deleteConfirmBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-none"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
