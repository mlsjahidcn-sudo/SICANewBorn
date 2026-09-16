'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { apiFetch, apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import {
  STUDENT_DOC_CATEGORIES,
  type StudentDocCategory,
} from '@/lib/admin-document-categories';
import {
  STUDENT_DOC_ALLOWED_TYPES,
  STUDENT_DOC_MAX_BYTES,
} from '@/lib/storage';

export interface AdminDocUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  applicationId?: string | null;
  /**
   * Called with the new document row after a successful upload.
   * The wizard uses this to append the new doc to its local state
   * + add the id to `selectedDocuments` so the new doc auto-links
   * to the freshly-created application in the Phase 18
   * Promise.allSettled block.
   */
  onUploaded: (document: { id: string; name: string; fileName?: string }) => void;
}

interface DocumentRow {
  id: string;
  student_id: string;
  application_id: string | null;
  name: string;
  file_name?: string;
  status: string;
  category: StudentDocCategory;
  file_url: string;
}

export function AdminDocUploadDialog({
  open,
  onOpenChange,
  studentId,
  applicationId,
  onUploaded,
}: AdminDocUploadDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [nameCn, setNameCn] = useState('');
  const [category, setCategory] = useState<StudentDocCategory>('Other');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setName('');
    setNameCn('');
    setCategory('Other');
    setFile(null);
    setNotes('');
    setError(null);
    setSuccess(null);
  };

  const handleClose = (next: boolean) => {
    if (submitting) return; // don't let the user close mid-upload
    reset();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !file) {
      setError(t('adminAppUpload.errorMissingFields'));
      return;
    }
    if (file.size > STUDENT_DOC_MAX_BYTES) {
      setError(t('adminAppUpload.errorTooLarge'));
      return;
    }
    // Client-side MIME allow-list check. The server re-validates so
    // this is just a friendlier error message.
    if (
      !(STUDENT_DOC_ALLOWED_TYPES as readonly string[]).includes(file.type)
    ) {
      setError(t('adminAppUpload.errorBadType'));
      return;
    }

    setSubmitting(true);
    try {
      // Step 1: mint signed upload URL.
      const minted = await apiFetchJson<{
        uploadUrl: string;
        storagePath: string;
        token: string;
        documentId: string;
        studentId: string;
      }>('/api/admin/documents/upload-url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          studentId,
        }),
      });

      // Step 2: PUT the file bytes to the signed URL.
      const putRes = await fetch(minted.uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type },
        body: file,
      });
      if (!putRes.ok) {
        throw new Error(`Upload failed (HTTP ${putRes.status})`);
      }

      // Step 3: create the student_documents row.
      const result = await apiFetchJson<{ document: DocumentRow }>(
        '/api/admin/documents',
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            studentId,
            applicationId: applicationId ?? null,
            name: name.trim(),
            nameCn: nameCn.trim() || null,
            category,
            fileUrl: minted.storagePath,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            notes: notes.trim() || null,
          }),
        },
      );

      setSuccess(t('adminAppUpload.success'));
      onUploaded({
        id: result.document.id,
        name: result.document.name,
        fileName: result.document.file_name,
      });
      // Brief success banner before auto-closing.
      setTimeout(() => {
        handleClose(false);
      }, 600);
    } catch (err) {
      // Best-effort: don't leak the file bytes back through state.
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('adminAppUpload.title')}</DialogTitle>
          <DialogDescription>
            {studentId ? (
              <span className="text-xs text-gray-500">
                student_id = <code>{studentId.slice(0, 8)}…</code>
              </span>
            ) : (
              <span className="text-xs text-red-600">
                {t('adminAppUpload.errorLeadDisabled')}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('adminAppUpload.fieldName')}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('adminAppUpload.fieldNamePlaceholder')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('adminAppUpload.fieldNameCn')}
            </label>
            <Input
              value={nameCn}
              onChange={(e) => setNameCn(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('adminAppUpload.fieldCategory')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as StudentDocCategory)}
              className="h-10 w-full px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              {STUDENT_DOC_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('adminAppUpload.fieldFile')}
            </label>
            <Input
              type="file"
              accept={STUDENT_DOC_ALLOWED_TYPES.join(',')}
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setError(null);
              }}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('adminAppUpload.fieldFileHint')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('adminAppUpload.fieldNotes')}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-16 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
              rows={2}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {success}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
              disabled={submitting || !studentId}
            >
              <Upload className="h-4 w-4 mr-2" />
              {submitting
                ? t('adminAppUpload.uploading')
                : t('adminAppUpload.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}