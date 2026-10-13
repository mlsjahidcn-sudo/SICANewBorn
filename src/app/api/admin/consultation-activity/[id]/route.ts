import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { pickConsultationShotInput, CONSULTATION_BUCKET } from '@/lib/consultation-activity';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/consultation-activity/[id]  — partial update.
 *      Auth: requireAdmin.
 *      Body: same whitelist as POST (`pickConsultationShotInput`).
 *      All keys are optional — a missing key means "don't change".
 *      Returns: 200 `{ shot }`, 400, 401, 404 (if id missing).
 *
 * DELETE /api/admin/consultation-activity/[id]  — hard delete.
 *      Auth: requireAdmin.
 *      Returns: 200 `{ ok: true }`, 401, 404.
 *      Side effect: best-effort delete of the storage object (via
 *      `supabase.storage.from('consultation-activity').remove([path])`).
 *      Storage delete failure is logged but does NOT block the DB
 *      row delete — the row goes, the file becomes an orphan that
 *      a future cleanup job can sweep.
 */

async function getIdFromContext(context: { params: Promise<{ id: string }> }): Promise<string | null> {
  const { id } = await context.params;
  if (!id) return null;
  return id;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = await getIdFromContext(context);
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const input = pickConsultationShotInput(body);
    if (!input) {
      return NextResponse.json(
        {
          error:
            'Validation failed: required fields are image_url (must start with consultation/), caption_en, caption_zh, person_name, initials (1-8 chars), is_active (boolean), display_order (integer). shot_date is optional (YYYY-MM-DD).',
        },
        { status: 400 },
      );
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('consultation_activity_shots')
      .update({
        image_url: input.image_url,
        caption_en: input.caption_en,
        caption_zh: input.caption_zh,
        person_name: input.person_name,
        initials: input.initials,
        shot_date: input.shot_date,
        is_active: input.is_active,
        display_order: input.display_order,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      console.error('[admin/consultation-activity/[id] PATCH] update failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ shot: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const id = await getIdFromContext(context);
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const service = buildServiceClient();

    // Best-effort storage cleanup BEFORE the row delete so a
    // failed storage delete can be logged without losing the DB
    // reference. Read the row first to get image_url.
    const { data: row } = await service
      .from('consultation_activity_shots')
      .select('image_url')
      .eq('id', id)
      .maybeSingle();
    if (row?.image_url) {
      try {
        const { error: storageErr } = await service.storage
          .from(CONSULTATION_BUCKET)
          .remove([row.image_url]);
        if (storageErr) {
          console.warn('[admin/consultation-activity/[id] DELETE] storage cleanup failed:', storageErr);
        }
      } catch (storageCatch) {
        console.warn('[admin/consultation-activity/[id] DELETE] storage cleanup threw:', storageCatch);
      }
    }

    const { error } = await service
      .from('consultation_activity_shots')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[admin/consultation-activity/[id] DELETE] delete failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
