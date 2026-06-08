/**
 * Partner: hydrate auth.users metadata for a list of user_ids.
 *
 * Why this exists
 * ───────────────
 * The team page + several other partner endpoints need to render a
 * user's email + last_sign_in_at alongside a partner_team_members /
 * partner_students row. The naive approach — `service.auth.admin
 * .listUsers({ perPage: 200 })` and filter in JS — has two real
 * problems:
 *
 *   1. Scalability: at 201+ users in the project, listUsers silently
 *      truncates. An email at the bottom of the alphabet is just
 *      gone, no error surfaced.
 *   2. Privacy: the partner server ends up holding every user in
 *      the project in memory, even though the partner only needs
 *      their own team (5-10 user_ids). On a multi-tenant platform
 *      that's a leak.
 *
 * The right tool is `auth.admin.getUserById(id)` — a single-user
 * lookup. We do it in parallel for the small set we actually need
 * (typically <20 calls per request) and cache the result in-memory
 * for 60s to avoid hammering GoTrue on every page load.
 *
 * Cache: module-level Map. Survives between requests on a long-
 * running server (Railway single Node process) but not across cold
 * starts on serverless. That's fine — the cache is a perf
 * optimization, not correctness. On cache miss we just hit GoTrue.
 *
 * Not for admin endpoints: those are scoped to all users in the
 * system for legitimate reasons. This helper is partner-scoped and
 * trusts the input list comes from a partner-scoped query.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export interface HydratedUser {
  email: string | null;
  lastSignInAt: string | null;
}

const CACHE_TTL_MS = 60_000;
const userCache = new Map<string, { value: HydratedUser; expiresAt: number }>();

/**
 * Look up email + last_sign_in_at for a list of auth.users.id.
 *
 * Returns a Map keyed by user_id. Missing users (deleted accounts,
 * race conditions) get `{ email: null, lastSignInAt: null }` — the
 * caller decides whether to render a "deleted user" placeholder.
 *
 * Cache hits short-circuit the network call; cache misses fire one
 * parallel `getUserById` per unique id. Cached entries are
 * invalidated on TTL expiry (lazy — we check on read, not on a
 * timer).
 */
export async function hydrateUserEmails(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, HydratedUser>> {
  const result = new Map<string, HydratedUser>();
  if (userIds.length === 0) return result;

  const now = Date.now();
  const toFetch: string[] = [];
  for (const id of userIds) {
    if (!id) continue;
    const cached = userCache.get(id);
    if (cached && cached.expiresAt > now) {
      result.set(id, cached.value);
    } else {
      toFetch.push(id);
    }
  }

  if (toFetch.length === 0) return result;

  // Parallel lookups — one HTTP call per missing user. Safe because
  // the input set is small (a partner team, typically <20 people)
  // and GoTrue is happy to handle dozens of concurrent reads.
  const settled = await Promise.all(
    toFetch.map(async (id) => {
      const { data, error } = await supabase.auth.admin.getUserById(id);
      if (error || !data?.user) {
        return { id, value: { email: null, lastSignInAt: null } };
      }
      const u = data.user;
      const value: HydratedUser = {
        email: u.email || null,
        lastSignInAt: u.last_sign_in_at || null,
      };
      return { id, value };
    }),
  );

  for (const { id, value } of settled) {
    result.set(id, value);
    userCache.set(id, { value, expiresAt: now + CACHE_TTL_MS });
  }

  return result;
}

/**
 * For tests / hot-reload: clear the in-memory cache. Not exported
 * from any UI surface; only useful for unit tests that want to
 * reset state.
 */
export function _clearPartnerUserCacheForTests(): void {
  userCache.clear();
}

/**
 * Find an auth.users row by email. The Supabase JS admin API
 * (2.95.x) doesn't expose a direct `getUserByEmail` method, and
 * the underlying GoTrue admin HTTP endpoint ignores the `?email=`
 * filter (it just returns the first page). So we paginate
 * `listUsers` ourselves, stopping as soon as we find a match.
 *
 * The scan is bounded — we cap at 10 pages of 200 = 2000 users
 * scanned, which is well past the foreseeable SICA partner-base
 * size. If the cap is reached without a match we return null
 * (same as "not found" — the caller can decide whether to 404 or
 * fall through to "create the user").
 *
 * Results are cached the same way as the user_id → metadata map
 * above, so a partner who retries an invite with the same email
 * within 60s gets an instant hit.
 */
const MAX_EMAIL_SCAN_PAGES = 10;
const emailToUserIdCache = new Map<string, { userId: string | null; expiresAt: number }>();

export async function findUserIdByEmail(
  supabase: SupabaseClient,
  email: string,
): Promise<string | null> {
  const key = email.trim().toLowerCase();
  if (!key) return null;
  const now = Date.now();
  const cached = emailToUserIdCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.userId;
  }

  for (let page = 1; page <= MAX_EMAIL_SCAN_PAGES; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200, page });
    if (error || !data?.users) break;
    const hit = data.users.find((u) => (u.email || '').toLowerCase() === key);
    if (hit) {
      emailToUserIdCache.set(key, { userId: hit.id, expiresAt: now + CACHE_TTL_MS });
      return hit.id;
    }
    // If the page came back with fewer than 200 users, we just
    // walked past the end of the user list — no point in paging
    // further.
    if (data.users.length < 200) break;
  }

  emailToUserIdCache.set(key, { userId: null, expiresAt: now + CACHE_TTL_MS });
  return null;
}

/**
 * Invalidate-and-prime the email→userId cache for a newly-created
 * user. Without this, a follow-up `findUserByEmail` within the
 * 60s TTL would return the stale "not found" entry from the
 * earlier scan, and the route would try to createUser again —
 * which Supabase rejects with "A user with this email address
 * has already been registered" (a 500, not a 409).
 *
 * Also expires any userId→metadata cache entries for this new
 * user so the next `hydrateUserEmails` call picks up their
 * fresh auth metadata (last_sign_in_at is null, created_at is
 * just now, etc.).
 */
export function primeEmailToUserIdCache(email: string, userId: string): void {
  const key = email.trim().toLowerCase();
  emailToUserIdCache.set(key, { userId, expiresAt: Date.now() + CACHE_TTL_MS });
  userCache.delete(userId);
}
