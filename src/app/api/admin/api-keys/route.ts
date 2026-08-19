import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { generateApiKey } from '@/lib/api-keys';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const CreatePayload = z.object({
  name: z.string().min(2).max(120),
  contact_email: z.string().email(),
  org_name: z.string().max(120).optional().nullable(),
  scope: z.array(z.string()).optional(),
  rate_limit_per_minute: z.number().int().min(1).max(100_000).optional(),
  expires_at: z.string().datetime().optional().nullable(),
});

/**
 * GET /api/admin/api-keys
 * List all API keys (admin-only). Returns public-safe shape — no key_hash.
 */
export async function GET(request: NextRequest) {
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

  const service = buildServiceClient();
  const { data, error } = await service
    .from('api_keys')
    .select('id, name, org_name, contact_email, key_prefix, scope, rate_limit_per_minute, created_at, last_used_at, expires_at, revoked_at, revoke_reason')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/api-keys] list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ keys: data ?? [] });
}

/**
 * POST /api/admin/api-keys
 * Create a new API key. The plaintext is returned ONCE in the response —
 * the admin UI surfaces it in a copy-to-clipboard modal. We only store
 * key_prefix + key_hash.
 */
export async function POST(request: NextRequest) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = CreatePayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const generated = generateApiKey();
  const service = buildServiceClient();
  const { data, error } = await service
    .from('api_keys')
    .insert({
      name: parsed.data.name,
      contact_email: parsed.data.contact_email,
      org_name: parsed.data.org_name ?? null,
      key_prefix: generated.prefix,
      key_hash: generated.hash,
      scope: parsed.data.scope ?? ['read:catalog'],
      rate_limit_per_minute: parsed.data.rate_limit_per_minute ?? 100,
      expires_at: parsed.data.expires_at ?? null,
      created_by: auth.user.id,
    })
    .select('id, name, org_name, contact_email, key_prefix, scope, rate_limit_per_minute, created_at, last_used_at, expires_at, revoked_at')
    .single();

  if (error) {
    console.error('[admin/api-keys] insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return plaintext exactly once. The admin UI must surface this in a
  // copy-to-clipboard banner; never log, never store client-side.
  return NextResponse.json({
    key: data,
    plaintext: generated.plaintext,
    plaintext_note: 'This is the only time this key will be shown. Store it securely — we only keep the SHA-256 hash.',
  });
}
