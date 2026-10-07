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
    .select(
      'id, slug, title_en, title_zh, description_en, description_zh, session_date, session_time, duration_minutes, join_url, status, is_active, display_order, created_at, updated_at',
    )
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
// Phase 142: capacity / waitlist helpers
// ============================================================================

export interface ActiveSessionCapacity {
  maxAttendees: number;
  /** Distinct signup rows with status IN ('Registered','Attended').
   *  Cancelled + No-Show are explicitly excluded so a freed seat
   *  frees immediately on status flip. */
  seatHolders: number;
  /** maxAttendees - seatHolders, clamped to ≥ 0. */
  seatsRemaining: number;
  /** Convenience boolean. */
  isFull: boolean;
  /** True when the active session row exists AND seats are free. */
  acceptsSignups: boolean;
}

const EMPTY_CAPACITY: ActiveSessionCapacity = {
  maxAttendees: 0,
  seatHolders: 0,
  seatsRemaining: 0,
  isFull: true,
  acceptsSignups: false,
};

/**
 * Return `{maxAttendees, seatHolders, seatsRemaining, isFull,
 * acceptsSignups}` for the active session. If no session is
 * active, returns the empty-shape (acceptsSignups=false) so
 * the caller can render the "no session" branch uniformly.
 *
 * Used by:
 *   - `/api/webinar-signups` POST (returns 409 when full)
 *   - `/api/webinar-sessions/capacity` GET (public live count)
 *   - the public RSC for the cached initial capacity render
 */
export async function getActiveSessionCapacity(): Promise<ActiveSessionCapacity> {
  if (!isSupabaseServerConfigured()) return EMPTY_CAPACITY;
  const supabase = getSupabaseServer();
  if (!supabase) return EMPTY_CAPACITY;

  const { data: sessionRow, error: sessionErr } = await supabase
    .from('webinar_sessions')
    .select('id, max_attendees')
    .eq('is_active', true)
    .maybeSingle();
  if (sessionErr || !sessionRow) return EMPTY_CAPACITY;

  // count: 'exact' so the cap check is real, not an estimate.
  // Cancelled + No-Show are excluded — see Phase 137 occupancy.
  const { count, error: countErr } = await supabase
    .from('webinar_signups')
    .select('id', { count: 'exact', head: true })
    .eq('webinar_session_id', sessionRow.id as string)
    .in('status', ['Registered', 'Attended']);
  if (countErr) {
    console.error('[webinar-sessions] capacity count failed:', countErr);
    return EMPTY_CAPACITY;
  }
  const maxAttendees = (sessionRow.max_attendees as number) ?? 50;
  const seatHolders = count ?? 0;
  const seatsRemaining = Math.max(0, maxAttendees - seatHolders);
  return {
    maxAttendees,
    seatHolders,
    seatsRemaining,
    isFull: seatsRemaining <= 0,
    acceptsSignups: seatsRemaining > 0,
  };
}

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
