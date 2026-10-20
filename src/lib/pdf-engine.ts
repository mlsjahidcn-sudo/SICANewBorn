'use client';

/**
 * pdf-engine — lazy, browser-side pdf.js loader.
 *
 * The admin document viewer renders PDFs with pdf.js so the admin
 * gets real app-controlled zoom (50–400%), page navigation and
 * rotation instead of whatever the browser's built-in PDF plugin
 * happens to offer.
 *
 * Two deliberate choices:
 *
 * 1. **Lazily imported.** `pdfjs-dist` is ~180 KB gzipped. It is
 *    only pulled down when an admin actually opens a PDF, so no page
 *    pays for it in its initial bundle — not even the public site.
 *
 * 2. **Worker served from `public/`, not bundled.** pdf.js spawns a
 *    worker via `GlobalWorkerOptions.workerSrc`. Bundler-native ways
 *    to ship that worker behave differently under Next 16's webpack
 *    build vs. its Turbopack dev server, so `scripts/copy-pdf-worker.mjs`
 *    copies the worker (plus the CMap tables and standard fonts
 *    needed for correct CJK rendering) into `public/` and we point
 *    at it by absolute path. One code path for dev + build.
 *
 * The CMap + standard-font directories matter for Chinese
 * university transcripts, which are frequently generated with
 * non-embedded CID fonts — without the tables those glyphs render
 * as blanks.
 */

/** Absolute path of the copied pdf.js worker. */
export const PDF_WORKER_SRC = '/pdf.worker.min.mjs';

/** Base path of the copied CMap tables. */
export const PDF_CMAP_URL = '/pdfjs/cmaps/';

/** Base path of the copied standard font files. */
export const PDF_STANDARD_FONT_URL = '/pdfjs/standard_fonts/';

type PdfjsModule = typeof import('pdfjs-dist');

let loader: Promise<PdfjsModule> | null = null;

/**
 * Load pdf.js (once per page session).
 *
 * The module promise is cached so opening a second document doesn't
 * re-download the library. A failed load rejects; callers are
 * expected to fall back to the browser's native PDF preview.
 */
export function loadPdfjs(): Promise<PdfjsModule> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('pdf.js is browser-only'));
  }
  if (!loader) {
    loader = import('pdfjs-dist')
      .then((mod) => {
        // The worker + asset dirs are copied into `public/` at build
        // time (see scripts/copy-pdf-worker.mjs). Absolute paths
        // mean the bundler never has to resolve them.
        mod.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
        return mod as PdfjsModule;
      })
      .catch((err) => {
        // Don't cache a failure — a later attempt should retry.
        loader = null;
        throw err;
      });
  }
  return loader;
}

/**
 * Open a PDF from a signed URL.
 *
 * `isEvalSupported: false` keeps pdf.js off `eval` — the project's
 * CSP allows it, but the optimizer isn't needed for document
 * rendering and disabling it removes a class of surprises.
 */
export async function openPdfDocument(url: string) {
  const pdfjs = await loadPdfjs();
  return pdfjs.getDocument({
    url,
    cMapUrl: PDF_CMAP_URL,
    cMapPacked: true,
    standardFontDataUrl: PDF_STANDARD_FONT_URL,
    isEvalSupported: false,
  }).promise;
}

export type { PdfjsModule };
