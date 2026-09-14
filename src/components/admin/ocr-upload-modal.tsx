'use client';

/**
 * Phase 89: Admin OCR upload modal for passport + high-school transcript.
 *
 * Flow:
 *   1. Admin picks a file (drag-drop or click) — image or single-page PDF, ≤10MB
 *   2. POST /api/admin/students/ocr/upload-url → signed upload URL
 *   3. PUT the file directly to Supabase Storage
 *   4. POST /api/admin/students/ocr/extract (SSE) → parsed OCR fields + per-field confidence
 *   5. Show a preview table with confidence chips (green ≥0.7, yellow 0.4-0.7, red <0.4)
 *   6. onApply(result) — when existingFieldKeys is non-empty, confirm before overwriting
 *
 * Mirrors src/components/admin/ai-generate-modal.tsx in:
 *   - 4-state machine: 'idle' | 'extracting' | 'success' | 'error'
 *   - SSE stream parsing with cross-chunk line buffering
 *   - AbortController-based cancellation
 *   - Visual chrome (max-w-2xl overlay, crimson primary, outline cancel)
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Loader2, CheckCircle, AlertCircle, FileText, UploadCloud } from 'lucide-react';
import { apiFetch, apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
  OcrKind,
  OcrResult,
  PassportOcrResult,
  TranscriptOcrResult,
} from './ocr-result-types';
import {
  isValidFileType,
  isValidFileSize,
  formatFileSize,
  confidenceToTone,
  formatFieldLabel,
  OCR_MAX_BYTES,
} from '@/lib/admin-ocr-helpers';

export type { OcrKind, OcrResult, PassportOcrResult, TranscriptOcrResult };

export interface OcrUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: OcrKind;
  /** Field names already populated in the wizard form — used to gate the replace-confirm dialog. */
  existingFieldKeys: string[];
  onApply: (result: OcrResult) => void;
}

type Status = 'idle' | 'extracting' | 'success' | 'error';

interface UploadUrlResponse {
  uploadUrl: string;
  storagePath: string;
  documentId: string;
}

export function OcrUploadModal({
  open,
  onOpenChange,
  kind,
  existingFieldKeys,
  onApply,
}: OcrUploadModalProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<OcrResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset state whenever the modal opens so a stale preview from
  // a previous session doesn't leak in.
  useEffect(() => {
    if (open) {
      setStatus('idle');
      setFile(null);
      setProgress('');
      setErrorMsg('');
      setResult(null);
      setDragActive(false);
      setConfirmReplaceOpen(false);
    }
  }, [open]);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
    setFile(null);
    setProgress('');
    setErrorMsg('');
    setResult(null);
    setConfirmReplaceOpen(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleFilePicked = useCallback((picked: File | null) => {
    if (!picked) return;
    if (!isValidFileType(picked.type)) {
      setErrorMsg(t('adminStudentOcr.errorUnsupportedFormat'));
      setFile(null);
      return;
    }
    if (!isValidFileSize(picked.size)) {
      setErrorMsg(t('adminStudentOcr.errorTooLarge'));
      setFile(null);
      return;
    }
    setErrorMsg('');
    setResult(null);
    setFile(picked);
  }, [t]);

  const handleExtract = async () => {
    if (!file) return;
    abortRef.current = new AbortController();
    setStatus('extracting');
    setErrorMsg('');
    setResult(null);
    setProgress(t('adminStudentOcr.extracting'));

    try {
      // Step 1: request a signed upload URL
      const uploadMeta = await apiFetchJson<UploadUrlResponse>(
        '/api/admin/students/ocr/upload-url',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            kind,
          }),
          signal: abortRef.current.signal,
        },
      );

      // Step 2: PUT the file directly to Supabase Storage.
      // The signed URL embeds its own auth — plain fetch is correct.
      const putRes = await fetch(uploadMeta.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
        signal: abortRef.current.signal,
      });
      if (!putRes.ok) {
        throw new Error(`Storage upload failed: ${putRes.status}`);
      }

      // Step 3: kick off the SSE extraction
      setProgress(t('adminStudentOcr.extractingProgress', { progress: '10%' }));
      const extractRes = await apiFetch('/api/admin/students/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          storagePath: uploadMeta.storagePath,
          fileType: file.type,
        }),
        signal: abortRef.current.signal,
      });

      if (!extractRes.ok) {
        let body: unknown;
        try { body = await extractRes.json(); } catch { body = null; }
        const message = (body as { error?: string })?.error ?? `Extract failed: ${extractRes.status}`;
        if (extractRes.status === 429) {
          throw new Error(t('adminStudentOcr.errorRateLimited'));
        }
        throw new Error(message);
      }

      const reader = extractRes.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let sseBuffer = '';
      let parsed: OcrResult | null = null;

      const handleSseLine = (line: string) => {
        if (!line.startsWith('data: ')) return;
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') return;
        try {
          const obj = JSON.parse(data);
          if (obj.error) throw new Error(String(obj.error));
          if (obj.status && typeof obj.status === 'string') {
            setProgress(t('adminStudentOcr.extractingProgress', { progress: String(obj.status) }));
          }
          if (obj.progress && typeof obj.progress === 'string') {
            setProgress(t('adminStudentOcr.extractingProgress', { progress: obj.progress }));
          }
          if (obj.parsed) {
            parsed = obj.parsed as OcrResult;
          }
        } catch (err) {
          if (err instanceof SyntaxError) return;
          throw err;
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() ?? '';
        for (const line of lines) handleSseLine(line);
      }
      if (sseBuffer.trim()) handleSseLine(sseBuffer);

      if (!parsed) {
        throw new Error(t('adminStudentOcr.errorParse'));
      }

      // Empty result check: every field null → nothing to apply
      const hasAnyValue = Object.entries(parsed).some(([k, v]) => {
        if (k === 'confidence') return false;
        return v !== null && v !== '';
      });

      setResult(parsed);
      setProgress('');
      setStatus('success');

      if (!hasAnyValue) {
        // Show an error-style message in the success view (the table
        // will render an "all nulls" placeholder; we surface a hint).
        setErrorMsg(t('adminStudentOcr.errorEmpty'));
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('idle');
        setProgress('');
        return;
      }
      const message =
        err instanceof ApiError ? err.message :
        err instanceof Error ? err.message :
        'Unknown error';
      setErrorMsg(message);
      setStatus('error');
      setProgress('');
    }
  };

  const handleApplyClick = () => {
    if (!result) return;
    if (existingFieldKeys.length === 0) {
      onApply(result);
      handleClose();
      return;
    }
    setConfirmReplaceOpen(true);
  };

  const handleConfirmReplace = () => {
    if (!result) return;
    setConfirmReplaceOpen(false);
    onApply(result);
    handleClose();
  };

  const handleCancelExtract = () => {
    abortRef.current?.abort();
    setStatus('idle');
    setProgress('');
  };

  if (!open) return null;

  const isPassport = kind === 'passport';
  const titleKey = isPassport ? 'adminStudentOcr.titlePassport' : 'adminStudentOcr.titleTranscript';
  const kindLabel = isPassport ? 'Passport' : 'High School Transcript';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#9B1B30]" />
              <h2 className="text-lg font-semibold text-[#1F2937]">
                {t(titleKey)}
              </h2>
              <span className="ml-2 text-xs bg-gray-100 text-[#4B5563] px-2 py-0.5">
                {kindLabel}
              </span>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {status === 'idle' && (
              <div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    handleFilePicked(e.dataTransfer.files?.[0] ?? null);
                  }}
                  className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                    dragActive
                      ? 'border-[#9B1B30] bg-[#9B1B30]/5'
                      : 'border-gray-300 hover:border-[#9B1B30]'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-10 h-10 mx-auto text-[#1B2A4A] mb-2" />
                  <p className="text-sm text-[#4B5563]">
                    {t('adminStudentOcr.dropzone')}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">
                    {t('adminStudentOcr.dropzoneOr')}{' '}
                    <span className="text-[#9B1B30] hover:underline">
                      {t('adminStudentOcr.chooseFile')}
                    </span>
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    JPG / PNG / WEBP / PDF · max {formatFileSize(OCR_MAX_BYTES)}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFilePicked(e.target.files?.[0] ?? null)}
                  />
                </div>

                {file && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-gray-50 border border-gray-200">
                    <FileText className="w-4 h-4 text-[#1B2A4A]" />
                    <span className="text-sm text-[#1F2937] flex-1 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                )}

                {errorMsg && (
                  <div className="mt-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-700">{errorMsg}</span>
                  </div>
                )}
              </div>
            )}

            {status === 'extracting' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Loader2 className="w-5 h-5 text-[#9B1B30] animate-spin" />
                  <span className="text-sm text-[#4B5563]">{progress || t('adminStudentOcr.extracting')}</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 text-sm text-[#6B7280]">
                  {t('adminStudentOcr.extracting')}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-600">
                    {t('adminStudentOcr.errorParse')}
                  </span>
                </div>
                <p className="text-sm text-[#4B5563] mb-4">{errorMsg}</p>
                <button
                  onClick={() => {
                    setStatus('idle');
                    setErrorMsg('');
                  }}
                  className="text-sm text-[#9B1B30] hover:underline"
                >
                  {t('adminStudentOcr.discard')}
                </button>
              </div>
            )}

            {status === 'success' && result && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    {t('adminStudentOcr.success')}
                  </span>
                </div>

                {errorMsg && (
                  <div className="mb-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-amber-700">{errorMsg}</span>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 p-3 max-h-80 overflow-y-auto">
                  <h3 className="text-xs font-semibold text-[#1B2A4A] mb-2 uppercase tracking-wide">
                    {t('adminStudentOcr.preview')}
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(result).map(([key, value]) => {
                        if (key === 'confidence') return null;
                        if (value === null || value === '') return null;
                        const conf = (result.confidence as Record<string, number>)?.[key] ?? 0;
                        const tone = confidenceToTone(conf);
                        const toneClasses: Record<string, string> = {
                          green: 'bg-green-100 text-green-800 border-green-200',
                          yellow: 'bg-amber-100 text-amber-800 border-amber-200',
                          red: 'bg-red-100 text-red-800 border-red-200',
                        };
                        return (
                          <tr key={key} className="border-b border-gray-200 last:border-0">
                            <td className="py-1.5 pr-3 text-xs font-medium text-[#1B2A4A] align-top w-1/3">
                              {t(`adminStudentOcr.fields.${formatFieldLabel(kind, key)}`)}
                            </td>
                            <td className="py-1.5 text-xs text-[#4B5563]">
                              <div className="flex items-start gap-2 flex-wrap">
                                <span>{String(value)}</span>
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 border ${toneClasses[tone]}`}
                                  title={`confidence ${conf.toFixed(2)}`}
                                >
                                  {conf.toFixed(2)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
            {status === 'idle' && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]"
                >
                  {t('adminStudentOcr.discard')}
                </button>
                <button
                  onClick={handleExtract}
                  disabled={!file}
                  className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  {t('adminStudentOcr.extract')}
                </button>
              </>
            )}

            {status === 'extracting' && (
              <button
                onClick={handleCancelExtract}
                className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]"
              >
                {t('adminStudentOcr.discard')}
              </button>
            )}

            {status === 'success' && result && (
              <>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]"
                >
                  {t('adminStudentOcr.discard')}
                </button>
                <button
                  onClick={handleApplyClick}
                  className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-4 py-2 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  {t('adminStudentOcr.applyToForm')}
                </button>
              </>
            )}

            {status === 'error' && (
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-[#4B5563] hover:text-[#1F2937]"
              >
                {t('adminStudentOcr.discard')}
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReplaceOpen}
        title={t('adminStudentOcr.replaceConfirmationTitle')}
        message={t('adminStudentOcr.replaceConfirmationBody', { count: existingFieldKeys.length })}
        confirmText={t('adminStudentOcr.replaceConfirmationConfirm')}
        cancelLabel={t('adminStudentOcr.replaceConfirmationCancel')}
        variant="warning"
        onConfirm={handleConfirmReplace}
        onCancel={() => setConfirmReplaceOpen(false)}
        onClose={() => setConfirmReplaceOpen(false)}
      />
    </>
  );
}

export default OcrUploadModal;