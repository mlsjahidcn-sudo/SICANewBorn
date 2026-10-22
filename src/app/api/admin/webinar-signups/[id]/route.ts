import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  parseWebinarIds,
  updateWebinarStatus,
} from '@/lib/webinar-report-server';
import { isWebinarStatus } from '@/lib/webinar-report';
import { ReportInputError } from '@/lib/admin-reporting';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ id: string }> };
export async function GET(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    parseWebinarIds([id]);
    const { data, error } = await auth.supabase
      .from('lead_history')
      .select('id,action,from_value,to_value,note,created_at')
      .eq('lead_type', 'webinar_signup')
      .eq('lead_id', id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error('History unavailable.');
    return NextResponse.json({ history: data || [] });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof ReportInputError
            ? error.message
            : 'History is unavailable.',
      },
      { status: error instanceof ReportInputError ? 400 : 503 },
    );
  }
}
export async function PATCH(
  request: NextRequest,
  context: Context,
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const { id } = await context.params;
    parseWebinarIds([id]);
    const body: unknown = await request.json();
    const status =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>).status
        : null;
    if (!isWebinarStatus(status))
      throw new ReportInputError('Invalid registration status.');
    await updateWebinarStatus(auth.supabase, id, status, auth.user.id);
    return NextResponse.json({ id, status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Update unavailable.' },
      {
        status:
          error instanceof ReportInputError || error instanceof SyntaxError
            ? 400
            : 503,
      },
    );
  }
}
