/**
 * GET /api/admin/applications/candidates
 *
 * Phase 175: the live, DB-derived candidate set for the shortlist builder
 * (and, later, the input the AI ranks — see the plan's Part B).
 *
 * WHY THIS EXISTS SEPARATELY FROM /api/programs
 * ----------------------------------------------
 * The shortlist builder needs programs *grouped by university* so the
 * admin can think "this student wants Computer Science — which of our
 * schools?" The public `/api/programs` returns a flat, paginated list
 * and is deliberately unauthenticated; this one is admin-gated, returns
 * the live catalog only (never the static seed fallback), and is shaped
 * for grouping.
 *
 * IMPORTANT — this is the DETERMINISTIC half of the AI feature. The
 * model never invents candidates: it receives exactly what this
 * endpoint returns and may only rank/explain that set. The sanitizer
 * (Part B) drops any slug not present here.
 */
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  fetchCandidates,
  CandidatesNotConfiguredError,
} from '@/lib/application-candidates';

export const maxDuration = 30;

export interface CandidateUniversity {
  slug: string;
  name: string;
  nameCn: string;
}

export interface CandidateProgram {
  slug: string;
  name: string;
  nameCn: string;
  discipline: string;
  disciplineCn: string;
  degree: string;
  language: string;
  tuition: string;
  duration: string;
  scholarshipAvailable: boolean;
  /** true when the university has no published program matching the
   *  filters — the admin should see "no catalog coverage here" rather
   *  than the school silently vanishing from the picker. */
  noMatchingPrograms: boolean;
}

/** Hard ceiling on candidates. A shortlist is a shortlist; 200 programs
 *  is far past any real need and keeps the response (and a later AI
 *  prompt) bounded. */
const MAX_CANDIDATE_PROGRAMS = 200;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);

  try {
    const set = await fetchCandidates({
      discipline: searchParams.get('discipline') ?? undefined,
      degree: searchParams.get('degree') ?? undefined,
      language: searchParams.get('language') ?? undefined,
      scholarshipOnly: searchParams.get('scholarship') === '1',
      search: searchParams.get('search') ?? undefined,
    });

    return NextResponse.json({
      universities: set.groups,
      programCount: set.programCount,
      droppedOrphanPrograms: set.droppedOrphanPrograms,
    });
  } catch (e) {
    if (e instanceof CandidatesNotConfiguredError) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    console.error('[admin/applications/candidates]', e);
    return NextResponse.json({ error: 'Failed to load candidates' }, { status: 500 });
  }
}
