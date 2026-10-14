import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { trackServer } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const VALID_KINDS = ['program', 'scholarship', 'timing', 'requirement'] as const;
type TopicKind = (typeof VALID_KINDS)[number];

/**
 * Phase 162: create a university-kind topic under a session.
 *
 * Distinct from `POST /api/admin/webinar-sessions/[id]/topics`
 * (Phase 140), which still creates the old "track" topics
 * (intake + degree enum + title/body). University-kind topics
 * bind a session to a specific university + a kind (program /
 * scholarship / timing / requirement) so the public page can
 * render a 5-card featured-university grid.
 *
 * Admin-only via `requireAdmin`. The session_id is taken from
 * the URL (`[id]`), the rest from the body. The university FK
 * is a UUID; the kind is a closed enum (CHECK at the DB layer
 * is the final guard).
 *
 * Idempotent-ish: if a (session_id, university_id, kind) tuple
 * already exists we 409 instead of inserting a duplicate —
 * this matches the existing agenda-grid semantics where each
 * track/intake pair is unique per session. If staff wants to
 * replace copy, they PATCH the existing row via
 * `/api/admin/webinar-university-topics/[id]`.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  interface CreateBody {
    universityId?: string;
    kind?: string;
    titleEn?: string;
    titleZh?: string;
    bodyEn?: string;
    bodyZh?: string;
    displayOrder?: number;
  }

  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const universityId = body.universityId?.trim();
  const kind = body.kind;
  const titleEn = body.titleEn?.trim();
  const titleZh = body.titleZh?.trim();
  const bodyEn = body.bodyEn?.trim();
  const bodyZh = body.bodyZh?.trim();

  if (!universityId || !kind || !titleEn || !titleZh || !bodyEn || !bodyZh) {
    return NextResponse.json(
      {
        error:
          'universityId, kind, titleEn, titleZh, bodyEn, bodyZh are required',
      },
      { status: 400 },
    );
  }
  if (!(VALID_KINDS as readonly string[]).includes(kind)) {
    return NextResponse.json(
      { error: `kind must be one of ${VALID_KINDS.join('|')}` },
      { status: 400 },
    );
  }

  // UUID shape guard — cheap pre-flight, the DB FK would catch
  // it anyway but a clearer error message helps the UI surface
  // the field-level problem.
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(universityId)) {
    return NextResponse.json(
      { error: 'universityId must be a UUID' },
      { status: 400 },
    );
  }

  // Enforce one (session_id, university_id, kind) tuple per
  // session. The DB doesn't have a hard unique constraint
  // because the partial index is on (university_id IS NOT NULL)
  // and there's no other uniqueness on (session_id, university_id,
  // kind) — duplicates would render as duplicate grid rows on
  // the public page. Probe first to return a clean 409.
  const { data: existing, error: existingErr } = await auth.supabase
    .from('webinar_topics')
    .select('id')
    .eq('session_id', paramsId)
    .eq('university_id', universityId)
    .eq('kind', kind)
    .maybeSingle();
  if (existingErr) {
    console.error(
      '[POST /api/admin/webinar-sessions/[id]/university-topics] existing probe failed:',
      existingErr,
    );
    return NextResponse.json({ error: 'Failed to check existing topic' }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json(
      {
        error:
          'A topic already exists for this session + university + kind. PATCH the existing row instead.',
        existingId: existing.id,
      },
      { status: 409 },
    );
  }

  const { data, error } = await auth.supabase
    .from('webinar_topics')
    .insert({
      session_id: paramsId,
      university_id: universityId,
      kind: kind as TopicKind,
      intake: null,                  // university-kind rows don't bind intake
      degree: null,                  // or degree
      title_en: titleEn,
      title_zh: titleZh,
      body_en: bodyEn,
      body_zh: bodyZh,
      display_order: body.displayOrder ?? 0,
    })
    .select('id')
    .single();

  if (error) {
    console.error(
      '[POST /api/admin/webinar-sessions/[id]/university-topics] insert failed:',
      error,
    );
    return NextResponse.json({ error: 'Failed to create university topic' }, { status: 500 });
  }

  trackServer('webinar_topic_added', {
    locale: 'en',
    session_id: paramsId,
    university_id: universityId,
    kind,
    degree: '',
  });

  return NextResponse.json({ id: data.id });
}