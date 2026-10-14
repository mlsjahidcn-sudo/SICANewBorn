import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { trackServer } from '@/lib/analytics';
import { computeNextSessionDate, formatWebinarDate } from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Scheduled', 'Live', 'Completed', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

/**
 * Phase 164: admin CRUD on webinar_sessions.
 *
 * GET — list all sessions ordered by session_date ASC
 * (the auto-rollover sort key — date ordering replaces the
 * Phase 139-162 manual `display_order` column).
 *
 * POST — create a new session. `label` and `week_number`
 * are auto-generated when not supplied:
 *   - label: "Week {n} · {Mon DD, YYYY}" from the new
 *     week_number + session_date (Asia/Shanghai)
 *   - week_number: MAX(week_number) + 1, so the new row is
 *     always one slot past the highest-existing one
 *
 * Phase 164 dropped the `is_active` single-row toggle and
 * the corresponding flip-previous-off code; "active" is now
 * a derived query (`gt('session_date', now()) ORDER BY
 * session_date ASC LIMIT 1`).
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from('webinar_sessions')
    .select(
      'id, slug, title_en, title_zh, description_en, description_zh, session_date, session_time, duration_minutes, join_url, status, label, week_number, created_at, updated_at',
    )
    .order('session_date', { ascending: true });

  if (error) {
    console.error('[GET /api/admin/webinar-sessions] query failed:', error);
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 });
  }

  const sessions = (data ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    titleEn: (row.title_en as string) ?? '',
    titleZh: (row.title_zh as string) ?? '',
    descriptionEn: (row.description_en as string | null) ?? null,
    descriptionZh: (row.description_zh as string | null) ?? null,
    sessionDate: (row.session_date as string | null) ?? null,
    sessionTime: (row.session_time as string | null) ?? null,
    durationMinutes: (row.duration_minutes as number) ?? 60,
    joinUrl: (row.join_url as string | null) ?? null,
    status: (row.status as WebinarStatus) ?? 'Scheduled',
    label: (row.label as string | null) ?? null,
    weekNumber: (row.week_number as number | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? null,
  }));

  return NextResponse.json({ sessions });
}

interface CreateBody {
  slug?: string;
  titleEn?: string;
  titleZh?: string;
  descriptionEn?: string | null;
  descriptionZh?: string | null;
  sessionDate?: string | null;
  sessionTime?: string | null;
  durationMinutes?: number;
  joinUrl?: string | null;
  status?: WebinarStatus;
  /** Phase 164: optional — auto-generated from week_number + date when missing. */
  label?: string | null;
  /** Phase 164: optional — auto-assigned to MAX(week_number)+1 when missing. */
  weekNumber?: number | null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const titleEn = body.titleEn?.trim();
  const titleZh = body.titleZh?.trim();
  if (!slug || !titleEn || !titleZh) {
    return NextResponse.json(
      { error: 'slug, titleEn, and titleZh are required' },
      { status: 400 },
    );
  }
  if (body.status && !(VALID_STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of ${VALID_STATUSES.join('|')}` },
      { status: 400 },
    );
  }

  // Phase 164: auto-generate label + week_number when not
  // supplied. Reads the existing MAX(week_number) inside the
  // same admin session so the unique partial index accepts
  // the insert (no 23505). If two admins schedule at the
  // exact same moment the second one would 500 — that's the
  // intended defence-in-depth, same as the partial index
  // was for `is_active=true` in Phase 140.
  let weekNumber = typeof body.weekNumber === 'number' ? body.weekNumber : null;
  if (weekNumber == null) {
    const { data: maxRow } = await auth.supabase
      .from('webinar_sessions')
      .select('week_number')
      .not('week_number', 'is', null)
      .order('week_number', { ascending: false })
      .limit(1)
      .maybeSingle();
    weekNumber = ((maxRow?.week_number as number | undefined) ?? 0) + 1;
  }

  const sessionDateIso = body.sessionDate ?? null;
  let label = body.label?.trim() || null;
  if (!label && sessionDateIso) {
    const dateStr = formatWebinarDate(sessionDateIso);
    label = `Week ${weekNumber} · ${dateStr}`;
  }

  // Phase 164: when the admin hits "Schedule next" with no
  // session_date, default the next-week slot at 14:00 Beijing
  // (06:00 UTC) — staff can edit it afterwards.
  let resolvedSessionDate = sessionDateIso;
  if (!resolvedSessionDate) {
    resolvedSessionDate = computeNextSessionDate(null);
  }

  const { data, error } = await auth.supabase
    .from('webinar_sessions')
    .insert({
      slug,
      title_en: titleEn,
      title_zh: titleZh,
      description_en: body.descriptionEn ?? null,
      description_zh: body.descriptionZh ?? null,
      session_date: resolvedSessionDate,
      session_time: body.sessionTime ?? null,
      duration_minutes: body.durationMinutes ?? 60,
      join_url: body.joinUrl ?? null,
      status: body.status ?? 'Scheduled',
      label,
      week_number: weekNumber,
    })
    .select('id, slug, label, week_number')
    .single();

  if (error) {
    console.error('[POST /api/admin/webinar-sessions] insert failed:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  // Phase 143: admin-action event (kept under the same event
  // name — no consumer changes needed). Phase 164's
  // auto-create path emits the same event as the manual
  // dialog path; admins can segment in GA by `week_number`.
  trackServer('webinar_session_created', {
    locale: 'en',
    session_id: data.id,
  });

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    label: (data.label as string | null) ?? null,
    weekNumber: (data.week_number as number | null) ?? null,
  });
}
