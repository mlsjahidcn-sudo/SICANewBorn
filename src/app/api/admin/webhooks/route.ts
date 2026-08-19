import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { ALL_WEBHOOK_EVENTS, generateWebhookSecret } from '@/lib/webhook-delivery';

export const dynamic = 'force-dynamic';

const CreatePayload = z.object({
  api_key_id: z.string().uuid(),
  url: z.string().url().max(2000),
  events: z
    .array(z.enum(ALL_WEBHOOK_EVENTS as [string, ...string[]]))
    .min(1)
    .max(10),
  description: z.string().max(200).optional().nullable(),
});

/**
 * GET /api/admin/webhooks
 * Admin view: list ALL webhook subscriptions across all API keys, with
 * the owning key's label + key_prefix joined in. No `secret` in the
 * response (it's shown once at create time, like api-keys).
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const service = buildServiceClient();
  // Join on api_keys to surface the label + key_prefix alongside
  // each subscription. PostgREST resolves the FK by the column name.
  const { data, error } = await service
    .from('webhook_subscriptions')
    .select(`
      id,
      url,
      events,
      description,
      active,
      created_at,
      last_triggered_at,
      success_count,
      failure_count,
      api_key:api_keys!webhook_subscriptions_api_key_id_fkey (
        id,
        name,
        key_prefix
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/webhooks] list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ subscriptions: data ?? [] });
}

/**
 * POST /api/admin/webhooks
 * Admin-initiated subscription. The admin picks an API key from the
 * dropdown (api_key_id is required, unlike the B2B /v1/webhooks which
 * derives it from the authenticated key). Returns the secret ONCE.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = CreatePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 });
  }

  // Same https-only validation as the B2B /v1/webhooks route.
  const u = new URL(parsed.data.url);
  if (u.protocol === 'http:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
    return NextResponse.json(
      { error: 'Webhook URL must be https:// (http allowed only for localhost during dev).' },
      { status: 400 },
    );
  }

  const service = buildServiceClient();
  // Confirm the api_key exists. PostgREST would error on FK violation
  // too, but the resulting 500 is harder to read than a 404.
  const { data: key, error: keyErr } = await service
    .from('api_keys')
    .select('id, name')
    .eq('id', parsed.data.api_key_id)
    .single();

  if (keyErr || !key) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  const secret = generateWebhookSecret();
  const { data, error } = await service
    .from('webhook_subscriptions')
    .insert({
      api_key_id: parsed.data.api_key_id,
      url: parsed.data.url,
      events: parsed.data.events,
      secret,
      description: parsed.data.description ?? null,
      created_by: auth.user.id,
    })
    .select('id, url, events, description, active, created_at')
    .single();

  if (error) {
    console.error('[admin/webhooks] insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    subscription: data,
    secret,
    secret_note: 'Shown only once. Store it server-side — the consumer verifies the X-SICA-Signature with it.',
  });
}
