'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Plus, Trash2, Edit3, Loader2, ImageIcon, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { apiFetch, apiFetchJson } from '@/lib/api-client';

interface Shot {
  id: string;
  image_url: string;
  caption_en: string;
  caption_zh: string;
  person_name: string;
  initials: string;
  shot_date: string | null;
  is_active: boolean;
  display_order: number;
  imageSrc: string; // admin-resolved public URL
  created_at: string;
  updated_at: string;
}

interface ShotForm {
  id?: string;
  image_url: string;
  caption_en: string;
  caption_zh: string;
  person_name: string;
  initials: string;
  shot_date: string;
  is_active: boolean;
  display_order: number;
}

/**
 * /admin/consultation-activity — admin CRUD for the consultation
 * activity social proof section. Source of truth for what shows
 * up on /counselling + / (Phase 160).
 *
 * Flow:
 *   1. Admin opens the page → loads all shots (active + inactive)
 *      via GET /api/admin/consultation-activity.
 *   2. "Add new" opens the dialog with a fresh shot_id + an empty
 *      form. Admin picks an image, the dialog requests
 *      POST /api/admin/consultation-activity/upload-url to get a
 *      signed PUT URL, then PUTs the file bytes directly to that
 *      URL. The resulting storagePath is then POSTed with the rest
 *      of the form to /api/admin/consultation-activity.
 *   3. "Edit" opens the same dialog pre-filled with the shot's
 *      data. Re-upload optional (the form has a "Replace image"
 *      toggle that re-requests a signed URL when on).
 *   4. "Delete" asks for confirmation; on yes, hits DELETE and
 *      the server best-effort removes the storage object too.
 *   5. "Toggle active" — single PATCH with is_active flipped.
 *      Lets admins hide a shot without deleting it (Phase 160's
 *      "toggle inactive" feature; the public query filters by
 *      `is_active=true` so a hidden shot disappears from the page
 *      instantly).
 */
export default function AdminConsultationActivityPage() {
  const { t } = useI18n();
  const [shots, setShots] = useState<Shot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ShotForm | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [replaceImage, setReplaceImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetchJson<{ shots: Shot[] }>('/api/admin/consultation-activity');
      setShots(data.shots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleNew = () => {
    setEditing({
      image_url: '',
      caption_en: '',
      caption_zh: '',
      person_name: '',
      initials: '',
      shot_date: '',
      is_active: true,
      display_order: (shots.length || 0) + 1,
    });
    setReplaceImage(true);
  };

  const handleEdit = (shot: Shot) => {
    setEditing({
      id: shot.id,
      image_url: shot.image_url,
      caption_en: shot.caption_en,
      caption_zh: shot.caption_zh,
      person_name: shot.person_name,
      initials: shot.initials,
      shot_date: shot.shot_date || '',
      is_active: shot.is_active,
      display_order: shot.display_order,
    });
    setReplaceImage(false);
  };

  const handleCloseDialog = () => {
    setEditing(null);
    setReplaceImage(false);
    setUploadProgress('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (file: File) => {
    if (!editing) return;
    setIsUploading(true);
    setUploadProgress('Requesting upload URL…');
    try {
      const { uploadUrl, storagePath } = await apiFetchJson<{
        uploadUrl: string;
        storagePath: string;
      }>('/api/admin/consultation-activity/upload-url', {
        method: 'POST',
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      });
      setUploadProgress('Uploading…');
      const putRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!putRes.ok) {
        throw new Error(`Upload failed: ${putRes.status} ${putRes.statusText}`);
      }
      // Store the storagePath on the editing form — POST/PATCH
      // will validate it starts with `consultation/`.
      setEditing((prev) => (prev ? { ...prev, image_url: storagePath } : prev));
      setUploadProgress('Upload complete.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editing) return;
    setIsSaving(true);
    setError(null);
    try {
      if (!editing.image_url) {
        setError('Image is required');
        setIsSaving(false);
        return;
      }
      const body = JSON.stringify({
        image_url: editing.image_url,
        caption_en: editing.caption_en,
        caption_zh: editing.caption_zh,
        person_name: editing.person_name,
        initials: editing.initials,
        shot_date: editing.shot_date || null,
        is_active: editing.is_active,
        display_order: editing.display_order,
      });
      if (editing.id) {
        await apiFetch(`/api/admin/consultation-activity/${editing.id}`, {
          method: 'PATCH',
          body,
        });
      } else {
        await apiFetch('/api/admin/consultation-activity', {
          method: 'POST',
          body,
        });
      }
      handleCloseDialog();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (shot: Shot) => {
    setError(null);
    try {
      await apiFetch(`/api/admin/consultation-activity/${shot.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          image_url: shot.image_url,
          caption_en: shot.caption_en,
          caption_zh: shot.caption_zh,
          person_name: shot.person_name,
          initials: shot.initials,
          shot_date: shot.shot_date,
          is_active: !shot.is_active,
          display_order: shot.display_order,
        }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await apiFetch(`/api/admin/consultation-activity/${deletingId}`, {
        method: 'DELETE',
      });
      setDeletingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (isLoading && shots.length === 0 && !error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            {t('adminConsultationActivity.title')}
          </h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B2A4A]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">
            {t('adminConsultationActivity.title')}
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            {t('adminConsultationActivity.subtitle')}
          </p>
        </div>
        <Button
          onClick={handleNew}
          className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526] text-white"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          {t('adminConsultationActivity.addNew')}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          <strong>{t('common.errorPrefix')}</strong> {error}
        </div>
      )}

      {shots.length === 0 && (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-[#4B5563] text-sm">
            {t('adminConsultationActivity.empty')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className="bg-white border border-gray-200 p-4 flex gap-4"
          >
            <div className="relative w-32 h-20 flex-shrink-0 bg-gray-100 overflow-hidden">
              {shot.imageSrc ? (
                <Image
                  src={shot.imageSrc}
                  alt={shot.person_name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1B2A4A] truncate">
                    {shot.person_name}{' '}
                    <span className="text-xs font-normal text-gray-500">
                      ({shot.initials})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('adminConsultationActivity.shotOn', {
                      date: shot.shot_date || '—',
                    })}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {shot.caption_en}
                  </p>
                </div>
                {shot.is_active ? (
                  <Badge className="bg-green-100 text-green-800 rounded-none border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t('adminConsultationActivity.active')}
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 rounded-none border-gray-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    {t('adminConsultationActivity.inactive')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none text-xs"
                  onClick={() => handleEdit(shot)}
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  {t('common.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none text-xs"
                  onClick={() => handleToggleActive(shot)}
                >
                  {shot.is_active
                    ? t('adminConsultationActivity.deactivate')
                    : t('adminConsultationActivity.activate')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-none text-xs text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setDeletingId(shot.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t('common.delete')}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
      >
        <DialogContent className="rounded-none max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#1B2A4A]">
              {editing?.id
                ? t('adminConsultationActivity.editTitle')
                : t('adminConsultationActivity.addTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('adminConsultationActivity.dialogBody')}
            </DialogDescription>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                  {t('adminConsultationActivity.fieldImage')}
                </label>
                {editing.id && !replaceImage && editing.image_url && (
                  <div className="flex items-center gap-3">
                    <div className="relative w-24 h-16 bg-gray-100 overflow-hidden flex-shrink-0">
                      <Image
                        src={shots.find((s) => s.id === editing.id)?.imageSrc || ''}
                        alt={editing.person_name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-none"
                      onClick={() => setReplaceImage(true)}
                    >
                      {t('adminConsultationActivity.replaceImage')}
                    </Button>
                  </div>
                )}
                {(replaceImage || !editing.id) && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                      className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:bg-[#1B2A4A] file:text-white file:cursor-pointer"
                    />
                    {isUploading && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {uploadProgress}
                      </p>
                    )}
                    {!isUploading && editing.image_url && (
                      <p className="text-xs text-green-700 mt-1">
                        ✓ {editing.image_url}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                    {t('adminConsultationActivity.fieldPersonName')}
                  </label>
                  <Input
                    value={editing.person_name}
                    onChange={(e) =>
                      setEditing({ ...editing, person_name: e.target.value })
                    }
                    className="rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                    {t('adminConsultationActivity.fieldInitials')}
                  </label>
                  <Input
                    value={editing.initials}
                    onChange={(e) =>
                      setEditing({ ...editing, initials: e.target.value.toUpperCase() })
                    }
                    maxLength={8}
                    className="rounded-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                    {t('adminConsultationActivity.fieldShotDate')}
                  </label>
                  <Input
                    type="date"
                    value={editing.shot_date}
                    onChange={(e) =>
                      setEditing({ ...editing, shot_date: e.target.value })
                    }
                    className="rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                    {t('adminConsultationActivity.fieldDisplayOrder')}
                  </label>
                  <Input
                    type="number"
                    value={editing.display_order}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        display_order: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="rounded-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                  {t('adminConsultationActivity.fieldCaptionEn')}
                </label>
                <textarea
                  value={editing.caption_en}
                  onChange={(e) =>
                    setEditing({ ...editing, caption_en: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none text-sm focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1B2A4A] mb-1">
                  {t('adminConsultationActivity.fieldCaptionZh')}
                </label>
                <textarea
                  value={editing.caption_zh}
                  onChange={(e) =>
                    setEditing({ ...editing, caption_zh: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-none text-sm focus:outline-none focus:border-[#1B2A4A]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-active"
                  checked={editing.is_active}
                  onChange={(e) =>
                    setEditing({ ...editing, is_active: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <label htmlFor="is-active" className="text-sm">
                  {t('adminConsultationActivity.fieldActive')}
                </label>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={handleCloseDialog}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526] text-white"
              onClick={handleSave}
              disabled={isSaving || isUploading || !editing?.image_url}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              {editing?.id ? t('common.saveChanges') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('adminConsultationActivity.deleteTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('adminConsultationActivity.deleteBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-none bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
