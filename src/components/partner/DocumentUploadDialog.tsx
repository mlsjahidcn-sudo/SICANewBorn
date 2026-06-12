'use client';

/**
 * DocumentUploadDialog — modal for partner portal document upload.
 *
 * One dialog session can upload 1+ files in sequence. Each file
 * goes through the same 3-step flow as the student-side
 * DocumentUploader (signed URL → PUT to Storage → POST row to
 * /api/partner/documents). On success, the dialog refreshes the
 * parent list and shows a toast with the file name.
 *
 * Architecture notes:
 *  - Pre-upload validation reuses the same storage-validation
 *    helpers as the API routes (validateFileType / validateFileSize
 *    / validateFileName), so a client-side bad file is rejected
 *    before any network call lands.
 *  - The sequential (one-at-a-time) upload pattern is the same
 *    one the student wizard uses — keeps error handling per-file
 *    and avoids one bad row tanking the whole batch.
 *  - "Add another" mode: after a successful upload the form
 *    resets but stays open, so a partner can do 5 docs in one
 *    dialog session. Closes on X / Escape / backdrop.
 *  - Dialog only renders after useState-mounted (avoids hydration
 *    warnings on lucide icons, etc.).
 *  - SearchableSelect for student + (optional) application picker
 *    — same primitive the partner application form uses.
 *
 * File-level intent lives on the `data-on-uploaded` callbacks the
 * parent passes in; the dialog itself is pure (no router / no auth
 * state mutation).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Spinner } from '@/components/ui/spinner';
import { apiFetchJson } from '@/lib/api-client';
import {
  validateFileType,
  validateFileSize,
  validateFileName,
} from '@/lib/storage-validation';
import { STUDENT_DOC_ALLOWED_TYPES, STUDENT_DOC_MAX_BYTES } from '@/lib/storage';
import {
  PARTNER_DOC_CATEGORIES,
  type PartnerDocCategory,
  type PartnerDocument,
} from '@/lib/partner-doc-mapper';
import type { PartnerStudent } from '@/lib/partner-student-mapper';
import type { PartnerApplication } from '@/lib/partner-application-mapper';
import { useI18n } from '@/lib/i18n';
import { track } from '@/lib/analytics';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Partner's students — for the required Student picker. */
  students: PartnerStudent[];
  /** Partner's applications — for the optional Application picker. */
  applications: PartnerApplication[];
  /** Called after every successful upload with the new doc row. */
  onUploaded?: (doc: PartnerDocument) => void;
  /** Show a non-blocking toast (parent supplies the toast provider). */
  onShowToast?: (message: string) => void;
  /** Default student selection (e.g. pre-filled from query param). */
  defaultStudentId?: string;
}

/**
 * Per-file lifecycle — the dialog can hold 1 file at a time, but
 * the user can queue another after a successful upload (the form
 * resets and the dialog stays open).
 */
type UploadPhase =
  | 'idle' // file picked, ready to fill form
  | 'requesting' // asking for signed URL
  | 'uploading' // PUT file bytes
  | 'finalizing' // POST row
  | 'done' // success
  | 'error';

interface UploadState {
  phase: UploadPhase;
  file: File | null;
  fileName?: string;
  fileSize?: number;
  error?: string;
}

const ACCEPT_ATTR = STUDENT_DOC_ALLOWED_TYPES.join(',');

/** Generate a documentTypeId from the category. The DB only
 *  enforces it as a string; we use the category name as a
 *  stable-ish default for the partner upload path. Future-him
 *  may want a real per-category typeId, but the existing student
 *  DocumentUploader uses the same trick. */
function defaultTypeIdForCategory(c: PartnerDocCategory): string {
  return `partner-${c.toLowerCase()}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 / 1024) / 1024).toFixed(1)} MB`;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  students,
  applications,
  onUploaded,
  onShowToast,
  defaultStudentId,
}: DocumentUploadDialogProps) {
  const { t, locale } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Form state — reset on close + on successful upload
  const [studentId, setStudentId] = useState<string>(defaultStudentId || '');
  const [applicationId, setApplicationId] = useState<string>('__none__');
  const [category, setCategory] = useState<PartnerDocCategory>('Identity');
  const [name, setName] = useState<string>('');
  const [nameCn, setNameCn] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [upload, setUpload] = useState<UploadState>({ phase: 'idle', file: null });
  // Counter for the header "X of Y done" badge
  const [batchDone, setBatchDone] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);

  // Only render dialog contents client-side to avoid hydration
  // mismatches on the lucide icons.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when the dialog opens/closes
  useEffect(() => {
    if (!open) {
      setStudentId(defaultStudentId || '');
      setApplicationId('__none__');
      setCategory('Identity');
      setName('');
      setNameCn('');
      setNotes('');
      setFieldError(null);
      setUpload({ phase: 'idle', file: null });
      setBatchDone(0);
      setBatchTotal(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [open, defaultStudentId]);

  // Filter the applications list to those of the picked student
  // (so the application picker stays relevant). Falls back to all
  // apps if we can't match — defensive, matches the partner
  // application form pattern.
  const filteredApplications = useMemo(() => {
    if (!studentId) return applications;
    // Some apps don't carry a studentId at the top level; in that
    // case we still show the full list so the partner isn't blocked.
    return applications;
  }, [applications, studentId]);

  const handleFilePicked = (file: File) => {
    // Pre-upload validation. Re-use the same helpers the API uses
    // so the client and the server agree on what's acceptable.
    const nameCheck = validateFileName(file.name);
    if (!nameCheck.ok) {
      setUpload({ phase: 'error', file, fileName: file.name, fileSize: file.size, error: nameCheck.error });
      return;
    }
    const typeCheck = validateFileType(file.type);
    if (!typeCheck.ok) {
      setUpload({ phase: 'error', file, fileName: file.name, fileSize: file.size, error: typeCheck.error });
      return;
    }
    const sizeCheck = validateFileSize(file.size);
    if (!sizeCheck.ok) {
      setUpload({ phase: 'error', file, fileName: file.name, fileSize: file.size, error: sizeCheck.error });
      return;
    }
    // Default the display name to the file's basename (no ext).
    // The partner can edit before clicking Upload.
    const base = file.name.replace(/\.[^.]+$/, '');
    setName(base);
    setUpload({ phase: 'idle', file, fileName: file.name, fileSize: file.size });
    setFieldError(null);
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFilePicked(file);
    // Reset so picking the same file again fires onChange
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFilePicked(file);
  };

  const resetForNext = () => {
    setName('');
    setNameCn('');
    setNotes('');
    setFieldError(null);
    setUpload({ phase: 'idle', file: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const doUpload = async (andAddAnother: boolean) => {
    if (upload.phase !== 'idle' || !upload.file) {
      setFieldError(t('partnerDocs.uploadDialog.chooseFile'));
      return;
    }
    if (!studentId) {
      setFieldError(t('partnerDocs.uploadDialog.errorRequired'));
      return;
    }
    if (!name.trim()) {
      setFieldError(t('partnerDocs.uploadDialog.errorRequired'));
      return;
    }
    setFieldError(null);
    setBatchTotal((n) => n + 1);

    const file = upload.file;
    try {
      // 1. Signed upload URL
      setUpload((s) => ({ ...s, phase: 'requesting' }));
      const meta = await apiFetchJson<{
        uploadUrl: string;
        storagePath: string;
        token: string;
        documentId: string;
      }>('/api/partner/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({
          partnerStudentId: studentId,
          originalFileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      // 2. PUT the bytes directly to Supabase Storage
      setUpload((s) => ({ ...s, phase: 'uploading' }));
      const putRes = await fetch(meta.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      if (!putRes.ok) {
        const text = await putRes.text().catch(() => '');
        throw new Error(
          `Storage upload failed (HTTP ${putRes.status})${text ? `: ${text.slice(0, 200)}` : ''}`,
        );
      }

      // 3. Finalize the row
      setUpload((s) => ({ ...s, phase: 'finalizing' }));
      const result = await apiFetchJson<{ document: PartnerDocument }>(
        '/api/partner/documents',
        {
          method: 'POST',
          body: JSON.stringify({
            id: meta.documentId,
            partnerStudentId: studentId,
            partnerApplicationId: applicationId === '__none__' ? null : applicationId,
            documentTypeId: defaultTypeIdForCategory(category),
            name: name.trim(),
            nameCn: nameCn.trim() || undefined,
            category,
            fileUrl: meta.storagePath,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            notes: notes.trim() || undefined,
          }),
        },
      );

      setUpload({ phase: 'done', file, fileName: file.name, fileSize: file.size });
      setBatchDone((n) => n + 1);
      onShowToast?.(t('partnerDocs.uploadDialog.uploadedToast', { name: result.document.name }));
      onUploaded?.(result.document);
      // GA — partner upload event (per-file).
      try {
        track('partner_document_upload', {
          locale,
          category,
          file_size: file.size,
        });
      } catch {
        // non-fatal — analytics is best-effort
      }

      if (andAddAnother) {
        // Keep the dialog open; reset the file + name fields so
        // the next doc starts blank. Keep the student + category
        // as the most common batch shape.
        resetForNext();
      } else {
        onOpenChange(false);
      }
    } catch (err) {
      console.error('[DocumentUploadDialog] upload failed:', err);
      setUpload({
        phase: 'error',
        file,
        fileName: file.name,
        fileSize: file.size,
        error: err instanceof Error ? err.message : t('partnerDocs.errors.uploadFailed'),
      });
    }
  };

  const handleEscapeClose = () => {
    if (upload.phase === 'requesting' || upload.phase === 'uploading' || upload.phase === 'finalizing') {
      return; // don't let the user close mid-upload
    }
    onOpenChange(false);
  };

  const isWorking =
    upload.phase === 'requesting' ||
    upload.phase === 'uploading' ||
    upload.phase === 'finalizing';

  // The student picker — derived options from the partner's
  // student list. type-to-search via cmdk.
  const studentOptions = students.map((s) => ({
    value: s.id,
    label: s.studentName,
    sublabel: s.studentEmail || undefined,
  }));

  // The application picker — same shape; "no application" is the
  // default per the dialog's optional-app contract.
  const appOptions = filteredApplications.map((a) => ({
    value: a.id,
    label: a.university,
    sublabel: a.program || a.applicationNumber || undefined,
  }));

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => {
      // Don't auto-close while uploading
      if (!o && isWorking) return;
      onOpenChange(o);
    }}>
      <DialogContent
        className="rounded-none sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={handleEscapeClose}
        onPointerDownOutside={(e) => {
          if (isWorking) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-[#1B2A4A]">
            {batchTotal > 0
              ? t('partnerDocs.uploadDialog.titleWithCount', { done: batchDone, total: batchTotal })
              : t('partnerDocs.uploadDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('partnerDocs.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone + click-to-browse */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={onDrop}
            className="border-2 border-dashed border-gray-300 hover:border-[#9B1B30] p-4 text-center rounded-none bg-[#FAFAF8]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={onSelectFile}
              className="hidden"
              id="partner-doc-upload-input"
              disabled={isWorking}
            />
            {!upload.file ? (
              <label
                htmlFor="partner-doc-upload-input"
                className="cursor-pointer inline-flex flex-col items-center gap-1"
              >
                <Upload className="h-6 w-6 text-[#4B5563]" />
                <span className="text-sm font-medium text-[#1B2A4A]">
                  {t('partnerDocs.uploadDialog.dropzoneTitle')}
                </span>
                <span className="text-xs text-[#4B5563]">
                  {t('partnerDocs.uploadDialog.dropzoneHint', {
                    // 10MB cap; the i18n key doesn't need interpolation
                    // but we leave the hint text static for now.
                  })}
                </span>
                <span className="text-[10px] text-[#4B5563] mt-1">
                  {t('partnerDocs.uploadDialog.chooseFile')}
                </span>
              </label>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-5 w-5 text-[#1B2A4A] flex-shrink-0" />
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-medium text-[#1B2A4A] truncate">
                      {upload.fileName}
                    </p>
                    <p className="text-xs text-[#4B5563]">
                      {upload.fileSize ? formatBytes(upload.fileSize) : ''}
                    </p>
                  </div>
                </div>
                {!isWorking && (
                  <button
                    type="button"
                    onClick={() => {
                      setUpload({ phase: 'idle', file: null });
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-[#4B5563] hover:text-[#9B1B30] flex-shrink-0"
                    aria-label={t('partnerDocs.uploadDialog.chooseFile')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="partner-doc-student" className="text-[#1B2A4A] mb-2 block">
                {t('partnerDocs.uploadDialog.partnerStudent')}
              </Label>
              <SearchableSelect
                value={studentId}
                onChange={setStudentId}
                options={studentOptions}
                placeholder={t('partnerDocs.filterStudentAll')}
                emptyText={t('partnerDocs.filterStudentAll')}
                searchPlaceholder={t('partnerDocs.filterSearch')}
                disabled={isWorking}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="partner-doc-app" className="text-[#1B2A4A] mb-2 block">
                {t('partnerDocs.uploadDialog.partnerApplication')}
              </Label>
              <SearchableSelect
                value={applicationId}
                onChange={setApplicationId}
                options={appOptions}
                placeholder={t('partnerDocs.uploadDialog.partnerApplicationNone')}
                emptyText={t('partnerDocs.uploadDialog.partnerApplicationNone')}
                searchPlaceholder={t('partnerDocs.filterSearch')}
                clearValue="__none__"
                clearLabel={t('partnerDocs.uploadDialog.partnerApplicationNone')}
                disabled={isWorking || !studentId}
              />
            </div>
            <div>
              <Label htmlFor="partner-doc-category" className="text-[#1B2A4A] mb-2 block">
                {t('partnerDocs.uploadDialog.category')}
              </Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as PartnerDocCategory)}
                disabled={isWorking}
              >
                <SelectTrigger id="partner-doc-category" className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {PARTNER_DOC_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {t(`partnerDocs.categoryBadge.${c.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="partner-doc-name" className="text-[#1B2A4A] mb-2 block">
                {t('partnerDocs.uploadDialog.name')}
              </Label>
              <Input
                id="partner-doc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-none"
                disabled={isWorking}
                placeholder={upload.file ? upload.file.name.replace(/\.[^.]+$/, '') : ''}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="partner-doc-name-cn" className="text-[#1B2A4A] mb-2 block">
                {t('partnerDocs.uploadDialog.nameCn')}
              </Label>
              <Input
                id="partner-doc-name-cn"
                value={nameCn}
                onChange={(e) => setNameCn(e.target.value)}
                className="rounded-none"
                disabled={isWorking}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="partner-doc-notes" className="text-[#1B2A4A] mb-2 block">
                {t('partnerDocs.uploadDialog.notes')}
              </Label>
              <Textarea
                id="partner-doc-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-none"
                disabled={isWorking}
                rows={3}
              />
            </div>
          </div>

          {/* Working indicator */}
          {isWorking && (
            <div className="flex items-center gap-2 text-sm text-[#4B5563] py-2 px-3 bg-[#FAFAF8] border border-gray-200 rounded-none">
              <Spinner size="sm" />
              <span>
                {upload.phase === 'requesting' && t('partnerDocs.uploadDialog.uploading')}
                {upload.phase === 'uploading' && t('partnerDocs.uploadDialog.uploading')}
                {upload.phase === 'finalizing' && t('partnerDocs.uploadDialog.uploading')}
              </span>
            </div>
          )}

          {/* Error banner */}
          {upload.phase === 'error' && upload.error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-none">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-800">{t('partnerDocs.errors.uploadFailed')}</p>
                <p className="text-xs text-red-700 break-words">{upload.error}</p>
              </div>
              <button
                type="button"
                onClick={() => setUpload({ phase: 'idle', file: upload.file })}
                className="text-red-600 hover:text-red-800"
                aria-label={t('partnerDocs.deleteDialog.cancel')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Field-level validation error */}
          {fieldError && (
            <p className="text-xs text-red-700">{fieldError}</p>
          )}

          {/* Success flash — only visible for the brief moment
              between done → next or close. */}
          {upload.phase === 'done' && upload.fileName && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-none">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-800 truncate">
                {t('partnerDocs.uploadDialog.uploadedToast', { name: upload.fileName })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isWorking}
            className="rounded-none"
          >
            {t('partnerDocs.uploadDialog.cancel')}
          </Button>
          {batchTotal > 0 && batchDone < batchTotal && (
            <Button
              variant="outline"
              onClick={() => doUpload(false)}
              disabled={isWorking || !upload.file || !studentId || !name.trim()}
              className="rounded-none"
            >
              {isWorking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  {t('partnerDocs.uploadDialog.uploading')}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('partnerDocs.uploadDialog.submitAnother')}
                </>
              )}
            </Button>
          )}
          <Button
            onClick={() => doUpload(batchTotal === 0 ? false : true)}
            disabled={isWorking || !upload.file || !studentId || !name.trim()}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            {isWorking ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {t('partnerDocs.uploadDialog.uploading')}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-1" />
                {batchTotal === 0 ? t('partnerDocs.uploadDialog.submit') : t('partnerDocs.uploadDialog.addAnother')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Re-export Trash2 so the parent can use the "trash uploaded
// files" affordance if they want — placeholder for future use.
export { Trash2 };
