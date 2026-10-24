import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/supabase-auth';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rate-limit';
import { CACHE_TAGS } from '@/lib/cache';
import { invalidateLiveCatalogCache } from '@/lib/ai/live-data-context';
import { invalidateCatalogSearchCache } from '@/lib/catalog-search-server';
import {
  importUniversityMediaFields,
  isExternalImageUrl,
  type MediaImportReport,
} from '@/lib/university-media';

/**
 * POST /api/admin/universities/import-media
 *
 * Phase 175 — bulk-import external logo / banner / gallery URLs into
 * the `university-media` Supabase Storage bucket as WebP. Used by the
 * "Import external images" button on `/admin/universities`.
 *
 * Body: `{ limit?: number, slug?: string }`
 *   - `slug` → process a single university (limit ignored)
 *   - otherwise scan for rows with external URLs, take first `limit`
 *     (default 25, max 100)
 *
 * Rate limit: 3 runs / 15 min per admin (heavy: downloads + sharp +
 * Storage uploads). Auth: requireAdmin.
 *
 * Response: `{ processed, updated, imported, skipped, failed, details }`
 */

export const maxDuration = 300;

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const BATCH_SIZE = 5;
const RATE_MAX = 3;
const RATE_WINDOW_MS = 15 * 60 * 1000;

type UniRow = {
  slug: string;
  logo: string | null;
  image: string | null;
  gallery: string[] | null;
};

type DetailRow = {
  slug: string;
  imported: number;
  skipped: number;
  failed: MediaImportReport['failed'];
  updated: boolean;
};

function rowHasExternalMedia(row: UniRow): boolean {
  if (typeof row.logo === 'string' && isExternalImageUrl(row.logo)) return true;
  if (typeof row.image === 'string' && isExternalImageUrl(row.image)) return true;
  if (Array.isArray(row.gallery)) {
    for (const entry of row.gallery) {
      if (typeof entry === 'string' && isExternalImageUrl(entry)) return true;
    }
  }
  return false;
}

function normalizeGallery(raw: unknown): string[] | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    return raw.filter((x): x is string => typeof x === 'string');
  }
  return null;
}

async function processOne(row: UniRow): Promise<DetailRow> {
  const media = await importUniversityMediaFields({
    slug: row.slug,
    logo: row.logo,
    image: row.image,
    gallery: row.gallery,
  });

  const shouldUpdate = media.report.imported >= 1;
  if (shouldUpdate && supabaseServer) {
    const patch: Record<string, unknown> = {};
    if (media.logo !== undefined && media.logo !== row.logo) {
      patch.logo = media.logo;
    }
    if (media.image !== undefined && media.image !== row.image) {
      patch.image = media.image;
    }
    if (media.gallery !== undefined) {
      const next = media.gallery ?? [];
      const prev = row.gallery ?? [];
      const changed =
        next.length !== prev.length || next.some((u, i) => u !== prev[i]);
      if (changed) patch.gallery = next;
    }

    if (Object.keys(patch).length > 0) {
      const { error } = await supabaseServer
        .from('universities')
        .update(patch)
        .eq('slug', row.slug);
      if (error) {
        console.error('[import-media] update failed:', row.slug, error.message);
        return {
          slug: row.slug,
          imported: media.report.imported,
          skipped: media.report.skipped,
          failed: [
            ...media.report.failed,
            { field: 'row', url: row.slug, error: `DB update failed: ${error.message}` },
          ],
          updated: false,
        };
      }
      revalidateTag(CACHE_TAGS.university(row.slug), 'default');
      return {
        slug: row.slug,
        imported: media.report.imported,
        skipped: media.report.skipped,
        failed: media.report.failed,
        updated: true,
      };
    }
  }

  return {
    slug: row.slug,
    imported: media.report.imported,
    skipped: media.report.skipped,
    failed: media.report.failed,
    updated: false,
  };
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const rl = checkRateLimit({
    action: 'university-import-media',
    key: auth.user.id,
    max: RATE_MAX,
    windowMs: RATE_WINDOW_MS,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `Too many import runs. Try again in ${rl.retryAfterSec} seconds.`,
        code: 'RATE_LIMITED',
        retryAfterSec: rl.retryAfterSec,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    );
  }

  let body: { limit?: unknown; slug?: unknown } = {};
  try {
    const raw = await request.json();
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      body = raw as { limit?: unknown; slug?: unknown };
    }
  } catch {
    // Empty body is fine — use defaults.
  }

  const slugFilter =
    typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : null;

  let limit = DEFAULT_LIMIT;
  if (typeof body.limit === 'number' && Number.isFinite(body.limit)) {
    limit = Math.max(1, Math.min(MAX_LIMIT, Math.floor(body.limit)));
  } else if (typeof body.limit === 'string' && /^\d+$/.test(body.limit)) {
    limit = Math.max(1, Math.min(MAX_LIMIT, parseInt(body.limit, 10)));
  }

  let candidates: UniRow[] = [];

  if (slugFilter) {
    const { data, error } = await supabaseServer
      .from('universities')
      .select('slug, logo, image, gallery')
      .eq('slug', slugFilter)
      .maybeSingle();
    if (error) {
      console.error('[import-media] select by slug:', error.message);
      return NextResponse.json({ error: 'Failed to load university' }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }
    const row: UniRow = {
      slug: data.slug as string,
      logo: (data.logo as string | null) ?? null,
      image: (data.image as string | null) ?? null,
      gallery: normalizeGallery(data.gallery),
    };
    if (rowHasExternalMedia(row)) {
      candidates = [row];
    }
  } else {
    // Broad scan — PostgREST can't express "URL looks external", so
    // we fetch a generous window and filter in JS. Cap the DB read
    // well above MAX_LIMIT so we can skip already-imported rows.
    const scanCap = Math.max(MAX_LIMIT * 4, 400);
    const { data, error } = await supabaseServer
      .from('universities')
      .select('slug, logo, image, gallery')
      .order('ranking', { ascending: true, nullsFirst: false })
      .limit(scanCap);
    if (error) {
      console.error('[import-media] select scan:', error.message);
      return NextResponse.json({ error: 'Failed to load universities' }, { status: 500 });
    }
    const rows: UniRow[] = (data ?? []).map((r) => ({
      slug: r.slug as string,
      logo: (r.logo as string | null) ?? null,
      image: (r.image as string | null) ?? null,
      gallery: normalizeGallery(r.gallery),
    }));
    candidates = rows.filter(rowHasExternalMedia).slice(0, limit);
  }

  const details: DetailRow[] = [];
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    const batch = candidates.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map((row) => processOne(row)));
    details.push(...results);
  }

  const processed = details.length;
  const updated = details.filter((d) => d.updated).length;
  const imported = details.reduce((n, d) => n + d.imported, 0);
  const skipped = details.reduce((n, d) => n + d.skipped, 0);
  const failed = details.reduce((n, d) => n + d.failed.length, 0);

  if (updated > 0) {
    revalidateTag(CACHE_TAGS.universities, 'default');
    invalidateLiveCatalogCache();
    invalidateCatalogSearchCache();
  }

  return NextResponse.json({
    processed,
    updated,
    imported,
    skipped,
    failed,
    details,
  });
}
