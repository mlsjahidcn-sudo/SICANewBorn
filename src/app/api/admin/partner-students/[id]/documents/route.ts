import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/admin/partner-students/[id]/documents
 *
 * Returns all partner-uploaded documents for a single partner student.
 * Auth: any admin. Service-role client.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
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
    const { data, error } = await service
      .from('student_documents')
      .select('id, name, category, file_name, status, uploaded_at')
      .eq('partner_student_id', id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('[admin/partner-students/:id/documents GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ documents: data || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-students/:id/documents GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
