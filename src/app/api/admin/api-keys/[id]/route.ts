import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const PatchPayload = z.object({
  name: z.string().min(2).max(120).optional(),
  rate_limit_per_minute: z.number().int().min(1).max(100_000).optional(),
  scope: z.array(z.string()).optional(),
  expires_at: z.string().datetime().nullable().optional(),
});

const RevokePayload = z.object({
  revoke_reason: z.string().max(500).optional(),
});

/**
 * PATCH /api/admin/api-keys/[id]
 * Update mutable fields on an existing key (name, rate limit, scope, expiry).
 * Cannot un-revoke — once revoked, create a new key.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured.' },
      { status: 503 },
    );
  }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = PatchPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('api_keys')
    .update(parsed.data)
    .eq('id', id)
    .select('id, name, org_name, contact_email, key_prefix, scope, rate_limit_per_minute, created_at, last_used_at, expires_at, revoked_at')
    .single();
  if (error) {
    console.error('[admin/api-keys/:id] patch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ key: data });
}

/**
 * DELETE /api/admin/api-keys/[id]
 * Soft-revoke a key. We never hard-delete — auditing requires the row
 * to stay. Revoked keys fail requireApiKey() with 401. The plaintext
 * is not retrievable after revocation (only the hash was stored).
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured.' },
      { status: 503 },
    );
  }
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  let body: { revoke_reason?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional for DELETE.
  }
  const parsed = RevokePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('api_keys')
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: auth.user.id,
      revoke_reason: parsed.data.revoke_reason ?? null,
    })
    .eq('id', id)
    .select('id, name, revoked_at, revoke_reason')
    .single();
  if (error) {
    console.error('[admin/api-keys/:id] revoke error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ key: data });
}
