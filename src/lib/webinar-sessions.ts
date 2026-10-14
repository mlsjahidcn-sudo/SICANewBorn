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
  isActive: boolean;
  displayOrder: number;
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
      'id, session_id, intake, degree, kind, university_id, title_en, title_zh, body_en, body_zh, display_order, created_at, updated_at',
    )
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
    session: mapSession(sessionRow as Record<string, unknown>),
    topics,
    universities,
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

/**
 * Phase 162: return the active session's id + session_date (or
 * null/null). The signup route uses both — the id to set the FK
 * on insert, the date to enforce the "registration closes after
 * the webinar day" gate at 410. We combine into one query because
 * the active-session lookup is already in the hot path of every
 * POST and adding a second query would double the round trips.
 */
export async function getActiveSessionWithDate(): Promise<{
  id: string;
  sessionDate: string | null;
} | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = getSupabaseServer();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('webinar_sessions')
    .select('id, session_date')
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: (data.id as string) ?? '',
    sessionDate: (data.session_date as string | null) ?? null,
  };
}

/**
 * Phase 162: closed-state predicate (pure). Spec says
 * "registration closes after the webinar day until we setup
 * for next webinar". With single-active enforcement, when the
 * active session's date is in the past AND no future session
 * has been set up, registration is closed. When staff flips
 * `is_active=true` on a future-dated session, registration
 * reopens automatically.
 *
 * Pure function — `nowMs` is injectable so the unit test can
 * fix "now" without mocking the clock. Hoisted to module scope
 * per Phase 161's lint rule (no `Date.now()` inside render
 * bodies — same lesson applies to any pure helper).
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
