'use client';

/**
 * DocumentToolbar — the zoom / rotate / page / export controls shared
 * by the in-app document viewer modal and the standalone
 * `/admin/documents/[id]` page.
 *
 * Keeping one toolbar for both surfaces means an admin gets the same
 * controls whether they opened the document in the modal (from a
 * student page, the partner-student page, the review queue or an
 * application) or landed on the standalone page from a deep link.
 */

import {
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';
import { clampZoom, MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '@/lib/document-viewer-origin';

interface DocumentToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  /** 1-based page number (PDF only). */
  pageNumber?: number;
  pageCount?: number;
  onPageChange?: (page: number) => void;
  /** Scale that makes the content fill the viewport width. */
  fitWidthScale?: number;
  /** Scale that makes the whole content fit in the viewport. */
  fitPageScale?: number;
  onOpenExternal?: () => void;
  onDownload?: () => void;
  /** Disables the export buttons (e.g. while the signed URL is minted). */
  exportDisabled?: boolean;
  /** Extra actions rendered on the right-hand side. */
  children?: React.ReactNode;
}

export function DocumentToolbar({
  zoom,
  onZoomChange,
  rotation,
  onRotationChange,
  pageNumber,
  pageCount,
  onPageChange,
  fitWidthScale = 1,
  fitPageScale = 1,
  onOpenExternal,
  onDownload,
  exportDisabled = false,
  children,
}: DocumentToolbarProps) {
  const { t } = useI18n();
  const showPages = Boolean(pageCount && pageCount > 1 && onPageChange);
  // Narrow the optional props once so the JSX below doesn't have to
  // repeat `as number` on every access.
  const currentPage = pageNumber ?? 1;
  const totalPages = pageCount ?? 1;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-[#FAFAF8] px-4 py-2">
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onZoomChange(clampZoom(zoom - ZOOM_STEP))}
        disabled={zoom <= MIN_ZOOM}
        title={t('adminDocViewer.zoomOut')}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="w-14 text-center text-xs font-medium tabular-nums text-[#1B2A4A]">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onZoomChange(clampZoom(zoom + ZOOM_STEP))}
        disabled={zoom >= MAX_ZOOM}
        title={t('adminDocViewer.zoomIn')}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onZoomChange(clampZoom(fitWidthScale))}
        title={t('adminDocViewer.zoomFitWidth')}
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onZoomChange(clampZoom(fitPageScale))}
        title={t('adminDocViewer.zoomFitPage')}
      >
        <Minimize2 className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onZoomChange(1)}
        title={t('adminDocViewer.zoomReset')}
      >
        <span className="text-xs">100%</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onRotationChange((rotation - 90 + 360) % 360)}
        title={t('adminDocViewer.rotateLeft')}
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-none"
        onClick={() => onRotationChange((rotation + 90) % 360)}
        title={t('adminDocViewer.rotateRight')}
      >
        <RotateCw className="h-4 w-4" />
      </Button>

      {showPages && (
        <div className="ml-2 flex items-center gap-2 border-l border-gray-300 pl-3">
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label={t('adminDocViewer.pageNumber')}
          >
            ‹
          </Button>
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const next = parseInt(e.target.value, 10);
              if (Number.isFinite(next)) {
                onPageChange?.(Math.min(Math.max(1, next), totalPages));
              }
            }}
            className="h-8 w-16 rounded-none text-center"
            aria-label={t('adminDocViewer.pageNumber')}
          />
          <span className="text-xs text-[#4B5563]">
            {t('adminDocViewer.pageOf', { total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label={t('adminDocViewer.pageNumber')}
          >
            ›
          </Button>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {children}
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={onDownload}
            disabled={exportDisabled}
          >
            <Download className="h-4 w-4" />
            {t('adminDocViewer.download')}
          </Button>
        )}
        {onOpenExternal && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-none"
            onClick={onOpenExternal}
            disabled={exportDisabled}
          >
            <ExternalLink className="h-4 w-4" />
            {t('adminDocViewer.openInNewWindow')}
          </Button>
        )}
      </div>
    </div>
  );
}
