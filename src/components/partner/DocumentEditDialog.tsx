'use client';

/**
 * DocumentEditDialog — modal for editing a partner document's
 * editable metadata (name, nameCn, category, notes, linked
 * application). Pre-populated from the doc's current values.
 *
 * Editable scope mirrors the API contract (whitelist):
 *   - name
 *   - nameCn
 *   - category (6 closed enum values)
 *   - notes
 *   - partnerApplicationId (link / unlink)
 *
 * NOT editable (intentionally not surfaced in the form):
 *   - file (immutable after upload — re-upload to change)
 *   - status / verifiedAt / verifiedBy / rejectionReason (admin only)
 *   - partnerStudentId (immutable — re-upload to change)
 *
 * On save, PATCHes /api/partner/documents/[id] and calls the
 * parent's onSaved callback with the updated row.
 */
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

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
import { apiFetchJson } from '@/lib/api-client';
import {
  PARTNER_DOC_CATEGORIES,
  type PartnerDocCategory,
  type PartnerDocument,
} from '@/lib/partner-doc-mapper';
import type { PartnerApplication } from '@/lib/partner-application-mapper';
import { useI18n } from '@/lib/i18n';

interface DocumentEditDialogProps {
  /** Doc to edit. null = dialog closed. */
  doc: PartnerDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Partner's applications — for the optional application picker. */
  applications: PartnerApplication[];
  /** Called after a successful save with the updated row. */
  onSaved?: (doc: PartnerDocument) => void;
  /** Optional non-blocking toast (parent supplies). */
  onShowToast?: (message: string) => void;
}

export function DocumentEditDialog({
  doc,
  open,
  onOpenChange,
  applications,
  onSaved,
  onShowToast,
}: DocumentEditDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [nameCn, setNameCn] = useState('');
  const [category, setCategory] = useState<PartnerDocCategory>('Other');
  const [notes, setNotes] = useState('');
  const [applicationId, setApplicationId] = useState<string>('__none__');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-hydrate form fields whenever the source doc changes
  // (e.g. user opens the dialog for a different row).
  useEffect(() => {
    if (!doc) return;
    setName(doc.name || '');
    setNameCn(doc.nameCn || '');
    setCategory(doc.category);
    setNotes(doc.notes || '');
    setApplicationId(doc.partnerApplicationId || '__none__');
    setError(null);
    setFieldError(null);
  }, [doc]);

  // Reset error state when the dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
      setFieldError(null);
    }
  }, [open]);

  const save = async () => {
    if (!doc) return;
    if (!name.trim()) {
      setFieldError(t('partnerDocs.editDialog.errorRequired'));
      return;
    }
    setFieldError(null);
    setSaving(true);
    setError(null);
    try {
      const result = await apiFetchJson<{ document: PartnerDocument }>(
        `/api/partner/documents/${doc.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name: name.trim(),
            nameCn: nameCn.trim() || null,
            category,
            notes: notes.trim() || null,
            // null is the explicit "unlink" sentinel; "__none__" is
            // our UI sentinel for "no choice" — convert it before
            // sending.
            partnerApplicationId: applicationId === '__none__' ? null : applicationId,
          }),
        },
      );
      onSaved?.(result.document);
      onShowToast?.(t('partnerDocs.editDialog.savedToast'));
      onOpenChange(false);
    } catch (err) {
      console.error('[DocumentEditDialog] save failed:', err);
      setError(err instanceof Error ? err.message : t('partnerDocs.editDialog.errorRequired'));
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  const appOptions = applications.map((a) => ({
    value: a.id,
    label: a.university,
    sublabel: a.program || a.applicationNumber || undefined,
  }));

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o && saving) return;
      onOpenChange(o);
    }}>
      <DialogContent
        className="rounded-none sm:max-w-xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => {
          if (saving) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (saving) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-[#1B2A4A]">
            {t('partnerDocs.editDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {doc?.fileName ? `${doc.fileName}` : doc?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-doc-name" className="text-[#1B2A4A] mb-2 block">
              {t('partnerDocs.uploadDialog.name')}
            </Label>
            <Input
              id="edit-doc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-none"
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="edit-doc-name-cn" className="text-[#1B2A4A] mb-2 block">
              {t('partnerDocs.uploadDialog.nameCn')}
            </Label>
            <Input
              id="edit-doc-name-cn"
              value={nameCn}
              onChange={(e) => setNameCn(e.target.value)}
              className="rounded-none"
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="edit-doc-category" className="text-[#1B2A4A] mb-2 block">
              {t('partnerDocs.uploadDialog.category')}
            </Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as PartnerDocCategory)}
              disabled={saving}
            >
              <SelectTrigger id="edit-doc-category" className="rounded-none">
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
            <Label htmlFor="edit-doc-app" className="text-[#1B2A4A] mb-2 block">
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
              disabled={saving}
            />
          </div>
          <div>
            <Label htmlFor="edit-doc-notes" className="text-[#1B2A4A] mb-2 block">
              {t('partnerDocs.uploadDialog.notes')}
            </Label>
            <Textarea
              id="edit-doc-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-none"
              disabled={saving}
              rows={3}
            />
          </div>

          {fieldError && (
            <p className="text-xs text-red-700">{fieldError}</p>
          )}
          {error && (
            <p className="text-xs text-red-700">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
            className="rounded-none"
          >
            {t('partnerDocs.editDialog.cancel')}
          </Button>
          <Button
            onClick={save}
            disabled={saving || !name.trim()}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {t('partnerDocs.uploadDialog.uploading')}
              </>
            ) : (
              t('partnerDocs.editDialog.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
