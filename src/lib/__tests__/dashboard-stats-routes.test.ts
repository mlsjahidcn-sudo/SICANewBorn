import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), team: vi.fn(), env: vi.fn(), service: vi.fn() }));
vi.mock('@/lib/supabase-auth', () => ({
  getRequestAuth: mocks.auth, requireTeamMember: mocks.team, getServerEnv: mocks.env, buildServiceClient: mocks.service,
}));
import { GET as studentStats } from '@/app/api/student/applications/stats/route';
import { GET as partnerStats } from '@/app/api/partner/applications/stats/route';

type Row = Record<string, string | null>;
interface CountResult { count: number | null; error: { message: string } | null }

/** Executes the route's actual filters against fixture rows, including ownership and archived rows. */
function clientFor(rows: Row[], error = false): { from: ReturnType<typeof vi.fn>; queries: Array<{ filters: Array<[string, unknown]> }> } {
  const queries: Array<{ filters: Array<[string, unknown]> }> = [];
  const from = vi.fn(() => {
    let matching = rows;
    const filters: Array<[string, unknown]> = [];
    const query = {
      filters,
      select: vi.fn(), eq: vi.fn(), in: vi.fn(), is: vi.fn(), not: vi.fn(),
      then: (resolve: (result: CountResult) => unknown): Promise<unknown> => Promise.resolve(resolve({
        count: error ? null : matching.length, error: error ? { message: 'DB unavailable' } : null,
      })),
    };
    query.select.mockReturnValue(query);
    query.eq.mockImplementation((key: string, value: string) => { filters.push([key, value]); matching = matching.filter((row) => row[key] === value); return query; });
    query.in.mockImplementation((key: string, values: string[]) => { filters.push([key, values]); matching = matching.filter((row) => values.includes(row[key] ?? '')); return query; });
    query.is.mockImplementation((key: string, value: null) => { filters.push([key, value]); matching = matching.filter((row) => row[key] === value); return query; });
    query.not.mockImplementation((key: string) => { matching = matching.filter((row) => row[key] !== null); return query; });
    queries.push(query);
    return query;
  });
  return { from, queries };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.env.mockReturnValue({ url: 'https://example.supabase.co', serviceKey: 'service' });
  mocks.auth.mockResolvedValue({ ok: true, user: { id: 'student-1' } });
});

describe('student application statistics', () => {
  it('counts every status beyond a page and excludes other students on every service-role query', async () => {
    const rows: Row[] = [
      ...Array.from({ length: 25 }, () => ({ student_id: 'student-1', status: 'Under Review' })),
      ...['Submitted', 'Documents Requested', 'Decision Made', 'Draft', 'Accepted', 'Rejected', 'Withdrawn'].map((status) => ({ student_id: 'student-1', status })),
      { student_id: 'student-2', status: 'Accepted' },
    ];
    const client = clientFor(rows);
    mocks.service.mockReturnValue(client);
    const response = await studentStats(new Request('http://localhost/api/student/applications/stats?studentId=student-2'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ total: 32, pending: 28, accepted: 1, documentsRequested: 1, drafts: 1 });
    expect(client.queries).toHaveLength(5);
    for (const query of client.queries) expect(query.filters).toContainEqual(['student_id', 'student-1']);
  });

  it('rejects unauthenticated callers before constructing a privileged client', async () => {
    mocks.auth.mockResolvedValue({ ok: false, status: 401, error: 'Not authenticated' });
    expect((await studentStats(new Request('http://localhost'))).status).toBe(401);
    expect(mocks.service).not.toHaveBeenCalled();
  });

  it('returns 503 without a service key, and never reports DB errors as zero counts', async () => {
    mocks.env.mockReturnValue({ url: 'https://example.supabase.co', serviceKey: '' });
    expect((await studentStats(new Request('http://localhost'))).status).toBe(503);
    mocks.env.mockReturnValue({ url: 'https://example.supabase.co', serviceKey: 'service' });
    mocks.service.mockReturnValue(clientFor([], true));
    expect((await studentStats(new Request('http://localhost'))).status).toBe(500);
  });
});

describe('partner application statistics', () => {
  const rows: Row[] = [
    ...Array.from({ length: 110 }, () => ({ partner_id: 'p1', created_by_user_id: 'u1', archived_at: null, status: 'In Review' })),
    ...['Draft', 'Submitted', 'Accepted', 'Rejected', 'Withdrawn'].map((status) => ({ partner_id: 'p1', created_by_user_id: 'u1', archived_at: null, status })),
    { partner_id: 'p1', created_by_user_id: 'u2', archived_at: null, status: 'Submitted' },
    { partner_id: 'p2', created_by_user_id: 'u1', archived_at: null, status: 'Submitted' },
    { partner_id: 'p1', created_by_user_id: 'u1', archived_at: '2026-10-01', status: 'Submitted' },
  ];

  it.each(['owner', 'member'])('includes In Review beyond 100 rows and enforces %s scope', async (role) => {
    const client = clientFor(rows);
    mocks.team.mockResolvedValue({ ok: true, role, user: { id: 'u1' }, partnerId: 'p1', supabase: client });
    const response = await partnerStats(new NextRequest('http://localhost/api/partner/applications/stats'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ active: role === 'owner' ? 113 : 112, accepted: 1, archived: 1 });
    for (const query of client.queries) {
      expect(query.filters).toContainEqual(['partner_id', 'p1']);
      if (role === 'member') expect(query.filters).toContainEqual(['created_by_user_id', 'u1']);
    }
  });
});

describe('partner student statistics', () => {
  const rows: Row[] = [
    ...['New', 'In Progress', 'Applied', 'Accepted', 'Rejected'].map((status) => ({ partner_id: 'p1', created_by_user_id: 'u1', archived_at: null, status })),
    { partner_id: 'p1', created_by_user_id: 'u1', archived_at: '2026-10-01', status: 'New' },
    { partner_id: 'p1', created_by_user_id: 'u2', archived_at: null, status: 'New' },
    { partner_id: 'p1', created_by_user_id: 'u2', archived_at: '2026-10-01', status: 'New' },
    { partner_id: 'p2', created_by_user_id: 'u1', archived_at: null, status: 'New' },
  ];
  it.each(['owner', 'member'])('matches the list ownership scope for %s, including archived counts', async (role) => {
    const client = clientFor(rows);
    mocks.team.mockResolvedValue({ ok: true, role, user: { id: 'u1' }, partnerId: 'p1', supabase: client });
    const { GET } = await import('@/app/api/partner/students/stats/route');
    const response = await GET(new NextRequest('http://localhost/api/partner/students/stats'));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      total: role === 'owner' ? 8 : 6, new: role === 'owner' ? 2 : 1,
      archived: role === 'owner' ? 2 : 1, inProgress: 1, applied: 1, accepted: 1, rejected: 1,
    });
    for (const query of client.queries) {
      expect(query.filters).toContainEqual(['partner_id', 'p1']);
      if (role === 'member') expect(query.filters).toContainEqual(['created_by_user_id', 'u1']);
    }
  });
});
