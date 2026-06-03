import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * Admin: update a student_assessment row.
 * Body: { status?, reviewer_notes?, reviewer_id? }
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.status === 'string') {
    const valid = ['New', 'Reviewing', 'Completed', 'Rejected'];
    if (!valid.includes(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${valid.join(', ')}` },
        { status: 400 },
      );
    }
    updates.status = body.status;
  }
  if (typeof body.reviewer_notes === 'string') updates.reviewer_notes = body.reviewer_notes;
  if (typeof body.reviewer_id === 'string') updates.reviewer_id = body.reviewer_id;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('student_assessments')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ assessment: data });
}
