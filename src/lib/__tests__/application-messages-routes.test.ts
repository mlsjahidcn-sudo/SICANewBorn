import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MessageApplicationContext } from '@/lib/application-messages-server';

const authMocks = vi.hoisted(() => ({
  getRequestAuth: vi.fn(),
  requireTeamMember: vi.fn(),
  requireAdmin: vi.fn(),
}));
const serverMocks = vi.hoisted(() => ({
  loadMessageApplicationContext: vi.fn(),
  listApplicationMessages: vi.fn(),
  countUnreadApplicationMessages: vi.fn(),
  postApplicationMessage: vi.fn(),
}));

vi.mock('@/lib/supabase-auth', () => ({
  ...authMocks,
  buildServiceClient: () => ({}),
  getServerEnv: () => ({ url: 'u', anonKey: 'a', serviceKey: 's' }),
}));
vi.mock('@/lib/application-messages-server', () => serverMocks);

import * as studentRoute from '@/app/api/student/applications/[id]/messages/route';
import * as partnerRoute from '@/app/api/partner/applications/[id]/messages/route';
import * as adminRoute from '@/app/api/admin/applications/[id]/messages/route';

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const get = (url = 'http://x/api/m') => new NextRequest(url);
const post = (body: unknown) =>
  new NextRequest('http://x/api/m', { method: 'POST', body: JSON.stringify(body) });

function ctx(over: Partial<MessageApplicationContext>): MessageApplicationContext {
  return {
    surface: 'student',
    id: 'app-1',
    applicationRef: 'SA-1',
    university: 'Tsinghua',
    studentName: 'Amina',
    studentId: 'student-1',
    studentFirstName: 'Amina',
    studentEmail: 'amina@example.com',
    partnerId: null,
    createdByUserId: null,
    companyName: '',
    ...over,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  serverMocks.listApplicationMessages.mockResolvedValue([]);
  serverMocks.postApplicationMessage.mockResolvedValue({ id: 'm1' });
});

describe('student messages route', () => {
  it("returns 404 for another student's application", async () => {
    authMocks.getRequestAuth.mockResolvedValue({ ok: true, user: { id: 'student-2' } });
    serverMocks.loadMessageApplicationContext.mockResolvedValue(ctx({}));
    const res = await studentRoute.GET(get(), params('app-1'));
    expect(res.status).toBe(404);
    expect(serverMocks.listApplicationMessages).not.toHaveBeenCalled();
  });

  it('lets the owner read (marking read) and post', async () => {
    authMocks.getRequestAuth.mockResolvedValue({ ok: true, user: { id: 'student-1' } });
    serverMocks.loadMessageApplicationContext.mockResolvedValue(ctx({}));
    const res = await studentRoute.GET(get('http://x/api/m?markRead=1'), params('app-1'));
    expect(res.status).toBe(200);
    expect(serverMocks.listApplicationMessages).toHaveBeenCalledWith({}, expect.anything(), 'student', true);
    const sent = await studentRoute.POST(post({ body: ' Hello ' }), params('app-1'));
    expect(sent.status).toBe(201);
    expect(serverMocks.postApplicationMessage).toHaveBeenCalledWith(
      {},
      expect.anything(),
      { role: 'student', userId: 'student-1', name: 'Amina' },
      'Hello',
    );
  });

  it('rejects an empty message with 400', async () => {
    authMocks.getRequestAuth.mockResolvedValue({ ok: true, user: { id: 'student-1' } });
    serverMocks.loadMessageApplicationContext.mockResolvedValue(ctx({}));
    const res = await studentRoute.POST(post({ body: '   ' }), params('app-1'));
    expect(res.status).toBe(400);
  });

  it('passes auth failures through', async () => {
    authMocks.getRequestAuth.mockResolvedValue({ ok: false, status: 401, error: 'Not signed in' });
    expect((await studentRoute.GET(get(), params('app-1'))).status).toBe(401);
  });
});

describe('partner messages route', () => {
  const partnerCtx = ctx({ surface: 'partner', studentId: null, partnerId: 'org-1', createdByUserId: 'creator' });

  it('blocks a member from a teammate’s application', async () => {
    authMocks.requireTeamMember.mockResolvedValue({
      ok: true, user: { id: 'member-2' }, partnerId: 'org-1', role: 'member', partner: {},
    });
    serverMocks.loadMessageApplicationContext.mockResolvedValue(partnerCtx);
    expect((await partnerRoute.GET(get(), params('app-1'))).status).toBe(404);
  });

  it('blocks a partner from another org, even an owner', async () => {
    authMocks.requireTeamMember.mockResolvedValue({
      ok: true, user: { id: 'owner-x' }, partnerId: 'org-2', role: 'owner', partner: {},
    });
    serverMocks.loadMessageApplicationContext.mockResolvedValue(partnerCtx);
    expect((await partnerRoute.GET(get(), params('app-1'))).status).toBe(404);
  });

  it('allows the creator and the org owner', async () => {
    serverMocks.loadMessageApplicationContext.mockResolvedValue(partnerCtx);
    authMocks.requireTeamMember.mockResolvedValue({
      ok: true, user: { id: 'creator' }, partnerId: 'org-1', role: 'member', partner: {},
    });
    expect((await partnerRoute.GET(get(), params('app-1'))).status).toBe(200);
    authMocks.requireTeamMember.mockResolvedValue({
      ok: true, user: { id: 'boss' }, partnerId: 'org-1', role: 'owner', partner: { company_name: 'Acme' },
    });
    const res = await partnerRoute.POST(post({ body: 'Docs sent' }), params('app-1'));
    expect(res.status).toBe(201);
    expect(serverMocks.postApplicationMessage).toHaveBeenCalledWith(
      {},
      expect.anything(),
      { role: 'partner', userId: 'boss', name: 'Acme' },
      'Docs sent',
    );
  });
});

describe('admin messages route (student applications)', () => {
  beforeEach(() => {
    authMocks.requireAdmin.mockResolvedValue({ ok: true, user: { id: 'admin-1' } });
  });

  it('lets an admin read any application', async () => {
    serverMocks.loadMessageApplicationContext.mockResolvedValue(ctx({}));
    const res = await adminRoute.GET(get(), params('app-1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ canSend: true, disabledReason: null });
  });

  it('refuses to post on a lead-path application with no student account', async () => {
    serverMocks.loadMessageApplicationContext.mockResolvedValue(ctx({ studentId: null }));
    const read = await adminRoute.GET(get(), params('app-1'));
    expect(await read.json()).toMatchObject({ canSend: false, disabledReason: 'no_portal_account' });
    const res = await adminRoute.POST(post({ body: 'Hi' }), params('app-1'));
    expect(res.status).toBe(409);
    expect(serverMocks.postApplicationMessage).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing application and blocks non-admins', async () => {
    serverMocks.loadMessageApplicationContext.mockResolvedValue(null);
    expect((await adminRoute.GET(get(), params('nope'))).status).toBe(404);
    authMocks.requireAdmin.mockResolvedValue({ ok: false, status: 403, error: 'Admin access required' });
    expect((await adminRoute.GET(get(), params('app-1'))).status).toBe(403);
  });
});
