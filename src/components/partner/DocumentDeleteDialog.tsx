'use client';

/**
 * DocumentDeleteDialog — confirmation modal before deleting a
 * partner document. The "this will also delete the file from
 * storage" warning is intentional: per the API-layer scoping memo
 * §2f, partner deletes intentionally clean up the Storage object
 * (unlike the student side, which orphans the file).
 *
 * Why is the destructive behavior different from the student side?
 *   - Students may want to recover an accidentally-deleted doc
 *     (admin audit trail is lighter on the student side).
 *   - Partners have an admin-facing audit trail and the row
 *     delete is intentional — orphan storage objects accumulate
 *     fast and have no recovery path.
 *
 * This file intentionally documents that difference so future-him
 * doesn't "fix" it back to orphan-only by accident.
 */
import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiFetch } from '@/lib/api-client';
import type { PartnerDocument } from '@/lib/partner-doc-mapper';
import { useI18n } from '@/lib/i18n';

interface DocumentDeleteDialogProps {
  /** Doc to delete. null = dialog closed. */
  doc: PartnerDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete (parent removes the row from state). */
  onDeleted?: (id: string) => void;
  /** Optional non-blocking toast. */
  onShowToast?: (message: string) => void;
}

export function DocumentDeleteDialog({
  doc,
  open,
  onOpenChange,
  onDeleted,
  onShowToast,
}: DocumentDeleteDialogProps) {
  const { t } = useI18n();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset error when reopening
  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const confirm = async () => {
    if (!doc) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/partner/documents/${doc.id}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string })?.error || `Delete failed (HTTP ${res.status})`);
      }
      onDeleted?.(doc.id);
      onOpenChange(false);
    } catch (err) {
      console.error('[DocumentDeleteDialog] delete failed:', err);
      setError(err instanceof Error ? err.message : t('partnerDocs.errors.uploadFailed'));
    } finally {
      setDeleting(false);
    }
  };

  if (!mounted) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o && deleting) return;
      onOpenChange(o);
    }}>
      <DialogContent
        className="rounded-none sm:max-w-md"
        onEscapeKeyDown={(e) => {
          if (deleting) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (deleting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-[#1B2A4A] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#9B1B30]" />
            {t('partnerDocs.deleteDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {doc
              ? t('partnerDocs.deleteDialog.bodyFor', { name: doc.name })
              : t('partnerDocs.deleteDialog.title')}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-red-50 border border-red-200 p-3 rounded-none text-sm text-red-800">
          <p className="font-semibold">{t('partnerDocs.deleteDialog.warning')}</p>
          <p className="text-xs text-red-700 mt-1">
            {doc?.fileName ? `${doc.fileName}` : ''}
          </p>
        </div>

        {error && (
          <p className="text-xs text-red-700">{error}</p>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
            className="rounded-none"
          >
            {t('partnerDocs.deleteDialog.cancel')}
          </Button>
          <Button
            onClick={confirm}
            disabled={deleting}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                {t('partnerDocs.deleteDialog.deleting')}
              </>
            ) : (
              t('partnerDocs.deleteDialog.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
