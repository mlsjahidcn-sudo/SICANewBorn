import { describe, it, expect, beforeEach } from 'vitest';
import {
  extractClientIp,
  checkPublicRateLimit,
  _resetRateLimits,
} from '@/lib/rate-limit';

function req(headers: Record<string, string>): Request {
  return new Request('http://localhost/api/test', { method: 'POST', headers });
}

describe('extractClientIp — trusted platform headers take priority over XFF', () => {
  beforeEach(() => {
    _resetRateLimits();
  });

  it('prefers CF-Connecting-IP over XFF (Cloudflare)', () => {
    const ip = extractClientIp(
      req({
        'cf-connecting-ip': '203.0.113.5',
        'x-forwarded-for': '1.2.3.4, 10.0.0.1',
      }),
    );
    expect(ip).toBe('203.0.113.5');
  });

  it('prefers Fly-Client-IP over XFF (Fly.io)', () => {
    const ip = extractClientIp(
      req({
        'fly-client-ip': '203.0.113.7',
        'x-forwarded-for': '1.2.3.4',
      }),
    );
    expect(ip).toBe('203.0.113.7');
  });

  it('prefers X-Vercel-Forwarded-For over XFF (Vercel)', () => {
    const ip = extractClientIp(
      req({
        'x-vercel-forwarded-for': '203.0.113.10',
        'x-forwarded-for': '1.2.3.4',
      }),
    );
    expect(ip).toBe('203.0.113.10');
  });

  it('falls back to first XFF hop when no platform header', () => {
    expect(extractClientIp(req({ 'x-forwarded-for': '8.8.8.8, 10.0.0.1' }))).toBe('8.8.8.8');
  });

  it('falls back to X-Real-IP', () => {
    expect(extractClientIp(req({ 'x-real-ip': '5.6.7.8' }))).toBe('5.6.7.8');
  });

  it('returns "unknown" with no headers', () => {
    expect(extractClientIp(req({}))).toBe('unknown');
  });
});

describe('checkPublicRateLimit — XFF spoofing does not reset a bucket held by the trusted IP', () => {
  beforeEach(() => {
    _resetRateLimits();
  });

  // The previous implementation used `request.headers.get('x-forwarded-for')`
  // first; an attacker with a stale trusted IP on the bucket could just
  // send a different XFF to mint a new key. The new implementation uses
  // cf-connecting-ip first when present, so the bucket key is stable
  // against XFF rotation.
  it('keeps the same bucket key when the attacker rotates x-forwarded-for', () => {
    const opts = {
      action: 'pub',
      maxPerIp: 1,
      maxGlobal: 100,
      windowMs: 60_000,
    };
    const r1 = checkPublicRateLimit({
      ...opts,
      request: req({
        'cf-connecting-ip': '203.0.113.1',
        'x-forwarded-for': '1.1.1.1',
      }),
    });
    expect(r1.blocked).toBe(false);
    const r2 = checkPublicRateLimit({
      ...opts,
      request: req({
        'cf-connecting-ip': '203.0.113.1', // same client, different XFF
        'x-forwarded-for': '9.9.9.9',
      }),
    });
    // maxPerIp is 1, the bucket key is the trusted IP (203.0.113.1),
    // and the attacker can't flip it via XFF.
    expect(r2.blocked).toBe(true);
  });
});