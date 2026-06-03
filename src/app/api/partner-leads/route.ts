import { NextRequest, NextResponse } from 'next/server';
import { requirePartner } from '@/lib/supabase-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePartner(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    let query = auth.supabase
      .from('partner_leads')
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
    return NextResponse.json({ error: 'Failed to fetch partner leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePartner(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const insert = { ...body, partner_id: auth.partnerId };

    const { data, error } = await auth.supabase
      .from('partner_leads')
      .insert([insert])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] || null);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create partner lead' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requirePartner(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    delete (body as { partner_id?: unknown }).partner_id;

    const { data, error } = await auth.supabase
      .from('partner_leads')
      .update(body)
      .eq('id', id)
      .eq('partner_id', auth.partnerId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Lead not found or not owned by you' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update partner lead' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requirePartner(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await auth.supabase
      .from('partner_leads')
      .delete()
      .eq('id', id)
      .eq('partner_id', auth.partnerId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete partner lead' }, { status: 500 });
  }
}
