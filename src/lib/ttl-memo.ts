/**
 * Small in-process TTL memo for public reads that every page render
 * would otherwise send to Supabase. Concurrent callers share one
 * in-flight load; a load that throws, or whose value `keep` rejects,
 * is not cached. Process-local (one Node server on Hostinger), so an
 * admin write clears it with `clear()` on the same server.
 *
 * Plain module state, not `unstable_cache`, so it works in unit tests
 * and outside a Next request context.
 */
export interface TtlMemo<T> {
  get(key: string, load: () => Promise<T>): Promise<T>;
  clear(): void;
}

export function createTtlMemo<T>(
  ttlMs: number,
  { max = 100, keep = () => true }: { max?: number; keep?: (value: T) => boolean } = {},
): TtlMemo<T> {
  const entries = new Map<string, { at: number; value: T }>();
  const pending = new Map<string, Promise<T>>();
  let generation = 0;

  return {
    async get(key, load) {
      const hit = entries.get(key);
      if (hit && Date.now() - hit.at < ttlMs) return hit.value;
      const inFlight = pending.get(key);
      if (inFlight) return inFlight;
      const started = generation;
      const promise = load();
      pending.set(key, promise);
      try {
        const value = await promise;
        // Don't let a load that began before clear() refill the cache.
        if (started === generation && keep(value)) {
          if (!entries.has(key) && entries.size >= max) entries.delete(entries.keys().next().value ?? '');
          entries.set(key, { at: Date.now(), value });
        }
        return value;
      } finally {
        if (pending.get(key) === promise) pending.delete(key);
      }
    },
    clear() {
      generation += 1;
      entries.clear();
      pending.clear();
    },
  };
}
