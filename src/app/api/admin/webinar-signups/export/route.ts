import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  buildWebinarReport,
  parseWebinarIds,
} from '@/lib/webinar-report-server';
import { webinarCsv } from '@/lib/webinar-report';
import { ReportInputError } from '@/lib/admin-reporting';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const params = new URL(request.url).searchParams;
    const ids = params.has('ids')
      ? new Set(parseWebinarIds(params.get('ids')?.split(',')))
      : null;
    const { matching, report } = await buildWebinarReport(
      auth.supabase,
      params,
    );
    const rows = ids ? matching.filter((row) => ids.has(row.id)) : matching;
    return new NextResponse(webinarCsv(rows, report.range.timezone), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sica-webinar-${report.range.from}-${report.range.to}.csv"`,
        'Cache-Control': 'no-store',
        'X-Row-Count': String(rows.length),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ReportInputError
            ? error.message
            : 'Export is unavailable. Please retry.',
      },
      { status: error instanceof ReportInputError ? 400 : 503 },
    );
  }
}
