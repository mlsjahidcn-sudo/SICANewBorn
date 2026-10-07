/**
 * S144 — hardens the suspension check against user_metadata.role
 * spoofing. The previous implementation gated the student-profile
 * suspension lookup on user_metadata?.role — a user-writable field,
 * so a suspended student could claim to be admin in their
 * user_metadata.role and bypass suspension entirely.
 *
 * The fix reads the role from admin_profiles (DB, not metadata).
 * The two contracts that need to hold after the change:
 *
 *   1. A user whose admin_profiles row says "admin" is never
 *      blocked by their student_profiles.status (admins aren't
 *      suspended via the student table).
 *   2. A user with user_metadata.role='admin' but NO admin_profiles
 *      row is treated as a student. If their student_profiles row
 *      is Suspended, they get 403.
 *
 * These are the tests we couldn't have written before — they're
 * the regression guards.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';

const mockCreateClient = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}));

const { getRequestAuth } = await import('@/lib/supabase-auth');

interface FakeUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

function makeFakeClient(opts: {
  user?: FakeUser | null;
  userError?: { message: string } | null;
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
      eq: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue(terminal),
        maybeSingle: vi.fn().mockResolvedValue(response),
      }),
    };
  };

  return { auth, from };
}

const SAVED_ENV = { ...process.env };

function makeRequest(): Request {
  return new Request('http://localhost/test', {
    headers: { authorization: 'Bearer fake.token' },
  });
}

beforeEach(() => {
  mockCreateClient.mockReset();
  mockCreateClient.mockImplementation(
    () => makeFakeClient() as unknown as ReturnType<typeof mockCreateClient>,
  );
  process.env.COZE_SUPABASE_URL = 'https://fake.supabase.co';
  process.env.COZE_SUPABASE_ANON_KEY = 'anon-fake';
  process.env.COZE_SUPABASE_SERVICE_ROLE_KEY = 'service-fake';
});

afterEach(() => {
  process.env = { ...SAVED_ENV };
});

describe('getRequestAuth — S144 suspension hardening', () => {
  it('does NOT honor user_metadata.role to bypass suspension', async () => {
    // A user claims role='admin' in their user_metadata. Their
    // student_profiles.status is 'Suspended'. The previous version
    // would have skipped the suspension check; the fixed version
    // must still 403.
    const fakeUser: FakeUser = {
      id: 'u-suspended-spoof',
      email: 'spoof@example.com',
      user_metadata: { role: 'admin' },
      app_metadata: {},
    };
    const anonClient = makeFakeClient({
      user: fakeUser,
      tableResponses: { student_profiles: { data: { status: 'Suspended' }, error: null } },
    });
    const adminCheck = makeFakeClient({
      // No admin_profiles row → not actually an admin.
      tableResponses: { admin_profiles: { data: null, error: null } },
    });
    mockCreateClient.mockReset();
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(adminCheck);

    const result = await getRequestAuth(makeRequest());
    expect(result).toEqual({
      ok: false,
      status: 403,
      error: 'Account suspended',
    });
  });

  it('does NOT honor app_metadata.role to bypass suspension', async () => {
    // Defense in depth — app_metadata.role might be set by a server-side
    // script that has been compromised. The DB row is the only
    // source of truth.
    const fakeUser: FakeUser = {
      id: 'u-app-meta-spoof',
      email: 'appmeta-spoof@example.com',
      user_metadata: {},
      app_metadata: { role: 'admin' },
    };
    const anonClient = makeFakeClient({
      user: fakeUser,
      tableResponses: { student_profiles: { data: { status: 'Suspended' }, error: null } },
    });
    const adminCheck = makeFakeClient({
      tableResponses: { admin_profiles: { data: null, error: null } },
    });
    mockCreateClient.mockReset();
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(adminCheck);

    const result = await getRequestAuth(makeRequest());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);
  });

  it('admits a real admin (admin_profiles row exists) regardless of student_profiles', async () => {
    const fakeUser: FakeUser = {
      id: 'u-real-admin',
      email: 'admin@example.com',
      user_metadata: {},
      app_metadata: {},
    };
    const anonClient = makeFakeClient({ user: fakeUser });
    const adminCheck = makeFakeClient({
      tableResponses: { admin_profiles: { data: { role: 'admin' }, error: null } },
    });
    mockCreateClient.mockReset();
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(adminCheck);

    const result = await getRequestAuth(makeRequest());
    expect(result.ok).toBe(true);
  });

  it('admits a non-admin with no student_profiles row (clean account)', async () => {
    const fakeUser: FakeUser = {
      id: 'u-clean-student',
      email: 'clean@example.com',
      user_metadata: {},
      app_metadata: {},
    };
    const anonClient = makeFakeClient({ user: fakeUser });
    const adminCheck = makeFakeClient({
      tableResponses: { admin_profiles: { data: null, error: null } },
    });
    mockCreateClient.mockReset();
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(adminCheck);

    const result = await getRequestAuth(makeRequest());
    expect(result.ok).toBe(true);
  });

  it('admits a non-suspended student whose student_profiles.status is anything-but-Suspended', async () => {
    const fakeUser: FakeUser = {
      id: 'u-active-student',
      email: 'active@example.com',
      user_metadata: {},
      app_metadata: {},
    };
    const anonClient = makeFakeClient({ user: fakeUser });
    const adminCheck = makeFakeClient({
      tableResponses: { admin_profiles: { data: null, error: null } },
    });
    mockCreateClient.mockReset();
    mockCreateClient
      .mockReturnValueOnce(anonClient)
      .mockReturnValueOnce(adminCheck);

    const result = await getRequestAuth(makeRequest());
    expect(result.ok).toBe(true);
  });
});