/**
 * webinar-signups route — session-date registration gate.
 *
 * Past sessions must 410 before any DB write or confirmation email.
 * Future sessions keep the existing happy path.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  mail: vi.fn(),
  configured: vi.fn(() => true),
  getServer: vi.fn(),
}));

vi.mock('@/lib/supabase-server', () => ({
  isSupabaseServerConfigured: () => mocks.configured(),
  getSupabaseServer: () => mocks.getServer(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkPublicRateLimit: () => ({ blocked: false }),
  isHoneypotFilled: () => false,
}));

vi.mock('@/lib/email', () => ({
  sendWebinarConfirmation: (...args: unknown[]) => mocks.mail(...args),
}));

import { POST } from '../route';
import { WEBINAR_CONFIG } from '@/lib/webinar-config';

const validBody = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.test',
  whatsapp: '+441234567890',
  country: 'United Kingdom',
  programInterests: ['bachelor'],
  locale: 'en',
};

function request(body: Record<string, unknown> = validBody): NextRequest {
  return new NextRequest('http://localhost/api/webinar-signups', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.configured.mockReturnValue(true);
  mocks.getServer.mockReturnValue({
    from: () => ({ insert: mocks.insert }),
  });
  mocks.insert.mockReturnValue({ select: mocks.select });
  mocks.select.mockReturnValue({ single: mocks.single });
  mocks.single.mockResolvedValue({
    data: { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', created_at: '2026-11-01T00:00:00Z' },
    error: null,
  });
  mocks.mail.mockResolvedValue(true);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('POST /api/webinar-signups session-date gate', () => {
  it('returns 410 for a past session without database writes or email', async () => {
    const sessionMs = Date.parse(WEBINAR_CONFIG.sessionDateIso);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(sessionMs + 60_000));

    const res = await POST(request());

    expect(res.status).toBe(410);
    expect(await res.json()).toEqual({
      error: 'Webinar registration is currently closed.',
    });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.mail).not.toHaveBeenCalled();
    expect(mocks.getServer).not.toHaveBeenCalled();
  });

  it('accepts a future session and still inserts + emails', async () => {
    const sessionMs = Date.parse(WEBINAR_CONFIG.sessionDateIso);
    vi.useFakeTimers();
    vi.setSystemTime(new Date(sessionMs - 60_000));

    const res = await POST(request());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.id).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(mocks.mail).toHaveBeenCalledTimes(1);
  });
});
