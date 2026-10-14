import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const VALID_KINDS = ['program', 'scholarship', 'timing', 'requirement'] as const;

interface UpdateBody {
  kind?: string;
  titleEn?: string;
  titleZh?: string;
  bodyEn?: string;
  bodyZh?: string;
  displayOrder?: number;
}

/**
 * Phase 162: per university-kind topic update + delete.
 *
 * Mirrors `/api/admin/webinar-topics/[id]` (Phase 140) but
 * only exposes the fields a university-kind topic can carry
 * (no intake / degree — those are bound to the track schema,
 * not the university-kind schema).
 *
 * The university_id is intentionally NOT editable: moving a
 * topic between universities would silently rewrite its
 * university-card placement on the public page. If staff want
 * a topic bound to a different university, they DELETE the
 * row and POST a fresh one against the new university.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.kind !== undefined && !(VALID_KINDS as readonly string[]).includes(body.kind)) {
    return NextResponse.json(
      { error: `kind must be one of ${VALID_KINDS.join('|')}` },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};
  if (body.kind !== undefined) update.kind = body.kind;
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
    console.error(
      '[PATCH /api/admin/webinar-university-topics/[id]] update failed:',
      error,
    );
    return NextResponse.json({ error: 'Failed to update university topic' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  const { error } = await auth.supabase
    .from('webinar_topics')
    .delete()
    .eq('id', paramsId);

  if (error) {
    console.error(
      '[DELETE /api/admin/webinar-university-topics/[id]] delete failed:',
      error,
    );
    return NextResponse.json({ error: 'Failed to delete university topic' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}