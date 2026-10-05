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

interface UpdateTopicBody {
  intake?: string;
  degree?: string;
  titleEn?: string;
  titleZh?: string;
  bodyEn?: string;
  bodyZh?: string;
  displayOrder?: number;
}

/**
 * Phase 140: per-topic update + delete.
 * Admin-only; PATCH validates the closed intake/degree enums
 * the same way POST does so a malicious body can't smuggle
 * an arbitrary CHECK-bypassing value past the API (the DB
 * CHECK constraint is the final guard).
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  let body: UpdateTopicBody;
  try {
    body = (await request.json()) as UpdateTopicBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.intake !== undefined && !(VALID_INTAKES as readonly string[]).includes(body.intake)) {
    return NextResponse.json(
      { error: `intake must be one of ${VALID_INTAKES.join('|')}` },
      { status: 400 },
    );
  }
  if (body.degree !== undefined && !(VALID_DEGREES as readonly string[]).includes(body.degree)) {
    return NextResponse.json(
      { error: `degree must be one of ${VALID_DEGREES.join('|')}` },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};
  if (body.intake !== undefined) update.intake = body.intake;
  if (body.degree !== undefined) update.degree = body.degree;
  if (body.titleEn !== undefined) update.title_en = body.titleEn;
  if (body.titleZh !== undefined) update.title_zh = body.titleZh;
  if (body.bodyEn !== undefined) update.body_en = body.bodyEn;
  if (body.bodyZh !== undefined) update.body_zh = body.bodyZh;
  if (body.displayOrder !== undefined) update.display_order = body.displayOrder;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from('webinar_topics')
    .update(update)
    .eq('id', paramsId)
    .select('id')
    .single();

  if (error) {
    console.error('[PATCH /api/admin/webinar-topics/[id]] update failed:', error);
    return NextResponse.json({ error: 'Failed to update topic' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  const { error } = await auth.supabase
    .from('webinar_topics')
    .delete()
    .eq('id', paramsId);

  if (error) {
    console.error('[DELETE /api/admin/webinar-topics/[id]] delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete topic' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
