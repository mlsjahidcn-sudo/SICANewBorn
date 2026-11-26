import { describe, expect, it, vi, afterEach } from 'vitest';
import { createTtlMemo } from '@/lib/ttl-memo';

afterEach(() => vi.useRealTimers());

describe('createTtlMemo', () => {
  it('serves a cached value until the TTL passes', async () => {
    vi.useFakeTimers();
    const memo = createTtlMemo<number>(1000);
    const load = vi.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    expect(await memo.get('k', load)).toBe(1);
    expect(await memo.get('k', load)).toBe(1);
    vi.advanceTimersByTime(1001);
    expect(await memo.get('k', load)).toBe(2);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('shares one in-flight load between concurrent callers', async () => {
    const memo = createTtlMemo<number>(1000);
    const load = vi.fn(async () => 7);
    const [a, b] = await Promise.all([memo.get('k', load), memo.get('k', load)]);
    expect([a, b]).toEqual([7, 7]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not cache failures or values rejected by keep', async () => {
    const memo = createTtlMemo<{ ok: boolean }>(1000, { keep: (v) => v.ok });
    await expect(memo.get('k', () => Promise.reject(new Error('down')))).rejects.toThrow('down');
    const bad = vi.fn(async () => ({ ok: false }));
    await memo.get('k', bad);
    await memo.get('k', bad);
    expect(bad).toHaveBeenCalledTimes(2);
  });

  it('clear() forces a reload and ignores loads started before it', async () => {
    const memo = createTtlMemo<number>(1000);
    let resolveOld: (v: number) => void = () => {};
    const old = memo.get('k', () => new Promise<number>((r) => { resolveOld = r; }));
    memo.clear();
    resolveOld(1);
    await old;
    expect(await memo.get('k', async () => 2)).toBe(2);
  });

  it('evicts the oldest key past max entries', async () => {
    const memo = createTtlMemo<string>(1000, { max: 2 });
    await memo.get('a', async () => 'a');
    await memo.get('b', async () => 'b');
    await memo.get('c', async () => 'c');
    const reload = vi.fn(async () => 'a2');
    expect(await memo.get('a', reload)).toBe('a2');
  });
});
