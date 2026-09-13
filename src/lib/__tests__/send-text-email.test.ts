import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendTextEmail, getResend, isEmailConfigured } from '@/lib/email';

const mockSend = vi.fn();
const mockResend = vi.fn(() => ({ emails: { send: mockSend } }));

vi.mock('resend', () => ({
  Resend: function Resend() {
    return mockResend();
  },
}));

describe('sendTextEmail', () => {
  beforeEach(() => {
    mockSend.mockReset();
    delete process.env.RESEND_API_KEY;
  });

  it('returns ok:false with "not configured" when RESEND_API_KEY is unset', async () => {
    const r = await sendTextEmail({
      to: 'a@b.com',
      subject: 'X',
      text: 'Y',
    });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/not configured/i);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('calls Resend with text-only fields (NO html) and returns ok:true', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    mockSend.mockResolvedValueOnce({ data: { id: 'msg-1' }, error: null });

    const r = await sendTextEmail({
      to: 'a@b.com',
      subject: 'Hi',
      text: 'Hello there',
    });

    expect(r.ok).toBe(true);
    expect(r.id).toBe('msg-1');
    expect(mockSend).toHaveBeenCalledTimes(1);
    const call = mockSend.mock.calls[0][0];
    expect(call).toMatchObject({
      from: 'SICA <noreply@sica.com.cn>',
      to: 'a@b.com',
      subject: 'Hi',
      text: 'Hello there',
      replyTo: expect.any(String),
    });
    expect(call.html).toBeUndefined();
  });

  it('returns ok:false when Resend returns error', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    mockSend.mockResolvedValueOnce({ data: null, error: { message: 'domain blocked' } });

    const r = await sendTextEmail({
      to: 'a@b.com',
      subject: 'X',
      text: 'Y',
    });

    expect(r.ok).toBe(false);
    expect(r.error).toContain('domain blocked');
  });

  it('returns ok:false when Resend throws', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    mockSend.mockRejectedValueOnce(new Error('network down'));

    const r = await sendTextEmail({
      to: 'a@b.com',
      subject: 'X',
      text: 'Y',
    });

    expect(r.ok).toBe(false);
    expect(r.error).toBe('network down');
  });

  it('passes replyTo through verbatim when supplied', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    mockSend.mockResolvedValueOnce({ data: { id: 'msg-2' }, error: null });

    await sendTextEmail({
      to: 'a@b.com',
      subject: 'X',
      text: 'Y',
      replyTo: 'custom@example.com',
    });

    const call = mockSend.mock.calls[0][0];
    expect(call.replyTo).toBe('custom@example.com');
  });
});

describe('isEmailConfigured + getResend', () => {
  beforeEach(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.ADMIN_EMAIL;
  });

  it('isEmailConfigured is false when env is missing', () => {
    expect(isEmailConfigured()).toBe(false);
  });

  it('isEmailConfigured is true only when BOTH env vars are set', () => {
    process.env.RESEND_API_KEY = 'k';
    process.env.ADMIN_EMAIL = 'a@b.com';
    expect(isEmailConfigured()).toBe(true);

    delete process.env.ADMIN_EMAIL;
    expect(isEmailConfigured()).toBe(false);
  });

  it('getResend returns null when RESEND_API_KEY is unset', () => {
    expect(getResend()).toBeNull();
  });

  it('getResend returns a Resend client when RESEND_API_KEY is set', () => {
    process.env.RESEND_API_KEY = 'k';
    const r = getResend();
    expect(r).not.toBeNull();
    expect(typeof r?.emails.send).toBe('function');
  });
});