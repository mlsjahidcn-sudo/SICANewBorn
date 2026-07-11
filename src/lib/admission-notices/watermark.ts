/**
 * admission-notices/watermark.ts
 *
 * Server-side image watermarking for the Success Stories feature
 * (Phase 51). Takes a buffer (PNG/JPEG/WebP), bakes a SICA logo
 * watermark onto it, and returns the watermarked buffer.
 *
 * Design:
 *
 *   1. Tiled diagonal SICA logo + `sica.com.cn` text, 30% opacity.
 *      The tile pattern covers the entire image so a casual user
 *      can't crop the watermark out without losing the visible
 *      content of the notice (passport numbers, signatures, etc.).
 *
 *   2. The SICA logo is rendered as an inline SVG (with the brand
 *      colors #9B1B30 + #1B2A4A) so we don't need to ship a
 *      separate PNG asset. Sharp handles SVG → raster natively.
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
 */
import sharp from 'sharp';

/** Max output width. Larger uploads get downscaled. */
const MAX_WIDTH = 1600;
/** JPEG quality for the output. */
const JPEG_QUALITY = 85;
/** Watermark tile width. The tile is rotated 30° and tiled. */
const TILE_WIDTH = 360;
/** Watermark opacity (0-1). 0.3 is visible without obscuring text. */
const TILE_OPACITY = 0.3;

/**
 * Build a tiled-watermark SVG sized to the input image. The tile
 * pattern is rotated 30° and repeated across the full canvas.
 *
 * Canvas strategy: the SVG canvas is the SAME size as the input
 * (width × height). The tile grid is rendered in a group that's
 * then rotated by -30° around the canvas center. Anything that
 * extends outside the canvas is clipped by the SVG viewBox — so
 * the corners may have a partial tile, but the watermark is
 * uniformly dense and the resulting buffer composites cleanly
 * onto the base image.
 */
function buildTiledWatermarkSvg(width: number, height: number): string {
  // A reasonable tile is ~360x110. For a 1280x1080 image, that's
  // about 3.5 x 9.8 = ~35 tiles. Enough density to prevent crops.
  const tileW = TILE_WIDTH;
  const tileH = Math.round(TILE_WIDTH * 0.32);
  const rotate = -30;

  // The rotated grid extends beyond width×height, so we need to
  // render a larger grid and let the viewBox clip. The diagonal
  // of width×height rotated by 30° is roughly width+height in
  // each direction; pad to be safe.
  const diagonal = Math.ceil(Math.sqrt(width * width + height * height));
  const gridW = diagonal + tileW;
  const gridH = diagonal + tileH;
  const cols = Math.ceil(gridW / tileW) + 1;
  const rows = Math.ceil(gridH / tileH) + 1;

  // Build N tile elements positioned in a grid.
  let tiles = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles += `<g transform="translate(${c * tileW}, ${r * tileH})">
        <text x="0" y="${Math.round(tileH * 0.6)}" font-family="Arial, Helvetica, sans-serif" font-size="60" font-weight="900" fill="white" fill-opacity="${TILE_OPACITY}" stroke="white" stroke-opacity="${TILE_OPACITY * 0.4}" stroke-width="0.5">SICA</text>
        <text x="0" y="${Math.round(tileH * 0.95)}" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="white" fill-opacity="${TILE_OPACITY}">www.sica.com.cn</text>
      </g>`;
    }
  }

  // Outer wrapper: rotate the tile grid around its own center, then
  // translate so the rotated grid is centered on the (width, height)
  // canvas. The viewBox ensures anything outside is clipped.
  const gridCenterX = (cols * tileW) / 2;
  const gridCenterY = (rows * tileH) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <g transform="rotate(${rotate} ${gridCenterX} ${gridCenterY}) translate(${-((cols * tileW - width) / 2)}, ${-((rows * tileH - height) / 2)})">${tiles}</g>
  </svg>`;
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
  const baseImage = sharp(input, { failOn: 'none' });
  const metadata = await baseImage.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error('Could not read image dimensions');
  }
  // Compute the target width (preserve aspect ratio, cap at MAX_WIDTH).
  const targetWidth = Math.min(metadata.width, MAX_WIDTH);
  const scale = targetWidth / metadata.width;
  const targetHeight = Math.round(metadata.height * scale);

  // Pad the base image so the rotated watermark tiles don't clip
  // at the edges. The padding is added before compositing and
  // removed after, so the output dimensions match the input.
  // sharp requires composite images to be ≤ the base in both
  // dimensions — the padding approach keeps the invariant.
  const padding = Math.ceil(Math.max(targetWidth, targetHeight) * 0.3);
  const extendedW = targetWidth + padding * 2;
  const extendedH = targetHeight + padding * 2;

  // Resize the input, then pad with white. Output as raw buffer
  // (no JPEG compression yet — the watermark composite would lose
  // quality).
  const paddedBuffer = await sharp(input, { failOn: 'none' })
    .rotate() // auto-rotate based on EXIF orientation
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toBuffer();

  // Build the watermark tile canvas. We then force its rendered
  // dimensions to match the padded image exactly (sharp's SVG
  // renderer can produce off-by-one sizes due to viewBox +
  // width/height attribute interactions; this guarantees the
  // composite invariant the call site depends on).
  const watermarkSvg = buildTiledWatermarkSvg(extendedW, extendedH);
  const watermarkBuffer = await sharp(Buffer.from(watermarkSvg))
    .resize(extendedW, extendedH, { fit: 'fill' })
    .png()
    .toBuffer();

  // Composite the watermark on the padded base, then trim back to
  // the original dimensions as a separate step. We can't chain
  // composite → extract because sharp validates the composite
  // input against the FINAL output size (post-extract), which
  // is smaller than the composite input.
  const composited = await sharp(paddedBuffer)
    .composite([
      {
        input: watermarkBuffer,
        top: 0,
        left: 0,
      },
    ])
    .toBuffer();
  return await sharp(composited)
    .extract({
      left: padding,
      top: padding,
      width: targetWidth,
      height: targetHeight,
    })
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
