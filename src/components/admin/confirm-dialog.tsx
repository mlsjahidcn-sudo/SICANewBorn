'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void> | null;
  onClose?: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
  onCancel,
  confirmText = 'Confirm',
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmBg =
    variant === 'danger'
      ? 'bg-red-700 hover:bg-red-800'
      : variant === 'warning'
        ? 'bg-amber-600 hover:bg-amber-700'
        : 'bg-[#1B2A4A] hover:bg-[#253658]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel || onClose} />
      <div className="relative bg-white p-6 shadow-xl max-w-md w-full mx-4" style={{ borderRadius: 0 }}>
        <button
          onClick={onCancel || onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-start gap-4">
          <div className={`p-2 ${variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#1F2937]">{title}</h3>
            <p className="mt-2 text-sm text-[#4B5563]">{message}</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={onCancel || onClose}
                className="px-4 py-2 text-sm border border-gray-300 text-[#4B5563] hover:bg-gray-50"
                style={{ borderRadius: 0 }}
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => onConfirm?.()}
                className={`px-4 py-2 text-sm text-white font-medium ${confirmBg}`}
                style={{ borderRadius: 0 }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
