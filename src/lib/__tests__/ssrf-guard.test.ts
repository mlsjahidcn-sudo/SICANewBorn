import { describe, it, expect } from 'vitest';
import {
  assertSafeWebhookUrl,
  isBlockedAddress,
  recheckUrlSafe,
  shouldAllowLocalhost,
} from '@/lib/ssrf-guard';

describe('isBlockedAddress', () => {
  it('blocks IPv4 loopback (127.0.0.0/8)', () => {
    expect(isBlockedAddress('127.0.0.1')).toBe(true);
    expect(isBlockedAddress('127.255.255.254')).toBe(true);
  });

  it('blocks RFC 1918 private IPv4 ranges', () => {
    expect(isBlockedAddress('10.0.0.1')).toBe(true);
    expect(isBlockedAddress('10.255.255.254')).toBe(true);
    expect(isBlockedAddress('172.16.0.1')).toBe(true);
    expect(isBlockedAddress('172.31.255.254')).toBe(true);
    expect(isBlockedAddress('192.168.1.1')).toBe(true);
    expect(isBlockedAddress('192.168.255.254')).toBe(true);
  });

  it('blocks the cloud-metadata IP 169.254.169.254', () => {
    expect(isBlockedAddress('169.254.169.254')).toBe(true);
    expect(isBlockedAddress('169.254.1.1')).toBe(true);
  });

  it('blocks CGNAT (100.64.0.0/10)', () => {
    expect(isBlockedAddress('100.64.0.1')).toBe(true);
    expect(isBlockedAddress('100.127.255.254')).toBe(true);
  });

  it('blocks 0.0.0.0/8, multicast, reserved', () => {
    expect(isBlockedAddress('0.0.0.1')).toBe(true);
    expect(isBlockedAddress('224.0.0.1')).toBe(true);
    expect(isBlockedAddress('240.0.0.1')).toBe(true);
  });

  it('allows 172.15.x.x and 172.32.x.x (edges of /12)', () => {
    expect(isBlockedAddress('172.15.255.254')).toBe(false);
    expect(isBlockedAddress('172.32.0.1')).toBe(false);
  });

  it('blocks IPv6 loopback, ULA, link-local, multicast', () => {
    expect(isBlockedAddress('::1')).toBe(true);
    expect(isBlockedAddress('::')).toBe(true);
    expect(isBlockedAddress('fc00::1')).toBe(true);
    expect(isBlockedAddress('fd12:3456::1')).toBe(true);
    expect(isBlockedAddress('fe80::1')).toBe(true);
    expect(isBlockedAddress('fea0::1')).toBe(true);
    expect(isBlockedAddress('ff02::1')).toBe(true);
  });

  it('blocks IPv4-mapped IPv6 representations of private IPs', () => {
    expect(isBlockedAddress('::ffff:10.0.0.1')).toBe(true);
    expect(isBlockedAddress('::ffff:127.0.0.1')).toBe(true);
    expect(isBlockedAddress('::ffff:169.254.169.254')).toBe(true);
  });

  it('allows public IPv4 (sanity)', () => {
    expect(isBlockedAddress('8.8.8.8')).toBe(false);
    expect(isBlockedAddress('1.1.1.1')).toBe(false);
    expect(isBlockedAddress('93.184.216.34')).toBe(false);
  });
});

describe('shouldAllowLocalhost', () => {
  // NODE_ENV is read-only in some TS configs; we cast to a mutable
  // object so we can save/restore around the test.
  const NODE_ENV_OBJECT = process.env as Record<string, string | undefined>;

  it('returns true in non-production NODE_ENV', () => {
    const saved = NODE_ENV_OBJECT.NODE_ENV;
    NODE_ENV_OBJECT.NODE_ENV = 'test';
    expect(shouldAllowLocalhost()).toBe(true);
    NODE_ENV_OBJECT.NODE_ENV = saved;
  });

  it('returns false when NODE_ENV=production', () => {
    const saved = NODE_ENV_OBJECT.NODE_ENV;
    NODE_ENV_OBJECT.NODE_ENV = 'production';
    expect(shouldAllowLocalhost()).toBe(false);
    NODE_ENV_OBJECT.NODE_ENV = saved;
  });
});

describe('assertSafeWebhookUrl', () => {
  it('rejects the cloud-metadata hostname', async () => {
    const r = await assertSafeWebhookUrl('https://metadata.google.internal/', true);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/metadata/i);
  });

  it('rejects invalid URLs', async () => {
    const r = await assertSafeWebhookUrl('not a url', true);
    expect(r.ok).toBe(false);
  });

  it('rejects non-http(s) schemes', async () => {
    const r = await assertSafeWebhookUrl('ftp://example.com/foo', true);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/http/i);
  });

  it('rejects http://non-loopback in production', async () => {
    const r = await assertSafeWebhookUrl('http://example.com/webhook', false);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/https/i);
  });

  it('allows http://localhost in dev', async () => {
    // 127.0.0.1 is in the loopback range so allowLocalhost=true
    // accepts http. We use the IP form because localhost resolution
    // varies by environment.
    const r = await assertSafeWebhookUrl('http://127.0.0.1:3000/hook', true);
    expect(r.ok).toBe(true);
  });

  it('rejects https://loopback in production', async () => {
    const r = await assertSafeWebhookUrl('https://127.0.0.1/hook', false);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/loopback/i);
  });

  it('rejects IP literals in the URL', async () => {
    // Pass the IPv4 literal straight in — the resolver step sees
    // an IP and skips DNS but still checks the address against
    // the blocked list.
    const r = await assertSafeWebhookUrl('https://169.254.169.254/hook', true);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/blocked|169/);
  });

  it('rejects 10.0.0.1 IP literal', async () => {
    const r = await assertSafeWebhookUrl('https://10.0.0.1/admin', true);
    expect(r.ok).toBe(false);
  });

  it('rejects 192.168.1.1 IP literal', async () => {
    const r = await assertSafeWebhookUrl('https://192.168.1.1/', true);
    expect(r.ok).toBe(false);
  });

  it('accepts a public IP literal (sanity)', async () => {
    // 8.8.8.8 (Google DNS) is public. The test exercises the
    // IP-literal branch.
    const r = await assertSafeWebhookUrl('https://8.8.8.8/hook', true);
    expect(r.ok).toBe(true);
  });
});

describe('recheckUrlSafe', () => {
  it('is an alias for assertSafeWebhookUrl (per-delivery re-check)', async () => {
    const r = await recheckUrlSafe('https://169.254.169.254/', false);
    expect(r.ok).toBe(false);
  });
});