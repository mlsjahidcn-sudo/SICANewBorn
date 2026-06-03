import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/supabase-auth';

export async function GET(request: Request) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const { data: profile, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('[Student Profile GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, created_at, updated_at, ...updates } = body;

    const { data: profile, error } = await supabase
      .from('student_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('[Student Profile PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
