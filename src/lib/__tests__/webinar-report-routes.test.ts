import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), track: vi.fn() }));
vi.mock('@/lib/supabase-auth', () => ({ requireAdmin: mocks.auth }));
vi.mock('@/lib/analytics', () => ({ trackServer: mocks.track }));
import { GET } from '@/app/api/admin/webinar-signups/route';
import { GET as exportRows } from '@/app/api/admin/webinar-signups/export/route';
import { GET as stats } from '@/app/api/admin/webinar-signups/stats/route';
import { POST as bulk } from '@/app/api/admin/webinar-signups/bulk/route';
import {
  GET as history,
  PATCH,
} from '@/app/api/admin/webinar-signups/[id]/route';
import {
  buildWebinarReport,
  updateWebinarStatus,
} from '../webinar-report-server';
import { loadDashboardAnalytics } from '../admin-dashboard-report';
import { parseReportRange } from '../admin-reporting';

type Row = Record<string, unknown>;
const id = (n: number): string =>
  `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const row = (n: number, patch: Row = {}): Row => ({
  id: id(n),
  first_name: 'Test',
  last_name: `Student ${n}`,
  email: `test${n}@example.com`,
  whatsapp: '+12345',
  country: 'Nigeria',
  program_interests: ['master'],
  notes: null,
  source_page: '/webinar',
  utm_source: 'email',
  utm_campaign: null,
  status: 'Registered',
  created_at: '2026-10-21T18:00:00Z',
  webinar_key: '2026-10-22',
  ...patch,
});

interface FixtureQuery {
  select(columns: string, options?: { head?: boolean }): FixtureQuery;
  gte(key: string, value: string): FixtureQuery;
  lt(key: string, value: string): FixtureQuery;
  eq(key: string, value: unknown): FixtureQuery;
  is(key: string, value: null): FixtureQuery;
  order(): FixtureQuery;
  range(start: number, end: number): FixtureQuery;
  limit(limit: number): FixtureQuery;
  update(value: Row): FixtureQuery;
  insert(): FixtureQuery;
  maybeSingle(): Promise<{
    data: Row | null;
    error: { message: string } | null;
  }>;
  then(
    resolve: (result: {
      data: Row[] | null;
      count: number | null;
      error: { message: string } | null;
    }) => unknown,
    reject: (reason: Error) => unknown,
  ): Promise<unknown>;
}
function fixtureClient(
  tables: Record<string, Row[]>,
  failTable = '',
  conflict = false,
  historyThrows = false,
): SupabaseClient {
  return {
    from: (table: string) => {
      let matching = [...(tables[table] || [])];
      let from = 0;
      let to = Number.MAX_SAFE_INTEGER;
      let head = false;
      let patch: Row | null = null;
      const query: FixtureQuery = {
        select: (
          _columns: string,
          options?: { head?: boolean },
        ): FixtureQuery => {
          head = !!options?.head;
          return query;
        },
        gte: (key: string, value: string): FixtureQuery => {
          matching = matching.filter((r) => String(r[key]) >= value);
          return query;
        },
        lt: (key: string, value: string): FixtureQuery => {
          matching = matching.filter((r) => String(r[key]) < value);
          return query;
        },
        eq: (key: string, value: unknown): FixtureQuery => {
          matching = matching.filter((r) => r[key] === value);
          return query;
        },
        is: (key: string, value: null): FixtureQuery => {
          matching = matching.filter((r) => r[key] === value);
          return query;
        },
        order: (): FixtureQuery => query,
        range: (start: number, end: number): FixtureQuery => {
          from = start;
          to = end;
          return query;
        },
        limit: (limit: number): FixtureQuery => {
          to = limit - 1;
          return query;
        },
        update: (value: Row): FixtureQuery => {
          patch = value;
          return query;
        },
        insert: (): FixtureQuery => query,
        maybeSingle: async (): Promise<{
          data: Row | null;
          error: { message: string } | null;
        }> => {
          if (failTable === table)
            return { data: null, error: { message: 'Database failed' } };
          if (patch && conflict) return { data: null, error: null };
          if (patch && matching[0]) Object.assign(matching[0], patch);
          return { data: matching[0] || null, error: null };
        },
        then: (
          resolve: (result: {
            data: Row[] | null;
            count: number | null;
            error: { message: string } | null;
          }) => unknown,
          reject: (reason: Error) => unknown,
        ): Promise<unknown> => {
          if (historyThrows && table === 'lead_history')
            return Promise.reject(new Error('Network failed')).then(
              resolve,
              reject,
            );
          return Promise.resolve(
            resolve({
              data:
                failTable === table
                  ? null
                  : head
                    ? null
                    : matching.slice(from, to + 1),
              count: failTable === table ? null : matching.length,
              error:
                failTable === table ? { message: 'Database failed' } : null,
            }),
          );
        },
      };
      return query;
    },
  } as unknown as SupabaseClient;
}
const request = (suffix = ''): NextRequest =>
  new NextRequest(
    `http://localhost/api/admin/webinar-signups?range=custom&from=2026-10-21&to=2026-10-22${suffix}`,
  );
const post = (body: unknown): NextRequest =>
  new NextRequest('http://localhost/api/admin/webinar-signups/bulk', {
    method: 'POST',
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue({
    ok: true,
    user: { id: id(9999) },
    supabase: fixtureClient({ webinar_signups: [row(1)] }),
  });
});

describe('authenticated webinar reporting', () => {
  it('uses all 1,201 records and separates status-filtered results from the full audience summary', async () => {
    const client = fixtureClient({
      webinar_signups: Array.from({ length: 1201 }, (_, n) =>
        row(n, { status: n === 1200 ? 'Attended' : 'Registered' }),
      ),
    });
    const { report, matching } = await buildWebinarReport(
      client,
      request('&status=Attended').nextUrl.searchParams,
    );
    expect(report.stats.total).toBe(1201);
    expect(report.stats.attended).toBe(1);
    expect(report.total).toBe(1);
    expect(matching[0].id).toBe(id(1200));
    expect(report.signups).toHaveLength(1);
    expect(report.stats.attendanceRate).toBe(100);
  });
  it('exports the filtered population and selected IDs, not merely the visible page', async () => {
    mocks.auth.mockResolvedValue({
      ok: true,
      user: { id: id(9999) },
      supabase: fixtureClient({
        webinar_signups: [row(1), row(2, { country: 'China' }), row(3)],
      }),
    });
    const response = await exportRows(
      request(`&country=Nigeria&ids=${id(1)},${id(2)}`),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('X-Row-Count')).toBe('1');
    const text = await response.text();
    expect(text).toContain('test1@example.com');
    expect(text).not.toContain('test2@example.com');
    expect(text).not.toContain('test3@example.com');
  });
  it('returns 503 for database failures instead of successful zero statistics', async () => {
    mocks.auth.mockResolvedValue({
      ok: true,
      supabase: fixtureClient({}, 'webinar_signups'),
    });
    for (const handler of [GET, stats, exportRows])
      expect((await handler(request())).status).toBe(503);
    expect(
      (
        await GET(
          new NextRequest(
            'http://localhost/api/admin/webinar-signups?range=custom&from=2026-02-30&to=2026-03-01',
          ),
        )
      ).status,
    ).toBe(400);
  });
  it.each([401, 403])(
    'rejects unauthorized callers (%s) for reads, exports, history and writes',
    async (status) => {
      mocks.auth.mockResolvedValue({ ok: false, status, error: 'Forbidden' });
      for (const handler of [GET, stats, exportRows])
        expect((await handler(request())).status).toBe(status);
      expect(
        (await bulk(post({ ids: [id(1)], status: 'Attended' }))).status,
      ).toBe(status);
      const context = { params: Promise.resolve({ id: id(1) }) };
      expect((await history(request(), context)).status).toBe(status);
      expect((await PATCH(post({ status: 'Attended' }), context)).status).toBe(
        status,
      );
    },
  );
});

describe('attendance writes', () => {
  it('reports partial bulk failures and deduplicates repeated selections', async () => {
    const response = await bulk(
      post({ ids: [id(1), id(1), id(2)], status: 'Attended' }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      updated: 1,
      failed: [{ id: id(2), error: 'Registration not found.' }],
    });
    expect(mocks.track).toHaveBeenCalledTimes(1);
  });
  it('rejects malformed, empty, oversized, or unsupported write requests', async () => {
    for (const body of [
      { ids: [], status: 'Attended' },
      { ids: ['bad'], status: 'Attended' },
      { ids: Array.from({ length: 201 }, (_, n) => id(n)), status: 'Attended' },
      { ids: [id(1)], status: 'Unknown' },
    ])
      expect((await bulk(post(body))).status).toBe(400);
  });
  it('leaves a concurrent change intact, treats no-op writes as success, and isolates history failure', async () => {
    await expect(
      updateWebinarStatus(
        fixtureClient({ webinar_signups: [row(1)] }, '', true),
        id(1),
        'Attended',
        id(9999),
      ),
    ).rejects.toThrow('changed');
    await updateWebinarStatus(
      fixtureClient({ webinar_signups: [row(1, { status: 'Attended' })] }),
      id(1),
      'Attended',
      id(9999),
    );
    expect(mocks.track).not.toHaveBeenCalled();
    await expect(
      updateWebinarStatus(
        fixtureClient({ webinar_signups: [row(1)] }, '', false, true),
        id(1),
        'Attended',
        id(9999),
      ),
    ).resolves.toBeUndefined();
  });
});

it('dashboard excludes archived partner applications from period counts and current Submitted queue', async () => {
  const range = parseReportRange(request().nextUrl.searchParams);
  const analytics = await loadDashboardAnalytics(
    fixtureClient({
      student_applications: [
        {
          id: 'student',
          created_at: '2026-10-21T18:00:00Z',
          status: 'Submitted',
        },
      ],
      partner_applications: [
        {
          id: 'active',
          created_at: '2026-10-21T18:00:00Z',
          status: 'Submitted',
          archived_at: null,
        },
        {
          id: 'archived',
          created_at: '2026-10-21T18:00:00Z',
          status: 'Submitted',
          archived_at: '2026-10-22',
        },
      ],
    }),
    range,
  );
  expect(analytics.metrics.applications).toEqual({ current: 2, previous: 0 });
  expect(analytics.submitted).toBe(2);
});
