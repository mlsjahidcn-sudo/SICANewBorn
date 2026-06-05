import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
  parsePartnerApplicationStatus,
  isPartnerStatusTransitionAllowed,
  PARTNER_STATUS_TRANSITIONS,
} from '@/lib/partner-application-mapper';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    let q = auth.supabase
      .from('partner_applications')
      .select('*')
      .eq('id', id);
    if (auth.role === 'member') {
      q = q.eq('created_by_user_id', auth.user.id);
    }
    const { data, error } = await q.maybeSingle();

    if (error) {
      console.error('[partner/applications/:id GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application: mapPartnerApplicationFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const body = await request.json();

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
    delete (updates as Record<string, unknown>).partner_id;
    delete (updates as Record<string, unknown>).id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    // Phase 4 (security hardening): if the PATCH is changing `status`,
    // fetch the current row first and validate the transition against
    // PARTNER_STATUS_TRANSITIONS. The UI's allow-list used to be the
    // only gate — a raw PATCH could skip the pipeline. The same
    // current-row fetch also lets us auto-stamp `submitted_at` on
    // the first transition to Submitted (or any Submitted-ish state).
    if (typeof updates.status === 'string') {
      let fetchQ = auth.supabase
        .from('partner_applications')
        .select('status, submitted_at')
        .eq('id', id);
      if (auth.role === 'member') {
        fetchQ = fetchQ.eq('created_by_user_id', auth.user.id);
      }
      const { data: current, error: fetchError } = await fetchQ.maybeSingle();
      if (fetchError) {
        console.error('[partner/applications/:id PATCH] current fetch error:', fetchError);
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }
      if (!current) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      const currentStatus = parsePartnerApplicationStatus(current.status) || 'Draft';
      const nextStatus = updates.status as string;
      if (!isPartnerStatusTransitionAllowed(currentStatus, nextStatus as Parameters<typeof isPartnerStatusTransitionAllowed>[1])) {
        return NextResponse.json(
          {
            error: `Cannot move from ${currentStatus} to ${nextStatus} as a partner. Allowed next states: ${(PARTNER_STATUS_TRANSITIONS[currentStatus] || []).join(', ')}.`,
          },
          { status: 400 },
        );
      }
      // No-op transition (e.g. Draft → Draft from a stray click) —
      // don't update the row, just return the current state. Other
      // field changes in the same PATCH ARE still applied because
      // we only short-circuit on the status flip.
      if (nextStatus === currentStatus && !('submitted_at' in updates)) {
        const freshQ = auth.supabase
          .from('partner_applications')
          .select('*')
          .eq('id', id);
        if (auth.role === 'member') {
          freshQ.eq('created_by_user_id', auth.user.id);
        }
        const { data: fresh } = await freshQ.maybeSingle();
        return NextResponse.json({
          application: fresh
            ? mapPartnerApplicationFromDb(fresh as Parameters<typeof mapPartnerApplicationFromDb>[0])
            : mapPartnerApplicationFromDb(current as Parameters<typeof mapPartnerApplicationFromDb>[0]),
        });
      }
      // Auto-stamp submittedAt on the first move to Submitted /
      // In Review. The mapper writes any caller-supplied
      // submitted_at first, so explicit values always win.
      if (
        (nextStatus === 'Submitted' || nextStatus === 'In Review') &&
        !updates.submitted_at &&
        !current.submitted_at
      ) {
        updates.submitted_at = new Date().toISOString();
      }
    }

    let q = auth.supabase
      .from('partner_applications')
      .update(updates)
      .eq('id', id);
    if (auth.role === 'member') {
      q = q.eq('created_by_user_id', auth.user.id);
    }
    const { data, error } = await q.select('*').maybeSingle();

    if (error) {
      console.error('[partner/applications/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application: mapPartnerApplicationFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    let delQ = auth.supabase
      .from('partner_applications')
      .delete({ count: 'exact' })
      .eq('id', id);
    if (auth.role === 'member') {
      delQ = delQ.eq('created_by_user_id', auth.user.id);
    }
    const { error, count } = await delQ;

    if (error) {
      console.error('[partner/applications/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!count) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
