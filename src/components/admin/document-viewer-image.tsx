'use client';

/**
 * DocumentViewerImage — renders an image document with zoom + pan.
 *
 * Images (passport photos, scanned pages saved as PNG/JPEG) are the
 * other half of the admin document set. The old admin page showed
 * them in a `<img className="max-h-96">` — no zoom at all, so an
 * admin could not read a passport number or a serial on a scan.
 *
 * Layout notes
 * ------------
 * - Zoom is applied to the *element size* (not a CSS transform), so
 *   the scroll container's scroll area stays correct and the browser
 *   rasterises at the right resolution.
 * - Rotation is handled with a wrapper sized to the rotated bounding
 *   box and the image centred + rotated inside it, so a 90° rotation
 *   doesn't leave the page sideways in the scroll area.
 * - Drag-to-pan is enabled whenever the image is larger than the
 *   viewport (i.e. zoomed in), so the admin doesn't have to hunt for
 *   scrollbars.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface DocumentViewerImageProps {
  /** Signed URL of the image. */
  url: string;
  /** Zoom factor (1 = 100% of the natural size). */
  scale: number;
  /** Rotation in degrees (0 / 90 / 180 / 270). */
  rotation: number;
  /** Called with the image's natural pixel size once loaded. */
  onNaturalSize?: (size: { width: number; height: number }) => void;
  /** Called when the image cannot be loaded. */
  onError?: (message: string) => void;
}

export function DocumentViewerImage({
  url,
  scale,
  rotation,
  onNaturalSize,
  onError,
}: DocumentViewerImageProps) {
  const [loading, setLoading] = useState(true);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [failed, setFailed] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  const [dragging, setDragging] = useState(false);

  // Latest callbacks, kept in a ref so the img onLoad / onError
  // handlers don't need to be re-created when a parent re-renders
  // with a new callback identity. Synced in an effect (not during
  // render — the React Compiler's `react-hooks/refs` rule flags that).
  const callbacksRef = useRef({ onNaturalSize, onError });
  useEffect(() => {
    callbacksRef.current = { onNaturalSize, onError };
  });

  useEffect(() => {
    setLoading(true);
    setNatural(null);
    setFailed(false);
  }, [url]);

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      const size = { width: img.naturalWidth, height: img.naturalHeight };
      setNatural(size);
      setFailed(false);
      setLoading(false);
      callbacksRef.current.onNaturalSize?.(size);
    },
    [],
  );

  const handleError = useCallback(() => {
    setLoading(false);
    setFailed(true);
    callbacksRef.current.onError?.('Failed to load the image');
  }, []);

  // --- drag to pan ------------------------------------------------------
  const onPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return;
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    setDragging(true);
    el.setPointerCapture(event.pointerId);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    const el = containerRef.current;
    if (!drag || !el || drag.pointerId !== event.pointerId) return;
    el.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
    el.scrollTop = drag.scrollTop - (event.clientY - drag.startY);
  }, []);

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    setDragging(false);
    const el = containerRef.current;
    if (el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
  }, []);

  const quarterTurn = rotation === 90 || rotation === 270;
  const renderWidth = natural ? natural.width * scale : 0;
  const renderHeight = natural ? natural.height * scale : 0;
  const boxWidth = natural ? (quarterTurn ? natural.height : natural.width) * scale : 0;
  const boxHeight = natural ? (quarterTurn ? natural.width : natural.height) * scale : 0;

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className="relative flex h-full w-full items-center justify-center overflow-auto bg-neutral-800 p-4"
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-black/40 px-4 py-2 text-sm text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading image…
          </div>
        </div>
      )}

      {failed && (
        <div className="flex flex-col items-center gap-2 text-sm text-neutral-300">
          <AlertCircle className="h-8 w-8" />
          <span>Could not load the image</span>
        </div>
      )}

      {/*
        The <img> is ALWAYS mounted — its onLoad is what tells us the
        natural size, so gating it behind `natural` would deadlock
        (the element that fires the event is the one being withheld).
        Until the size is known the image renders at its intrinsic
        size inside a zero-sized box.
      */}
      <div
        className="relative shrink-0 shadow-lg"
        style={{
          width: natural ? `${boxWidth}px` : '0px',
          height: natural ? `${boxHeight}px` : '0px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Document preview"
          onLoad={handleLoad}
          onError={handleError}
          draggable={false}
          className={`absolute left-1/2 top-1/2 select-none bg-white ${failed ? 'hidden' : ''}`}
          style={{
            width: natural ? `${renderWidth}px` : 'auto',
            height: natural ? `${renderHeight}px` : 'auto',
            transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        />
      </div>
    </div>
  );
}
