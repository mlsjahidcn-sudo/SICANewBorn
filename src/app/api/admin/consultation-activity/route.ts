import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  getAllConsultationShotsAdmin,
  pickConsultationShotInput,
} from '@/lib/consultation-activity';

export const dynamic = 'force-dynamic';

/**
 * GET  /api/admin/consultation-activity  — list all shots (active +
 *      inactive), sorted active-first by display_order.
 *      Auth: requireAdmin.
 *      Returns: `{ shots: ConsultationShotRow[] + imageSrc }`
 *
 * POST /api/admin/consultation-activity  — create a new shot.
 *      Auth: requireAdmin.
 *      Body: { image_url, caption_en, caption_zh, person_name,
 *              initials, shot_date?, is_active, display_order }
 *      Validation: pickConsultationShotInput() whitelists keys +
 *      types; image_url must start with `consultation/` (defense
 *      in depth — admin UI shouldn't be able to write outside
 *      the bucket). created_by is auto-filled from auth.user.id.
 *      Returns: 201 `{ shot }` on success, 400 on validation
 *      failure, 401 on auth fail.
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const shots = await getAllConsultationShotsAdmin();
    return NextResponse.json({ shots });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/consultation-activity GET] failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

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
      .insert({
        image_url: input.image_url,
        caption_en: input.caption_en,
        caption_zh: input.caption_zh,
        person_name: input.person_name,
        initials: input.initials,
        shot_date: input.shot_date,
        is_active: input.is_active,
        display_order: input.display_order,
        created_by: auth.user.id,
      })
      .select('*')
      .single();
    if (error) {
      console.error('[admin/consultation-activity POST] insert failed:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ shot: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
