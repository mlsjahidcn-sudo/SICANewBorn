import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  mapPartnerStudentFromDb,
  parsePartnerStudentStatus,
  PARTNER_STUDENT_STATUSES,
} from '@/lib/partner-student-mapper';

/**
 * GET    /api/admin/partner-students/[id] — admin detail view
 * PATCH  /api/admin/partner-students/[id] — update notes/status/archive
 *
 * Auth: any admin or super_admin. Uses service-role client.
 */
export const dynamic = 'force-dynamic';

async function getStudentDetail(service: ReturnType<typeof buildServiceClient>, id: string) {
  const { data, error } = await service
    .from('partner_students')
    .select(
      `*,
      partner:partners!partner_id (id, company_name, email, contact_person, phone, country),
      application_count:partner_applications!id(count),
      document_count:student_documents!id(count)`,
    )
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const partner = data.partner as Record<string, unknown> | undefined;
  const appCount = Array.isArray(data.application_count)
    ? data.application_count[0]?.count
    : (data.application_count as { count?: number } | undefined)?.count;
  const docCount = Array.isArray(data.document_count)
    ? data.document_count[0]?.count
    : (data.document_count as { count?: number } | undefined)?.count;

  return mapPartnerStudentFromDb({
    ...data,
    partner_name: (partner?.company_name as string) || null,
    application_count: typeof appCount === 'number' ? appCount : 0,
    document_count: typeof docCount === 'number' ? docCount : 0,
  } as Parameters<typeof mapPartnerStudentFromDb>[0]);
}

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
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const service = buildServiceClient();
    const student = await getStudentDetail(service, id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ student });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-students/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
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
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const service = buildServiceClient();

    const updates: Record<string, unknown> = {};

    if (body.notes !== undefined) updates.notes = body.notes || null;
    if (body.status !== undefined) {
      const status = parsePartnerStudentStatus(body.status);
      if (!status) {
        return NextResponse.json(
          { error: `status must be one of ${PARTNER_STUDENT_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
      updates.status = status;
    }
    if (body.archived !== undefined) {
      updates.archived_at = body.archived ? new Date().toISOString() : null;
      updates.archived_by_user_id = body.archived ? auth.user.id : null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { error: updateError } = await service
      .from('partner_students')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      console.error('[admin/partner-students/:id PATCH] supabase error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const student = await getStudentDetail(service, id);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    return NextResponse.json({ student });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-students/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
