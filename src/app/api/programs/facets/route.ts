import { NextResponse } from 'next/server';
import { getProgramFacets } from '@/lib/program-facets';

/**
 * GET /api/programs/facets — the filter vocabulary + per-option
 * counts for the public program finder.
 *
 * PF-1: the finder used to build its filter options from three
 * hardcoded arrays in `src/lib/data.ts` that had drifted from
 * production (8 of 82 live discipline values were reachable). The
 * vocabulary now comes from the table itself.
 *
 * The snapshot is cached in-process for 10 minutes and invalidated by
 * the admin write paths, so this endpoint is cheap to call. It is
 * public data (the same rows the public listing already exposes).
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const facets = await getProgramFacets();
  return NextResponse.json(facets);
}
