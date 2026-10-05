import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const VALID_INTAKES = ['march_2027', 'september_2027', 'csc', 'other'] as const;
const VALID_DEGREES = [
  'chinese_language',
  'foundation',
  'bachelor',
  'master',
  'phd',
  'csc',
] as const;

/**
 * GET — list topics for a session, ordered by display_order.
 * Admin-only.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  const { data, error } = await auth.supabase
    .from('webinar_topics')
    .select(
      'id, session_id, intake, degree, title_en, title_zh, body_en, body_zh, display_order, created_at, updated_at',
    )
    .eq('session_id', paramsId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('[GET /api/admin/webinar-sessions/[id]/topics] query failed:', error);
    return NextResponse.json({ error: 'Failed to load topics' }, { status: 500 });
  }

  const topics = (data ?? []).map((row) => ({
    id: row.id as string,
    sessionId: row.session_id as string,
    intake: row.intake as 'march_2027' | 'september_2027' | 'csc' | 'other',
    degree: row.degree as
      | 'chinese_language'
      | 'foundation'
      | 'bachelor'
      | 'master'
      | 'phd'
      | 'csc',
    titleEn: (row.title_en as string) ?? '',
    titleZh: (row.title_zh as string) ?? '',
    bodyEn: (row.body_en as string) ?? '',
    bodyZh: (row.body_zh as string) ?? '',
    displayOrder: (row.display_order as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? null,
  }));

  return NextResponse.json({ topics });
}

interface CreateTopicBody {
  intake?: string;
  degree?: string;
  titleEn?: string;
  titleZh?: string;
  bodyEn?: string;
  bodyZh?: string;
  displayOrder?: number;
}

/**
 * Phase 140: create a topic under a session. The session_id
 * is taken from the URL (`[id]`), the rest from the body.
 * Admin-only via `requireAdmin`. Topics are scoped to a
 * session and ordered by `display_order`.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  let body: CreateTopicBody;
  try {
    body = (await request.json()) as CreateTopicBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const intake = body.intake;
  const degree = body.degree;
  const titleEn = body.titleEn?.trim();
  const titleZh = body.titleZh?.trim();
  const bodyEn = body.bodyEn?.trim();
  const bodyZh = body.bodyZh?.trim();
  if (!intake || !degree || !titleEn || !titleZh || !bodyEn || !bodyZh) {
    return NextResponse.json(
      { error: 'intake, degree, titleEn, titleZh, bodyEn, bodyZh are required' },
      { status: 400 },
    );
  }
  if (!(VALID_INTAKES as readonly string[]).includes(intake)) {
    return NextResponse.json(
      { error: `intake must be one of ${VALID_INTAKES.join('|')}` },
      { status: 400 },
    );
  }
  if (!(VALID_DEGREES as readonly string[]).includes(degree)) {
    return NextResponse.json(
      { error: `degree must be one of ${VALID_DEGREES.join('|')}` },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from('webinar_topics')
    .insert({
      session_id: paramsId,
      intake,
      degree,
      title_en: titleEn,
      title_zh: titleZh,
      body_en: bodyEn,
      body_zh: bodyZh,
      display_order: body.displayOrder ?? 0,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[POST /api/admin/webinar-sessions/[id]/topics] insert failed:', error);
    return NextResponse.json({ error: 'Failed to create topic' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
