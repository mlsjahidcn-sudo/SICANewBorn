'use client';

/**
 * AdmissionNoticeForm — shared form for create + edit.
 *
 * Phase 51: the admin form for adding/editing an admission notice.
 * Used by /admin/admission-notices/new and /admin/admission-notices/[id]/edit.
 *
 * Flow:
 *   1. User selects an image file (drag-drop or click)
 *   2. Client uploads to /api/admin/admission-notices/upload
 *   3. Server watermarks + stores; returns originalPath + publicPath
 *   4. User fills the metadata fields
 *   5. User clicks Save
 *   6. Client POSTs (create) or PATCHes (edit) the metadata + paths
 *
 * Reusing the form for both modes (per Phase 26's S26 decision for
 * PartnerApplicationForm): the props are `mode: 'create' | 'edit'`
 * + `initial?: AdmissionNotice` for prefill. Validation + state
 * lives here, not in the page wrapper.
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Loader2, ArrowLeft, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { AdmissionDegree, AdmissionNotice as AdmissionNoticeData } from '@/lib/admission-notices/types';
import { ADMISSION_DEGREES } from '@/lib/admission-notices/types';
import { apiFetchJson } from '@/lib/api-client';

interface AdmissionNoticeFormProps {
  mode: 'create' | 'edit';
  /** Pre-fill data for the edit form. Includes the API-enriched
   *  `publicImageUrl` (not in the DB row, added at the API layer
   *  for the existing-image preview). */
  initial?: AdmissionNoticeData & { publicImageUrl?: string | null };
}

interface UploadResult {
  originalPath: string;
  publicPath: string;
  originalSize: number;
  watermarkedSize: number;
}

export function AdmissionNoticeForm({ mode, initial }: AdmissionNoticeFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [studentName, setStudentName] = useState(initial?.studentName || '');
  const [universityName, setUniversityName] = useState(initial?.universityName || '');
  const [program, setProgram] = useState(initial?.program || '');
  const [degree, setDegree] = useState<AdmissionDegree | ''>(initial?.degree || '');
  const [intake, setIntake] = useState(initial?.intake || '');
  const [scholarship, setScholarship] = useState(initial?.scholarship || '');
  const [country, setCountry] = useState(initial?.country || '');
  const [displayOrder, setDisplayOrder] = useState<number>(initial?.displayOrder ?? 0);
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);

  // Image upload state
  const [uploaded, setUploaded] = useState<UploadResult | null>(
    initial
      ? {
          originalPath: initial.originalPath,
          publicPath: initial.imagePath,
          originalSize: 0,
          watermarkedSize: 0,
        }
      : null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.publicImageUrl || null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Clean up the preview URL on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFile = async (file: File) => {
    setUploadError(null);
    if (file.size === 0) {
      setUploadError(t('adminAdmissionNotices.errorEmptyFile'));
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError(t('adminAdmissionNotices.errorFileTooLarge'));
      return;
    }
    // Local preview immediately
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(file));

    // Upload to the server
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/admission-notices/upload', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Upload failed');
      }
      const data = (await res.json()) as UploadResult;
      setUploaded(data);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(initial?.publicImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const handleRemoveUploaded = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploaded(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    // Per-field validation
    const errs: Record<string, string> = {};
    if (!studentName.trim()) errs.studentName = t('adminAdmissionNotices.errorRequired');
    if (!universityName.trim()) errs.universityName = t('adminAdmissionNotices.errorRequired');
    if (mode === 'create' && !uploaded) {
      errs.image = t('adminAdmissionNotices.errorImageRequired');
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        studentName: studentName.trim(),
        universityName: universityName.trim(),
        program: program.trim() || null,
        degree: degree || null,
        intake: intake.trim() || null,
        scholarship: scholarship.trim() || null,
        country: country.trim() || null,
        displayOrder: Number(displayOrder) || 0,
        isPublished,
      };
      if (uploaded) {
        payload.imagePath = uploaded.publicPath;
        payload.originalPath = uploaded.originalPath;
      }
      if (mode === 'create') {
        await apiFetchJson('/api/admin/admission-notices', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } else if (initial) {
        await apiFetchJson(`/api/admin/admission-notices/${initial.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      router.push('/admin/admission-notices');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/admission-notices">
          <Button variant="ghost" className="rounded-none h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('adminAdmissionNotices.back')}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          {mode === 'create' ? t('adminAdmissionNotices.addTitle') : t('adminAdmissionNotices.editTitle')}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              {t('adminAdmissionNotices.sectionImage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewUrl ? (
              <div className="space-y-3">
                <div className="relative aspect-[3/4] max-w-sm bg-gray-100 border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="rounded-none">
                    {uploaded
                      ? t('adminAdmissionNotices.imageUploaded')
                      : t('adminAdmissionNotices.imageExisting')}
                  </Badge>
                  {uploaded && uploaded.watermarkedSize > 0 && (
                    <span className="text-xs text-[#4B5563]">
                      {t('adminAdmissionNotices.imageSize', {
                        size: Math.round(uploaded.watermarkedSize / 1024),
                      })}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveUploaded}
                    className="rounded-none text-red-600 hover:text-red-700 ml-auto"
                  >
                    <X className="h-4 w-4 mr-1" />
                    {t('adminAdmissionNotices.imageRemove')}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#1B2A4A] p-8 text-center cursor-pointer transition-colors"
              >
                <Upload className="h-8 w-8 text-[#4B5563] mx-auto mb-3" />
                <p className="text-sm text-[#1B2A4A] font-semibold mb-1">
                  {t('adminAdmissionNotices.dropzoneTitle')}
                </p>
                <p className="text-xs text-[#4B5563]">
                  {t('adminAdmissionNotices.dropzoneHelp')}
                </p>
                <p className="text-[11px] text-[#4B5563] mt-2 italic">
                  {t('adminAdmissionNotices.dropzoneWatermarkNote')}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </div>
            )}
            {fieldErrors.image && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {fieldErrors.image}
              </p>
            )}
            {uploadError && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {uploadError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Metadata fields */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              {t('adminAdmissionNotices.sectionDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentName" className="text-[#1B2A4A]">
                  {t('adminAdmissionNotices.fieldStudentName')} *
                </Label>
                <Input
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="rounded-none mt-1"
                  maxLength={200}
                />
                {fieldErrors.studentName && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.studentName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="universityName" className="text-[#1B2A4A]">
                  {t('adminAdmissionNotices.fieldUniversityName')} *
                </Label>
                <Input
                  id="universityName"
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  className="rounded-none mt-1"
                  maxLength={200}
                />
                {fieldErrors.universityName && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.universityName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="program" className="text-[#1B2A4A]">
                  {t('adminAdmissionNotices.fieldProgram')}
                </Label>
                <Input
                  id="program"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className="rounded-none mt-1"
                  maxLength={200}
                />
              </div>
              <div>
                <Label htmlFor="degree" className="text-[#1B2A4A]">
                  {t('adminAdmissionNotices.fieldDegree')}
                </Label>
                <select
                  id="degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value as AdmissionDegree | '')}
                  className="mt-1 w-full border border-gray-300 rounded-none px-3 py-2 text-sm bg-white"
                >
                  <option value="">{t('adminAdmissionNotices.fieldDegreePlaceholder')}</option>
                  {ADMISSION_DEGREES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="intake" className="text-[#1B2A4A]">
                  {t('adminAdmissionNotices.fieldIntake')}
                </Label>
                <Input
                  id="intake"
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  className="rounded-none mt-1"
                  placeholder="September 2026"
                  maxLength={100}
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-[#1B2A4A]">
                  {t('adminAdmissionNotices.fieldCountry')}
                </Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="rounded-none mt-1"
                  maxLength={100}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="scholarship" className="text-[#1B2A4A]">
                  {t('adminAdmissionNotices.fieldScholarship')}
                </Label>
                <Textarea
                  id="scholarship"
                  value={scholarship}
                  onChange={(e) => setScholarship(e.target.value)}
                  className="rounded-none mt-1"
                  rows={2}
                  maxLength={300}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display settings */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle className="text-[#1B2A4A] text-base">
              {t('adminAdmissionNotices.sectionDisplay')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayOrder" className="text-[#1B2A4A]">
                {t('adminAdmissionNotices.fieldDisplayOrder')}
              </Label>
              <Input
                id="displayOrder"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="rounded-none mt-1 max-w-xs"
              />
              <p className="text-xs text-[#4B5563] mt-1">
                {t('adminAdmissionNotices.fieldDisplayOrderHelp')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 accent-[#9B1B30]"
              />
              <Label htmlFor="isPublished" className="text-[#1B2A4A] cursor-pointer">
                {t('adminAdmissionNotices.fieldIsPublished')}
              </Label>
            </div>
          </CardContent>
        </Card>

        {submitError && (
          <div className="bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            <Save className="h-4 w-4 mr-1" />
            {isSubmitting ? t('adminAdmissionNotices.saving') : t('adminAdmissionNotices.save')}
          </Button>
          <Link href="/admin/admission-notices">
            <Button type="button" variant="outline" className="rounded-none">
              {t('adminAdmissionNotices.cancel')}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
