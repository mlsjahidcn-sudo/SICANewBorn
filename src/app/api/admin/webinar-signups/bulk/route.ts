import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  parseWebinarIds,
  updateWebinarStatus,
} from '@/lib/webinar-report-server';
import { isWebinarStatus } from '@/lib/webinar-report';
import { ReportInputError } from '@/lib/admin-reporting';
export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object')
      throw new ReportInputError('Invalid request.');
    const input = body as Record<string, unknown>;
    const ids = parseWebinarIds(input.ids);
    if (!isWebinarStatus(input.status))
      throw new ReportInputError('Invalid registration status.');
    const status = input.status;
    const failed: { id: string; error: string }[] = [];
    let updated = 0;
    for (let offset = 0; offset < ids.length; offset += 5) {
      await Promise.all(
        ids.slice(offset, offset + 5).map(async (id) => {
          try {
            await updateWebinarStatus(auth.supabase, id, status, auth.user.id);
            updated++;
          } catch (error) {
            failed.push({
              id,
              error: error instanceof Error ? error.message : 'Update failed.',
            });
          }
        }),
      );
    }
    return NextResponse.json({ updated, failed });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ReportInputError
            ? error.message
            : 'Could not update registrations.',
      },
      {
        status:
          error instanceof ReportInputError || error instanceof SyntaxError
            ? 400
            : 503,
      },
    );
  }
}
