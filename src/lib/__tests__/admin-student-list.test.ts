import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadAdminStudentList } from '@/lib/admin-student-list';
import { adminStudentDetailHref } from '@/lib/admin-student-list-types';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), env: vi.fn(), service: vi.fn() }));
vi.mock('@/lib/supabase-auth', () => ({ requireAdmin: mocks.auth, getServerEnv: mocks.env, buildServiceClient: mocks.service }));
vi.mock('@/lib/email', () => ({ sendStudentWelcome: vi.fn() }));
vi.mock('@/lib/admin/last-email-lookup', () => ({ fetchLastEmailSentAt: vi.fn(async () => new Map()) }));
import { GET as list } from '@/app/api/admin/students/route';
import { GET as stats } from '@/app/api/admin/students/stats/route';
import { GET as csv } from '@/app/api/admin/students/export/route';

type Row = Record<string, unknown>;
const profile = { id: 'profile-1', first_name: 'Amina', last_name: 'Ali', email: 'amina@example.test', source: 'Online', status: 'Active', service_paid: false, created_at: '2026-10-01', updated_at: '2026-10-01' };
const partner = { id: 'partner-student-1', student_name: 'Bashir Khan', student_email: 'bashir@example.test', student_phone: '1234', nationality: 'Bangladesh', target_program: 'Medicine', target_university: 'Test University', linked_student_profile_id: null, archived_at: null, status: 'New', created_at: '2026-10-02', updated_at: '2026-10-02' };

/** Execute actual route predicates, and emulate a Data API page cap. */
function client(tables: Record<string, Row[]>, failTable?: string): SupabaseClient {
  return { from(table: string) {
    let rows = [...(tables[table] || [])];
    let start = 0; let end = Infinity; let head = false;
    const query = {
      select(_columns: string, options?: { head?: boolean }) { head = Boolean(options?.head); return query; },
      eq(key: string, value: unknown) { rows = rows.filter(row => row[key] === value); return query; },
      neq(key: string, value: unknown) { rows = rows.filter(row => row[key] !== value); return query; },
      is(key: string, value: unknown) { rows = rows.filter(row => row[key] === value); return query; },
      in(key: string, values: unknown[]) { rows = rows.filter(row => values.includes(row[key])); return query; },
      or(filters: string) {
        const terms = filters.split(',').map(term => term.split('.ilike.%'));
        rows = rows.filter(row => terms.some(([key, term]) => String(row[key] || '').toLowerCase().includes(term.slice(0, -1).toLowerCase())));
        return query;
      },
      order(key: string) { rows.sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || ''))); return query; },
      range(from: number, to: number) { start = from; end = Math.min(to, from + 49); return query; },
      then(resolve: (result: unknown) => unknown) {
        return Promise.resolve(resolve({ data: head ? null : rows.slice(start, end + 1), count: rows.length, error: table === failTable ? { message: 'Database unavailable' } : null }));
      },
    };
    return query;
  } } as unknown as SupabaseClient;
}
const request = (params = ''): NextRequest => new NextRequest(`http://localhost/api/admin/students${params}`);
beforeEach(() => {
  vi.clearAllMocks();
  mocks.env.mockReturnValue({ serviceKey: 'test' });
  mocks.auth.mockResolvedValue({ ok: true, user: { id: 'admin-1' } });
});

describe('unified admin students', () => {
  const tables = {
    student_profiles: [profile],
    partner_students: [partner,
      { ...partner, id: 'no-email', student_name: 'SingleName', student_email: null },
      { ...partner, id: 'linked', linked_student_profile_id: profile.id },
      { ...partner, id: 'archived', archived_at: '2026-10-03' }],
    partner_applications: [
      { id: 'a1', student_id: partner.id, archived_at: null },
      { id: 'a2', student_id: partner.id, archived_at: null },
      { id: 'a3', student_id: partner.id, archived_at: '2026-10-03' },
      { id: 'a4', linked_student_profile_id: profile.id, archived_at: null },
    ],
  };
  it('includes unlinked and email-less partner students, omits archived/linked duplicates, and routes by identity', async () => {
    const rows = await loadAdminStudentList(client(tables), new URLSearchParams());
    expect(rows).toHaveLength(3);
    expect(rows.map(row => row.id)).not.toContain('linked');
    expect(rows.find(row => row.id === partner.id)).toMatchObject({ surface: 'partner', source: 'Partner', status: 'New', firstName: 'Bashir', lastName: 'Khan', targetField: 'Medicine' });
    expect(rows.find(row => row.id === 'no-email')).toMatchObject({ email: '', firstName: 'SingleName', lastName: '' });
    expect(adminStudentDetailHref(rows.find(row => row.id === partner.id)!)).toBe(`/admin/partner-students/${partner.id}`);
    expect(adminStudentDetailHref({ id: profile.id })).toBe(`/admin/students/${profile.id}`);
  });
  it.each([
    ['surface=student', [profile.id]], ['surface=partner', [partner.id, 'no-email']],
    ['source=Partner', [partner.id, 'no-email']], ['source=Online', [profile.id]],
    ['status=New', [partner.id, 'no-email']], ['status=Active', [profile.id]],
    ['servicePaid=true', []], ['servicePaid=false', [profile.id]],
    ['isOffline=true', []], ['isOffline=false', [partner.id, 'no-email', profile.id]],
    ['search=Medicine', [partner.id, 'no-email']], ['search=1234', [partner.id, 'no-email']],
    ['search=amina', [profile.id]],
  ])('keeps filters consistent: %s', async (params, expected) => {
    const rows = await loadAdminStudentList(client(tables), new URLSearchParams(params));
    expect(rows.map(row => row.id).sort()).toEqual([...expected].sort());
  });
  it('paginates the merged result and counts CRM applications using student_id', async () => {
    mocks.service.mockReturnValue(client(tables));
    const response = await list(request('?sort=first_name&order=asc&page=2&limit=1'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ total: 3, totalPages: 3, page: 2, students: [{ id: partner.id, status: 'New', applicationCount: 2 }] });
  });
  it('reads past the Data API cap before sorting and paginating', async () => {
    const many = Array.from({ length: 125 }, (_, i) => ({ ...partner, id: `p-${String(i).padStart(3, '0')}`, student_name: `Student ${String(i).padStart(3, '0')}` }));
    mocks.service.mockReturnValue(client({ partner_students: many }));
    const response = await list(request('?source=Partner&sort=last_name&order=asc&page=7&limit=20'));
    const body = await response.json();
    expect(body.total).toBe(125); expect(body.students).toHaveLength(5); expect(body.students[0].id).toBe('p-120');
  });
  it('includes CRM records in totals without inventing profile account statuses', async () => {
    mocks.service.mockReturnValue(client(tables));
    const response = await stats(request());
    expect(await response.json()).toMatchObject({ total: 3, active: 1, pending: 0, offline: 0 });
  });
  it('exports the same filtered records, native statuses, and application counts', async () => {
    mocks.service.mockReturnValue(client(tables));
    const response = await csv(request('?source=Partner'));
    const text = await response.text();
    expect(response.headers.get('X-Row-Count')).toBe('2');
    expect(text).toContain('Bashir Khan,bashir@example.test,1234,Bangladesh');
    expect(text).toContain('Partner,New,,2,');
    expect(text).not.toContain('amina@example.test');
  });
  it('reports export truncation when the merged list exceeds 1000', async () => {
    mocks.service.mockReturnValue(client({ partner_students: Array.from({ length: 1001 }, (_, i) => ({ ...partner, id: `p-${i}` })) }));
    const response = await csv(request());
    expect(response.headers.get('X-Truncated')).toBe('true');
    expect(response.headers.get('X-Row-Count')).toBe('1000');
  });
  it.each([list, stats, csv])('rejects non-admin callers before querying privileged data', async (handler) => {
    mocks.auth.mockResolvedValue({ ok: false, status: 403, error: 'Forbidden' });
    expect((await handler(request())).status).toBe(403);
    expect(mocks.service).not.toHaveBeenCalled();
  });
  it.each([list, stats, csv])('surfaces a CRM query failure instead of hiding partner students', async (handler) => {
    mocks.service.mockReturnValue(client(tables, 'partner_students'));
    expect((await handler(request())).status).toBe(500);
  });
});
