/**
 * consultation-activity.ts
 *
 * Server-side fetch + validation helpers for the public "consultation
 * activity" social proof section. Backs the admin-managed CRUD at
 * `/admin/consultation-activity` (Phase 160).
 *
 * Storage model:
 *   - Bucket: `consultation-activity` — PUBLIC (created in Supabase
 *     Storage dashboard, NOT via SQL; the migration only creates
 *     the DB table + RLS).
 *   - `image_url` column stores the OBJECT PATH (relative to the
 *     bucket), e.g. `consultation/<shotId>/<filename>.jpg`. The
 *     public fetch helper builds the absolute URL via Supabase's
 *     `getPublicUrl()` so a bucket hostname change doesn't require
 *     a DB migration.
 *   - `<Image src=...>` on the public page uses the Supabase
 *     hostname which is already in `next.config.ts#remotePatterns`.
 *
 * Schema: `database/2026-10-12_consultation_activity.sql`
 *   - id uuid PK
 *   - image_url text NOT NULL (storage OBJECT path)
 *   - caption_en text NOT NULL
 *   - caption_zh text NOT NULL
 *   - person_name varchar(120) NOT NULL
 *   - initials varchar(8) NOT NULL
 *   - shot_date date (nullable)
 *   - is_active boolean NOT NULL DEFAULT true
 *   - display_order integer NOT NULL DEFAULT 0
 *   - created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
 *   - created_at + updated_at timestamptz
 *
 * RLS:
 *   - admin: full (SELECT/INSERT/UPDATE/DELETE via is_admin() helper)
 *   - public: SELECT WHERE is_active=true (anon can read)
 *
 * Single-source: all reads go through this helper. Public page +
 * admin page both call it; no duplicate mapping logic.
 */

import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import type { Locale } from '@/lib/i18n-translations';

export const CONSULTATION_BUCKET = 'consultation-activity';

export interface ConsultationShotRow {
  id: string;
  image_url: string;
  caption_en: string;
  caption_zh: string;
  person_name: string;
  initials: string;
  shot_date: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Resolved shot — what the public component consumes. imageSrc is
 * the absolute URL (built via Supabase getPublicUrl).
 */
export interface ResolvedConsultationShot {
  id: string;
  imageSrc: string;
  caption: string;
  personName: string;
  initials: string;
  shotDate: string | null;
}

/**
 * Public-facing fetch. Returns active shots sorted by
 * `display_order ASC, created_at DESC`. Returns [] when Supabase is
 * not configured (no rows = section hidden) or when the query
 * fails (logged + returns [] so the page still renders).
 *
 * `locale` selects which caption to use — `caption_zh` when zh,
 * else `caption_en`.
 */
export async function getActiveConsultationShots(
  locale: Locale,
): Promise<ResolvedConsultationShot[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('consultation_activity_shots')
      .select('id, image_url, caption_en, caption_zh, person_name, initials, shot_date, is_active, display_order, created_at, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[consultation-activity] public fetch failed:', error);
      return [];
    }
    const rows = (data || []) as ConsultationShotRow[];
    return rows.map((row) => {
      // Resolve the storage object path to a full public URL.
      // `getPublicUrl` returns `{ data: { publicUrl } }`; on
      // missing rows it returns null.
      const { data } = supabase.storage.from(CONSULTATION_BUCKET).getPublicUrl(row.image_url);
      return {
        id: row.id,
        imageSrc: data.publicUrl,
        caption: locale === 'zh' ? row.caption_zh : row.caption_en,
        personName: row.person_name,
        initials: row.initials,
        shotDate: row.shot_date,
      };
    });
  } catch (err) {
    console.error('[consultation-activity] unhandled:', err);
    return [];
  }
}

/**
 * Admin-facing fetch — returns all rows (including inactive) +
 * absolute image URLs + raw timestamp fields. Active-first ordering
 * (active rows on top, inactive below) keeps the inactive rows
 * visible for admins to re-enable.
 */
export async function getAllConsultationShotsAdmin(): Promise<
  Array<ConsultationShotRow & { imageSrc: string }>
> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('consultation_activity_shots')
      .select('*')
      .order('is_active', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[consultation-activity] admin fetch failed:', error);
      return [];
    }
    const rows = (data || []) as ConsultationShotRow[];
    return rows.map((row) => {
      const { data: urlData } = supabase.storage.from(CONSULTATION_BUCKET).getPublicUrl(row.image_url);
      return { ...row, imageSrc: urlData.publicUrl };
    });
  } catch (err) {
    console.error('[consultation-activity] admin unhandled:', err);
    return [];
  }
}

/**
 * Build a validation whitelist for the admin POST/PATCH payload.
 * Refuses anything outside the column whitelist (defense in depth
 * — PostgREST silently drops unknown keys, which is exactly the
 * "I sent it but the DB didn't get it" trap).
 */
export interface ConsultationShotInput {
  image_url: string;
  caption_en: string;
  caption_zh: string;
  person_name: string;
  initials: string;
  shot_date: string | null;
  is_active: boolean;
  display_order: number;
}

export function pickConsultationShotInput(body: unknown): ConsultationShotInput | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const out: Partial<ConsultationShotInput> = {};
  // image_url: required, non-empty string starting with `consultation/`
  // (defense-in-depth path-prefix check matching the documents pattern).
  if (typeof b.image_url === 'string' && b.image_url.trim().startsWith('consultation/')) {
    out.image_url = b.image_url.trim();
  }
  if (typeof b.caption_en === 'string' && b.caption_en.trim()) {
    out.caption_en = b.caption_en.trim();
  }
  if (typeof b.caption_zh === 'string' && b.caption_zh.trim()) {
    out.caption_zh = b.caption_zh.trim();
  }
  if (typeof b.person_name === 'string' && b.person_name.trim()) {
    out.person_name = b.person_name.trim();
  }
  if (typeof b.initials === 'string' && b.initials.trim() && b.initials.trim().length <= 8) {
    out.initials = b.initials.trim();
  }
  if (b.shot_date === null || b.shot_date === '') {
    out.shot_date = null;
  } else if (typeof b.shot_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.shot_date)) {
    out.shot_date = b.shot_date;
  }
  if (typeof b.is_active === 'boolean') {
    out.is_active = b.is_active;
  } else if (typeof b.is_active === 'string' && (b.is_active === 'true' || b.is_active === 'false')) {
    out.is_active = b.is_active === 'true';
  }
  if (typeof b.display_order === 'number' && Number.isFinite(b.display_order)) {
    out.display_order = Math.trunc(b.display_order);
  } else if (typeof b.display_order === 'string' && b.display_order.trim() !== '') {
    const n = parseInt(b.display_order, 10);
    if (Number.isFinite(n)) out.display_order = n;
  }
  if (
    !out.image_url ||
    !out.caption_en ||
    !out.caption_zh ||
    !out.person_name ||
    !out.initials ||
    typeof out.is_active !== 'boolean' ||
    typeof out.display_order !== 'number'
  ) {
    return null;
  }
  return out as ConsultationShotInput;
}
