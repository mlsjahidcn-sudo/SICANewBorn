import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const PatchPayload = z.object({
  active: z.boolean().optional(),
  description: z.string().max(200).nullable().optional(),
});

/**
 * PATCH /api/admin/webhooks/[id]
 * Toggle active state or change description. The `secret` is NOT
 * updatable here — it's a one-time-create value (rotating it would
 * silently break the consumer's signature verification).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = PatchPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('webhook_subscriptions')
    .update(parsed.data)
    .eq('id', id)
    .select('id, url, events, description, active, created_at, last_triggered_at, success_count, failure_count')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }
    console.error('[admin/webhooks/:id] patch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ subscription: data });
}
