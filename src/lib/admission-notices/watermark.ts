/**
 * admission-notices/watermark.ts
 *
 * Server-side image watermarking for the Success Stories feature
 * (Phase 51). Takes a buffer (PNG/JPEG/WebP), bakes a SICA logo
 * watermark onto it, and returns the watermarked buffer.
 *
 * Design:
 *
 *   1. Tiled diagonal SICA logo (the actual brand mark from
 *      public/sica-logo.svg) at 10% opacity. The tile pattern
 *      covers the entire image so a casual user can't crop out
 *      the watermark without losing the visible content of the
 *      notice (passport numbers, signatures, etc.).
 *
 *   2. The SICA logo is rendered from an inline SVG, baked into a
 *      single small tile PNG, then repeated across the canvas by
 *      sharp's `tile: true` composite.
 *
 *   3. Output is JPEG quality 85% to keep file size small while
 *      preserving readability of the notice text. Width is capped
 *      at 1600px so a phone-captured 4000px image doesn't bloat
 *      the public storage bucket.
 *
 *   4. The watermark is *baked* into the image at upload time.
 *      The browser receives the watermarked file directly. There's
 *      no client-side watermark that can be removed with devtools.
 *
 * Why a tiled pattern (not a single centered logo):
 *   - Single-center can be cropped with basic image tools.
 *   - Tile covers the entire image area; the only way to remove
 *     it is to clone-stamp the whole image, which is obvious if
 *     anyone tries.
 *
 * ── Perf rewrite (rasterize-one-tile + `tile: true`) ──────────────
 * The original implementation emitted ONE giant SVG canvas sized to
 * the image, containing a <use> reference to the brand logo for
 * every cell of a grid large enough to cover the *rotated
 * diagonal* of the canvas. For a 1600px-wide output that worked
 * out to ~372 `<use>` instances, each of which made librsvg
 * re-rasterize the logo's ~6.8KB of clipPath geometry across a
 * 2560x2027 canvas. Measured cost:
 *
 *     800x600   ->    317ms
 *     1600x1067 ->   7631ms     <-- cliff
 *     3000x2000 ->   7556ms
 *     4000x3000 ->   8408ms
 *
 * Because `applySicaWatermark` is awaited synchronously inside
 * POST /api/admin/admission-notices/upload, that ~8s of CPU ran
 * inside the request handler and blocked the server on every admin
 * upload of a full-resolution phone photo. It also blew the 5s
 * vitest default timeout in admission-notices-watermark.test.ts,
 * which had been mis-diagnosed as an environment flake (it
 * reproduced deterministically in isolation).
 *
 * The fix rasterizes the logo ONCE into a single TILE_W x TILE_H
 * PNG — with the -30deg rotation baked into the tile itself — and
 * lets sharp repeat it with `tile: true`. Axis-aligned tiling of
 * pre-rotated logos preserves both properties the design cares
 * about: every logo still reads at a diagonal, and coverage is
 * still edge-to-edge (actually stronger — no corner gaps, since
 * the tile grid no longer has to over-cover a rotated diagonal).
 *
 * That also removes the extend/extract padding dance the old
 * version needed to keep rotated tiles from clipping at the edges,
 * which was two extra full-image sharp passes.
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

/** Max output width. Larger uploads get downscaled. */
const MAX_WIDTH = 1600;
/** JPEG quality for the output. */
const JPEG_QUALITY = 85;
/** Watermark tile cell width. Tiled at this pitch across the canvas. */
const TILE_WIDTH = 360;
/** Watermark tile cell height (~4:1, matching the logo's aspect). */
const TILE_HEIGHT = 115;
/** Watermark opacity (0-1). Tuned to be visible but not dominant. */
const TILE_OPACITY = 0.1;
/** Rendered logo size inside each tile (preserves the logo's 4:1 ratio). */
const LOGO_WIDTH = 280;
const LOGO_HEIGHT = 70;
/** Diagonal tilt applied to each logo inside its tile. */
const TILE_ROTATE = -30;

/**
 * Load the SICA brand logo SVG from public/sica-logo.svg and
 * extract the inner content (everything inside the outer <svg>
 * element). Cached at module load — the file is small (~7KB)
 * and immutable.
 *
 * If the file isn't found (e.g. dev environment with a missing
 * public/), fall back to a simple "SICA" text tile so the
 * watermark feature still works (better than a hard failure on
 * the upload route).
 */
function loadSicaLogoInner(): string {
  try {
    // process.cwd() is the project root in both the Next.js build
    // and the tsx seed-script contexts.
    const candidates = [
      join(process.cwd(), 'public/sica-logo.svg'),
      join(process.cwd(), '..', 'public/sica-logo.svg'),
    ];
    let raw = '';
    for (const c of candidates) {
      try {
        raw = readFileSync(c, 'utf-8');
        break;
      } catch {
        // try next candidate
      }
    }
    if (!raw) throw new Error('sica-logo.svg not found');
    // Extract the inner content. Strip the outer <svg ...> wrapper.
    const m = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
    return m ? m[1] : raw;
  } catch {
    // Fallback: a plain "SICA" wordmark so the watermark still works.
    return `<text x="0" y="50" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900" fill="#9B1B30">SICA</text>`;
  }
}

const SICA_LOGO_INNER = loadSicaLogoInner();

/** Memoized rasterization of the single watermark tile. */
let tilePromise: Promise<Buffer> | null = null;

/**
 * Render ONE watermark tile: the SICA brand logo scaled to
 * LOGO_WIDTH x LOGO_HEIGHT, tilted TILE_ROTATE degrees, centered
 * in a transparent TILE_WIDTH x TILE_HEIGHT cell.
 *
 * The result is memoized per process — the tile is identical for
 * every upload, so it is rasterized at most once no matter how
 * many notices come through.
 */
function buildWatermarkTile(): Promise<Buffer> {
  if (tilePromise) return tilePromise;
  tilePromise = (async () => {
    // The source logo's natural viewBox is 300x75 (4:1); scale that
    // into LOGO_WIDTH so the paths rasterize at their intended size.
    const scale = LOGO_WIDTH / 300;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_WIDTH}" height="${TILE_HEIGHT}" viewBox="0 0 ${TILE_WIDTH} ${TILE_HEIGHT}"><g transform="translate(${TILE_WIDTH / 2} ${TILE_HEIGHT / 2}) rotate(${TILE_ROTATE}) translate(${-LOGO_WIDTH / 2} ${-LOGO_HEIGHT / 2})"><g opacity="${TILE_OPACITY}" transform="scale(${scale})">${SICA_LOGO_INNER}</g></g></svg>`;
    return await sharp(Buffer.from(svg)).png().toBuffer();
  })();
  return tilePromise;
}

/**
 * Apply the SICA watermark to an image buffer.
 *
 *   - Input: any sharp-supported format (PNG, JPEG, WebP, HEIC, etc.)
 *   - Output: JPEG buffer, ≤ 1600px wide, quality 85%, with the
 *     tiled SICA watermark baked in.
 *
 * Throws on sharp errors (corrupt input, etc.). The caller (the
 * admin upload route) catches and returns 400.
 */
export async function applySicaWatermark(input: Buffer): Promise<Buffer> {
  // Read the input once: get metadata for sizing.
  const metadata = await sharp(input, { failOn: 'none' }).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }
  // Compute the target width (preserve aspect ratio, cap at MAX_WIDTH).
  const targetWidth = Math.min(metadata.width, MAX_WIDTH);
  const scale = targetWidth / metadata.width;
  const targetHeight = Math.round(metadata.height * scale);

  // sharp applies resize BEFORE composite, so the tile is laid over
  // the already-downscaled canvas and the repeated tile count stays
  // proportional to the final (capped) output size.
  return await sharp(input, { failOn: 'none' })
    .rotate() // auto-rotate based on EXIF orientation
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .composite([{ input: await buildWatermarkTile(), tile: true }])
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

/** Hard caps for the admin upload route. */
export const ADMISSION_NOTICE_MAX_INPUT_BYTES = 15 * 1024 * 1024; // 15 MB
export const ADMISSION_NOTICE_ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;
