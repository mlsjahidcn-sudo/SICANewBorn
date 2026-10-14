import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { trackServer } from '@/lib/analytics';
import type {
  NormalizedBrief,
  NormalizedBriefTopic,
  WebinarBriefKind,
} from '@/lib/ai/webinar-brief-sanitize';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Phase 163: AI-generated webinar brief — apply.
 *
 * POST /api/admin/webinar-ai/apply
 *
 * Body shape:
 *   {
 *     sessionId: string,                                 // target webinar_sessions row
 *     brief: NormalizedBrief,                            // from /generate
 *     accepted: {
 *       session: boolean,                                // accept the title/description patch?
 *       universities: { [slug]: boolean },              // accept each university's topics
 *     },
 *   }
 *
 * Behavior:
 *   - If `accepted.session === true`, PATCH the session's
 *     title_en / title_zh / description_en / description_zh
 *     from `brief.titleEn` / `brief.titleZh` / `brief.descriptionEn` /
 *     `brief.descriptionZh`.
 *   - For each (slug in `accepted.universities`), loop the 4
 *     kinds. For each kind present in `brief.featuredUniversities[slug].topics`,
 *     POST a new webinar_topic row via the Phase 162 API
 *     (`POST /api/admin/webinar-sessions/[id]/university-topics`)
 *     — if it returns 409 (duplicate (session, university, kind)
 *     tuple), we PATCH the existing row instead. Per-row errors
 *     are returned in `results` but the route never throws.
 *
 * Returns:
 *   {
 *     session: { updated: boolean, error: string | null },
 *     topics: { slug, kind, status: 'created' | 'updated' | 'skipped' | 'error', id?: string, error?: string }[],
 *   }
 */

interface AcceptedUniversitiesMap {
  [slug: string]: boolean;
}

interface ApplyBody {
  sessionId?: string;
  brief?: NormalizedBrief;
  accepted?: {
    session?: boolean;
    universities?: AcceptedUniversitiesMap;
  };
}

const KINDS: WebinarBriefKind[] = ['program', 'scholarship', 'timing', 'requirement'];

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: ApplyBody;
  try {
    body = (await request.json()) as ApplyBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }
  if (!body.brief) {
    return NextResponse.json({ error: 'brief is required' }, { status: 400 });
  }
  const acceptedSession = body.accepted?.session === true;
  const acceptedUniversities: AcceptedUniversitiesMap = body.accepted?.universities ?? {};

  const results = {
    session: { updated: false, error: null as string | null },
    topics: [] as Array<{
      slug: string;
      kind: WebinarBriefKind;
      status: 'created' | 'updated' | 'skipped' | 'error';
      id?: string;
      error?: string;
    }>,
  };

  // (1) PATCH session.title_en/title_zh/description_en/description_zh
  // if the admin checked the title/description accept box.
  if (acceptedSession) {
    const { error: sessionErr } = await auth.supabase
      .from('webinar_sessions')
      .update({
        title_en: body.brief.titleEn,
        title_zh: body.brief.titleZh,
        description_en: body.brief.descriptionEn,
        description_zh: body.brief.descriptionZh,
      })
      .eq('id', sessionId);
    if (sessionErr) {
      console.error(
        '[POST /api/admin/webinar-ai/apply] session PATCH failed:',
        sessionErr,
      );
      results.session.error = sessionErr.message ?? 'session update failed';
    } else {
      results.session.updated = true;
      trackServer('webinar_brief_applied_session', {
        locale: 'en',
        session_id: sessionId,
      });
    }
  } else {
    results.session.error = 'skipped (admin did not accept)';
  }

  // (2) For each accepted university, for each kind present, POST
  // (or PATCH-on-409) the topic. Use the admin client so the
  // RLS gate is the same as the existing admin endpoints.
  for (const uniBrief of body.brief.featuredUniversities) {
    const slug = uniBrief.slug;
    if (!acceptedUniversities[slug]) {
      for (const kind of KINDS) {
        if (uniBrief.topics[kind]) {
          results.topics.push({ slug, kind, status: 'skipped' });
        }
      }
      continue;
    }

    // Look up the university id from the slug. Single fetch per
    // accepted university (cheap, parallel-eligible).
    const { data: uniRow, error: uniErr } = await auth.supabase
      .from('universities')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    if (uniErr || !uniRow) {
      results.topics.push({
        slug,
        kind: 'program',
        status: 'error',
        error: uniErr?.message ?? 'university not found by slug',
      });
      continue;
    }
    const universityId = uniRow.id as string;

    for (const kind of KINDS) {
      const topic = uniBrief.topics[kind];
      if (!topic) continue;

      const topicResult = await upsertUniversityTopic(
        auth.supabase,
        sessionId,
        universityId,
        kind,
        topic,
      );
      results.topics.push({ slug, kind, ...topicResult });
    }
  }

  // Top-level summary.
  const created = results.topics.filter((r) => r.status === 'created').length;
  const updated = results.topics.filter((r) => r.status === 'updated').length;
  const skipped = results.topics.filter((r) => r.status === 'skipped').length;
  const failed = results.topics.filter((r) => r.status === 'error').length;

  trackServer('webinar_brief_applied_topics', {
    locale: 'en',
    session_id: sessionId,
    created: String(created),
    updated: String(updated),
    skipped: String(skipped),
    failed: String(failed),
  });

  return NextResponse.json(results);
}

/**
 * POST a new university-kind topic for (session, university, kind).
 * If a duplicate exists (the existing /api/admin/webinar-sessions/[id]/university-topics
 * returns 409 with `existingId`), PATCH the existing row instead.
 * Returns `{status: 'created' | 'updated' | 'error', id?, error?}`.
 */
async function upsertUniversityTopic(
  supabase: ReturnType<typeof requireAdmin> extends Promise<infer R>
    ? R extends { supabase: infer S }
      ? S
      : never
    : never,
  sessionId: string,
  universityId: string,
  kind: WebinarBriefKind,
  topic: NormalizedBriefTopic,
): Promise<{
  status: 'created' | 'updated' | 'error';
  id?: string;
  error?: string;
}> {
  // Pre-flight probe for an existing (session, university, kind)
  // tuple — same check the Phase 162 admin endpoint does. Avoids
  // the 409 round trip when we know we'll PATCH instead.
  const { data: existing, error: probeErr } = await supabase
    .from('webinar_topics')
    .select('id')
    .eq('session_id', sessionId)
    .eq('university_id', universityId)
    .eq('kind', kind)
    .maybeSingle();
  if (probeErr) {
    return { status: 'error', error: `probe failed: ${probeErr.message}` };
  }
  if (existing) {
    const { data: updated, error: patchErr } = await supabase
      .from('webinar_topics')
      .update({
        title_en: topic.titleEn,
        title_zh: topic.titleZh,
        body_en: topic.bodyEn,
        body_zh: topic.bodyZh,
      })
      .eq('id', (existing as { id: string }).id)
      .select('id')
      .single();
    if (patchErr) {
      return { status: 'error', error: `patch failed: ${patchErr.message}` };
    }
    return { status: 'updated', id: (updated as { id: string }).id };
  }

  const { data: created, error: insertErr } = await supabase
    .from('webinar_topics')
    .insert({
      session_id: sessionId,
      university_id: universityId,
      kind,
      intake: null,
      degree: null,
      title_en: topic.titleEn,
      title_zh: topic.titleZh,
      body_en: topic.bodyEn,
      body_zh: topic.bodyZh,
    })
    .select('id')
    .single();
  if (insertErr) {
    return { status: 'error', error: `insert failed: ${insertErr.message}` };
  }
  return { status: 'created', id: (created as { id: string }).id };
}