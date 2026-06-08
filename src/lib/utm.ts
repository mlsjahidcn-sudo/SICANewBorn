/**
 * Marketing attribution: UTM + click-id capture.
 *
 * The contact form and assessment form both need to know how
 * the lead found the site (utm_source = 'google' | 'newsletter'
 * | etc.) so SICA's marketing team can answer "which channel
 * actually converts" and run paid campaigns with proper
 * attribution back to the lead.
 *
 * The standard Google Analytics UTMs:
 *   - utm_source   : who sent them (google, newsletter, fb)
 *   - utm_medium   : the channel type (cpc, email, social)
 *   - utm_campaign : the specific campaign (spring_2026, etc.)
 *   - utm_term     : paid keyword (optional, often blank)
 *   - utm_content  : ad variant (optional, A/B tests)
 *
 * We capture the 3 essential ones (source, medium, campaign)
 * on the lead form. The other two (term, content) are rarely
 * useful for SICA's small paid spend and would just be
 * noise in the admin view. Easy to extend later — single
 * line in the WHITELIST below.
 *
 * Plus the two paid click IDs that show up in real ad URLs:
 *   - gclid (Google Click ID)
 *   - fbclid (Facebook Click ID)
 *
 * **Persistence**: UTM params are persisted in sessionStorage
 * on first sight so the attribution survives cross-page
 * navigation. A user lands on /?utm_source=google, browses to
 * /universities, then clicks Apply → /contact — the contact
 * form should still attribute to Google. Without persistence,
 * a hard navigation (which strips the query string) would
 * lose the attribution.
 *
 * sessionStorage (not localStorage) so the attribution
 * resets when the user closes the tab — avoids attributing
 * a 3-month-later return visit to the original Google
 * click (which is what Google Analytics would do, but for
 * lead attribution the fresh-touch is more useful).
 */
'use client';

const STORAGE_KEY = 'sica_utm_v1';

// Standard UTM params + the 2 most common paid click IDs.
// Keep this list short and explicit — anything new needs a
// column on the DB and a server-side accept, so adding
// casually here is fine but actually persisting it needs
// the migration in database/2026-06-09_utm_attribution.sql
// to match.
const WHITELIST = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
] as const;

export type UtmKey = (typeof WHITELIST)[number];

export type UtmParams = Partial<Record<UtmKey, string>>;

/**
 * Read the current UTM set from sessionStorage (set by a
 * prior `captureUtmFromCurrentUrl()` call on this tab) or,
 * if nothing is stored, return an empty object.
 *
 * Safe to call server-rendered — the `typeof window === 'undefined'`
 * check returns the empty object on the server, then the
 * client picks up the real values on hydration.
 */
export function getStoredUtm(): UtmParams {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    // Re-filter against the whitelist so a stale key from
    // a prior schema version doesn't sneak through.
    const out: UtmParams = {};
    for (const k of WHITELIST) {
      const v = (parsed as Record<string, unknown>)[k];
      if (typeof v === 'string' && v.trim()) out[k] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Look at the current URL's query string and persist any
 * whitelisted UTM / click-id params to sessionStorage. Call
 * this once on app mount (or on the form's mount) so the
 * attribution survives any subsequent navigation.
 *
 * Idempotent: re-running is a no-op if the values are
 * unchanged. We only WRITE when a new value appears, so a
 * back/forward navigation that re-exposes a partial URL
 * doesn't blow away an existing attribution.
 */
export function captureUtmFromCurrentUrl(): UtmParams {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const found: UtmParams = {};
  for (const k of WHITELIST) {
    const v = params.get(k);
    if (v && v.trim()) found[k] = v.trim();
  }
  if (Object.keys(found).length === 0) return getStoredUtm();

  // Merge with any existing stored values (preserve keys
  // we didn't see in the current URL — covers the case
  // where a click-through was missing utm_term but the
  // session already captured it from an earlier visit).
  const merged = { ...getStoredUtm(), ...found };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // QuotaExceeded or disabled storage — degrade silently.
    // The merge is still useful for the current call.
  }
  return merged;
}

/**
 * One-shot helper for form submissions: capture (in case the
 * form is the first thing to run on a fresh tab) + read +
 * return the current set. Forms should call this in their
 * mount effect so the payload always carries the attribution
 * regardless of how the user got there.
 */
export function getCurrentUtm(): UtmParams {
  captureUtmFromCurrentUrl();
  return getStoredUtm();
}
