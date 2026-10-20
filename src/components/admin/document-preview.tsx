'use client';

/**
 * DocumentPreview — picks the right renderer for a document file and
 * renders it.
 *
 * This is the shared rendering core used by both surfaces:
 *   - the in-app modal viewer (`document-viewer.tsx`)
 *   - the standalone `/admin/documents/[id]` page
 *
 * Renderers
 * ---------
 *   pdf    → pdf.js canvas (zoom, page nav, rotation)
 *   image  → zoom + pan viewer
 *   office → "cannot preview in the browser" card (DOC/DOCX)
 *   unknown→ same card, with a slightly different wording
 *
 * Fallback
 * --------
 * If pdf.js cannot open the file (CORS, a missing range request, a
 * corrupt PDF), the preview degrades to the browser's own `<iframe>`
 * PDF viewer rather than dead-ending. The admin still sees the
 * document, and "Open in new window" always works.
 */

import { useEffect, useMemo, useState } from 'react';
import { FileText, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  classifyFile,
  type DocumentFileKind,
} from '@/lib/document-viewer-origin';
import {
  DocumentViewerImage,
} from '@/components/admin/document-viewer-image';
import {
  DocumentViewerPdf,
  type PdfPageMetrics,
} from '@/components/admin/document-viewer-pdf';

export interface DocumentPreviewProps {
  /** MIME type stored on the row. */
  fileType?: string | null;
  /** Original file name stored on the row. */
  fileName?: string | null;
  /** Signed URL of the file. Null while it is still being minted. */
  url: string | null;
  /** Zoom factor (1 = 100%). */
  scale: number;
  /** Rotation in degrees. */
  rotation: number;
  /** 1-based page number (PDF only). */
  pageNumber: number;
  onPageCountChange?: (numPages: number) => void;
  onPageMetrics?: (metrics: PdfPageMetrics) => void;
  onContainerSize?: (size: { width: number; height: number }) => void;
  onNaturalSize?: (size: { width: number; height: number }) => void;
  /** Called with a human-readable message when rendering fails. */
  onError?: (message: string) => void;
  /** Label for the "open in new window" button on the unsupported card. */
  openExternalLabel?: string;
  /** Invoked when the admin asks to open the file outside the viewer. */
  onOpenExternal?: () => void;
  /** Copy for the unsupported-file card. */
  unsupportedTitle?: string;
  unsupportedBody?: string;
  /** Copy for the "pdf.js failed, using the browser viewer" notice. */
  fallbackNotice?: string;
}

export function DocumentPreview({
  fileType,
  fileName,
  url,
  scale,
  rotation,
  pageNumber,
  onPageCountChange,
  onPageMetrics,
  onContainerSize,
  onNaturalSize,
  onError,
  openExternalLabel = 'Open in new window',
  onOpenExternal,
  unsupportedTitle = 'This file type cannot be previewed in the browser',
  unsupportedBody = 'Open it in a new window to view or download it.',
  fallbackNotice,
}: DocumentPreviewProps) {
  const kind: DocumentFileKind = useMemo(
    () => classifyFile(fileType, fileName),
    [fileType, fileName],
  );

  // True once pdf.js has failed on this file — we then fall back to
  // the browser's built-in PDF viewer.
  const [nativeFallback, setNativeFallback] = useState(false);

  useEffect(() => {
    setNativeFallback(false);
  }, [url]);

  if (!url) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-neutral-800">
        <p className="text-sm text-neutral-300">Preparing preview…</p>
      </div>
    );
  }

  if (kind === 'pdf') {
    if (nativeFallback) {
      return (
        <div className="relative h-full w-full bg-neutral-800">
          {fallbackNotice && (
            <div className="absolute left-4 top-4 z-10 flex max-w-md items-start gap-2 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{fallbackNotice}</span>
            </div>
          )}
          <iframe
            src={url}
            title="Document preview"
            className="h-full w-full border-0"
          />
        </div>
      );
    }

    return (
      <DocumentViewerPdf
        url={url}
        scale={scale}
        rotation={rotation}
        pageNumber={pageNumber}
        onPageCountChange={onPageCountChange}
        onPageMetrics={onPageMetrics}
        onContainerSize={onContainerSize}
        onError={(message) => {
          setNativeFallback(true);
          onError?.(message);
        }}
      />
    );
  }

  if (kind === 'image') {
    return (
      <DocumentViewerImage
        url={url}
        scale={scale}
        rotation={rotation}
        onNaturalSize={onNaturalSize}
        onError={onError}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-neutral-800 p-8 text-center">
      <FileText className="h-12 w-12 text-neutral-400" />
      <div className="max-w-md space-y-1">
        <p className="font-medium text-white">{unsupportedTitle}</p>
        <p className="text-sm text-neutral-300">{unsupportedBody}</p>
      </div>
      {onOpenExternal && (
        <Button
          variant="outline"
          className="rounded-none"
          onClick={onOpenExternal}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {openExternalLabel}
        </Button>
      )}
    </div>
  );
}
