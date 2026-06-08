import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, _resetRateLimits } from '@/lib/rate-limit';

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
