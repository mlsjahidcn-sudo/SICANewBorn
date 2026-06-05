import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.supabase
      .from('partner_students')
      .select('*')
      .eq('partner_id', auth.partnerId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch partner students' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    // Force partner_id from the verified session — never trust the body.
    const insert = { ...body, partner_id: auth.partnerId };

    const { data, error } = await auth.supabase
      .from('partner_students')
      .insert([insert])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0] || null);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create partner student' }, { status: 500 });
  }
}
