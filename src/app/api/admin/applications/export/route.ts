import { escapeApplicationCsv } from '@/lib/application-csv';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';
import { loadAdminApplications, filterAdminApplications, ApplicationQueryError } from '@/lib/admin-application-query';
export const dynamic = 'force-dynamic';
const MAX_ROWS = 1000;
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const params = new URL(request.url).searchParams;
    const matching = filterAdminApplications(await loadAdminApplications(buildServiceClient()), params);
    const rows = matching.slice(0, MAX_ROWS);
    const header = ['Application #','Surface','Student Name','Student Email','Student Phone','Nationality','Passport Number','Date of Birth','University','Program','Degree','Intake','Status','Decision','Priority','Source','Submitted At','Created At','Updated At','Student-visible Message'];
    const csv = [header, ...rows.map(r => [r.applicationNumber,r.surface,r.studentName,r.studentEmail,r.studentPhone,r.nationality,r.studentPassportNumber,r.dateOfBirth,r.university,r.program,r.degree,r.intake,r.status,r.decision,r.priority,r.source,r.submittedAt,r.createdAt,r.updatedAt,r.adminNotes])].map(r => r.map(escapeApplicationCsv).join(',')).join('\r\n');
    return new NextResponse(`\uFEFF${csv}`, { headers: {
      'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Disposition': `attachment; filename="sica-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
      'X-Row-Count': String(rows.length), 'X-Matching-Count': String(matching.length), 'X-Max-Rows': String(MAX_ROWS), 'X-Truncated': String(matching.length > MAX_ROWS),
    } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Export failed' }, { status: error instanceof ApplicationQueryError ? 400 : 500 });
  }
}
