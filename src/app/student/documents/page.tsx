'use client';

import { useState, useEffect } from 'react';
import { FileText, FileUp, Upload, CheckCircle2, Clock, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiFetchJson } from '@/lib/api-client';
import { documentTypes, DocumentCategory } from '@/lib/student-data';
import { DocumentUploader, DocumentCategory as DocCat, UploadedDocument } from '@/components/student/DocumentUploader';
import { createStudentDocDownloadUrl } from '@/lib/storage-client';

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
  const [error, setError] = useState<string | null>(null);

  // Upload panel state
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [pickerCategory, setPickerCategory] = useState<DocumentCategory>('Identity');

  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ data: DbStudentDocument[] }>(
        '/api/student/documents',
      );
      setDocuments(res.data || []);
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

  const handleUploaded = (doc: UploadedDocument) => {
    // Optimistic prepend so the doc appears immediately
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
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="rounded-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#1B2A4A]/10 p-3 rounded-none">
                  <FileText className="h-6 w-6 text-[#1B2A4A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-medium text-[#1B2A4A]">{doc.name}</h3>
                    {getStatusBadge(doc.status)}
                  </div>
                  <p className="text-sm text-[#4B5563]">
                    {doc.category}
                    {doc.file_size ? ` • ${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                    {doc.file_name ? ` • ${doc.file_name}` : ''}
                  </p>
                  {doc.uploaded_at && (
                    <p className="text-xs text-[#4B5563] mt-1">
                      Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
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
        ))}
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
