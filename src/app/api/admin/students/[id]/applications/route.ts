import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

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

    const data = [...(studentAppsRes.data || []), ...(partnerAppsRes.data || [])].sort(
      (a, b) =>
        new Date((b as { created_at?: string }).created_at || 0).getTime() -
        new Date((a as { created_at?: string }).created_at || 0).getTime(),
    );
    const error = studentAppsRes.error || partnerAppsRes.error;


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
