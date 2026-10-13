/**
 * Phase 140: server-side helpers for the active webinar
 * session + its topics. Single source of truth — both the
 * public RSC landing page and the public `/api/webinar-sessions/active`
 * endpoint call `getActiveSessionWithTopics()` so the cache
 * shape stays consistent.
 *
 * The active session is the one row where `is_active = true`,
 * enforced at the DB layer by a partial unique index. If
 * none is active, the function returns `null` and the public
 * page falls back to the "Date coming soon" empty-state copy.
 *
 * Bilingual shape: each row carries `title_en` + `title_zh`,
 * `body_en` + `body_zh`. The caller picks the locale (via
 * `lookupRecipientLocale` for emails or `useI18n().locale`
 * for the page).
 */
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import {
  parseWebinarContent,
  type WebinarContent,
} from '@/lib/webinar-content';
import {
  computeSeatInfo,
  SEAT_HOLDER_STATUSES,
  type SeatInfo,
  type WebinarRegistrationStatus,
} from '@/lib/webinar-capacity';

export type WebinarSessionStatus = 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
export type WebinarTopicIntake = 'march_2027' | 'september_2027' | 'csc' | 'other';
export type WebinarTopicDegree =
  | 'chinese_language'
  | 'foundation'
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'csc';

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
  isActive: boolean;
  displayOrder: number;
  /** Phase 161: NULL = uncapped (Phase 157 semantics). */
  seatCap: number | null;
  /** Phase 161: draft | open | full | closed (stored value). */
  registrationStatus: WebinarRegistrationStatus;
  /** Phase 161: canonical IANA zone for wall-clock rendering. */
  timezoneLabel: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface WebinarTopic {
  id: string;
  sessionId: string;
  intake: WebinarTopicIntake;
  degree: WebinarTopicDegree;
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
}

/**
 * Column list shared by every webinar_sessions SELECT in this module.
 * Columns added by the Phase 161 migration degrade to defaults in
 * mapSession when the migration hasn't been applied yet (deploy-safe
 * probe pattern from Phase 128a — a missing column makes PostgREST
 * return 0 rows, so callers that need pre-migration resilience pass
 * the LEGACY list below).
 */
const SESSION_COLUMNS = 'id, slug, title_en, title_zh, description_en, description_zh, session_date, session_time, duration_minutes, join_url, status, is_active, display_order, seat_cap, registration_status, timezone_label, created_at, updated_at';
const SESSION_COLUMNS_LEGACY = 'id, slug, title_en, title_zh, description_en, description_zh, session_date, session_time, duration_minutes, join_url, status, is_active, display_order, created_at, updated_at';
const CONTENT_COLUMNS = 'agenda, featured_universities, faq';

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
    isActive: Boolean(row.is_active),
    displayOrder: (row.display_order as number) ?? 0,
    seatCap: (row.seat_cap as number | null) ?? null,
    registrationStatus: (row.registration_status as WebinarRegistrationStatus) ?? 'open',
    timezoneLabel: (row.timezone_label as string) ?? 'Asia/Shanghai',
    createdAt: row.created_at as string,
    updatedAt: (row.updated_at as string | null) ?? null,
  };
}

function mapTopic(row: Record<string, unknown>): WebinarTopic {
  return {
    id: row.id as string,
    sessionId: row.session_id as string,
    intake: row.intake as WebinarTopicIntake,
    degree: row.degree as WebinarTopicDegree,
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
 * Fetch the single active session + its topics (ordered by
 * display_order). Returns `null` when no session is active.
 * Used by the public RSC + the public `/api/webinar-sessions/active`
 * endpoint.
 */
export async function getActiveSessionWithTopics(): Promise<ActiveWebinarBundle | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  const { data: sessionRow, error: sessionErr } = await supabase
    .from('webinar_sessions')
    .select(SESSION_COLUMNS)
    .eq('is_active', true)
    .maybeSingle();
  if (sessionErr) {
    console.error('[webinar-sessions] active session query failed:', sessionErr);
    return null;
  }
  if (!sessionRow) return null;

  const { data: topicRows, error: topicsErr } = await supabase
    .from('webinar_topics')
    .select(
      'id, session_id, intake, degree, title_en, title_zh, body_en, body_zh, display_order, created_at, updated_at',
    )
    .eq('session_id', sessionRow.id)
    .order('display_order', { ascending: true });
  if (topicsErr) {
    console.error('[webinar-sessions] topics query failed:', topicsErr);
    return null;
  }

  return {
    session: mapSession(sessionRow as Record<string, unknown>),
    topics: (topicRows ?? []).map((r) => mapTopic(r as Record<string, unknown>)),
  };
}

/**
 * Fetch just the active session's email-render fields. Used
 * by the public signup POST handler before it fires
 * `sendWebinarConfirmation` so the email carries the real
 * join link + date instead of the Phase 139 placeholders.
 */
export async function getActiveSessionEmailFields(): Promise<{
  joinUrl: string | null;
  webinarDateIso: string | null;
  webinarTime: string | null;
}> {
  if (!isSupabaseServerConfigured()) {
    return { joinUrl: null, webinarDateIso: null, webinarTime: null };
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return { joinUrl: null, webinarDateIso: null, webinarTime: null };
  }
  const { data, error } = await supabase
    .from('webinar_sessions')
    .select('join_url, session_date, session_time')
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) {
    return { joinUrl: null, webinarDateIso: null, webinarTime: null };
  }
  return {
    joinUrl: (data.join_url as string | null) ?? null,
    webinarDateIso: (data.session_date as string | null) ?? null,
    webinarTime: (data.session_time as string | null) ?? null,
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

// ============================================================================
// Phase 157: capacity / waitlist removed — registration is uncapped.
//   The /api/webinar-sessions/capacity route + the webinar_waitlist
//   table are dropped. The only gate is "is there an active session
//   row?" — answered by getActiveSessionId() below.
// ============================================================================

/**
 * Phase 144b: return just the active session's UUID (or null).
 * Cheap — used by the signup handler to set the FK on insert
 * so the capacity count query (`eq('webinar_session_id', id)`)
 * actually finds the rows. Historical Phase 139/140/142 signups
 * were inserted with `webinar_session_id = null`, so without
 * this backfill the public counter stays at 50/50 even after
 * signups land.
 */
export async function getActiveSessionId(): Promise<string | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('webinar_sessions')
    .select('id')
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) return null;
  return (data.id as string) ?? null;
}

// ============================================================================
// Phase 161: per-slug public lookups + seat accounting.
// ============================================================================

export interface WebinarPageBundle {
  session: WebinarSession;
  content: WebinarContent;
  seatInfo: SeatInfo;
}

/**
 * Fetch one webinar by slug for the /webinar/[slug] landing page:
 * the session row + parsed jsonb content + live seat info.
 *
 * Uses the service-role client, so the lookup works for every slug
 * (public RLS only exposes is_active rows — an old-but-resolvable
 * webinar page must still render after staff demote it).
 *
 * Pre-migration safety: if the Phase 161 columns are missing,
 * PostgREST returns an error for the wider SELECT — the function
 * retries once with the legacy column list so the page degrades to
 * "content coming soon" instead of 500ing (Phase 128a probe
 * pattern).
 */
export async function getWebinarBySlug(slug: string): Promise<WebinarPageBundle | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;

  let row: Record<string, unknown> | null = null;

  const { data, error } = await supabase
    .from('webinar_sessions')
    .select(`${SESSION_COLUMNS}, ${CONTENT_COLUMNS}`)
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    // Columns from the Phase 161 migration not applied yet.
    const legacy = await supabase
      .from('webinar_sessions')
      .select(SESSION_COLUMNS_LEGACY)
      .eq('slug', slug)
      .maybeSingle();
    if (legacy.error || !legacy.data) {
      console.error('[webinar-sessions] by-slug query failed:', legacy.error ?? 'not found');
      return null;
    }
    row = legacy.data as Record<string, unknown>;
  } else if (data) {
    row = data as Record<string, unknown>;
  }
  if (!row) return null;

  const session = mapSession(row);
  const content = parseWebinarContent(row.agenda, row.featured_universities, row.faq);
  const seatInfo = await getSeatInfo(session);
  return { session, content, seatInfo };
}

/**
 * Count current seat holders for a session and fold them into a
 * SeatInfo decision. Count query uses `head: true` so no rows
 * travel. Any count error degrades to "uncapped" so a flaky count
 * can never block a registration.
 */
export async function getSeatInfo(session: WebinarSession): Promise<SeatInfo> {
  const fallback = computeSeatInfo({
    seatCap: null,
    seatsTaken: 0,
    storedStatus: session.registrationStatus,
  });
  if (!isSupabaseServerConfigured()) return fallback;
  const supabase = getSupabaseServer();
  if (!supabase) return fallback;

  const { count, error } = await supabase
    .from('webinar_signups')
    .select('id', { count: 'exact', head: true })
    .eq('webinar_session_id', session.id)
    .in('status', [...SEAT_HOLDER_STATUSES]);
  if (error || count === null) {
    console.error('[webinar-sessions] seat count failed:', error);
    return fallback;
  }
  return computeSeatInfo({
    seatCap: session.seatCap,
    seatsTaken: count,
    storedStatus: session.registrationStatus,
  });
}

/**
 * Topics for one session (Phase 140 rows) — the agenda fallback for
 * webinars that predate the Phase 161 agenda jsonb column.
 */
export async function getTopicsForSession(sessionId: string): Promise<WebinarTopic[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('webinar_topics')
    .select(
      'id, session_id, intake, degree, title_en, title_zh, body_en, body_zh, display_order, created_at, updated_at',
    )
    .eq('session_id', sessionId)
    .order('display_order', { ascending: true });
  if (error) {
    console.error('[webinar-sessions] topics query failed:', error);
    return [];
  }
  return (data ?? []).map((r) => mapTopic(r as Record<string, unknown>));
}

/**
 * Email-render fields for a specific session (by id) — used by the
 * per-webinar signup confirmation + the reminder cron. Legacy-safe:
 * only pre-Phase-161 columns are selected.
 */
export async function getSessionEmailFieldsById(
  sessionId: string,
): Promise<{ joinUrl: string | null; webinarDateIso: string | null; webinarTime: string | null; titleEn: string | null }> {
  const empty = { joinUrl: null, webinarDateIso: null, webinarTime: null, titleEn: null };
  if (!isSupabaseServerConfigured()) return empty;
  const supabase = getSupabaseServer();
  if (!supabase) return empty;
  const { data, error } = await supabase
    .from('webinar_sessions')
    .select('join_url, session_date, session_time, title_en')
    .eq('id', sessionId)
    .maybeSingle();
  if (error || !data) return empty;
  return {
    joinUrl: (data.join_url as string | null) ?? null,
    webinarDateIso: (data.session_date as string | null) ?? null,
    webinarTime: (data.session_time as string | null) ?? null,
    titleEn: (data.title_en as string | null) ?? null,
  };
}
