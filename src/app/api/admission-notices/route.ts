/**
 * /api/admission-notices (public)
 *
 * Phase 51: Success Stories list. Public read of published
 * admission notices. Used by the /success-stories page.
 *
 *   GET /api/admission-notices
 *     ?country=Bangladesh          (filter)
 *     ?degree=Master               (filter)
 *     ?page=1&limit=20             (pagination)
 *
 *   Response: { notices, total, page, limit, totalPages }
 *
 * Auth: NONE (public endpoint). RLS scopes the SELECT to
 * is_published = TRUE, so unpublished rows are never returned
 * even if the URL is guessed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { listPublishedAdmissionNotices } from '@/lib/admission-notices/public-list';
import { parseAdmissionDegree } from '@/lib/admission-notices/types';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const country = url.searchParams.get('country')?.trim() || null;
  const degreeRaw = url.searchParams.get('degree')?.trim() || null;
  const degree = degreeRaw ? parseAdmissionDegree(degreeRaw) : null;
  // Reject unknown degree early with a clean 400.
  if (degreeRaw && !degree) {
    return NextResponse.json(
      { error: `Invalid degree. Allowed: Bachelor, Master, PhD, Language, Pre-University` },
      { status: 400 },
    );
  }
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10) || 20));

  try {
    const result = await listPublishedAdmissionNotices({ country, degree, page, limit });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admission-notices GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
