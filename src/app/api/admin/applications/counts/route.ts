import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';
import { loadAdminApplications, filterAdminApplications, ApplicationQueryError } from '@/lib/admin-application-query';
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const rows = filterAdminApplications(await loadAdminApplications(buildServiceClient()), new URL(request.url).searchParams);
    const byStatus: Record<string, number> = {}; const byPriority: Record<string, number> = {}; const byDecision: Record<string, number> = {};
    for (const row of rows) {
      byStatus[row.status] = (byStatus[row.status] || 0) + 1;
      const priority = row.priority || 'Normal'; byPriority[priority] = (byPriority[priority] || 0) + 1;
      const decision = row.decision || 'None'; byDecision[decision] = (byDecision[decision] || 0) + 1;
    }
    return NextResponse.json({ total: rows.length, online: rows.filter(r => r.source === 'Online').length,
      partner: rows.filter(r => r.source === 'Partner' || r.surface === 'partner').length,
      partnerCrm: rows.filter(r => r.surface === 'partner').length, offline: rows.filter(r => r.source === 'Admin').length,
      submitted: byStatus.Submitted || 0, inReview: (byStatus['Under Review'] || 0) + (byStatus['In Review'] || 0),
      urgent: (byPriority.Urgent || 0) + (byPriority.High || 0), enrolled: rows.filter(r => r.enrolledAt).length,
      byStatus, byPriority, byDecision, perStatusCapped: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Counts unavailable' }, { status: error instanceof ApplicationQueryError ? 400 : 500 });
  }
}
