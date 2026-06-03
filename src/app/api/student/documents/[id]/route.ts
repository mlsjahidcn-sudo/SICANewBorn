import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/supabase-auth';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const { data: document, error } = await supabase
      .from('student_documents')
      .select('*')
      .eq('id', params.id)
      .eq('student_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('[Student Document GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const body = await request.json();
    const { id, created_at, uploaded_at, verified_at, ...updates } = body;

    const { data: document, error } = await supabase
      .from('student_documents')
      .update(updates)
      .eq('id', params.id)
      .eq('student_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('[Student Document PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const { error } = await supabase
      .from('student_documents')
      .delete()
      .eq('id', params.id)
      .eq('student_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Student Document DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
