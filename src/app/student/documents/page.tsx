'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, FileUp, Upload, CheckCircle2, Clock, XCircle, Trash2, Link2, ExternalLink, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetchJson } from '@/lib/api-client';
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
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'All' | DocumentCategory>('All');
  const [documents, setDocuments] = useState<DbStudentDocument[]>([]);
  // Phase S20: fetch the student's applications so each doc row
  // can show its "Linked to" app + offer a re-link dropdown.
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Per-doc re-link state. We track which doc is currently being
  // re-linked so the dropdown can show a "saving…" affordance.
  const [linkingId, setLinkingId] = useState<string | null>(null);

  // Upload panel state
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<DocumentCategory>('Identity');

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
      setError(err instanceof Error ? err.message : 'Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

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
      setError(err instanceof Error ? err.message : 'Failed to link document.');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/student/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Delete failed (HTTP ${res.status})`);
      }
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  const handleDownload = async (doc: DbStudentDocument) => {
    if (!doc.file_url) return;
    try {
      const { downloadUrl } = await createStudentDocDownloadUrl(doc.file_url);
      if (!downloadUrl) throw new Error('Could not generate download URL');
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      'Pending': { variant: 'outline', label: 'Pending' },
      'Verified': { variant: 'default', label: 'Verified' },
      'Rejected': { variant: 'destructive', label: 'Rejected' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant} className="rounded-none">{config.label}</Badge>;
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

  const filteredDocuments = activeCategory === 'All'
    ? documents
    : documents.filter(d => d.category === activeCategory);

  // Available document types in the picker — by current category
  const availableDocTypes = documentTypes.filter((dt) => dt.category === pickerCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">My Documents</h1>
          <p className="text-[#4B5563] mt-1">Upload and manage your application documents</p>
        </div>
        <Button
          variant="default"
          onClick={() => setShowUploadPanel((s) => !s)}
          className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
        >
          <Upload className="mr-2 h-4 w-4" />
          {showUploadPanel ? 'Close' : 'Upload Document'}
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
            <CardTitle className="text-[#1B2A4A] text-base">Upload a new document</CardTitle>
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
              <p className="text-sm text-[#4B5563]">No document types in this category.</p>
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

      <div className="flex flex-wrap gap-2">
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
                          title="Open this application"
                        >
                          <FileCheck className="h-3 w-3" />
                          Linked to {linkedApp.university}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-none"
                          title="This document isn't linked to any application yet"
                        >
                          <Link2 className="h-3 w-3" />
                          Unlinked
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
                        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
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
                          {linkedApp ? 'Move to:' : 'Link to:'}
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
                            <SelectValue placeholder="(unlinked)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              (unlinked — not attached to any app)
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
                          <span className="text-xs text-gray-500">Saving…</span>
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
                        onClick={() => handleDownload(doc)}
                        className="rounded-none"
                        title="Download"
                      >
                        Download
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doc.id)}
                      className="rounded-none text-red-600 hover:text-red-800"
                      title="Delete"
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
            <h3 className="text-lg font-medium text-[#1B2A4A] mb-2">No documents yet</h3>
            <p className="text-[#4B5563] mb-6">Upload your first document to get started</p>
            <Button
              onClick={() => setShowUploadPanel(true)}
              className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
