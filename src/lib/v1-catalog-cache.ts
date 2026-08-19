/**
 * Tiny in-memory TTL cache for the B2B /v1/catalog/* responses.
 *
 * Why not Next.js `unstable_cache`?
 *   - `unstable_cache` is per-route, not per-key. We want each B2B
 *     consumer to see a shared cache entry for the same query (so
 *     100 RPM from one key doesn't hit Supabase 100×).
 *   - `unstable_cache` returns stale data after direct DB writes
 *     (see user-memory hard rule). A short TTL (10 min) is fine
 *     for a B2B catalog where the data is "mostly stable" — admin
 *     edits appear within 10 min.
 *
 * Why a process-local Map and not Redis?
 *   - Phase C is the v1 ship. Process-local is enough for Hostinger
 *     Cloud's single-container deploy. If we ever scale to multiple
 *     containers, swap the Map for Redis. The interface is identical.
 *
 * LRU: a simple insertion-order Map with a hard cap. When the cap is
 * hit, the oldest entry is evicted. No clock per entry — `Date.now()`
 * check on read is enough for the 10-min TTL.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const MAX_ENTRIES = 500; // ~500 unique query strings × ~50KB each = 25MB cap

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  // Cap the cache. If we're full, evict the oldest (Map iteration
  // is in insertion order in JS).
  if (store.size >= MAX_ENTRIES) {
    const firstKey = store.keys().next().value;
    if (firstKey !== undefined) store.delete(firstKey);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

/** Build a deterministic cache key from the API key id + the query
 *  string. Two integrators asking for the same data share an entry;
 *  one integrator asking for the same query twice in a row hits the
 *  cache on the second call. */
export function cacheKey(apiKeyId: string, query: string): string {
  return `${apiKeyId}:${query}`;
}
