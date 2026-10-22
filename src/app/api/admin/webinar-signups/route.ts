import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { buildWebinarReport } from '@/lib/webinar-report-server';
import { ReportInputError } from '@/lib/admin-reporting';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { report } = await buildWebinarReport(
      auth.supabase,
      new URL(request.url).searchParams,
    );
    return NextResponse.json(report);
  } catch (error) {
    console.error('[webinar report]', error);
    return NextResponse.json(
      {
        error:
          error instanceof ReportInputError
            ? error.message
            : 'Registration report is unavailable. Please retry.',
      },
      { status: error instanceof ReportInputError ? 400 : 503 },
    );
  }
}
