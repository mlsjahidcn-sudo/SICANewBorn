/**
 * Phase 164: format `session_date` as a human-readable date in Asia/Shanghai.
 * Falls back to the input string when the date is null or invalid.
 * Hoisted to module scope per the Phase 161 lint rule (no
 * `Date.now()` inside render bodies).
 */
export function formatWebinarDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'long',
      timeZone: 'Asia/Shanghai',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Controls the public webinar page, registration endpoint, and promo popup. */
export const PUBLIC_WEBINAR_ENABLED = true;

/**
 * Phase 165: hardcoded webinar configuration.
 *
 * Before: every piece of webinar metadata (date, time, join URL,
 * agenda tracks, featured universities) lived in `webinar_sessions`
 * + `webinar_topics` tables, looked up at request time, with
 * `webinar_sessions.is_active` toggled by hand each session. Five
 * schemas, an auto-rollover query, two parallel topic shapes, an
 * AI brief wizard, and 17 API routes supported this.
 *
 * After: the public landing page is a static RSC that reads from
 * this module. The only DB-backed surfaces are the registration
 * form (`webinar_signups` insert, stamped with `webinar_key`) +
 * the featured-university cards (live catalog by slug) + the
 * admin signups list. No `webinar_sessions` / `webinar_topics`
 * lookups anywhere on the public surface.
 *
 * Staff edits this file when the webinar date moves or the join
 * URL is ready (typically once per session, by committing the
 * updated constant — deploys on push). No SQL, no admin UI.
 *
 * Single source of truth for both the public landing page hero
 * + the confirmation email body (the email helper reads the same
 * constants below).
 */
export interface WebinarStaticConfig {
  /** ISO timestamp (Asia/Shanghai) — what the countdown timer
   *  counts down to + what the email body renders as the date. */
  sessionDateIso: string;
  /** Human-readable time string (e.g. "21:00 Beijing Time"). */
  sessionTimeDisplay: string;
  /** IANA tz the date is in (for the local-time email rendering). */
  sessionTimezone: string;
  /** Join URL — staff pastes the Zoom/Meet link when ready. */
  joinUrl: string | null;
  /** Public label rendered in the email "You're registered for X". */
  label: string;
  /** Duration in minutes (used in the email template + admin copy). */
  durationMinutes: number;
}

/**
 * The current webinar session. Edit this when the webinar date
 * moves or the join URL is ready. Commit + push + redeploy — the
 * public page picks it up automatically.
 *
 * `webinar_key` on each signup is derived from `sessionDateIso`
 * via {@link getCurrentWebinarKey} (Asia/Shanghai `YYYY-MM-DD`).
 */
export const WEBINAR_CONFIG: WebinarStaticConfig = {
  // Monday 3 November 2026, 21:00 Asia/Shanghai = 13:00 UTC
  sessionDateIso: '2026-11-03T13:00:00.000Z',
  sessionTimeDisplay: '21:00 Beijing Time',
  sessionTimezone: 'Asia/Shanghai',
  joinUrl: 'https://studyinchina.academy/webinar-room',
  label: '2027 Intake · 5 Universities webinar',
  durationMinutes: 60,
};

/**
 * Per-session tag stamped onto every new `webinar_signups` row.
 * Derived from the session date in Asia/Shanghai as `YYYY-MM-DD`
 * so staff only edits `sessionDateIso` each week.
 */
export function getCurrentWebinarKey(
  sessionDateIso: string = WEBINAR_CONFIG.sessionDateIso,
): string {
  const t = Date.parse(sessionDateIso);
  if (Number.isNaN(t)) return 'unknown';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: WEBINAR_CONFIG.sessionTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(t));
}

/**
 * Pure upcoming-session check for the promo popup (and any
 * other surface that needs "is the webinar still open?").
 *
 * Pass `nowMs` so callers can capture `Date.now()` once in a
 * `useState(() => Date.now())` initializer — never call
 * `Date.now()` inside a render body (Phase 161 lint rule).
 *
 * Returns false for missing/invalid ISO strings so a bad
 * config falls into the teaser branch instead of crashing.
 */
export function isWebinarSessionUpcoming(
  sessionDateIso: string | null | undefined,
  nowMs: number,
): boolean {
  if (!sessionDateIso) return false;
  const t = Date.parse(sessionDateIso);
  if (Number.isNaN(t)) return false;
  return t > nowMs;
}

/**
 * Hardcoded agenda tracks — the 4-topic grid that the public
 * page renders below the hero.
 *
 * Each track has a badge (intake), title, and body. Bilingual
 * via the standard `t()` lookup at render time.
 */
export interface WebinarAgendaTrack {
  /** Stable id — React key. */
  id: string;
  /** i18n key for the badge text (e.g. "March 2027", "September 2027"). */
  badgeKey: string;
  /** i18n key for the track title. */
  titleKey: string;
  /** i18n key for the track body. */
  bodyKey: string;
  /** Lucide icon for the track card. */
  icon: 'march' | 'foundation' | 'bachelor' | 'universities';
}

/**
 * Featured-university slugs for the public 5-card grid.
 * Resolved from the live Supabase catalog (not static data.ts)
 * so admin-managed schools without a static fallback still render.
 */
export const WEBINAR_FEATURED_UNIVERSITY_SLUGS = [
  'zhengzhou-university',
  'zhejiang-university-of-technology',
  'nantong-university',
  'harbin-engineering-university',
  'hangzhou-dianzi-university',
] as const;

export const WEBINAR_AGENDA_TRACKS: WebinarAgendaTrack[] = [
  {
    id: 'march-lang',
    badgeKey: 'webinar.agenda.t1Badge',
    titleKey: 'webinar.agenda.t1Title',
    bodyKey: 'webinar.agenda.t1Body',
    icon: 'march',
  },
  {
    id: 'foundation',
    badgeKey: 'webinar.agenda.t2Badge',
    titleKey: 'webinar.agenda.t2Title',
    bodyKey: 'webinar.agenda.t2Body',
    icon: 'foundation',
  },
  {
    id: 'september',
    badgeKey: 'webinar.agenda.t3Badge',
    titleKey: 'webinar.agenda.t3Title',
    bodyKey: 'webinar.agenda.t3Body',
    icon: 'bachelor',
  },
  {
    id: 'universities',
    badgeKey: 'webinar.agenda.t4Badge',
    titleKey: 'webinar.agenda.t4Title',
    bodyKey: 'webinar.agenda.t4Body',
    icon: 'universities',
  },
];
