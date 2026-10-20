'use client';

/**
 * DocumentViewerPdf — renders a PDF with pdf.js onto a canvas.
 *
 * Why a canvas instead of an `<iframe>`?
 * --------------------------------------
 * The old admin document page embedded the signed URL in an
 * `<iframe>`, which hands rendering to the browser's built-in PDF
 * plugin. That gives no app-level zoom control, no page counter and
 * no way to rotate — and the behaviour differs per browser. This
 * component renders pages itself so the viewer toolbar can drive
 * zoom (50–400%), page navigation and rotation.
 *
 * Design notes
 * ------------
 * - **Paged, not a continuous scroll.** One page on screen at a time
 *   with explicit prev/next. That is the right shape for a document
 *   *review* queue (read one page, zoom into a stamp, move on) and
 *   it keeps memory to a single canvas instead of one per page.
 * - **Vector-sharp at every zoom.** pdf.js re-renders the page at the
 *   requested scale rather than scaling a rasterised canvas, so a
 *   300 DPI scan stays readable at 400%.
 * - **HiDPI aware.** The canvas backing store is `viewport * dpr` so
 *   text isn't fuzzy on retina displays; the CSS size stays at the
 *   logical viewport size.
 * - **pdf.js is lazy.** `openPdfDocument()` dynamically imports the
 *   library, so no page ships it until an admin opens a PDF.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { openPdfDocument } from '@/lib/pdf-engine';

export interface PdfPageMetrics {
  /** Page width in CSS px at scale 1, for the current rotation. */
  width: number;
  /** Page height in CSS px at scale 1, for the current rotation. */
  height: number;
}

interface DocumentViewerPdfProps {
  /** Signed URL of the PDF. Changing it reloads the document. */
  url: string;
  /** Zoom factor (1 = 100%). */
  scale: number;
  /** Page rotation in degrees (0 / 90 / 180 / 270). */
  rotation: number;
  /** 1-based page number to display. */
  pageNumber: number;
  /** Called once the document's page count is known. */
  onPageCountChange?: (numPages: number) => void;
  /** Called with the page's unscaled size so the parent can compute fit scales. */
  onPageMetrics?: (metrics: PdfPageMetrics) => void;
  /** Called with the visible canvas area size so the parent can compute fit scales. */
  onContainerSize?: (size: { width: number; height: number }) => void;
  /** Called when the document cannot be opened or rendered. */
  onError?: (message: string) => void;
}

export function DocumentViewerPdf({
  url,
  scale,
  rotation,
  pageNumber,
  onPageCountChange,
  onPageMetrics,
  onContainerSize,
  onError,
}: DocumentViewerPdfProps) {
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  /** Bumped when a document finishes loading, so the page renders. */
  const [docVersion, setDocVersion] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const docRef = useRef<Awaited<ReturnType<typeof openPdfDocument>> | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  /** Guards against a stale async render landing after a newer one. */
  const renderSeqRef = useRef(0);
  /** Last metrics reported upstream — avoids a pointless state update. */
  const metricsRef = useRef<PdfPageMetrics | null>(null);

  // Keep the latest callbacks in a ref so the load effect doesn't need
  // to re-run (and re-download the PDF) every time a callback identity
  // changes. The ref is synced in an effect (not during render — the
  // React Compiler's `react-hooks/refs` rule flags that), and the
  // effect is declared BEFORE the load effect so the ref is already
  // up to date when the loader runs.
  const callbacksRef = useRef({ onPageCountChange, onPageMetrics, onContainerSize, onError });
  useEffect(() => {
    callbacksRef.current = {
      onPageCountChange,
      onPageMetrics,
      onContainerSize,
      onError,
    };
  });

  // --- load the document ------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    metricsRef.current = null;

    openPdfDocument(url)
      .then((doc) => {
        if (cancelled) {
          void doc.destroy();
          return;
        }
        docRef.current = doc;
        setLoading(false);
        setDocVersion((v) => v + 1);
        callbacksRef.current.onPageCountChange?.(doc.numPages);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoading(false);
        const message =
          err instanceof Error ? err.message : 'Failed to load the PDF document';
        callbacksRef.current.onError?.(message);
      });

    return () => {
      cancelled = true;
      const doc = docRef.current;
      docRef.current = null;
      if (doc) void doc.destroy();
    };
  }, [url]);

  // --- report the visible canvas area ----------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const report = () => {
      callbacksRef.current.onContainerSize?.({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // --- render the current page -----------------------------------------
  const renderPage = useCallback(async () => {
    const doc = docRef.current;
    const canvas = canvasRef.current;
    if (!doc || !canvas) return;

    const seq = ++renderSeqRef.current;

    // Cancel any in-flight render — pdf.js throws if you render to the
    // same canvas twice concurrently.
    try {
      renderTaskRef.current?.cancel();
    } catch {
      /* already finished */
    }
    renderTaskRef.current = null;

    try {
      const page = await doc.getPage(pageNumber);
      if (seq !== renderSeqRef.current) return;

      const viewport = page.getViewport({ scale, rotation });
      const outputScale =
        typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas 2D context unavailable');

      setRendering(true);
      const task = page.render({
        canvasContext: context,
        viewport,
        transform:
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
      });
      renderTaskRef.current = task;
      await task.promise;
      if (seq !== renderSeqRef.current) return;

      // Report the unscaled page size (for the current rotation) so the
      // parent can compute "fit width" / "fit page" scales.
      const base = page.getViewport({ scale: 1, rotation });
      const metrics: PdfPageMetrics = { width: base.width, height: base.height };
      const previous = metricsRef.current;
      if (!previous || previous.width !== metrics.width || previous.height !== metrics.height) {
        metricsRef.current = metrics;
        callbacksRef.current.onPageMetrics?.(metrics);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'RenderingCancelledException') return;
      if (seq !== renderSeqRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to render the PDF page';
      callbacksRef.current.onError?.(message);
    } finally {
      if (seq === renderSeqRef.current) setRendering(false);
    }
  }, [pageNumber, rotation, scale]);

  useEffect(() => {
    void renderPage();
  }, [renderPage, docVersion]);

  // --- cleanup ----------------------------------------------------------
  useEffect(
    () => () => {
      try {
        renderTaskRef.current?.cancel();
      } catch {
        /* noop */
      }
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-start justify-center overflow-auto bg-neutral-800 p-4"
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 text-sm text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading PDF…
          </div>
        </div>
      )}

      {rendering && !loading && (
        <div className="pointer-events-none absolute right-4 top-4 z-10 flex items-center gap-2 bg-black/40 px-3 py-1 text-xs text-white">
          <Loader2 className="h-3 w-3 animate-spin" />
          Rendering…
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`bg-white shadow-lg ${loading ? 'invisible' : ''}`}
        aria-label="Document preview"
      />
    </div>
  );
}
