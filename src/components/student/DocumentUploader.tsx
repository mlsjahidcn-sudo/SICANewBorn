'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
import { STUDENT_DOC_ALLOWED_TYPES, STUDENT_DOC_MAX_BYTES } from '@/lib/storage';

export type DocumentCategory =
  | 'Identity'
  | 'Academic'
  | 'Language'
  | 'Financial'
  | 'Recommendation'
  | 'Other';

export interface UploadedDocument {
  id: string;
  documentTypeId: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  status: string;
  storagePath: string;
}

interface DocumentUploaderProps {
  documentTypeId: string;
  documentName: string;
  documentNameCn?: string;
  category: DocumentCategory;
  applicationId?: string;
  /** Called after a successful upload with the new document row */
  onUploaded?: (doc: UploadedDocument) => void;
  /** Optional compact mode — hides the help text */
  compact?: boolean;
}

interface UploadState {
  status: 'idle' | 'requesting' | 'uploading' | 'finalizing' | 'done' | 'error';
  error?: string;
  fileName?: string;
  fileSize?: number;
}

const ACCEPT_ATTR = STUDENT_DOC_ALLOWED_TYPES.join(',');

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentUploader({
  documentTypeId,
  documentName,
  documentNameCn,
  category,
  applicationId,
  onUploaded,
  compact = false,
}: DocumentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    setState({ status: 'requesting', fileName: file.name, fileSize: file.size });

    try {
      // 1. Ask the server for a signed upload URL
      const uploadMeta = await apiFetchJson<{
        uploadUrl: string;
        storagePath: string;
        token: string;
        documentId: string;
      }>('/api/student/documents/upload-url', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      setState((s) => ({ ...s, status: 'uploading' }));

      // 2. PUT the file bytes directly to Supabase Storage
      const putRes = await fetch(uploadMeta.uploadUrl, {
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

      setState((s) => ({ ...s, status: 'finalizing' }));

      // 3. Finalize the student_documents row
      const finalized = await apiFetchJson<{ data: UploadedDocument }>(
        '/api/student/documents',
        {
          method: 'POST',
          body: JSON.stringify({
            id: uploadMeta.documentId,
            documentTypeId,
            name: documentName,
            nameCn: documentNameCn,
            category,
            fileUrl: uploadMeta.storagePath,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            applicationId,
          }),
        },
      );

      setState({ status: 'done', fileName: file.name, fileSize: file.size });
      onUploaded?.(finalized.data);
    } catch (err) {
      console.error('[DocumentUploader] failed:', err);
      setState({
        status: 'error',
        fileName: file.name,
        fileSize: file.size,
        error: err instanceof Error ? err.message : 'Upload failed',
      });
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    // Reset the input so picking the same file again re-fires onChange
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const isWorking =
    state.status === 'requesting' ||
    state.status === 'uploading' ||
    state.status === 'finalizing';

  return (
    <Card
      className={`rounded-none border-dashed ${
        dragOver ? 'border-[#9B1B30] bg-red-50/30' : 'border-gray-300'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-[#1B2A4A]/10 p-2 rounded-none">
            <FileText className="h-4 w-4 text-[#1B2A4A]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1B2A4A]">{documentName}</p>
            {documentNameCn && (
              <p className="text-xs text-[#4B5563]">{documentNameCn}</p>
            )}
          </div>
        </div>

        {state.status === 'idle' && (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className="border-2 border-dashed border-gray-300 p-4 text-center rounded-none"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_ATTR}
                onChange={onSelectFile}
                className="hidden"
                id={`upload-${documentTypeId}`}
              />
              <label
                htmlFor={`upload-${documentTypeId}`}
                className="cursor-pointer inline-flex flex-col items-center gap-1"
              >
                <Upload className="h-5 w-5 text-[#4B5563]" />
                <span className="text-sm text-[#1B2A4A]">
                  Click to upload or drag & drop
                </span>
                {!compact && (
                  <span className="text-xs text-[#4B5563]">
                    PDF, PNG, JPG, WEBP, DOC, DOCX — max {STUDENT_DOC_MAX_BYTES / 1024 / 1024}MB
                  </span>
                )}
              </label>
            </div>
          </>
        )}

        {isWorking && (
          <div className="flex items-center gap-2 text-sm text-[#4B5563] py-2">
            <Spinner size="sm" />
            <span>
              {state.status === 'requesting' && 'Requesting upload URL…'}
              {state.status === 'uploading' && 'Uploading to storage…'}
              {state.status === 'finalizing' && 'Saving record…'}
            </span>
          </div>
        )}

        {state.status === 'done' && state.fileName && (
          <div className="flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-none">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-800 truncate">
                  {state.fileName}
                </p>
                <p className="text-xs text-green-700">
                  {state.fileSize ? formatBytes(state.fileSize) : ''} · Uploaded
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-none text-[#1B2A4A]"
            >
              Replace
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={onSelectFile}
              className="hidden"
            />
          </div>
        )}

        {state.status === 'error' && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-none">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-800">Upload failed</p>
                <p className="text-xs text-red-700 break-words">
                  {state.error || 'Unknown error'}
                </p>
              </div>
              <button
                onClick={() => setState({ status: 'idle' })}
                className="text-red-600 hover:text-red-800"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-none"
            >
              Try again
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_ATTR}
              onChange={onSelectFile}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
