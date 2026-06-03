import { NextRequest, NextResponse } from 'next/server';
import { requirePartner } from '@/lib/supabase-auth';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
  parsePartnerApplicationStatus,
} from '@/lib/partner-application-mapper';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const { data, error } = await auth.supabase
      .from('partner_applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

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
  const auth = await requirePartner(request);
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

    const updates = mapPartnerApplicationToDb(body);
    delete (updates as Record<string, unknown>).partner_id;
    delete (updates as Record<string, unknown>).id;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from('partner_applications')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

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
  const auth = await requirePartner(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const { error, count } = await auth.supabase
      .from('partner_applications')
      .delete({ count: 'exact' })
      .eq('id', id);

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
