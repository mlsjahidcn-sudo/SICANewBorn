import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/supabase-auth';
import { computeBasicProfileCompletion } from '@/lib/student-profile-completion';

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

    // Phase 94: server-computed basic-profile completion — the same
    // helper the dashboard banner and the profile-page meter use, so
    // all three surfaces agree on what's missing.
    const completion = computeBasicProfileCompletion(profile);

    return NextResponse.json({ data: profile, completion });
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

    // Only allow students to update their own profile fields. Guardrails:
    //   - id/email/status/source/user_id are admin/auth-managed.
    //   - created_at/updated_at are DB-managed.
    const allowedKeys = new Set([
      'first_name',
      'last_name',
      'phone',
      'nationality',
      'date_of_birth',
      'passport_number',
      'passport_expiry',
      'current_address',
      'permanent_address',
      'highest_education',
      'school_name',
      'graduation_year',
      'gpa',
      'english_proficiency',
      'english_score',
      'target_degree',
      'target_field',
      'target_intake',
      'preferred_universities',
    ]);

    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.has(key)) {
        updates[key] = value;
      }
    }

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
