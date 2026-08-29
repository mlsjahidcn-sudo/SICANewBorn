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
        .select('*')
        .eq('student_id', id)
        .order('created_at', { ascending: false }),
      service
        .from('partner_applications')
        .select('*')
        .eq('linked_student_profile_id', id)
        .order('created_at', { ascending: false }),
    ]);

    // Phase 62 (Bug 1): partner_applications uses different field names
    // (university/program/degree/intake) than student_applications
    // (university_slug/program_id/target_degree/target_intake) which the
    // admin UI reads. Map partner rows to the same shape so the UI sees a
    // unified field set without caring about the source.
    const normalizedPartnerApps = (partnerAppsRes.data || []).map((row: Record<string, unknown>) => ({
      ...row,
      surface: 'partner' as const,
      university_slug: (row.university as string | undefined) ?? null,
      program_id: (row.program as string | undefined) ?? null,
      target_degree: (row.degree as string | undefined) ?? null,
      target_intake: (row.intake as string | undefined) ?? null,
      studentName,
    }));

    const studentAppsWithName = (studentAppsRes.data || []).map((row: Record<string, unknown>) => ({
      ...row,
      studentName,
    }));

    const data = [...studentAppsWithName, ...normalizedPartnerApps].sort(
      (a, b) =>
        new Date((b as { created_at?: string }).created_at || 0).getTime() -
        new Date((a as { created_at?: string }).created_at || 0).getTime(),
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
