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
 * this module. The only DB-backed surface is the registration form
 * (`webinar_signups` insert) + the admin signups list (status flip
 * + CSV export). No `webinar_sessions` / `webinar_topics` lookups
 * anywhere on the public surface.
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
  /** Human-readable time string (e.g. "14:00 Beijing Time"). */
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
 */
export const WEBINAR_CONFIG: WebinarStaticConfig = {
  // Wednesday 22 October 2026, 14:00 Asia/Shanghai = 06:00 UTC
  sessionDateIso: '2026-10-22T06:00:00.000Z',
  sessionTimeDisplay: '14:00 Beijing Time',
  sessionTimezone: 'Asia/Shanghai',
  joinUrl: 'https://studyinchina.academy/webinar-room',
  label: '2027 Intake + CSC Scholarship webinar',
  durationMinutes: 60,
};

/**
 * Hardcoded agenda tracks — the 4-topic grid that the public
 * page renders below the hero. Phase 139/140 had these as
 * `webinar_topics` rows; Phase 162 added university-kind topics
 * on top; Phase 165 drops the DB entirely for the public surface.
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
  /** Lucide icon for the track card (matches the original 4 icons). */
  icon: 'march' | 'foundation' | 'bachelor' | 'csc';
}

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
    id: 'csc',
    badgeKey: 'webinar.agenda.t4Badge',
    titleKey: 'webinar.agenda.t4Title',
    bodyKey: 'webinar.agenda.t4Body',
    icon: 'csc',
  },
];
