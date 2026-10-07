import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildServiceClient } from '@/lib/supabase-auth';
import { setupV1Request } from '@/lib/v1-route-helpers';
import { ALL_WEBHOOK_EVENTS, generateWebhookSecret } from '@/lib/webhook-delivery';
import { v1ResponseHeaders } from '@/lib/v1-route-helpers';
import { assertSafeWebhookUrl, shouldAllowLocalhost } from '@/lib/ssrf-guard';
import { encryptWebhookSecret } from '@/lib/webhook-secret';

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
  const { key, rate, cors } = setup;

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
      { status: 500, headers: v1ResponseHeaders(rate, cors) },
    );
  }

  return NextResponse.json(
    { subscriptions: data ?? [] },
    { headers: v1ResponseHeaders(rate, cors) },
  );
}

/**
 * POST /v1/webhooks
 * Create a new subscription.
 *
 * The plaintext `secret` is generated server-side and returned ONCE
 * in the response — same pattern as the API key itself. The consumer
 * stores the secret and uses it to verify the X-SICA-Signature on
 * every incoming delivery. The database row holds the ENCRYPTED
 * ciphertext (AES-256-GCM keyed off the service role key); the
 * delivery worker decrypts on demand to compute the HMAC.
 *
 * SSRF guard: the URL is rejected at subscription creation if it
 * doesn't resolve to a public IP. The delivery worker re-checks the
 * same way on every attempt so a hostname that flips public → private
 * can't be used to bounce us back inside.
 */
export async function POST(request: NextRequest) {
  const setup = await setupV1Request(request);
  if (!setup.ok) return setup.response;
  const { key, rate, cors } = setup;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: v1ResponseHeaders(rate, cors) },
    );
  }
  const parsed = CreatePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400, headers: v1ResponseHeaders(rate, cors) },
    );
  }

  // SSRF guard. Reject any URL whose host is loopback / private /
  // link-local / cloud-metadata — including DNS-resolved private
  // IPs. In production, http:// is rejected outright; in dev we
  // allow it only for localhost so webhook deliveries can be tested
  // against a local tunnel.
  const ssrf = await assertSafeWebhookUrl(parsed.data.url, shouldAllowLocalhost());
  if (!ssrf.ok) {
    return NextResponse.json(
      { error: `Webhook URL rejected: ${ssrf.reason}` },
      { status: 400, headers: v1ResponseHeaders(rate, cors) },
    );
  }

  const plaintextSecret = generateWebhookSecret();
  // Store the secret encrypted; the delivery worker decrypts on demand.
  let storedSecret: string;
  try {
    storedSecret = encryptWebhookSecret(plaintextSecret);
  } catch (err) {
    console.error('[v1/webhooks] encrypt secret failed:', err);
    return NextResponse.json(
      { error: 'Failed to secure signing secret' },
      { status: 500, headers: v1ResponseHeaders(rate, cors) },
    );
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('webhook_subscriptions')
    .insert({
      api_key_id: key.id,
      url: parsed.data.url,
      events: parsed.data.events,
      secret: storedSecret,
      description: parsed.data.description ?? null,
    })
    .select('id, url, events, description, active, created_at')
    .single();

  if (error) {
    console.error('[v1/webhooks] create error:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500, headers: v1ResponseHeaders(rate, cors) },
    );
  }

  return NextResponse.json(
    {
      subscription: data,
      secret: plaintextSecret,
      secret_note:
        'This is the only time the plaintext secret will be shown. We store it encrypted at rest; the worker decrypts per delivery to sign.',
    },
    { status: 201, headers: v1ResponseHeaders(rate, cors) },
  );
}