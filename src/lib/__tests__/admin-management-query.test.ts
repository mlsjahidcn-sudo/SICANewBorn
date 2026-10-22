import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({ service: vi.fn(), auth: vi.fn() }));
vi.mock('@/lib/supabase-auth', () => ({ requireAdmin: mocks.auth, buildServiceClient: mocks.service, getServerEnv: () => ({ serviceKey: 'fixture' }) }));
import { GET as list } from '@/app/api/admin/applications/route';
import { GET as counts } from '@/app/api/admin/applications/counts/route';
import { GET as exportCsv } from '@/app/api/admin/applications/export/route';
import { DELETE as archive } from '@/app/api/admin/applications/[id]/route';
import { DELETE as archivePartner } from '@/app/api/admin/partner-applications/[id]/route';
import { GET as studentActivity } from '@/app/api/admin/students/[id]/activity/route';
import { PATCH as updateStudent } from '@/app/api/admin/students/[id]/route';
import { collectRows, filterAdminApplications, loadAdminApplications, paginateAdminApplications } from '@/lib/admin-application-query';
import { escapeApplicationCsv } from '@/lib/application-csv';

type Row = Record<string, unknown>;
function database(tables: Record<string, Row[]>, cap = 500): SupabaseClient {
  return { from: vi.fn((table: string) => {
    let rows = [...(tables[table] || [])]; let from = 0; let to = Infinity;
    const query = {
      select: vi.fn(), order: vi.fn(), range: vi.fn(), eq: vi.fn(), in: vi.fn(), is: vi.fn(), limit: vi.fn(), maybeSingle: vi.fn(),
      then: (resolve: (value: unknown) => unknown): Promise<unknown> => Promise.resolve(resolve({ data: rows.slice(from, Math.min(to + 1, from + cap)), count: rows.length, error: null })),
    };
    query.select.mockReturnValue(query); query.order.mockReturnValue(query);
    query.range.mockImplementation((a: number, b: number) => { from = a; to = b; return query; });
    query.eq.mockImplementation((key: string, value: unknown) => { rows = rows.filter(r => r[key] === value); return query; });
    query.in.mockImplementation((key: string, values: unknown[]) => { rows = rows.filter(r => values.includes(r[key])); return query; });
    query.is.mockImplementation((key: string, value: unknown) => { rows = rows.filter(r => (r[key] ?? null) === value); return query; });
    query.limit.mockImplementation((n: number) => { to = n - 1; return query; });
    query.maybeSingle.mockImplementation(async () => ({ data: rows[0] ?? null, error: null }));
    return query;
  }), rpc: vi.fn().mockResolvedValue({ data: null, error: null }) } as unknown as SupabaseClient;
}
function student(i: number, extra: Row = {}): Row {
  return { id: `s${i}`, student_id: 'person', student: { first_name: 'Amina', last_name: 'Ali', email: 'amina@example.test', source: 'Online' }, university_name: 'University', program_name: `Medicine ${i}`, application_number: `REF-${i}`, status: 'Submitted', created_at: '2026-10-21T00:00:00Z', updated_at: '2026-10-21T00:00:00Z', archived_at: null, ...extra };
}
const partner = (extra: Row = {}): Row => ({ id: 'p1', student_name: 'Partner applicant', student_email: 'partner@example.test', linked_student_profile_id: 'person', university: 'Partner University', program: 'Physics', status: 'In Review', created_at: '2026-10-20', archived_at: null, ...extra });
beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({ ok: true, user: { id: 'admin' } }); });

describe('complete unified application query', () => {
  it('reaches every record and reports exact totals beyond the API page cap', async () => {
    const db = database({ student_applications: Array.from({ length: 5001 }, (_, i) => student(i)), partner_applications: [partner()] }, 137);
    mocks.service.mockReturnValue(db);
    const response = await list(new NextRequest('http://localhost?limit=100&page=51'));
    const body = await response.json();
    expect(body.total).toBe(5002); expect(body.applications).toHaveLength(2); expect(body.totalPages).toBe(51);
  });
  it('sorts the full population by explicit priority rank with stable ties', async () => {
    const rows = await loadAdminApplications(database({ student_applications: [student(1, { priority: 'High' }), student(2, { priority: 'Urgent' }), student(3, { priority: 'Low' })] }));
    expect(filterAdminApplications(rows, new URLSearchParams('sort=priority&order=desc')).map(r => r.id)).toEqual(['s2','s1','s3']);
  });
  it('matches program, reference, profile name, literal punctuation and status aliases', async () => {
    const rows = await loadAdminApplications(database({ student_applications: [student(1, { program_name: 'Medicine, (Clinical)' })], partner_applications: [partner()] }));
    expect(filterAdminApplications(rows, new URLSearchParams({ search: 'Medicine, (Clinical)' }))).toHaveLength(1);
    expect(filterAdminApplications(rows, new URLSearchParams('search=REF-1'))).toHaveLength(1);
    expect(filterAdminApplications(rows, new URLSearchParams('search=Amina'))).toHaveLength(1);
    expect(filterAdminApplications(rows, new URLSearchParams('status=Under+Review'))[0].surface).toBe('partner');
  });
  it('uses linked profile identity on both surfaces and excludes unsupported finance/enrollment surfaces', async () => {
    const rows = await loadAdminApplications(database({ student_applications: [student(1), student(2, { student_id: 'other' })], partner_applications: [partner(), partner({ id: 'p2', linked_student_profile_id: null })] }));
    expect(filterAdminApplications(rows, new URLSearchParams('student=person')).map(r => r.id)).toEqual(['s1','p1']);
    expect(filterAdminApplications(rows, new URLSearchParams('enrolled=false')).every(r => r.surface === 'student')).toBe(true);
    expect(filterAdminApplications(rows, new URLSearchParams('paymentStatus=paid'))).toHaveLength(0);
  });
  it('shares surface, archive, decision and selected-record scope with export and counts', async () => {
    mocks.service.mockReturnValue(database({ student_applications: [student(1, { decision: 'Accepted' }), student(2, { archived_at: '2026-10-22' })], partner_applications: [partner()] }));
    const request = new NextRequest('http://localhost?surface=student&hasDecision=true');
    expect((await (await list(request)).json()).total).toBe(1);
    expect((await (await counts(request)).json()).total).toBe(1);
    const csv = await exportCsv(request); expect(csv.headers.get('X-Row-Count')).toBe('1'); expect(await csv.text()).toContain('Accepted');
    const partnerCsv = await exportCsv(new NextRequest('http://localhost?surface=partner')); expect(partnerCsv.headers.get('X-Row-Count')).toBe('1'); expect(await partnerCsv.text()).not.toContain('Amina');
    const selected = await exportCsv(new NextRequest('http://localhost?keys=student:s2')); expect(selected.headers.get('X-Row-Count')).toBe('1');
  });
  it('counts applications instead of the number of student profiles', async () => {
    mocks.service.mockReturnValue(database({ student_applications: [student(1),student(2)], partner_applications: [partner()] }));
    const body = await (await counts(new NextRequest('http://localhost'))).json();
    expect(body).toMatchObject({ total: 3, online: 2, partner: 1, partnerCrm: 1, inReview: 1, perStatusCapped: false });
  });
  it('detects export truncation within a single surface', async () => {
    mocks.service.mockReturnValue(database({ student_applications: Array.from({ length: 1001 }, (_, i) => student(i)) }));
    const response = await exportCsv(new NextRequest('http://localhost'));
    expect(response.headers.get('X-Truncated')).toBe('true'); expect(response.headers.get('X-Matching-Count')).toBe('1001');
  });
  it('keeps an entire shortlist together across page boundaries', async () => {
    const rows = await loadAdminApplications(database({ student_applications: Array.from({ length: 45 }, (_, i) => student(i, { campaign_id: 'one-shortlist' })) }));
    const result = paginateAdminApplications(rows, new URLSearchParams('grouped=true&limit=20'));
    expect(result.total).toBe(1); expect(result.applications).toHaveLength(45);
  });
  it('fails closed on partial database failure and rejects invalid filters', async () => {
    await expect(collectRows(async () => ({ data: null, error: { message: 'DB unavailable' } }))).rejects.toThrow('DB unavailable');
    mocks.service.mockReturnValue(database({}));
    expect((await list(new NextRequest('http://localhost?surface=invalid'))).status).toBe(400);
  });
  it('protects CSV readers from formulas and preserves RFC escaping', () => {
    expect(escapeApplicationCsv(' =HYPERLINK("x")')).toContain("' =HYPERLINK");
    expect(escapeApplicationCsv('a,b')).toBe('"a,b"');
  });
});

describe('admin mutations and activity integrity', () => {
  it.each([['student', archive], ['partner', archivePartner]] as const)('single %s removal calls the reversible, audited archive function', async (surface, route) => {
    const db = database({}); mocks.service.mockReturnValue(db);
    const response = await route(new NextRequest('http://localhost', { method: 'DELETE' }), { params: Promise.resolve({ id: 'application' }) });
    expect(response.ok).toBe(true);
    expect(db.rpc).toHaveBeenCalledWith('admin_archive_application', { p_id: 'application', p_surface: surface, p_archive: true, p_actor: 'admin' });
    expect(db.from).not.toHaveBeenCalled();
  });
  it('uses the atomic patch RPC, preserves explicit clears and returns a conflict', async () => {
    const db = database({}); vi.mocked(db.rpc).mockResolvedValue({ data: null, error: { code: '40001', message: 'Reload before saving' } } as unknown as Awaited<ReturnType<typeof db.rpc>>); mocks.service.mockReturnValue(db);
    const response = await updateStudent(new NextRequest('http://localhost', { method: 'PATCH', body: JSON.stringify({ phone: '', extra: { gender: '' }, expectedUpdatedAt: '2026-10-21T00:00:00Z' }) }), { params: Promise.resolve({ id: 'person' }) });
    expect(response.status).toBe(409);
    expect(db.rpc).toHaveBeenCalledWith('admin_patch_student', expect.objectContaining({ p_updates: { phone: '' }, p_extra: { gender: '' }, p_expected_updated_at: '2026-10-21T00:00:00Z' }));
  });
  it('reads the actual notification fields in the student activity feed', async () => {
    const db = database({ student_profiles: [{ id: 'person', created_at: '2026-10-21' }], student_notifications: [{ id: 'n1', student_id: 'person', title: 'Updated', message: 'Message', is_read: true, created_at: '2026-10-22' }] }); mocks.service.mockReturnValue(db);
    const response = await studentActivity(new NextRequest('http://localhost'), { params: Promise.resolve({ id: 'person' }) });
    expect(response.status).toBe(200); expect((await response.json()).activity[0]).toMatchObject({ message: 'Updated', meta: { read: true } });
  });
  it('rejects unauthenticated query, count, export and destructive actions', async () => {
    mocks.auth.mockResolvedValue({ ok: false, status: 401, error: 'Sign in required' });
    for (const route of [list, counts, exportCsv]) expect((await route(new NextRequest('http://localhost'))).status).toBe(401);
    expect(mocks.service).not.toHaveBeenCalled();
  });
});
