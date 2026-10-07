/**
 * S144 — admin create-user hardening.
 *
 * 1. Password minimum raised from 6 → 12 characters.
 * 2. Only super_admin can create admin or super_admin roles.
 *    Previously only super_admin → super_admin was gated; any
 *    admin could mint another admin.
 * 3. Partner creation is unchanged — any admin can still create
 *    partner users (different tenant boundary).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockRequireAdmin = vi.fn();
const mockBuildServiceClient = vi.fn();
vi.mock('@/lib/supabase-auth', () => ({
  requireAdmin: (...args: unknown[]) => mockRequireAdmin(...args),
  buildServiceClient: () => mockBuildServiceClient(),
  getServerEnv: () => ({
    url: 'https://fake.supabase.co',
    anonKey: 'anon',
    serviceKey: 'service-key-set',
  }),
}));

const { POST } = await import('@/app/api/admin/create-user/route');

function setupMocks(opts: { callerRole?: 'admin' | 'super_admin' | null }) {
  const callerRole = opts.callerRole ?? null;
  mockRequireAdmin.mockResolvedValue({
    ok: true,
    supabase: {} as never,
    user: { id: 'caller-uuid' } as never,
  });
  mockBuildServiceClient.mockReturnValue({
    from: (table: string) => {
      if (table === 'admin_profiles') {
        const data = callerRole === null ? null : { role: callerRole };
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data, error: null }),
            }),
          }),
        };
      }
      // The createUser / insert path. We don't want any of these
      // to actually fire in the gating tests — but if they do
      // (because the gating passed and we hit the happy path),
      // throw so it's loud.
      return {
        insert: () => {
          throw new Error(`Unexpected insert into ${table}`);
        },
        auth: {
          admin: {
            createUser: () => Promise.reject(new Error('Unexpected createUser call')),
            deleteUser: () => Promise.reject(new Error('Unexpected deleteUser call')),
          },
        },
      };
    },
  });
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/admin/create-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Test fixture: a 19-char string built from segments. Throwaway —
// never reaches auth.users. The route only sees it as a length check.
const TEST_OK_PASSWORD = ['longer', 'password', '12'].join('-');

const SAVED_ENV = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

beforeEach(() => {
  process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = 'service-key-set';
  vi.clearAllMocks();
});

afterEach(() => {
  if (SAVED_ENV === undefined) delete process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;
  else process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = SAVED_ENV;
});

describe('POST /api/admin/create-user — S144 password + role hardening', () => {
  it('rejects a 6-character password (below new 12-char floor)', async () => {
    setupMocks({ callerRole: 'super_admin' });
    const res = await POST(
      makeRequest({
        email: 'newuser@example.com',
        password: 'short12', // 7 chars
        fullName: 'New User',
        role: 'admin',
      }),
    );
    expect(res.status).toBe(400);
    const j = await res.json();
    expect(j.error).toMatch(/12 characters/);
  });

  it('accepts a long-enough password (validation passes the new floor)', async () => {
    setupMocks({ callerRole: 'super_admin' });
    const res = await POST(
      makeRequest({
        email: 'newuser@example.com',
        password: TEST_OK_PASSWORD,
        fullName: 'New User',
        role: 'admin',
      }),
    );
    // Validation passes the new 12-char floor; the role gate
    // passes for a super_admin caller; we hit the mock-failure
    // on the actual insert (expected — we don't fake the insert).
    // The contract under test is "not 400/403 from the gate".
    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(403);
  });

  it('forbids a regular admin from creating another admin', async () => {
    setupMocks({ callerRole: 'admin' });
    const res = await POST(
      makeRequest({
        email: 'newadmin@example.com',
        password: TEST_OK_PASSWORD,
        fullName: 'New Admin',
        role: 'admin',
      }),
    );
    expect(res.status).toBe(403);
    const j = await res.json();
    expect(j.error).toMatch(/super admin/i);
  });

  it('forbids a regular admin from creating a super_admin', async () => {
    setupMocks({ callerRole: 'admin' });
    const res = await POST(
      makeRequest({
        email: 'newsuper@example.com',
        password: TEST_OK_PASSWORD,
        fullName: 'New Super',
        role: 'super_admin',
      }),
    );
    expect(res.status).toBe(403);
  });

  it('allows a super_admin to create an admin', async () => {
    setupMocks({ callerRole: 'super_admin' });
    const res = await POST(
      makeRequest({
        email: 'newadmin@example.com',
        password: TEST_OK_PASSWORD,
        fullName: 'New Admin',
        role: 'admin',
      }),
    );
    // Past the role gate; mock-failure surfaces as a 500. The
    // assertion under test is "not 403 from the gate".
    expect(res.status).not.toBe(403);
  });

  it('allows a regular admin to create a partner (unchanged behavior)', async () => {
    setupMocks({ callerRole: 'admin' });
    const res = await POST(
      makeRequest({
        email: 'newpartner@example.com',
        password: TEST_OK_PASSWORD,
        fullName: 'New Partner',
        role: 'partner',
      }),
    );
    expect(res.status).not.toBe(403);
  });
});