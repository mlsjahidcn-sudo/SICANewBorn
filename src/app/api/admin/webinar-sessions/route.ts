import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Scheduled', 'Live', 'Completed', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

/**
 * Phase 140: admin CRUD on webinar_sessions.
 *
 * GET — list all sessions (active + inactive), ordered by
 * display_order then created_at desc. Admin sees everything.
 *
 * POST — create a new session. `is_active=true` is supported
 * on create; the partial unique index makes this fail loudly
 * if another row is already active (the UI toggles the
 * previous row to false in the same transaction so the
 * operation succeeds).
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data, error } = await auth.supabase
    .from('webinar_sessions')
    .select(
      'id, slug, title_en, title_zh, description_en, description_zh, session_date, session_time, duration_minutes, join_url, status, is_active, display_order, created_at, updated_at',
    )
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

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
    isActive: Boolean(row.is_active),
    displayOrder: (row.display_order as number) ?? 0,
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
    })
    .select('id, slug, is_active')
    .single();

  if (error) {
    console.error('[POST /api/admin/webinar-sessions] insert failed:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    isActive: Boolean(data.is_active),
  });
}
