import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkRateLimit,
  checkPublicRateLimit,
  extractClientIp,
  isHoneypotFilled,
  _resetRateLimits,
} from '@/lib/rate-limit';

describe('rate-limit', () => {
  beforeEach(() => {
    _resetRateLimits();
  });

  it('allows hits up to the max within the window', () => {
    for (let i = 0; i < 5; i++) {
      const r = checkRateLimit({
        action: 'test',
        key: 'user-1',
        max: 5,
        windowMs: 60_000,
      });
      expect(r.ok).toBe(true);
      expect(r.remaining).toBe(4 - i);
    }
  });

  it('blocks the (max+1)th hit and reports retry-after', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit({ action: 'test', key: 'user-1', max: 5, windowMs: 60_000 });
    }
    const r = checkRateLimit({
      action: 'test',
      key: 'user-1',
      max: 5,
      windowMs: 60_000,
    });
    expect(r.ok).toBe(false);
    expect(r.remaining).toBe(0);
    // retryAfter is bounded by the window
    expect(r.retryAfterSec).toBeGreaterThan(0);
    expect(r.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it('isolates buckets by key + action', () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit({ action: 'invite', key: 'user-1', max: 5, windowMs: 60_000 });
    }
    // Same user, different action — should still be allowed
    const r1 = checkRateLimit({ action: 'create', key: 'user-1', max: 5, windowMs: 60_000 });
    expect(r1.ok).toBe(true);
    // Different user, same action — should still be allowed
    const r2 = checkRateLimit({ action: 'invite', key: 'user-2', max: 5, windowMs: 60_000 });
    expect(r2.ok).toBe(true);
  });

  it('slides the window — old hits drop off', () => {
    // Use a tiny window so the test doesn't have to wait
    for (let i = 0; i < 3; i++) {
      checkRateLimit({ action: 'test', key: 'user-1', max: 3, windowMs: 50 });
    }
    // 4th hit is blocked
    const blocked = checkRateLimit({ action: 'test', key: 'user-1', max: 3, windowMs: 50 });
    expect(blocked.ok).toBe(false);
    // After the window passes, hits are allowed again
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const ok = checkRateLimit({ action: 'test', key: 'user-1', max: 3, windowMs: 50 });
        expect(ok.ok).toBe(true);
        resolve();
      }, 70);
    });
  });
});

function req(headers: Record<string, string>): Request {
  return new Request('http://localhost/api/test', { method: 'POST', headers });
}

describe('extractClientIp', () => {
  it('takes the first x-forwarded-for entry', () => {
    expect(extractClientIp(req({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4');
  });
  it('falls back to x-real-ip', () => {
    expect(extractClientIp(req({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8');
  });
  it('returns "unknown" with no headers', () => {
    expect(extractClientIp(req({}))).toBe('unknown');
  });
});

describe('checkPublicRateLimit', () => {
  const opts = { action: 'pub', maxPerIp: 2, maxGlobal: 4, windowMs: 60_000 };

  beforeEach(() => {
    _resetRateLimits();
  });

  it('blocks after maxPerIp hits from the same IP', () => {
    const ip1 = req({ 'x-forwarded-for': '9.9.9.9' });
    expect(checkPublicRateLimit({ ...opts, request: ip1 }).blocked).toBe(false);
    expect(checkPublicRateLimit({ ...opts, request: ip1 }).blocked).toBe(false);
    const blocked = checkPublicRateLimit({ ...opts, request: ip1 });
    expect(blocked.blocked).toBe(true);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it('blocks on the global cap even from fresh IPs', () => {
    // Global cap 4: two IPs × 2 hits each exhaust it (each IP within its own limit)
    for (const ip of ['1.1.1.1', '2.2.2.2']) {
      checkPublicRateLimit({ ...opts, request: req({ 'x-forwarded-for': ip }) });
      checkPublicRateLimit({ ...opts, request: req({ 'x-forwarded-for': ip }) });
    }
    const blocked = checkPublicRateLimit({ ...opts, request: req({ 'x-forwarded-for': '3.3.3.3' }) });
    expect(blocked.blocked).toBe(true);
  });

  it('allows when both buckets have room and reports per-IP remaining', () => {
    const r = checkPublicRateLimit({ ...opts, request: req({ 'x-forwarded-for': '4.4.4.4' }) });
    expect(r.blocked).toBe(false);
    expect(r.remaining).toBe(1);
  });
});

describe('isHoneypotFilled', () => {
  it('detects a filled honeypot field', () => {
    expect(isHoneypotFilled({ website: 'http://spam.example' })).toBe(true);
  });
  it('passes empty / missing / non-string values', () => {
    expect(isHoneypotFilled({ website: '' })).toBe(false);
    expect(isHoneypotFilled({ website: '   ' })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled({ website: 123 })).toBe(false);
  });
});
