/**
 * university-media.test.ts
 *
 * Phase 175: detect helpers, gallery import cap, and sharp PNG→WebP
 * compression. Network + storage are injected via `_testFetch` /
 * `_testUpload`. SSRF runs real DNS before `_testFetch`, so happy-path
 * URLs must be public https hosts (e.g. https://8.8.8.8/…).
 */
import { describe, it, expect } from 'vitest';
import sharp from 'sharp';
import {
  UNIVERSITY_MEDIA_BUCKET,
  UNIVERSITY_MEDIA_GALLERY_CAP,
  isUniversityMediaUrl,
  isExternalImageUrl,
  compressUniversityImageBuffer,
  importUniversityImageFromUrl,
  importUniversityMediaFields,
} from '@/lib/university-media';

async function makeTestPng(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 30, g: 80, b: 160 },
    },
  })
    .png()
    .toBuffer();
}

describe('isUniversityMediaUrl', () => {
  it('returns true for Storage public URLs under /university-media/', () => {
    expect(
      isUniversityMediaUrl(
        'https://wbzdwwvtbaftjxecgdxk.supabase.co/storage/v1/object/public/university-media/universities/tsinghua/logo.webp',
      ),
    ).toBe(true);
  });

  it('returns false for empty, relative, or unrelated URLs', () => {
    expect(isUniversityMediaUrl('')).toBe(false);
    expect(isUniversityMediaUrl('/university-logos/tsinghua.avif')).toBe(false);
    expect(isUniversityMediaUrl('https://cdn.example.com/logo.png')).toBe(false);
    expect(isUniversityMediaUrl('not a url')).toBe(false);
  });
});

describe('isExternalImageUrl', () => {
  it('returns true for absolute external https image URLs', () => {
    expect(isExternalImageUrl('https://cdn.urongda.com/logos/tsinghua.png')).toBe(true);
  });

  it('skips our Storage URLs and static /university-logos/ paths', () => {
    expect(
      isExternalImageUrl(
        'https://wbzdwwvtbaftjxecgdxk.supabase.co/storage/v1/object/public/university-media/universities/x/logo.webp',
      ),
    ).toBe(false);
    expect(isExternalImageUrl('/university-logos/tsinghua.avif')).toBe(false);
    expect(
      isExternalImageUrl('https://studyinchina.academy/university-logos/tsinghua.avif'),
    ).toBe(false);
  });

  it('skips empty and bare relative paths', () => {
    expect(isExternalImageUrl('')).toBe(false);
    expect(isExternalImageUrl('   ')).toBe(false);
    expect(isExternalImageUrl('logo.png')).toBe(false);
  });
});

describe('compressUniversityImageBuffer', () => {
  it('converts PNG to WebP for logo (≤512)', async () => {
    const input = await makeTestPng(800, 600);
    const output = await compressUniversityImageBuffer(input, 'logo');
    const meta = await sharp(output).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBeLessThanOrEqual(512);
    expect(meta.height).toBeLessThanOrEqual(512);
  });

  it('converts PNG to WebP for banner (width ≤1600)', async () => {
    const input = await makeTestPng(2400, 1200);
    const output = await compressUniversityImageBuffer(input, 'banner');
    const meta = await sharp(output).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBeLessThanOrEqual(1600);
  });
});

describe('importUniversityImageFromUrl', () => {
  it('rejects private / non-https URLs via SSRF (before _testFetch)', async () => {
    const r = await importUniversityImageFromUrl({
      slug: 'test-uni',
      url: 'https://127.0.0.1/logo.png',
      kind: 'logo',
      _testFetch: async () => {
        throw new Error('_testFetch should not run');
      },
    });
    expect('error' in r).toBe(true);
  });

  it('downloads, compresses, and uploads via test hooks', async () => {
    const png = await makeTestPng(200, 200);
    let uploadedPath = '';
    let uploadedBody: Buffer | null = null;

    const r = await importUniversityImageFromUrl({
      slug: 'test-uni',
      url: 'https://8.8.8.8/logo.png',
      kind: 'logo',
      _testFetch: async () =>
        new Response(new Uint8Array(png), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
      _testUpload: async (path, body) => {
        uploadedPath = path;
        uploadedBody = body;
        return `https://example.supabase.co/storage/v1/object/public/${UNIVERSITY_MEDIA_BUCKET}/${path}`;
      },
    });

    expect('publicUrl' in r).toBe(true);
    if ('publicUrl' in r) {
      expect(r.publicUrl).toContain('/university-media/');
      expect(r.publicUrl).toContain('universities/test-uni/logo.webp');
    }
    expect(uploadedPath).toBe('universities/test-uni/logo.webp');
    expect(uploadedBody).not.toBeNull();
    const meta = await sharp(uploadedBody!).metadata();
    expect(meta.format).toBe('webp');
  });

  it('rejects non-image Content-Type', async () => {
    const r = await importUniversityImageFromUrl({
      slug: 'test-uni',
      url: 'https://8.8.8.8/not-image',
      kind: 'logo',
      _testFetch: async () =>
        new Response('{"ok":true}', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    });
    expect('error' in r).toBe(true);
    if ('error' in r) expect(r.error).toMatch(/Content-Type/i);
  });

  it('rejects redirects (redirect: manual)', async () => {
    const r = await importUniversityImageFromUrl({
      slug: 'test-uni',
      url: 'https://8.8.8.8/redirect',
      kind: 'logo',
      _testFetch: async () =>
        new Response(null, {
          status: 302,
          headers: { Location: 'https://evil.example/x.png' },
        }),
    });
    expect('error' in r).toBe(true);
    if ('error' in r) expect(r.error).toMatch(/Redirect/i);
  });
});

describe('importUniversityMediaFields', () => {
  it('skips already-ours URLs and empty fields', async () => {
    const ours =
      'https://wbzdwwvtbaftjxecgdxk.supabase.co/storage/v1/object/public/university-media/universities/x/logo.webp';
    const { logo, report } = await importUniversityMediaFields({
      slug: 'test-uni',
      logo: ours,
      image: null,
      gallery: null,
    });
    expect(logo).toBe(ours);
    expect(report.skipped).toBe(1);
    expect(report.imported).toBe(0);
    expect(report.failed).toHaveLength(0);
  });

  it('imports logo + banner and rewrites URLs on success', async () => {
    const png = await makeTestPng(100, 100);
    const { logo, image, report } = await importUniversityMediaFields({
      slug: 'test-uni',
      logo: 'https://8.8.8.8/logo.png',
      image: 'https://8.8.8.8/banner.jpg',
      gallery: null,
      _testFetch: async () =>
        new Response(new Uint8Array(png), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
      _testUpload: async (path) =>
        `https://example.supabase.co/storage/v1/object/public/${UNIVERSITY_MEDIA_BUCKET}/${path}`,
    });
    expect(logo).toContain('/university-media/');
    expect(image).toContain('/university-media/');
    expect(report.imported).toBe(2);
    expect(report.failed).toHaveLength(0);
  });

  it('keeps original URL when import fails', async () => {
    const original = 'https://8.8.8.8/broken.png';
    const { logo, report } = await importUniversityMediaFields({
      slug: 'test-uni',
      logo: original,
      _testFetch: async () => new Response('nope', { status: 404 }),
    });
    expect(logo).toBe(original);
    expect(report.imported).toBe(0);
    expect(report.failed).toHaveLength(1);
    expect(report.failed[0].field).toBe('logo');
  });

  it(`caps gallery imports at ${UNIVERSITY_MEDIA_GALLERY_CAP} external URLs`, async () => {
    const png = await makeTestPng(64, 64);
    const gallery = Array.from(
      { length: UNIVERSITY_MEDIA_GALLERY_CAP + 3 },
      (_, i) => `https://8.8.8.8/g${i}.png`,
    );
    const { gallery: next, report } = await importUniversityMediaFields({
      slug: 'test-uni',
      gallery,
      _testFetch: async () =>
        new Response(new Uint8Array(png), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
      _testUpload: async (path) =>
        `https://example.supabase.co/storage/v1/object/public/${UNIVERSITY_MEDIA_BUCKET}/${path}`,
    });
    expect(next).toHaveLength(UNIVERSITY_MEDIA_GALLERY_CAP + 3);
    expect(report.imported).toBe(UNIVERSITY_MEDIA_GALLERY_CAP);
    // Excess external URLs stay as original + appear in failed with cap message
    expect(report.failed.length).toBe(3);
    expect(report.failed.every((f) => /cap of 12/i.test(f.error))).toBe(true);
    // First 12 rewritten; last 3 still external
    for (let i = 0; i < UNIVERSITY_MEDIA_GALLERY_CAP; i++) {
      expect(next![i]).toContain('/university-media/');
    }
    for (let i = UNIVERSITY_MEDIA_GALLERY_CAP; i < gallery.length; i++) {
      expect(next![i]).toBe(gallery[i]);
    }
  });
});
