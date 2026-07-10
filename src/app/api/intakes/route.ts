/**
 * /api/intakes
 *
 * Phase 50a: live intake-period catalog. Replaces the hardcoded
 * `getIntendedIntakes()` in src/lib/data.ts so admin-added
 * intakes (e.g. a new "2027 Fall" row) show up in the partner
 * application form + student wizard immediately.
 *
 * GET /api/intakes                  — all rows (admin context)
 * GET /api/intakes?active=true      — only is_active = TRUE rows
 *                                    (the public form dropdown)
 *
 * No auth required — the table's RLS policy grants public SELECT
 * on active rows (the form renders before auth). The
 * `?active=true` filter is the safest path to read for the
 * public form.
 *
 * Response: { intakes: [{ slug, label, applicationDeadline, startsAt, endsAt }] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, supabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('active') === 'true';

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 },
    );
  }

  try {
    let query = supabaseServer
      .from('intake_periods')
      .select('slug, label, application_deadline, starts_at, ends_at, is_active')
      .order('application_deadline', { ascending: true, nullsFirst: false });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[api/intakes GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const intakes = (data || []).map((row) => ({
      slug: row.slug as string,
      label: row.label as string,
      applicationDeadline: (row.application_deadline as string | null) ?? null,
      startsAt: (row.starts_at as string | null) ?? null,
      endsAt: (row.ends_at as string | null) ?? null,
      isActive: row.is_active as boolean,
    }));

    return NextResponse.json({ intakes });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[api/intakes GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
