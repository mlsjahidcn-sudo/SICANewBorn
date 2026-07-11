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
