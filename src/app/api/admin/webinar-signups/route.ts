import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const VALID_STATUSES = ['Registered', 'Attended', 'No-Show', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

/**
 * Phase 139: list webinar signups for /admin/webinar-signups.
 *
 * Read-only — the page only displays rows and lets staff
 * change status client-side (via PATCH). No create/delete
 * endpoints because signups come exclusively from the public
 * form at /webinar-2027-intake-csc.
 *
 * Pagination: ?page=1 (1-indexed) + ?limit= (default 50,
 * capped at 200). Total count uses head:'exact' so the admin
 * header shows the true row count, not the page slice.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const rawStatus = searchParams.get('status');
  const status: WebinarStatus | null =
    rawStatus && (VALID_STATUSES as readonly string[]).includes(rawStatus)
      ? (rawStatus as WebinarStatus)
      : null;
  const search = searchParams.get('q')?.trim() || null;
  const pageRaw = searchParams.get('page');
  const limitRaw = searchParams.get('limit');
  const page = Math.max(1, parseInt(pageRaw ?? '1', 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(limitRaw ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  );
  const offset = (page - 1) * limit;

  let query = auth.supabase
    .from('webinar_signups')
    .select(
      'id, first_name, last_name, email, whatsapp, country, program_interests, notes, source_page, utm_source, utm_campaign, status, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (search) {
    // ilike against the 4 most-searchable columns. Supabase
    // doesn't expose full-text search here, but for a few
    // thousand rows the prefix-scan is fast enough.
    const term = `%${search}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},whatsapp.ilike.${term}`,
    );
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /api/admin/webinar-signups] query failed:', error);
    return NextResponse.json({ error: 'Failed to load signups' }, { status: 500 });
  }

  // Map snake_case DB rows → camelCase UI rows. The page reads
  // camelCase keys only — never `data[0].first_name` directly
  // — so a future column rename can't silently break the
  // admin view.
  const signups = (data ?? []).map((row) => ({
    id: row.id as string,
    firstName: (row.first_name as string | null) ?? '',
    lastName: (row.last_name as string | null) ?? '',
    email: (row.email as string | null) ?? '',
    whatsapp: (row.whatsapp as string | null) ?? '',
    country: (row.country as string | null) ?? null,
    programInterests: (row.program_interests as string[] | null) ?? [],
    notes: (row.notes as string | null) ?? null,
    sourcePage: (row.source_page as string | null) ?? null,
    utmSource: (row.utm_source as string | null) ?? null,
    utmCampaign: (row.utm_campaign as string | null) ?? null,
    status: (row.status as WebinarStatus) ?? 'Registered',
    createdAt: row.created_at as string,
  }));

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({
    signups,
    total,
    page,
    limit,
    totalPages,
  });
}
