import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { buildServiceClient } from '@/lib/supabase-auth';
import { setupV1Request } from '@/lib/v1-route-helpers';
import { rateLimitHeaders } from '@/lib/v1-rate-limit';

export const dynamic = 'force-dynamic';

const PatchPayload = z.object({
  url: z.string().url().max(2000).optional(),
  events: z
    .array(z.enum([
      'university.created',
      'university.updated',
      'university.deleted',
      'program.created',
      'program.updated',
      'program.deleted',
    ] as [string, ...string[]]))
    .min(1)
    .max(10)
    .optional(),
  description: z.string().max(200).nullable().optional(),
  active: z.boolean().optional(),
});

/**
 * PATCH /v1/webhooks/[id]
 * Phase 72: when changing this route, update openapi/v1.yaml.
 * Update mutable fields on a subscription. Scoped to the
 * Update mutable fields on a subscription. Scoped to the
 * authenticated key — a key cannot edit another key's
 * subscriptions (enforced by api_key_id filter).
 *
 * The secret is NOT updatable. Rotating a secret means creating a
 * new subscription and deleting the old one (the secret is what
 * the consumer verifies signatures with, so silently rotating
 * would break verification).
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const setup = await setupV1Request(request);
  if (!setup.ok) return setup.response;
  const { key, rate } = setup;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: 'Missing id' },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }
  const parsed = PatchPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }

  // Same https-only validation as create.
  if (parsed.data.url) {
    const u = new URL(parsed.data.url);
    if (u.protocol === 'http:' && u.hostname !== 'localhost' && u.hostname !== '127.0.0.1') {
      return NextResponse.json(
        { error: 'Webhook URL must be https://' },
        { status: 400, headers: rateLimitHeaders(rate) },
      );
    }
  }

  const service = buildServiceClient();
  // api_key_id filter on the WHERE clause is what enforces
  // "a key can't edit another key's subscriptions".
  const { data, error } = await service
    .from('webhook_subscriptions')
    .update(parsed.data)
    .eq('id', id)
    .eq('api_key_id', key.id)
    .select('id, url, events, description, active, created_at, last_triggered_at, success_count, failure_count')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404, headers: rateLimitHeaders(rate) },
      );
    }
    console.error('[v1/webhooks/:id] patch error:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500, headers: rateLimitHeaders(rate) },
    );
  }
  return NextResponse.json({ subscription: data }, { headers: rateLimitHeaders(rate) });
}

/**
 * DELETE /v1/webhooks/[id]
 * Soft-revoke the subscription (set active=false). Row stays for
 * audit. Same scoping as PATCH (only the owning key can delete).
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const setup = await setupV1Request(request);
  if (!setup.ok) return setup.response;
  const { key, rate } = setup;

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: 'Missing id' },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('webhook_subscriptions')
    .update({ active: false })
    .eq('id', id)
    .eq('api_key_id', key.id)
    .select('id, active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404, headers: rateLimitHeaders(rate) },
      );
    }
    console.error('[v1/webhooks/:id] delete error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke subscription' },
      { status: 500, headers: rateLimitHeaders(rate) },
    );
  }
  return NextResponse.json({ subscription: data }, { headers: rateLimitHeaders(rate) });
}
