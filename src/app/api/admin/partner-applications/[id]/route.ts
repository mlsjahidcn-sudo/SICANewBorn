import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
  parsePartnerApplicationStatus,
} from '@/lib/partner-application-mapper';

/**
 * GET   /api/admin/partner-applications/[id] — admin view of a single row
 * PATCH /api/admin/partner-applications/[id] — admin can change status,
 *                                                decision, submitted_at,
 *                                                priority, notes, etc.
 *
 * S27: this is the *only* API path that lets the admin advance a
 * partner's application through the workflow. The partner's own
 * PATCH endpoint rejects status / decision / submitted_at with
 * 403, so the only way those fields get changed is through here.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }
  const auth = await requireAdmin(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  try {
    const service = buildServiceClient();
    const { data, error } = await service
      .from('partner_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Hydrate created_by_email
    const createdBy = (data as { created_by_user_id?: string | null })
      .created_by_user_id;
    let createdByEmail: string | null = null;
    if (createdBy) {
      const { data: u } = await service.auth.admin.getUserById(createdBy);
      createdByEmail = u?.user?.email || null;
    }
    return NextResponse.json({
      application: mapPartnerApplicationFromDb({
        ...(data as Record<string, unknown>),
        created_by_email: createdByEmail,
      } as Parameters<typeof mapPartnerApplicationFromDb>[0]),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-applications/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
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

    // S27: the admin can write any field. The mapper validates the
    // closed-set enums (gender, marital, education, etc.) and throws
    // a 400 on invalid values. status / decision are also validated
    // below so we can give a clearer error than the mapper's
    // generic Invalid field value.
    if (body.status !== undefined && !parsePartnerApplicationStatus(body.status)) {
      return NextResponse.json(
        {
          error:
            "status must be 'Draft' | 'Submitted' | 'In Review' | 'Accepted' | 'Rejected' | 'Withdrawn'",
        },
        { status: 400 },
      );
    }

    let updates: Record<string, unknown>;
    try {
      updates = mapPartnerApplicationToDb(body);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Invalid field value' },
        { status: 400 },
      );
    }

    // The admin's PATCH must not let them swap the row to a different
    // partner or change the creator.
    delete (updates as Record<string, unknown>).partner_id;
    delete (updates as Record<string, unknown>).created_by_user_id;
    delete (updates as Record<string, unknown>).id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('partner_applications')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[admin/partner-applications/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    return NextResponse.json({ application: mapPartnerApplicationFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-applications/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
