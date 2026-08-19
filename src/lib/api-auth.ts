/**
 * Bearer auth for /v1/* B2B endpoints.
 *
 * Usage from a /v1/* route:
 *   const auth = await requireApiKey(request);
 *   if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
 *   // auth.key is now safe to use for scope checks + per-key rate limit.
 *
 * Auth flow:
 *   1. Extract `Authorization: Bearer sk_live_…` header.
 *   2. Reject malformed keys (looksLikeApiKey) with 401 — fast path.
 *   3. SHA-256 the plaintext, look up by hash via service-role client
 *      (the table has RLS that only admins can read; service-role bypasses).
 *   4. Reject if revoked or expired → 401.
 *   5. Bump last_used_at via SECURITY DEFINER RPC (cheaper than an UPDATE
 *      roundtrip + survives the request failing after auth).
 *   6. Return { key: ApiKeyRow } for downstream scope checks.
 *
 * Why service-role, not a per-request anon client: anon + RLS would always
 * fail (no auth.users row for an API key). Service-role is the right tool
 * for this server-side lookup.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv } from './supabase-auth';
import { hashApiKey, looksLikeApiKey } from './api-keys';

export interface ApiKeyRow {
  id: string;
  name: string;
  org_name: string | null;
  contact_email: string;
  key_prefix: string;
  scope: string[];
  rate_limit_per_minute: number;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

export type ApiAuthResult =
  | { ok: true; key: ApiKeyRow }
  | { ok: false; error: string; status: 401 | 503 };

export async function requireApiKey(
  request: NextRequest,
): Promise<ApiAuthResult> {
  if (!getServerEnv().serviceKey) {
    return {
      ok: false,
      error: 'B2B API is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.',
      status: 503,
    };
  }

  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/.exec(header);
  if (!match) {
    return {
      ok: false,
      error: 'Missing or malformed Authorization header. Expected: Authorization: Bearer sk_live_…',
      status: 401,
    };
  }
  const plaintext = match[1].trim();

  if (!looksLikeApiKey(plaintext)) {
    return {
      ok: false,
      error: 'Invalid API key format.',
      status: 401,
    };
  }

  const hash = hashApiKey(plaintext);
  const service = buildServiceClient();
  const { data, error } = await service
    .from('api_keys')
    .select('*')
    .eq('key_hash', hash)
    .maybeSingle();

  if (error) {
    console.error('[api-auth] lookup error:', error);
    return { ok: false, error: 'Internal error during key lookup.', status: 401 };
  }
  if (!data) {
    return { ok: false, error: 'Invalid API key.', status: 401 };
  }

  if (data.revoked_at) {
    return { ok: false, error: 'API key has been revoked.', status: 401 };
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, error: 'API key has expired.', status: 401 };
  }

  // Bump last_used_at. Fire-and-forget — if the RPC fails the request
  // is still served (last_used_at is observability, not auth).
  service.rpc('touch_api_key_last_used', { p_key_hash: hash }).then(
    () => undefined,
    (err: unknown) => {
      console.error('[api-auth] touch_api_key_last_used failed:', err);
    },
  );

  return { ok: true, key: data as ApiKeyRow };
}

/** Check the key has all required scopes. Use after requireApiKey. */
export function hasScope(key: ApiKeyRow, required: string): boolean {
  return Array.isArray(key.scope) && key.scope.includes(required);
}
