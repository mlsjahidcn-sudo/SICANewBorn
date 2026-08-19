import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildServiceClient } from '@/lib/supabase-auth';
import { setupV1Request } from '@/lib/v1-route-helpers';
import { ALL_WEBHOOK_EVENTS, generateWebhookSecret } from '@/lib/webhook-delivery';
import { rateLimitHeaders } from '@/lib/v1-rate-limit';

export const dynamic = 'force-dynamic';

const CreatePayload = z.object({
  url: z.string().url().max(2000),
  events: z
    .array(z.enum(ALL_WEBHOOK_EVENTS as [string, ...string[]]))
    .min(1)
    .max(10),
  description: z.string().max(200).optional(),
});

/**
 * GET /v1/webhooks
 * Phase 72: when changing this route, update openapi/v1.yaml.
 * List the authenticated key's webhook subscriptions.
 * List the authenticated key's webhook subscriptions.
 * Returns the public shape (no secret) + a few derived fields.
 */
export async function GET(request: NextRequest) {
  const setup = await setupV1Request(request);
  if (!setup.ok) return setup.response;
  const { key, rate } = setup;

  const service = buildServiceClient();
  const { data, error } = await service
    .from('webhook_subscriptions')
    .select('id, url, events, description, active, created_at, last_triggered_at, success_count, failure_count')
    .eq('api_key_id', key.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[v1/webhooks] list error:', error);
    return NextResponse.json(
      { error: 'Failed to list subscriptions' },
      { status: 500, headers: rateLimitHeaders(rate) },
    );
  }

  return NextResponse.json(
    { subscriptions: data ?? [] },
    { headers: rateLimitHeaders(rate) },
  );
}

/**
 * POST /v1/webhooks
 * Create a new subscription. The `secret` is generated server-side
 * and returned ONCE in the response — same pattern as the API key
 * itself. The consumer stores the secret and uses it to verify
 * the X-SICA-Signature on every incoming delivery.
 */
export async function POST(request: NextRequest) {
  const setup = await setupV1Request(request);
  if (!setup.ok) return setup.response;
  const { key, rate } = setup;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }
  const parsed = CreatePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }

  // Reject http:// for non-localhost URLs. Webhooks over plaintext
  // would leak signed payloads to anyone on the network. Localhost
  // is allowed so consumers can test against a local dev server.
  const u = new URL(parsed.data.url);
  if (u.protocol === 'http:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
    return NextResponse.json(
      { error: 'Webhook URL must be https:// (http is only allowed for localhost during dev).' },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }

  const secret = generateWebhookSecret();
  const service = buildServiceClient();
  const { data, error } = await service
    .from('webhook_subscriptions')
    .insert({
      api_key_id: key.id,
      url: parsed.data.url,
      events: parsed.data.events,
      secret,
      description: parsed.data.description ?? null,
    })
    .select('id, url, events, description, active, created_at')
    .single();

  if (error) {
    console.error('[v1/webhooks] create error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500, headers: rateLimitHeaders(rate) },
    );
  }

  return NextResponse.json(
    {
      subscription: data,
      secret,
      secret_note: 'This is the only time the secret will be shown. Store it securely — we only keep a hash for verification.',
    },
    { status: 201, headers: rateLimitHeaders(rate) },
  );
}
