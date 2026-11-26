import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';

const emailMocks = vi.hoisted(() => ({
  sendTemplatedEmail: vi.fn(),
  lookupRecipientLocale: vi.fn(),
}));
vi.mock('@/lib/email', () => emailMocks);
vi.mock('@/lib/partner-user-lookup', () => ({
  hydrateUserEmails: vi.fn(async (_s: unknown, ids: string[]) => new Map(ids.map((id) => [id, { email: `${id}@example.com`, lastSignInAt: null }]))),
}));

import { postApplicationMessage, type MessageApplicationContext } from '@/lib/application-messages-server';

/**
 * Minimal chainable stand-in for the Supabase client. Each terminal call
 * (`single`, `maybeSingle`, or awaiting the builder) resolves through
 * `respond`, which sees the table and the operations recorded so far.
 */
type Op = { table: string; kind: string; args: unknown[] };
function fakeClient(respond: (ops: Op[]) => { data?: unknown; error?: unknown }) {
  const log: Op[][] = [];
  const client = {
    from(table: string) {
      const ops: Op[] = [];
      log.push(ops);
      const builder: Record<string, unknown> = {};
      for (const kind of ['select', 'insert', 'update', 'eq', 'neq', 'in', 'is', 'not', 'order', 'limit']) {
        builder[kind] = (...args: unknown[]) => {
          ops.push({ table, kind, args });
          return builder;
        };
      }
      const done = () => Promise.resolve({ data: null, error: null, ...respond(ops) });
      builder.single = done;
      builder.maybeSingle = done;
      builder.then = (ok: (v: unknown) => unknown, bad?: (e: unknown) => unknown) => done().then(ok, bad);
      return builder;
    },
  };
  return { client: client as unknown as SupabaseClient, log };
}

const messageRow = {
  id: 'msg-new',
  sender_role: 'admin',
  sender_name: 'SICA team',
  body: 'Please upload your passport.',
  read_at: null,
  created_at: '2026-11-26T12:00:00Z',
};

const studentCtx: MessageApplicationContext = {
  surface: 'student',
  id: 'app-1',
  applicationRef: 'SA-1',
  university: 'Tsinghua',
  studentName: 'Amina Bello',
  studentId: 'student-1',
  studentFirstName: 'Amina',
  studentEmail: 'amina@example.com',
  partnerId: null,
  createdByUserId: null,
  companyName: '',
};

function scenario(lastEmailedAt: string | null) {
  return fakeClient((ops) => {
    const first = ops[0];
    if (first.kind === 'insert' && first.table === 'application_messages') return { data: messageRow };
    const isThrottleLookup = ops.some((o) => o.kind === 'select' && o.args[0] === 'emailed_at');
    if (isThrottleLookup) return { data: lastEmailedAt ? { emailed_at: lastEmailedAt } : null };
    return {};
  });
}

const emailedUpdate = (log: Op[][]) =>
  log.filter((ops) => ops[0]?.kind === 'update' && (ops[0].args[0] as Record<string, unknown>)?.emailed_at);

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-26T12:00:00Z'));
  emailMocks.sendTemplatedEmail.mockResolvedValue(true);
  emailMocks.lookupRecipientLocale.mockResolvedValue('zh');
});

describe('message notifications', () => {
  it('emails the student and stamps emailed_at when nothing was emailed recently', async () => {
    const { client, log } = scenario(null);
    await postApplicationMessage(client, studentCtx, { role: 'admin', userId: 'admin-1', name: 'SICA team' }, messageRow.body);
    expect(emailMocks.sendTemplatedEmail).toHaveBeenCalledTimes(1);
    expect(emailMocks.sendTemplatedEmail.mock.calls[0][0]).toMatchObject({
      to: 'amina@example.com',
      slug: 'message.to_student',
      locale: 'zh',
    });
    expect(emailedUpdate(log)).toHaveLength(1);
    // The bell notification is always written.
    expect(log.some((ops) => ops[0]?.table === 'student_notifications' && ops[0].kind === 'insert')).toBe(true);
  });

  it('skips the email within the hour but still writes the bell notification', async () => {
    const { client, log } = scenario('2026-11-26T11:40:00Z');
    await postApplicationMessage(client, studentCtx, { role: 'admin', userId: 'admin-1', name: 'SICA team' }, messageRow.body);
    expect(emailMocks.sendTemplatedEmail).not.toHaveBeenCalled();
    expect(emailedUpdate(log)).toHaveLength(0);
    expect(log.some((ops) => ops[0]?.table === 'student_notifications')).toBe(true);
  });

  it('never emails a placeholder address', async () => {
    const { client } = scenario(null);
    await postApplicationMessage(
      client,
      { ...studentCtx, studentEmail: 'sica-noemail-9@sica.invalid' },
      { role: 'admin', userId: 'admin-1', name: 'SICA team' },
      messageRow.body,
    );
    expect(emailMocks.sendTemplatedEmail).not.toHaveBeenCalled();
  });

  it('does not stamp emailed_at when the send fails', async () => {
    emailMocks.sendTemplatedEmail.mockResolvedValue(false);
    const { client, log } = scenario(null);
    await postApplicationMessage(client, studentCtx, { role: 'admin', userId: 'admin-1', name: 'SICA team' }, messageRow.body);
    expect(emailedUpdate(log)).toHaveLength(0);
  });

  it('emails the admin inbox when a student writes', async () => {
    vi.stubEnv('ADMIN_NOTIFICATION_EMAIL', 'info@studyinchina.academy');
    const { client } = fakeClient((ops) =>
      ops[0].kind === 'insert' ? { data: { ...messageRow, sender_role: 'student' } } : {},
    );
    await postApplicationMessage(client, studentCtx, { role: 'student', userId: 'student-1', name: 'Amina Bello' }, 'Hi');
    expect(emailMocks.sendTemplatedEmail.mock.calls[0][0]).toMatchObject({
      to: 'info@studyinchina.academy',
      slug: 'message.to_admin',
    });
    vi.unstubAllEnvs();
  });
});
