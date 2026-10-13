import { NextRequest, NextResponse } from 'next/server';
import { getWebinarBySlug } from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';

/**
 * Phase 161: public seat-availability poll for one webinar.
 * Used by the /webinar/[slug] capacity pill + signup form to flip
 * to waitlist mode the moment the last seat goes.
 *
 * Deliberately minimal — no join URL, no email addresses, just the
 * counts. 30s browser-cache so a thousand visitors don't hammer
 * the count query.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const bundle = await getWebinarBySlug(slug);
  if (!bundle) {
    return NextResponse.json({ error: 'Webinar not found' }, { status: 404 });
  }
  const { seatInfo } = bundle;
  return NextResponse.json(
    {
      slug,
      seatCap: seatInfo.seatCap,
      seatsTaken: seatInfo.seatsTaken,
      seatsLeft: seatInfo.seatsLeft,
      registrationStatus: seatInfo.effectiveStatus,
      formMode: seatInfo.formMode,
    },
    { headers: { 'Cache-Control': 'public, max-age=30' } },
  );
}
