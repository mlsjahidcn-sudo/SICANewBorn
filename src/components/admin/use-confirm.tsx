'use client';

/**
 * useConfirm — a promise-based replacement for `window.confirm()` in the
 * admin portal.
 *
 *   const [confirm, confirmDialog] = useConfirm();
 *   if (!(await confirm({ title: '…', destructive: true }))) return;
 *   …
 *   return <>{…}{confirmDialog}</>;
 *
 * Why not window.confirm: it is unstyled, can't be translated beyond the
 * message, blocks the JS thread, and on mobile Safari the "prevent this
 * page from creating additional dialogs" checkbox can silently turn every
 * later confirm into an automatic "cancel". This uses the shadcn
 * AlertDialog, which traps focus and closes on Escape (= cancel).
 */

import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useI18n } from '@/lib/i18n';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red confirm button — use for deletes and other hard-to-undo actions. */
  destructive?: boolean;
}

export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const { t } = useI18n();
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setOptions(null);
  }, []);

  const confirm = useCallback((next: ConfirmOptions) => {
    // A second confirm while one is open cancels the first rather than
    // leaving its promise pending forever.
    resolveRef.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(next);
    });
  }, []);

  const dialog = (
    <AlertDialog
      open={options !== null}
      onOpenChange={(open) => {
        if (!open) settle(false);
      }}
    >
      <AlertDialogContent className="rounded-none">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#1B2A4A]">{options?.title}</AlertDialogTitle>
          {options?.description ? (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-none">
            {options?.cancelLabel ?? t('adminCommon.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className={
              options?.destructive
                ? 'rounded-none bg-red-700 text-white hover:bg-red-800'
                : 'rounded-none bg-[#1B2A4A] text-white hover:bg-[#253658]'
            }
            onClick={() => settle(true)}
          >
            {options?.confirmLabel ?? t('adminCommon.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [confirm, dialog];
}
