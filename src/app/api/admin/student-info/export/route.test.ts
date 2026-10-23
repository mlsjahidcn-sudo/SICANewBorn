import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ service: vi.fn(), auth: vi.fn(), configured: true }));
vi.mock('@/lib/supabase-auth', () => ({ requireAdmin: mocks.auth, buildServiceClient: mocks.service, getServerEnv: () => ({ serviceKey: mocks.configured ? 'fixture' : '' }) }));
import { GET } from './route';
import type { ExportRow } from '@/lib/student-markdown';

const PROFILE = '00000000-0000-0000-0000-000000000001';
const PARTNER_STUDENT = '00000000-0000-0000-0000-000000000002';
const APP = '00000000-0000-0000-0000-000000000003';
const OTHER = '00000000-0000-0000-0000-000000000004';
type Tables = Record<string, ExportRow[]>;
function database(tables: Tables = {}, failureTable?: string, failureCode?: string): { from: ReturnType<typeof vi.fn> } {
  return { from: vi.fn((table: string) => {
    let rows = [...(tables[table] ?? [])];
    const result = (): { data: ExportRow[]; error: { message: string; code?: string } | null } => ({ data: rows, error: table === failureTable ? { message: 'private database detail', code: failureCode } : null });
    const query = {
      select: vi.fn(() => query),
      eq: vi.fn((key: string, v: unknown) => { rows = rows.filter(r => r[key] === v); return query; }),
      is: vi.fn((key: string, v: unknown) => { rows = rows.filter(r => (r[key] ?? null) === v); return query; }),
      order: vi.fn(() => query),
      or: vi.fn((filters: string) => { rows = rows.filter(r => filters.split(',').some(f => { const [key, , v] = f.split('.'); return r[key] === v; })); return query; }),
      maybeSingle: vi.fn(async () => ({ ...result(), data: rows[0] ?? null })),
      range: vi.fn(async (from: number, to: number) => ({ ...result(), data: rows.slice(from, to + 1) })),
    };
    return query;
  }) };
}
const request = (kind = 'student', id = PROFILE): NextRequest => new NextRequest(`http://localhost/api/admin/student-info/export?${new URLSearchParams({ kind, id })}`);
beforeEach(() => { vi.clearAllMocks(); mocks.configured = true; mocks.auth.mockResolvedValue({ ok: true, user: { id: 'admin' } }); });

describe('admin student Markdown download', () => {
  it.each([401, 403])('returns %i before accessing any student data', async status => {
    mocks.auth.mockResolvedValue({ ok: false, error: 'Denied', status });
    const response = await GET(request());
    expect(response.status).toBe(status);
    expect(mocks.service).not.toHaveBeenCalled();
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });
  it.each([['invalid', PROFILE], ['student', 'bad-id'], ['student', `${PROFILE},id.neq.test`]])('rejects invalid references: %s %s', async (kind, id) => {
    expect((await GET(request(kind, id))).status).toBe(400);
    expect(mocks.service).not.toHaveBeenCalled();
  });
  it('downloads the canonical student, education, both current application surfaces and document names as private UTF-8 Markdown', async () => {
    mocks.service.mockReturnValue(database({
      student_profiles: [{ id: PROFILE, first_name: 'Amina', last_name: '李', passport_number: 'P123', extra: { ieltsScore: '7' } }],
      student_education_history: [{ student_id: PROFILE, institution: 'School', grading_scale: 'percentage', grade: '95' }],
      student_applications: [{ id: APP, student_id: PROFILE, university_name: 'Student university' }, { id: OTHER, student_id: PROFILE, university_name: 'Archived university', archived_at: '2026-10-01' }],
      partner_applications: [{ id: APP, linked_student_profile_id: PROFILE, university: 'Partner university' }, { id: OTHER, linked_student_profile_id: OTHER, university: 'Other student university' }],
      student_documents: [{ student_id: PROFILE, name: 'Passport', file_name: 'passport.pdf' }, { student_id: OTHER, name: 'Other student document' }],
    }));
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="student-info-amina.md"');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    const md = await response.text();
    for (const text of ['Amina 李', 'P123', 'School', 'Student university', 'Partner university', 'passport.pdf', '**IELTS score:** 7']) expect(md).toContain(text);
    expect(md).not.toMatch(/Archived university|Other student university|Other student document/);
  });
  it('exports an unlinked application using its saved applicant details and application-scoped documents', async () => {
    mocks.service.mockReturnValue(database({ student_applications: [{ id: APP, applicant_name: 'Lead Applicant', applicant_email: 'lead@example.test', personal_statement: 'Applicant statement' }], student_documents: [{ application_id: APP, file_name: 'statement.pdf' }] }));
    const response = await GET(request('student-application', APP));
    expect(response.status).toBe(200);
    const md = await response.text();
    for (const text of ['Lead Applicant', 'lead@example.test', 'Applicant statement', 'statement.pdf']) expect(md).toContain(text);
  });
  it.each(['PGRST205', '42P01'])('downloads saved profile and legacy qualifications when the education table is missing (%s)', async code => {
    mocks.service.mockReturnValue(database({ student_profiles: [{ id: PROFILE, first_name: 'Amina', highest_education: 'Bachelor', passport_expiry: '2030-01-01', extra: { bachelorUniversityName: 'Legacy University', bachelorGPA: '3.8' } }] }, 'student_education_history', code));
    const response = await GET(request());
    expect(response.status).toBe(200);
    const md = await response.text();
    for (const expected of ['Amina', 'Bachelor', 'Legacy University', '3.8', '**Expiry date:** 2030-01-01', 'Detailed education history is unavailable']) expect(md).toContain(expected);
    expect(md).not.toContain('private database detail');
  });
  it('does not turn missing required tables into a partial successful file', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.service.mockReturnValue(database({ student_profiles: [{ id: PROFILE }] }, 'student_documents', 'PGRST205'));
    expect((await GET(request())).status).toBe(500);
    expect(console.error).toHaveBeenCalledWith(expect.any(String), { resource: 'student_documents', code: 'PGRST205' });
    vi.restoreAllMocks();
  });
  it('resolves partner student IDs separately from profile IDs and exports only the selected application', async () => {
    mocks.service.mockReturnValue(database({
      student_profiles: [{ id: PROFILE, first_name: 'Profile Name', passport_number: 'PROFILE123' }],
      partner_students: [{ id: PARTNER_STUDENT, partner_id: 'agency', linked_student_profile_id: PROFILE }],
      partner_applications: [{ id: APP, student_id: PARTNER_STUDENT, partner_id: 'agency', university: 'Selected university', student_name: 'Application Name', passport_number: 'APP123' }, { id: OTHER, student_id: PARTNER_STUDENT, partner_id: 'agency', university: 'Different target' }],
    }));
    const response = await GET(request('partner-application', APP));
    expect(response.status).toBe(200);
    const md = await response.text();
    for (const text of ['Profile Name', 'PROFILE123', 'APP123', 'Selected university']) expect(md).toContain(text);
    expect(md).not.toContain('Different target');
  });
  it('exports a partner student without requiring a canonical student account', async () => {
    mocks.service.mockReturnValue(database({ partner_students: [{ id: PARTNER_STUDENT, partner_id: 'agency', student_name: 'Partner Student' }], partner_applications: [{ student_id: PARTNER_STUDENT, partner_id: 'agency', university: 'University', passport_number: 'P999' }] }));
    const response = await GET(request('partner-student', PARTNER_STUDENT));
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('P999');
  });
  it('rejects inconsistent partner/profile links instead of combining different students', async () => {
    mocks.service.mockReturnValue(database({ partner_students: [{ id: PARTNER_STUDENT, partner_id: 'agency', linked_student_profile_id: OTHER }], partner_applications: [{ id: APP, student_id: PARTNER_STUDENT, partner_id: 'agency', linked_student_profile_id: PROFILE }] }));
    expect((await GET(request('partner-application', APP))).status).toBe(409);
  });
  it('reads past the PostgREST 1000-row cap for document checklists', async () => {
    mocks.service.mockReturnValue(database({ student_profiles: [{ id: PROFILE }], student_documents: Array.from({ length: 1001 }, (_, i) => ({ student_id: PROFILE, file_name: `document-${i}.pdf` })) }));
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('document-1000.pdf');
  });
  it('returns 404 for missing records and 503 without a database configuration', async () => {
    mocks.service.mockReturnValue(database());
    expect((await GET(request())).status).toBe(404);
    mocks.configured = false;
    expect((await GET(request())).status).toBe(503);
  });
  it('fails the download on a related read error rather than marking unavailable data as missing', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.service.mockReturnValue(database({ student_profiles: [{ id: PROFILE }] }, 'student_education_history'));
    const response = await GET(request());
    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Disposition')).toBeNull();
    expect(await response.text()).not.toContain('private database detail');
    vi.restoreAllMocks();
  });
});
