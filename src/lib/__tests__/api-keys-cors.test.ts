/**
 * S144 — api-keys cors_origins hardening.
 *
 * The previous schema allowed a single-element allowlist of '*',
 * which made a partner with that key able to mount a CORS-permissive
 * read surface against the catalog from any origin. After the fix,
 * Zod rejects any cors_origins array that contains '*'.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the admin auth gate so the schema check is reachable.
const mockRequireAdmin = vi.fn();
vi.mock('@/lib/supabase-auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
  buildServiceClient: () => {
    const noopChain = {
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }),
        }),
        insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
        update: () => ({
          eq: () => ({
            select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }),
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    };
    return noopChain as never;
  },
  getServerEnv: () => ({
    url: 'https://fake.supabase.co',
    anonKey: 'anon',
    serviceKey: 'service-key-set',
  }),
}));

const { POST } = await import('@/app/api/admin/api-keys/route');
const { PATCH } = await import('@/app/api/admin/api-keys/[id]/route');

const SAVED_ENV = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

beforeEach(() => {
  mockRequireAdmin.mockReset();
  mockRequireAdmin.mockResolvedValue({
    ok: true,
    supabase: {} as never,
    user: { id: 'caller-uuid' } as never,
  });
  process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = 'service-key-set';
});

afterEach(() => {
  if (SAVED_ENV === undefined) delete process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  else process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = SAVED_ENV;
});

function makeRequest(body: unknown, method: 'POST' | 'PATCH' = 'POST'): NextRequest {
  return new NextRequest('http://localhost/api/admin/api-keys', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('api-keys CORS allowlist — rejects wildcard', () => {
  it('POST rejects cors_origins: ["*"]', async () => {
    const res = await POST(
      makeRequest({
        name: 'Test Key',
        contact_email: 'test@example.com',
        cors_origins: ['*'],
      }),
    );
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(JSON.stringify(j)).toMatch(/\*/);
  });

  it('POST rejects cors_origins: ["https://acme.com", "*"]', async () => {
    const res = await POST(
      makeRequest({
        name: 'Test Key',
        contact_email: 'test@example.com',
        cors_origins: ['https://acme.com', '*'],
      }),
    );
    expect(res.status).toBe(400);
  });

  it('POST accepts cors_origins: ["https://acme.com"]', async () => {
    const res = await POST(
      makeRequest({
        name: 'Test Key',
        contact_email: 'test@example.com',
        cors_origins: ['https://acme.com'],
      }),
    );
    // Past the schema gate; either 201 with the new key, or 500
    // from our empty service mock — both are "not 400" and that
    // is the contract under test.
    expect(res.status).not.toBe(400);
  });

  it('PATCH rejects a wildcard-set cors_origins', async () => {
    const req = new NextRequest('http://localhost/api/admin/api-keys/abc-123', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cors_origins: ['*'] }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'abc-123' }) });
    expect(res.status).toBe(400);
  });
});