/**
 * University media: download external image URLs → WebP → Supabase Storage.
 *
 * Phase 175. Used by POST/PUT /api/universities and the admin bulk
 * import endpoint. Partial failure keeps the original URL and reports
 * via MediaImportReport — the university row still saves.
 *
 * Bucket `university-media` is created manually in the Supabase
 * dashboard (see database/2026-10-17_university_media_bucket_notes.sql).
 */

import { createHash } from 'crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { assertSafeWebhookUrl } from '@/lib/ssrf-guard';

export const UNIVERSITY_MEDIA_BUCKET = 'university-media';

const MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 20_000;
const GALLERY_IMPORT_CAP = 12;
const LOGO_MAX = 512;
const BANNER_MAX_WIDTH = 1600;
const LOGO_QUALITY = 80;
const BANNER_QUALITY = 75;

export type MediaImportReport = {
  imported: number;
  skipped: number;
  failed: Array<{ field: string; url: string; error: string }>;
};

type MediaKind = 'logo' | 'banner' | 'gallery';

function getStorageClient(): SupabaseClient | null {
  const url = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Absolute URL whose path includes `/university-media/` (our bucket). */
export function isUniversityMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.pathname.includes('/university-media/');
  } catch {
    return false;
  }
}

/**
 * True when the URL should be downloaded and re-hosted.
 * Skips empty, already-ours Storage URLs, and static `/university-logos/…`.
 */
export function isExternalImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (isUniversityMediaUrl(trimmed)) return false;
  // Relative or absolute path ending in /university-logos/…
  if (trimmed.startsWith('/university-logos/')) return false;
  try {
    const u = new URL(trimmed);
    if (u.pathname.includes('/university-logos/')) return false;
  } catch {
    // Relative non-/university-logos path — treat as external only if
    // it looks like an absolute http(s) URL; bare relative paths are
    // not fetchable and should be skipped.
    return false;
  }
  return true;
}

function emptyReport(): MediaImportReport {
  return { imported: 0, skipped: 0, failed: [] };
}

function shortHash(input: string): string {
  return createHash('sha256').update(input).digest('hex').slice(0, 8);
}

function sanitizeSlug(slug: string): string {
  // University slugs are already validated by Zod; still strip anything
  // outside the known safe pattern so a buggy caller can't path-traverse.
  const cleaned = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
  return cleaned || 'unknown';
}

function storagePath(slug: string, kind: MediaKind, galleryIndex?: number, sourceUrl?: string): string {
  const safe = sanitizeSlug(slug);
  if (kind === 'logo') return `universities/${safe}/logo.webp`;
  if (kind === 'banner') return `universities/${safe}/banner.webp`;
  const idx = galleryIndex ?? 0;
  const hash = shortHash(sourceUrl || String(idx));
  return `universities/${safe}/gallery/${idx}-${hash}.webp`;
}

async function compressToWebp(buffer: Buffer, kind: MediaKind): Promise<Buffer> {
  let pipeline = sharp(buffer, { failOn: 'none' }).rotate();
  if (kind === 'logo') {
    pipeline = pipeline.resize({
      width: LOGO_MAX,
      height: LOGO_MAX,
      fit: 'inside',
      withoutEnlargement: true,
    });
    return pipeline.webp({ quality: LOGO_QUALITY }).toBuffer();
  }
  pipeline = pipeline.resize({
    width: BANNER_MAX_WIDTH,
    withoutEnlargement: true,
  });
  return pipeline.webp({ quality: BANNER_QUALITY }).toBuffer();
}

/**
 * Download one URL (SSRF-safe, https only), compress, upload.
 * Returns the public Storage URL or an error string.
 */
export async function importUniversityImageFromUrl(args: {
  slug: string;
  url: string;
  kind: MediaKind;
  galleryIndex?: number;
  /** Injected for tests — when set, skips network + storage. */
  _testFetch?: typeof fetch;
  _testUpload?: (path: string, body: Buffer) => Promise<string>;
}): Promise<{ publicUrl: string } | { error: string }> {
  const url = args.url.trim();
  if (!url) return { error: 'Empty URL' };

  // Media imports are always prod-strict: https only, no localhost.
  const safe = await assertSafeWebhookUrl(url, false);
  if (!safe.ok) return { error: safe.reason };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { error: 'Invalid URL' };
  }
  if (parsed.protocol !== 'https:') {
    return { error: 'Only https URLs are allowed' };
  }

  const doFetch = args._testFetch ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  let response: Response;
  try {
    response = await doFetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { Accept: 'image/*,*/*;q=0.8' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Fetch failed';
    return { error: msg.includes('abort') ? 'Download timed out' : msg };
  } finally {
    clearTimeout(timer);
  }

  if (response.status >= 300 && response.status < 400) {
    return { error: 'Redirects are not followed' };
  }
  if (!response.ok) {
    return { error: `HTTP ${response.status}` };
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.startsWith('image/')) {
    return { error: `Content-Type must be image/* (got ${contentType || 'missing'})` };
  }

  const contentLength = Number(response.headers.get('content-length') || 0);
  if (contentLength > MAX_DOWNLOAD_BYTES) {
    return { error: 'Image exceeds 15 MB limit' };
  }

  const ab = await response.arrayBuffer();
  if (ab.byteLength > MAX_DOWNLOAD_BYTES) {
    return { error: 'Image exceeds 15 MB limit' };
  }
  const raw = Buffer.from(ab);

  let webp: Buffer;
  try {
    webp = await compressToWebp(raw, args.kind);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'sharp failed';
    return { error: `Image decode/compress failed: ${msg}` };
  }

  const path = storagePath(args.slug, args.kind, args.galleryIndex, url);

  if (args._testUpload) {
    try {
      const publicUrl = await args._testUpload(path, webp);
      return { publicUrl };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Upload failed' };
    }
  }

  const supabase = getStorageClient();
  if (!supabase) return { error: 'Storage not configured' };

  const { error: uploadErr } = await supabase.storage
    .from(UNIVERSITY_MEDIA_BUCKET)
    .upload(path, webp, {
      contentType: 'image/webp',
      upsert: true,
    });
  if (uploadErr) {
    console.error('[university-media] upload:', uploadErr.message, { host: parsed.hostname });
    return { error: `Upload failed: ${uploadErr.message}` };
  }

  const { data } = supabase.storage.from(UNIVERSITY_MEDIA_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) return { error: 'Failed to resolve public URL' };
  return { publicUrl: data.publicUrl };
}

/**
 * Import logo / banner / gallery for one university. Fields that are
 * already ours or empty are skipped. Failures keep the original URL.
 */
export async function importUniversityMediaFields(args: {
  slug: string;
  logo?: string | null;
  image?: string | null;
  gallery?: string[] | null;
  _testFetch?: typeof fetch;
  _testUpload?: (path: string, body: Buffer) => Promise<string>;
}): Promise<{
  logo: string | null | undefined;
  image: string | null | undefined;
  gallery: string[] | null | undefined;
  report: MediaImportReport;
}> {
  const report = emptyReport();
  let logo = args.logo;
  let image = args.image;
  let gallery = args.gallery;

  const inject = {
    _testFetch: args._testFetch,
    _testUpload: args._testUpload,
  };

  // Logo
  if (typeof logo === 'string' && logo.trim()) {
    if (!isExternalImageUrl(logo)) {
      report.skipped += 1;
    } else {
      const result = await importUniversityImageFromUrl({
        slug: args.slug,
        url: logo,
        kind: 'logo',
        ...inject,
      });
      if ('publicUrl' in result) {
        logo = result.publicUrl;
        report.imported += 1;
      } else {
        report.failed.push({ field: 'logo', url: logo, error: result.error });
      }
    }
  }

  // Banner (DB column `image`)
  if (typeof image === 'string' && image.trim()) {
    if (!isExternalImageUrl(image)) {
      report.skipped += 1;
    } else {
      const result = await importUniversityImageFromUrl({
        slug: args.slug,
        url: image,
        kind: 'banner',
        ...inject,
      });
      if ('publicUrl' in result) {
        image = result.publicUrl;
        report.imported += 1;
      } else {
        report.failed.push({ field: 'image', url: image, error: result.error });
      }
    }
  }

  // Gallery
  if (Array.isArray(gallery) && gallery.length > 0) {
    const next: string[] = [];
    let externalSeen = 0;
    for (let i = 0; i < gallery.length; i++) {
      const entry = gallery[i];
      if (typeof entry !== 'string' || !entry.trim()) {
        next.push(entry);
        continue;
      }
      if (!isExternalImageUrl(entry)) {
        report.skipped += 1;
        next.push(entry);
        continue;
      }
      externalSeen += 1;
      if (externalSeen > GALLERY_IMPORT_CAP) {
        // Leave as original; warn once per excess URL.
        report.failed.push({
          field: `gallery[${i}]`,
          url: entry,
          error: `Gallery import cap of ${GALLERY_IMPORT_CAP} reached; left as external URL`,
        });
        next.push(entry);
        continue;
      }
      const result = await importUniversityImageFromUrl({
        slug: args.slug,
        url: entry,
        kind: 'gallery',
        galleryIndex: i,
        ...inject,
      });
      if ('publicUrl' in result) {
        next.push(result.publicUrl);
        report.imported += 1;
      } else {
        report.failed.push({ field: `gallery[${i}]`, url: entry, error: result.error });
        next.push(entry);
      }
    }
    gallery = next;
  }

  return { logo, image, gallery, report };
}

/** Exported for tests — compress a buffer the same way production does. */
export async function compressUniversityImageBuffer(
  buffer: Buffer,
  kind: MediaKind,
): Promise<Buffer> {
  return compressToWebp(buffer, kind);
}

export const UNIVERSITY_MEDIA_GALLERY_CAP = GALLERY_IMPORT_CAP;
