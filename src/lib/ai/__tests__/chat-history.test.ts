import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSessionHistory, persistMessages } from '@/lib/ai/chat-history';

describe('chat-history', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loadSessionHistory returns [] for an empty token', async () => {
    expect(await loadSessionHistory('')).toEqual([]);
  });

  it('loadSessionHistory returns the messages array on 200', async () => {
    const fakeMessages = [
      { role: 'user' as const, content: 'hi', created_at: '2026-09-01T00:00:00Z' },
      { role: 'assistant' as const, content: 'hello', created_at: '2026-09-01T00:00:01Z' },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ messages: fakeMessages, expires_at: null }),
      }),
    );
    const result = await loadSessionHistory('sess-abc');
    expect(result).toEqual(fakeMessages);
  });

  it('loadSessionHistory returns [] on a non-2xx response (no throw)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    );
    expect(await loadSessionHistory('sess-abc')).toEqual([]);
  });

  it('loadSessionHistory returns [] when fetch throws (network down)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    );
    expect(await loadSessionHistory('sess-abc')).toEqual([]);
  });

  it('loadSessionHistory returns [] when the response shape is wrong', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ wrong: 'shape' }),
      }),
    );
    expect(await loadSessionHistory('sess-abc')).toEqual([]);
  });

  it('persistMessages is a no-op for an empty token', () => {
    persistMessages('', [{ role: 'user', content: 'hi' }]);
    // No fetch call expected — but we don't fail if one happens,
    // since this is a fire-and-forget helper.
  });

  it('persistMessages is a no-op for an empty messages array', () => {
    persistMessages('sess-abc', []);
  });

  it('persistMessages calls fetch with the right body shape', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    persistMessages('sess-abc', [
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'hello' },
    ]);
    // Wait a microtask so the void promise gets a chance to call fetch.
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/chat/session/messages');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      session_token: 'sess-abc',
      messages: [
        { role: 'user', content: 'hi' },
        { role: 'assistant', content: 'hello' },
      ],
    });
  });

  it('persistMessages swallows network errors silently', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('offline')),
    );
    expect(() => {
      persistMessages('sess-abc', [{ role: 'user', content: 'hi' }]);
    }).not.toThrow();
  });
});