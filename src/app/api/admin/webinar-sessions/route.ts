import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { trackServer } from '@/lib/analytics';
import { parseSeatCapInput, type WebinarRegistrationStatus } from '@/lib/webinar-capacity';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Scheduled', 'Live', 'Completed', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

const VALID_REGISTRATION_STATUSES = ['draft', 'open', 'full', 'closed'] as const;
type RegistrationStatus = (typeof VALID_REGISTRATION_STATUSES)[number];

const COLUMNS_V2 =
  'id, slug, title_en, title_zh, description_en, description_zh, session_date, session_time, duration_minutes, join_url, status, is_active, display_order, seat_cap, registration_status, timezone_label, created_at, updated_at';
const COLUMNS_LEGACY =
  'id, slug, title_en, title_zh, description_en, description_zh, session_date, session_time, duration_minutes, join_url, status, is_active, display_order, created_at, updated_at';

/**
 * Phase 140 + 161: admin CRUD on webinar_sessions.
 *
 * GET — list all sessions (active + inactive), ordered by
 * display_order then created_at desc. Phase 161 adds seat_cap +
 * registration_status to the payload; when the Phase 161 migration
 * hasn't been applied yet the extended SELECT errors and we retry
 * with the legacy column list so the admin page still loads
 * (defaults: uncapped + 'open').
 *
 * POST — create a new session. `is_active=true` is supported
 * on create; the partial unique index makes this fail loudly
 * if another row is already active.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let data: Record<string, unknown>[] | null = null;
  const v2 = await auth.supabase
    .from('webinar_sessions')
    .select(COLUMNS_V2)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (v2.error) {
    // Phase 161 columns missing — degrade to the legacy shape.
    const legacy = await auth.supabase
      .from('webinar_sessions')
      .select(COLUMNS_LEGACY)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (legacy.error) {
      console.error('[GET /api/admin/webinar-sessions] query failed:', legacy.error);
      return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 });
    }
    data = legacy.data as Record<string, unknown>[];
  } else {
    data = v2.data as Record<string, unknown>[];
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
    isActive: Boolean(row.is_active),
    displayOrder: (row.display_order as number) ?? 0,
    seatCap: (row.seat_cap as number | null) ?? null,
    registrationStatus: (row.registration_status as RegistrationStatus) ?? 'open',
    timezoneLabel: (row.timezone_label as string) ?? 'Asia/Shanghai',
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
  isActive?: boolean;
  displayOrder?: number;
  /** Phase 161 */
  seatCap?: number | string | null;
  registrationStatus?: RegistrationStatus;
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
  if (
    body.registrationStatus &&
    !(VALID_REGISTRATION_STATUSES as readonly string[]).includes(body.registrationStatus)
  ) {
    return NextResponse.json(
      { error: `registrationStatus must be one of ${VALID_REGISTRATION_STATUSES.join('|')}` },
      { status: 400 },
    );
  }

  // If is_active=true is requested and another session is already
  // active, flip the previous one off first so the partial
  // unique index doesn't 23505 us.
  const isActive = body.isActive === true;
  if (isActive) {
    await auth.supabase
      .from('webinar_sessions')
      .update({ is_active: false })
      .eq('is_active', true);
  }

  const { data, error } = await auth.supabase
    .from('webinar_sessions')
    .insert({
      slug,
      title_en: titleEn,
      title_zh: titleZh,
      description_en: body.descriptionEn ?? null,
      description_zh: body.descriptionZh ?? null,
      session_date: body.sessionDate ?? null,
      session_time: body.sessionTime ?? null,
      duration_minutes: body.durationMinutes ?? 60,
      join_url: body.joinUrl ?? null,
      status: body.status ?? 'Scheduled',
      is_active: isActive,
      display_order: body.displayOrder ?? 0,
      seat_cap: parseSeatCapInput(body.seatCap ?? null),
      registration_status: body.registrationStatus ?? 'open',
    })
    .select('id, slug, is_active')
    .single();

  if (error) {
    console.error('[POST /api/admin/webinar-sessions] insert failed:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  // Phase 143: admin-action event.
  try {
    trackServer('webinar_session_created', {
      locale: 'en',
      session_id: data.id,
    });
  } catch {
    // best-effort
  }

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    isActive: Boolean(data.is_active),
  });
}
