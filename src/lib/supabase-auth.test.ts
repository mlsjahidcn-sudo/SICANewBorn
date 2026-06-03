/**
 * supabase-auth.test.ts
 *
 * Unit tests for src/lib/supabase-auth.ts — the per-request auth helpers
 * that back every /api/student/*, /api/partner/*, and /api/admin/* route.
 *
 * Why this matters: we hit a real bug in S1 where a service-role client
 * was being used to call getUser(), which always returns null. These tests
 * lock in the bearer-token contract so that bug can't come back.
 *
 * Strategy: mock @supabase/supabase-js so createClient returns a stub whose
 * `auth.getUser()` and `.from()...select()...` we control per test. This
 * keeps the tests fast and hermetic — no network, no real Supabase.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We mock the supabase client constructor BEFORE importing the module
// under test, so the module picks up our mock.
const mockCreateClient = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

// Import after the mock so the module's `import { createClient }` resolves
// to our mock.
const {
  getServerEnv,
  getRequestAuth,
  requireAdmin,
  requirePartner,
  unwrap,
  buildServiceClient,
} = await import('./supabase-auth');

/**
 * Build a fake Supabase client. The methods we expose are the only ones
 * the auth helpers actually call. Each test can override what they return.
 */
function makeFakeClient(opts: {
  user?: { id: string; email: string } | null;
  userError?: { message: string } | null;
  // Per-table mock: table name → row returned from .maybeSingle()
  tableResponses?: Record<string, { data: unknown; error: unknown }>;
} = {}) {
  const {
    user = null,
    userError = null,
    tableResponses = {},
  } = opts;

  const auth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user },
      error: userError,
    }),
  };

  // Build a chainable query builder that resolves to whatever
  // tableResponses[tableName] says. .from().select().eq().in().maybeSingle()
  // is the only shape we need to mock.
  const from = (table: string) => {
    const response = tableResponses[table] ?? { data: null, error: null };
    const terminal = {
      maybeSingle: vi.fn().mockResolvedValue(response),
      single: vi.fn().mockResolvedValue(response),
    };
    return {
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue(terminal),
          maybeSingle: vi.fn().mockResolvedValue(response),
        }),
        maybeSingle: vi.fn().mockResolvedValue(response),
      }),
    };
  };

  return { auth, from };
}

const validUser = { id: 'user-abc', email: 'test@example.com' };
const validToken = 'jwt.fake.token';

function makeRequest(authHeader: string | null = null): Request {
  const headers = new Headers();
  if (authHeader) headers.set('authorization', authHeader);
  // The body / method don't matter — auth helpers only read headers.
  return new Request('http://localhost/test', { headers });
}

// ---------------------------------------------------------------------------
// Env management — every test sets the env explicitly so we never depend
// on the values in the developer's .env.
// ---------------------------------------------------------------------------
const originalEnv = { ...process.env };

beforeEach(() => {
  mockCreateClient.mockReset();
  // Default: Supabase is configured. Tests that want the opposite override.
  process.env.COZE_SUPABASE_URL = 'https://fake.supabase.co';
  process.env.COZE_SUPABASE_ANON_KEY = 'anon-fake';
  process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = 'service-fake';
});

afterEach(() => {
  process.env = { ...originalEnv };
});

// ---------------------------------------------------------------------------
// getServerEnv
// ---------------------------------------------------------------------------
describe('getServerEnv', () => {
  it('returns empty strings when env vars are missing', () => {
    delete process.env.COZE_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.COZE_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

    const env = getServerEnv();
    expect(env.url).toBe('');
    expect(env.anonKey).toBe('');
    expect(env.serviceKey).toBe('');
  });

  it('prefers COZE_* env vars over NEXT_PUBLIC_*', () => {
    process.env.COZE_SUPABASE_URL = 'https://coze.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://next.supabase.co';
    process.env.COZE_SUPABASE_ANON_KEY = 'coze-anon';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'next-anon';

    const env = getServerEnv();
    expect(env.url).toBe('https://coze.supabase.co');
    expect(env.anonKey).toBe('coze-anon');
  });

  it('falls back to NEXT_PUBLIC_* when COZE_* is missing', () => {
    delete process.env.COZE_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://next.supabase.co';
    delete process.env.COZE_SUPABASE_ANON_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'next-anon';

    const env = getServerEnv();
    expect(env.url).toBe('https://next.supabase.co');
    expect(env.anonKey).toBe('next-anon');
  });
});

// ---------------------------------------------------------------------------
// getRequestAuth
// ---------------------------------------------------------------------------
describe('getRequestAuth', () => {
  it('returns 503 when Supabase is not configured', async () => {
    delete process.env.COZE_SUPABASE_URL;
    delete process.env.COZE_SUPABASE_ANON_KEY;
    const result = await getRequestAuth(makeRequest(`Bearer ${validToken}`));
    expect(result).toEqual({ ok: false, status: 503, error: 'Database not configured' });
  });

  it('returns 401 when there is no Authorization header', async () => {
    const result = await getRequestAuth(makeRequest());
    expect(result).toEqual({ ok: false, status: 401, error: 'Not authenticated' });
  });

  it('returns 401 when the Authorization header is not a Bearer token', async () => {
    const result = await getRequestAuth(makeRequest('Basic dXNlcjpwYXNz'));
    expect(result).toEqual({ ok: false, status: 401, error: 'Not authenticated' });
  });

  it('returns 401 when the token does not resolve to a user', async () => {
    const fake = makeFakeClient({ user: null, userError: { message: 'invalid' } });
    mockCreateClient.mockReturnValue(fake);

    const result = await getRequestAuth(makeRequest(`Bearer ${validToken}`));
    expect(result).toEqual({ ok: false, status: 401, error: 'Invalid or expired session' });
  });

  it('returns ok:true with the user when the token is valid', async () => {
    const fake = makeFakeClient({ user: validUser });
    mockCreateClient.mockReturnValue(fake);

    const result = await getRequestAuth(makeRequest(`Bearer ${validToken}`));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.user).toEqual(validUser);
      expect(result.supabase).toBe(fake);
    }
  });

  it('passes the bearer token in the Authorization global header', async () => {
    const fake = makeFakeClient({ user: validUser });
    mockCreateClient.mockReturnValue(fake);

    await getRequestAuth(makeRequest(`Bearer ${validToken}`));
    // First call, first arg: [url, anonKey, options]
    const [, , options] = mockCreateClient.mock.calls[0]!;
    expect(options.global.headers.Authorization).toBe(`Bearer ${validToken}`);
  });
});

// ---------------------------------------------------------------------------
// requireAdmin
// ---------------------------------------------------------------------------
describe('requireAdmin', () => {
  it('short-circuits to 401 when the caller is not authenticated', async () => {
    const result = await requireAdmin(makeRequest());
    expect(result).toEqual({ ok: false, status: 401, error: 'Not authenticated' });
  });

  it('returns 503 when service role key is missing (admin lookup cannot run)', async () => {
    const fake = makeFakeClient({ user: validUser });
    mockCreateClient.mockReturnValue(fake);
    delete process.env.COZE_SUPABASE_SERVICE_ROLE_KEY;

    const result = await requireAdmin(makeRequest(`Bearer ${validToken}`));
    expect(result).toEqual({ ok: false, status: 503, error: 'Database not configured' });
  });

  it('returns 403 when the user is authenticated but not in admin_profiles', async () => {
    // First call (anon client) returns the user, second call (service client)
    // returns null from admin_profiles.
    const anonClient = makeFakeClient({ user: validUser });
    const serviceClient = makeFakeClient({
      tableResponses: { admin_profiles: { data: null, error: null } },
    });
    mockCreateClient
      .mockReturnValueOnce(anonClient) // getRequestAuth
      .mockReturnValueOnce(serviceClient); // buildServiceClient

    const result = await requireAdmin(makeRequest(`Bearer ${validToken}`));
    expect(result).toEqual({ ok: false, status: 403, error: 'Admin access required' });
  });

  it('returns ok:true when the user has an admin role', async () => {
    const anonClient = makeFakeClient({ user: validUser });
    const serviceClient = makeFakeClient({
      tableResponses: { admin_profiles: { data: { role: 'admin' }, error: null } },
    });
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(serviceClient);

    const result = await requireAdmin(makeRequest(`Bearer ${validToken}`));
    expect(result.ok).toBe(true);
  });

  it('accepts super_admin as well as admin', async () => {
    const anonClient = makeFakeClient({ user: validUser });
    const serviceClient = makeFakeClient({
      tableResponses: { admin_profiles: { data: { role: 'super_admin' }, error: null } },
    });
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(serviceClient);

    const result = await requireAdmin(makeRequest(`Bearer ${validToken}`));
    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// requirePartner
// ---------------------------------------------------------------------------
describe('requirePartner', () => {
  const partnerRecord = { id: 'partner-xyz', user_id: validUser.id, name: 'Acme' };

  it('short-circuits to 401 when the caller is not authenticated', async () => {
    const result = await requirePartner(makeRequest());
    expect(result).toEqual({ ok: false, status: 401, error: 'Not authenticated' });
  });

  it('returns 403 when the user has no partner record', async () => {
    const anonClient = makeFakeClient({ user: validUser });
    const serviceClient = makeFakeClient({
      tableResponses: { partners: { data: null, error: null } },
    });
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(serviceClient);

    const result = await requirePartner(makeRequest(`Bearer ${validToken}`));
    expect(result).toEqual({ ok: false, status: 403, error: 'Partner access required' });
  });

  it('returns 500 with the underlying error message when the partners query fails', async () => {
    const anonClient = makeFakeClient({ user: validUser });
    const serviceClient = makeFakeClient({
      tableResponses: { partners: { data: null, error: { message: 'connection refused' } } },
    });
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(serviceClient);

    const result = await requirePartner(makeRequest(`Bearer ${validToken}`));
    expect(result).toEqual({ ok: false, status: 500, error: 'connection refused' });
  });

  it('returns ok:true with the derived partnerId when a partner record exists', async () => {
    const anonClient = makeFakeClient({ user: validUser });
    const serviceClient = makeFakeClient({
      tableResponses: { partners: { data: partnerRecord, error: null } },
    });
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(serviceClient);

    const result = await requirePartner(makeRequest(`Bearer ${validToken}`));
    expect(result.ok).toBe(true);
    if (result.ok) {
      // The partnerId comes from the server, NEVER from the client — this
      // is the contract that prevents ?partnerId=... spoofing.
      expect(result.partnerId).toBe('partner-xyz');
      expect(result.partner).toEqual(partnerRecord);
    }
  });
});

// ---------------------------------------------------------------------------
// unwrap
// ---------------------------------------------------------------------------
describe('unwrap', () => {
  it('returns a 4xx/5xx Response on failure', () => {
    // Use `as const` AND a const literal for status so the type narrows
    // to the AuthFailure.status union (401 | 403 | 404 | 500 | 503).
    const failure = { ok: false as const, status: 401 as const, error: 'nope' };
    const out = unwrap(failure);
    expect('error' in out).toBe(true);
    if ('error' in out) {
      expect(out.error.status).toBe(401);
    }
  });

  it('returns the value on success', () => {
    const fakeClient = makeFakeClient({ user: validUser });
    // Cast user to the full Supabase User type — the auth helpers require
    // app_metadata, user_metadata, aud, created_at even if we only use
    // .id and .email in the test.
    const success = {
      ok: true as const,
      supabase: fakeClient as never,
      user: validUser as unknown as import('@supabase/supabase-js').User,
    };
    const out = unwrap(success);
    expect('value' in out).toBe(true);
    if ('value' in out) {
      expect(out.value.user).toBe(validUser);
    }
  });
});

// ---------------------------------------------------------------------------
// buildServiceClient
// ---------------------------------------------------------------------------
describe('buildServiceClient', () => {
  it('uses the service role key, not the anon key', () => {
    const fake = makeFakeClient();
    mockCreateClient.mockReturnValue(fake);

    buildServiceClient();
    const [url, key, options] = mockCreateClient.mock.calls[0]!;
    expect(url).toBe('https://fake.supabase.co');
    expect(key).toBe('service-fake');
    // No Bearer token attached — service role bypasses RLS.
    expect(options.global?.headers?.Authorization).toBeUndefined();
  });
});
