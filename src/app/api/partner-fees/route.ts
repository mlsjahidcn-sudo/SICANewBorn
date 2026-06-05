import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    let query = auth.supabase
      .from('partner_fees')
      .select('*')
      .eq('partner_id', auth.partnerId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partner fees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const insert = { ...body, partner_id: auth.partnerId };

    const { data, error } = await auth.supabase
      .from('partner_fees')
      .insert([insert])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] || null);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create partner fee' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    // Strip partner_id from the body to prevent reassignment.
    delete (body as { partner_id?: unknown }).partner_id;

    const { data, error } = await auth.supabase
      .from('partner_fees')
      .update(body)
      .eq('id', id)
      .eq('partner_id', auth.partnerId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Fee not found or not owned by you' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update partner fee' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await auth.supabase
      .from('partner_fees')
      .delete()
      .eq('id', id)
      .eq('partner_id', auth.partnerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete partner fee' }, { status: 500 });
  }
}
