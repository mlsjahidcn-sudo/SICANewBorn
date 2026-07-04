import { describe, it, expect, beforeEach } from 'vitest';
import { _resetRateLimits } from '@/lib/rate-limit';

/**
 * Tests for the Phase 36 admin + chatbot AI rate limiters.
 *
 * These wrap the existing `checkRateLimit` from Phase 14. What we
 * want to verify here is:
 *   1. Each AdminAIAction has a distinct, predictable limit table
 *   2. The 429 NextResponse carries `Retry-After` so clients can
 *      show a countdown
 *   3. The chatbot extractor pulls the originating IP from
 *      `x-forwarded-for` correctly
 *   4. The chatbot falls back to 'unknown' for headerless callers
 *
 * We do NOT re-test the sliding-window math — that's exhaustively
 * covered by src/lib/__tests__/rate-limit.test.ts. These tests
 * focus on the per-action discriminator + header extraction.
 */

describe('checkAdminAIRateLimit', () => {
  beforeEach(() => _resetRateLimits());

  it('allows up to the max hits in a window for generate-university (10/15m)', async () => {
    const { checkAdminAIRateLimit } = await import('@/lib/ai/admin-ai-rate-limit');
    for (let i = 0; i < 10; i++) {
      const r = checkAdminAIRateLimit('admin-1', 'generate-university');
      expect(r.blocked).toBe(false);
    }
    const blocked = checkAdminAIRateLimit('admin-1', 'generate-university');
    expect(blocked.blocked).toBe(true);
    if (blocked.blocked) {
      expect(blocked.response.status).toBe(429);
      expect(blocked.response.headers.get('Retry-After')).toMatch(/^\d+$/);
      const body = await blocked.response.json();
      expect(body.code).toBe('AI_RATE_LIMITED');
      expect(body.error).toMatch(/Too many AI requests/);
      expect(typeof body.retryAfterSec).toBe('number');
    }
  });

  it('isolates buckets per (user, action) pair — different action same user is fresh', async () => {
    const { checkAdminAIRateLimit } = await import('@/lib/ai/admin-ai-rate-limit');
    // Burn the bulk bucket.
    for (let i = 0; i < 5; i++) {
      const r = checkAdminAIRateLimit('admin-1', 'bulk-suggest-names');
      expect(r.blocked).toBe(false);
    }
    expect(checkAdminAIRateLimit('admin-1', 'bulk-suggest-names').blocked).toBe(true);
    // Same user, different action — fresh bucket.
    expect(checkAdminAIRateLimit('admin-1', 'generate-blog').blocked).toBe(false);
    // Different user, same action — fresh bucket.
    expect(checkAdminAIRateLimit('admin-2', 'bulk-suggest-names').blocked).toBe(false);
  });

  it('respects distinct limits per action (bulk=5, generate-blog=3)', async () => {
    const { checkAdminAIRateLimit } = await import('@/lib/ai/admin-ai-rate-limit');
    // Bulk is the tightest (5). Verify blocker triggers exactly there.
    for (let i = 0; i < 5; i++) {
      expect(checkAdminAIRateLimit('admin-A', 'bulk-suggest-names').blocked).toBe(false);
    }
    expect(checkAdminAIRateLimit('admin-A', 'bulk-suggest-names').blocked).toBe(true);

    // Generate-blog is 3. Hits 1-3 allowed, 4th blocked.
    for (let i = 0; i < 3; i++) {
      expect(checkAdminAIRateLimit('admin-B', 'generate-blog').blocked).toBe(false);
    }
    expect(checkAdminAIRateLimit('admin-B', 'generate-blog').blocked).toBe(true);

    // Generate-university is 10. Hits 1-10 allowed.
    for (let i = 0; i < 10; i++) {
      expect(checkAdminAIRateLimit('admin-C', 'generate-university').blocked).toBe(false);
    }
    expect(checkAdminAIRateLimit('admin-C', 'generate-university').blocked).toBe(true);
  });
});

describe('checkChatbotRateLimit', () => {
  beforeEach(() => _resetRateLimits());

  it('allows 10 hits per 15m per IP then blocks with Retry-After', async () => {
    const { checkChatbotRateLimit } = await import('@/lib/ai/admin-ai-rate-limit');
    const req = (ip: string) =>
      new Request('https://example.com/api/ai/chat', {
        headers: { 'x-forwarded-for': ip },
      });

    for (let i = 0; i < 10; i++) {
      const r = checkChatbotRateLimit(req('203.0.113.5'));
      expect(r.blocked).toBe(false);
    }
    const blocked = checkChatbotRateLimit(req('203.0.113.5'));
    expect(blocked.blocked).toBe(true);
    if (blocked.blocked) {
      expect(blocked.response.status).toBe(429);
      expect(blocked.response.headers.get('Retry-After')).toMatch(/^\d+$/);
      const body = await blocked.response.json();
      expect(body.code).toBe('CHATBOT_RATE_LIMITED');
      expect(body.error).toMatch(/messages too quickly/);
    }
  });

  it('isolates per IP — different IPs in x-forwarded-for are independent', async () => {
    const { checkChatbotRateLimit } = await import('@/lib/ai/admin-ai-rate-limit');
    const req = (ip: string) =>
      new Request('https://example.com/api/ai/chat', {
        headers: { 'x-forwarded-for': ip },
      });

    // Burn IP 1.
    for (let i = 0; i < 10; i++) {
      checkChatbotRateLimit(req('198.51.100.10'));
    }
    expect(checkChatbotRateLimit(req('198.51.100.10')).blocked).toBe(true);

    // IP 2 is fresh.
    expect(checkChatbotRateLimit(req('198.51.100.11')).blocked).toBe(false);
  });

  it('picks the FIRST IP from a comma-separated x-forwarded-for chain', async () => {
    const { checkChatbotRateLimit } = await import('@/lib/ai/admin-ai-rate-limit');
    const req = (chain: string) =>
      new Request('https://example.com/api/ai/chat', {
        headers: { 'x-forwarded-for': chain },
      });

    // Burn the original-client IP (the first in the chain).
    for (let i = 0; i < 10; i++) {
      checkChatbotRateLimit(req('203.0.113.7, 10.0.0.1, 10.0.0.2'));
    }
    // Same chain — same first IP — should still be blocked.
    expect(checkChatbotRateLimit(req('203.0.113.7, 10.0.0.99')).blocked).toBe(true);
    // Different first IP — fresh bucket.
    expect(checkChatbotRateLimit(req('203.0.113.8, 10.0.0.1')).blocked).toBe(false);
  });

  it('falls back to x-real-ip when x-forwarded-for is missing', async () => {
    const { checkChatbotRateLimit } = await import('@/lib/ai/admin-ai-rate-limit');
    const req = new Request('https://example.com/api/ai/chat', {
      headers: { 'x-real-ip': '192.0.2.55' },
    });
    for (let i = 0; i < 10; i++) {
      const r = checkChatbotRateLimit(req);
      expect(r.blocked).toBe(false);
    }
    expect(checkChatbotRateLimit(req).blocked).toBe(true);
  });

  it('falls back to a shared "unknown" bucket when no IP headers are present', async () => {
    const { checkChatbotRateLimit } = await import('@/lib/ai/admin-ai-rate-limit');
    const req = new Request('https://example.com/api/ai/chat');
    for (let i = 0; i < 10; i++) {
      const r = checkChatbotRateLimit(req);
      expect(r.blocked).toBe(false);
    }
    expect(checkChatbotRateLimit(req).blocked).toBe(true);
  });
});
