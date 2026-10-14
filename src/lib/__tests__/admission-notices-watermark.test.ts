/**
 * admission-notices-watermark.test.ts
 *
 * Phase 51: tests the applySicaWatermark function with real sharp
 * + a tiny generated test image. The watermark is checked by
 * re-decoding the output and verifying:
 *   - The output is a valid JPEG
 *   - The dimensions are within the cap (≤ MAX_WIDTH)
 *   - The byte size is non-trivially different from the input
 *     (the tile pattern changes the image enough to be detectable)
 *   - The tile pattern reaches all four corners (anti-crop)
 */
import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import { applySicaWatermark, ADMISSION_NOTICE_MAX_INPUT_BYTES } from '@/lib/admission-notices/watermark';

async function makeTestJpeg(width: number, height: number): Promise<Buffer> {
  // A simple white image with a colored square in the center.
  return await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: Math.round(width / 3),
            height: Math.round(height / 3),
            channels: 3,
            background: { r: 200, g: 50, b: 50 },
          },
        })
          .png()
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .jpeg()
    .toBuffer();
}

describe('applySicaWatermark', () => {
  it('returns a valid JPEG', async () => {
    const input = await makeTestJpeg(800, 600);
    const output = await applySicaWatermark(input);
    const meta = await sharp(output).metadata();
    expect(meta.format).toBe('jpeg');
    expect(meta.width).toBeGreaterThan(0);
    expect(meta.height).toBeGreaterThan(0);
  });

  // Phase 172 note: this test used to carry a `{ timeout: 30_000 }` override,
  // added when the watermark was ~7.2s here and the failure was misread as a
  // slow-CI flake. It was never a flake — it was the rotated-grid SVG cliff,
  // now fixed (this case runs in ~0.4s). The override is gone so the vitest
  // default applies again; the dedicated tripwire in
  // `applySicaWatermark tiling coverage` guards against the cliff returning.
  it('caps the output width at 1600px', async () => {
    const input = await makeTestJpeg(3000, 2000);
    const output = await applySicaWatermark(input);
    const meta = await sharp(output).metadata();
    expect(meta.width).toBeLessThanOrEqual(1600);
    // Aspect ratio preserved (within 1%).
    const aspectIn = 3000 / 2000;
    const aspectOut = (meta.width || 0) / (meta.height || 1);
    expect(Math.abs(aspectIn - aspectOut) / aspectIn).toBeLessThan(0.01);
  });

  it('produces a different byte stream than the input (watermark altered pixels)', async () => {
    const input = await makeTestJpeg(800, 600);
    const output = await applySicaWatermark(input);
    expect(output.byteLength).toBeGreaterThan(0);
    expect(output.equals(input)).toBe(false);
  });

  it('handles a 1:1 square', async () => {
    const input = await makeTestJpeg(500, 500);
    const output = await applySicaWatermark(input);
    const meta = await sharp(output).metadata();
    expect(meta.width).toBe(500);
    expect(meta.height).toBe(500);
  });

  it('rejects invalid input gracefully (sharp throws)', async () => {
    await expect(applySicaWatermark(Buffer.from('not-an-image'))).rejects.toThrow();
  });
});

describe('ADMISSION_NOTICE_MAX_INPUT_BYTES', () => {
  it('is 15MB', () => {
    expect(ADMISSION_NOTICE_MAX_INPUT_BYTES).toBe(15 * 1024 * 1024);
  });
});

/**
 * Phase 172: the whole point of a *tiled* watermark is that it can't be
 * removed by cropping — so the tile pattern has to reach every edge,
 * including all four corners. Nothing asserted this before, so a future
 * "optimization" that quietly shrank the coverage would have shipped.
 *
 * Phase 172 also replaced the rotated-grid SVG with a single pre-rotated
 * tile repeated via sharp's `tile: true`; this is what pins that the
 * replacement still covers edge to edge. The pre-fix implementation
 * over-covered the rotated diagonal purely to guarantee the same thing.
 */
describe('applySicaWatermark tiling coverage', () => {
  const CORNER = 120;

  it('puts watermark pixels in all four corners of a full-width image', async () => {
    const input = await makeTestJpeg(1600, 1067);
    const output = await applySicaWatermark(input);
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });

    const nonWhiteIn = (ox: number, oy: number): number => {
      let n = 0;
      for (let y = oy; y < oy + CORNER && y < info.height; y++) {
        for (let x = ox; x < ox + CORNER && x < info.width; x++) {
          const i = (y * info.width + x) * info.channels;
          // The test image is white apart from a centered red square,
          // so anything under 250 means the watermark reached here.
          if (data[i] < 250 || data[i + 1] < 250 || data[i + 2] < 250) n++;
        }
      }
      return n;
    };

    expect(nonWhiteIn(0, 0)).toBeGreaterThan(0); // top-left
    expect(nonWhiteIn(info.width - CORNER, 0)).toBeGreaterThan(0); // top-right
    expect(nonWhiteIn(0, info.height - CORNER)).toBeGreaterThan(0); // bottom-left
    expect(nonWhiteIn(info.width - CORNER, info.height - CORNER)).toBeGreaterThan(0); // bottom-right
  });

  it('stays well under the 5s default timeout on a full-size image', async () => {
    // Regression tripwire for the Phase 172 perf cliff, NOT a benchmark.
    // Pre-fix this took ~7.2s and needed a 30s timeout to pass at all; the
    // tile-based version is ~0.4s. The 3s ceiling leaves generous headroom
    // for a slow/2-core CI runner while still failing loudly if the old
    // implementation ever comes back.
    const input = await makeTestJpeg(3000, 2000);
    const t0 = Date.now();
    await applySicaWatermark(input);
    expect(Date.now() - t0).toBeLessThan(3000);
  });
});
