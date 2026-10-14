/**
 * Phase 164: server-side helpers for the next-upcoming webinar
 * session + its topics. Single source of truth — both the
 * public RSC landing page and the public `/api/webinar-sessions/active`
 * endpoint call `getUpcomingSessionWithTopics()` so the cache
 * shape stays consistent.
 *
 * Phase 164 replaced the `is_active=true` single-row toggle
 * (Phase 139-162 model) with an auto-rollover derived query:
 * "the next-upcoming session is the earliest future-dated,
 * non-cancelled session_date." When that date passes, the
 * next-earliest one becomes "upcoming" with no admin action.
 *
 * Bilingual shape: each row carries `title_en` + `title_zh`,
 * `body_en` + `body_zh`. The caller picks the locale (via
 * `lookupRecipientLocale` for emails or `useI18n().locale`
 * for the page).
 */
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

export type WebinarSessionStatus = 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
export type WebinarTopicIntake = 'march_2027' | 'september_2027' | 'csc' | 'other';
export type WebinarTopicDegree =
  | 'chinese_language'
  | 'foundation'
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'csc';
// Phase 162: a topic can now also be a "university card section"
// (kind=program|scholarship|timing|requirement, bound to a
// specific university). The track-shape topic still uses
// intake+degree; the university-kind topic sets them to NULL.
export type WebinarTopicKind = 'program' | 'scholarship' | 'timing' | 'requirement';

export interface WebinarSession {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
  sessionDate: string | null;
  sessionTime: string | null;
  durationMinutes: number;
  joinUrl: string | null;
  status: WebinarSessionStatus;
  /** Phase 164: human-readable label like "Week 5 · Oct 20, 2026".
   *  Auto-generated on insert; admins can override via PATCH. */
  label: string | null;
  /** Phase 164: sequential week number (1, 2, 3...) for sorting.
   *  Sparse unique — historic rows can be NULL. */
  weekNumber: number | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface WebinarTopic {
  id: string;
  sessionId: string;
  intake: WebinarTopicIntake | null;
  degree: WebinarTopicDegree | null;
  kind: WebinarTopicKind | null;
  universityId: string | null;
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ActiveWebinarBundle {
  session: WebinarSession;
  topics: WebinarTopic[];
  /**
   * Phase 162: featured universities for the active session's
   * university-kind topics. Empty array when the session has
   * no university-kind topics (or no active session at all).
   * Each university has the slim public shape the page needs
   * to render the 5-card grid (logo, name, nameZh, city).
   */
  universities: WebinarUniversity[];
}

export interface WebinarUniversity {
  id: string;
  slug: string;
  name: string;
  nameZh: string;
  city: string | null;
  logo: string | null;
}

// Fields the helpers + admin GET endpoints read on webinar_sessions.
// Centralised so the column list lives in one place and the Supabase
// `.select(...)` shape stays in sync with the mapper below.
const SESSION_SELECT =
  'id, slug, title_en, title_zh, description_en, description_zh, session_date, session_time, duration_minutes, join_url, status, label, week_number, created_at, updated_at';

const TOPIC_SELECT =
  'id, session_id, intake, degree, kind, university_id, title_en, title_zh, body_en, body_zh, display_order, created_at, updated_at';

function mapSession(row: Record<string, unknown>): WebinarSession {
  return {
    id: row.id as string,
    slug: row.slug as string,
    titleEn: (row.title_en as string) ?? '',
    titleZh: (row.title_zh as string) ?? '',
    descriptionEn: (row.description_en as string | null) ?? null,
    descriptionZh: (row.description_zh as string | null) ?? null,
    sessionDate: (row.session_date as string | null) ?? null,
    sessionTime: (row.session_time as string | null) ?? null,
    durationMinutes: (row.duration_minutes as number) ?? 60,
    joinUrl: (row.join_url as string | null) ?? null,
    status: (row.status as WebinarSessionStatus) ?? 'Scheduled',
    label: (row.label as string | null) ?? null,
    weekNumber: (row.week_number as number | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? null,
  };
}

function mapTopic(row: Record<string, unknown>): WebinarTopic {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    intake: (row.intake as WebinarTopicIntake | null) ?? null,
    degree: (row.degree as WebinarTopicDegree | null) ?? null,
    kind: (row.kind as WebinarTopicKind | null) ?? null,
    universityId: (row.university_id as string | null) ?? null,
    titleEn: (row.title_en as string) ?? '',
    titleZh: (row.title_zh as string) ?? '',
    bodyEn: (row.body_en as string) ?? '',
    bodyZh: (row.body_zh as string) ?? '',
    displayOrder: (row.display_order as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? null,
  };
}

/**
 * Phase 164: fetch the next-upcoming session + its topics
 * (ordered by display_order). Replaces the Phase 139-162
 * `getActiveSessionWithTopics()` (which gated on
 * `is_active = true`). The new contract:
 *   - "upcoming" = earliest future-dated, non-cancelled session
 *   - When that session passes, the next-earliest becomes
 *     upcoming automatically (no admin toggle)
 *   - Returns `null` when no upcoming session is scheduled,
 *     so the public page can render the "register your
 *     interest" copy
 */
export async function getUpcomingSessionWithTopics(): Promise<ActiveWebinarBundle | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const sessionRow = await fetchUpcomingSessionRow(supabase);
  if (!sessionRow) return null;

  const { data: topicRows, error: topicsErr } = await supabase
    .from('webinar_topics')
    .select(TOPIC_SELECT)
    .eq('session_id', sessionRow.id)
    .order('display_order', { ascending: true });
  if (topicsErr) {
    console.error('[webinar-sessions] topics query failed:', topicsErr);
    return null;
  }
  const topics = (topicRows ?? []).map((r) => mapTopic(r as Record<string, unknown>));

  // Phase 162: featured universities — only the ones bound to
  // the active session's university-kind topics. Fetched as
  // a single SELECT IN (uuid[]) call (cheaper than N round
  // trips and the result is naturally limited to ~5 rows by
  // the topic fan-out).
  const uniIds = Array.from(
    new Set(
      topics
        .map((t) => t.universityId)
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );
  let universities: WebinarUniversity[] = [];
  if (uniIds.length > 0) {
    const { data: uniRows, error: uniErr } = await supabase
      .from('universities')
      .select('id, slug, name, name_cn, city, logo')
      .in('id', uniIds);
    if (uniErr) {
      console.error('[webinar-sessions] featured universities query failed:', uniErr);
      universities = [];
    } else {
      universities = (uniRows ?? []).map((row) => ({
        id: row.id as string,
        slug: row.slug as string,
        name: (row.name as string) ?? '',
        nameZh: (row.name_cn as string) ?? '',
        city: (row.city as string | null) ?? null,
        logo: (row.logo as string | null) ?? null,
      }));
      // Preserve the order from the topics (so the first university
      // to appear in a topic row renders first on the page).
      const orderById = new Map(uniIds.map((id, i) => [id, i]));
      universities.sort(
        (a, b) =>
          (orderById.get(a.id) ?? 0) - (orderById.get(b.id) ?? 0),
      );
    }
  }

  return {
    session: mapSession(sessionRow),
    topics,
    universities,
  };
}

/**
 * Phase 164: the public RSC page uses this to show
 * "Next: Week N · Oct 27" when the current week's session
 * has passed but the week-after's is still upcoming. Both
 * come from the same `fetchUpcomingSessionRow` helper so
 * the ordering is consistent.
 */
export interface CurrentAndNextSessions {
  current: WebinarSession | null;
  next: WebinarSession | null;
}

export async function getCurrentAndNextSessions(): Promise<CurrentAndNextSessions> {
  if (!isSupabaseServerConfigured()) return { current: null, next: null };
  const supabase = getSupabaseServer();
  if (!supabase) return { current: null, next: null };

  const { data, error } = await supabase
    .from('webinar_sessions')
    .select(SESSION_SELECT)
    .gt('session_date', new Date().toISOString())
    .neq('status', 'Cancelled')
    .order('session_date', { ascending: true })
    .limit(2);
  if (error) {
    console.error('[webinar-sessions] current+next query failed:', error);
    return { current: null, next: null };
  }
  const rows = data ?? [];
  return {
    current: rows[0] ? mapSession(rows[0] as Record<string, unknown>) : null,
    next: rows[1] ? mapSession(rows[1] as Record<string, unknown>) : null,
  };
}

/**
 * Phase 164: return the next-upcoming session's id (or null).
 * The signup handler uses this to set the FK on insert so the
 * admin signups list can join back. Replaces the Phase 162
 * `getActiveSessionId()` (which gated on `is_active=true`).
 */
export async function getUpcomingSessionId(): Promise<string | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const row = await fetchUpcomingSessionRow(supabase, 'id, slug, session_date');
  return row ? ((row.id as string) ?? null) : null;
}

/**
 * Phase 164: shared internal helper — fetch the next-upcoming
 * session row (any columns). Used by getUpcomingSessionWithTopics,
 * getUpcomingSessionId, and the upcoming-session email-fields
 * lookup. Encapsulates the "earliest future, non-cancelled"
 * query so callers don't drift.
 */
async function fetchUpcomingSessionRow(
  supabase: ReturnType<typeof getSupabaseServer>,
  columns: string = SESSION_SELECT,
): Promise<Record<string, unknown> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('webinar_sessions')
    .select(columns)
    .gt('session_date', new Date().toISOString())
    .neq('status', 'Cancelled')
    .order('session_date', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data as Record<string, unknown> | null) ?? null;
}

/**
 * Phase 164: the public signup POST handler needs the
 * next-upcoming session's email-render fields before firing
 * `sendWebinarConfirmation`. Replaces the Phase 162
 * `getActiveSessionEmailFields()` (which gated on
 * `is_active=true`).
 *
 * The `id` field lets the API stamp the FK on the signup row
 * without a second round-trip — same query serves both purposes.
 */
export async function getUpcomingSessionEmailFields(): Promise<{
  id: string | null;
  joinUrl: string | null;
  webinarDateIso: string | null;
  webinarTime: string | null;
  label: string | null;
}> {
  const empty = {
    id: null,
    joinUrl: null,
    webinarDateIso: null,
    webinarTime: null,
    label: null,
  };
  if (!isSupabaseServerConfigured()) return empty;
  const supabase = getSupabaseServer();
  if (!supabase) return empty;
  const row = await fetchUpcomingSessionRow(
    supabase,
    'id, slug, session_date, session_time, join_url, label',
  );
  if (!row) return empty;
  return {
    id: (row.id as string | null) ?? null,
    joinUrl: (row.join_url as string | null) ?? null,
    webinarDateIso: (row.session_date as string | null) ?? null,
    webinarTime: (row.session_time as string | null) ?? null,
    label: (row.label as string | null) ?? null,
  };
}

/**
 * Format `session_date` as a human-readable date in Asia/Shanghai.
 * Falls back to the input string when the date is null or invalid.
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
 * Phase 164: format `session_date` as a "Week N · MMM DD, YYYY"
 * label for the hero heading. Falls back to `formatWebinarDate`
 * when no explicit label / week_number is set (the historic
 * Phase 139-140 rows that pre-date auto-generation).
 */
export function formatWebinarLabel(
  iso: string | null,
  label: string | null,
  weekNumber: number | null,
  locale: 'en' | 'zh' = 'en',
): string {
  if (label && label.trim().length > 0) return label;
  const dateStr = formatWebinarDate(iso);
  if (weekNumber != null) {
    return locale === 'zh' ? `第 ${weekNumber} 期 · ${dateStr}` : `Week ${weekNumber} · ${dateStr}`;
  }
  return dateStr;
}

/**
 * Phase 164: derive the next session_date for "Schedule next".
 * Returns the same time-of-day as the most-recently-scheduled
 * upcoming session (default 14:00 Beijing = 06:00 UTC) + 7 days.
 * Pure function — `nowMs` injectable for tests.
 */
export function computeNextSessionDate(
  referenceDateIso: string | null,
  nowMs: number = Date.now(),
): string {
  const base = referenceDateIso
    ? new Date(referenceDateIso).getTime()
    : nowMs;
  if (!Number.isFinite(base)) {
    return new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  return new Date(base + 7 * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Phase 162: closed-state predicate (pure). Spec says
 * "registration closes after the webinar day until we setup
 * for next webinar". With Phase 164 auto-rollover, the API
 * just returns 410 when `getUpcomingSession()` is null — but
 * the public page still uses this for the closed banner +
 * the submit-disabled UX, which can be cheaper than a second
 * round-trip to the DB.
 *
 * Pure function — `nowMs` is injectable so the unit test can
 * fix "now" without mocking the clock.
 */
export function isSessionClosed(
  sessionDateIso: string | null,
  nowMs: number = Date.now(),
): boolean {
  if (!sessionDateIso) return false;
  const ms = new Date(sessionDateIso).getTime();
  if (!Number.isFinite(ms)) return false;
  return ms < nowMs;
}
