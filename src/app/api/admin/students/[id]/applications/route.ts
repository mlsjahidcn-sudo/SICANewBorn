import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { deriveStudentFullName } from '@/lib/application-mapper';

/**
 * GET /api/admin/students/[id]/applications
 *
 * Returns all applications for a single student. Used by the
 * Applications tab in /admin/students/[id].
 *
 * Auth: any admin (requireAdmin). Service-role client.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  }

  try {
    const service = buildServiceClient();

    // Phase 77: pull the parent student once so we can attach a
    // human-readable studentName to each row. The route returns one
    // student's apps, so the parent context is always available.
    const studentRes = await service
      .from('student_profiles')
      .select('id, first_name, last_name, email')
      .eq('id', id)
      .maybeSingle();

    const studentName = deriveStudentFullName(
      (studentRes.data as { first_name?: string | null; last_name?: string | null; email?: string | null } | null) ?? {},
    );

    // Fetch both student applications and partner applications that are linked
    // to this student profile via the Phase A bridge column.
    const [studentAppsRes, partnerAppsRes] = await Promise.all([
      service
        .from('student_applications')
        .select('id, application_number, status, university_name, program_name, degree, intake, created_at')
        .eq('student_id', id)
        .is('archived_at', null)
        .order('created_at', { ascending: false }),
      service
        .from('partner_applications')
        .select('id, application_number, status, university, program, degree, intake, created_at')
        .eq('linked_student_profile_id', id)
        .is('archived_at', null)
        .order('created_at', { ascending: false }),
    ]);

    // Both surfaces return the same explicit display fields. Database column
    // names differ, so never pass raw rows through to the detail page.
    const normalizedPartnerApps = (partnerAppsRes.data || []).map((row: Record<string, unknown>) => ({
      id: row.id, applicationNumber: row.application_number, status: row.status,
      university: row.university, program: row.program, degree: row.degree,
      intake: row.intake, createdAt: row.created_at, surface: 'partner' as const,
      studentName,
    }));
    const studentAppsWithName = (studentAppsRes.data || []).map((row: Record<string, unknown>) => ({
      id: row.id, applicationNumber: row.application_number, status: row.status,
      university: row.university_name, program: row.program_name, degree: row.degree,
      intake: row.intake, createdAt: row.created_at, surface: 'student' as const,
      studentName,
    }));

    const data = [...studentAppsWithName, ...normalizedPartnerApps].sort(
      (a, b) =>
        new Date(String(b.createdAt || '')).getTime() -
        new Date(String(a.createdAt || '')).getTime(),
    );
    const error = studentAppsRes.error || partnerAppsRes.error || studentRes.error;

    if (error) {
      console.error('[admin/students/:id/applications GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/:id/applications GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
