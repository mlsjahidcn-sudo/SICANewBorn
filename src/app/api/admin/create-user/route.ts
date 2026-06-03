import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * Create a new admin or partner user.
 *
 * Was: anyone could hit this endpoint and create users via service-role admin
 * API. Now: only authenticated admins can do so.
 *
 * Body: { email, password, fullName, role? ('admin' | 'super_admin' | 'partner') }
 *
 * If role === 'partner', the user is created and a `partners` row is also
 * inserted (so the new partner can immediately call partner APIs).
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      {
        error:
          'Supabase is not configured. Please set COZE_SUPABASE_URL and COZE_SUPABASE_SERVICE_ROLE_KEY environment variables.',
      },
      { status: 503 },
    );
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { email, password, fullName, role = 'admin' } = body as {
      email?: string;
      password?: string;
      fullName?: string;
      role?: 'admin' | 'super_admin' | 'partner';
    };

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and fullName are required.' },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 },
      );
    }
    if (!['admin', 'super_admin', 'partner'].includes(role)) {
      return NextResponse.json(
        { error: 'role must be one of admin | super_admin | partner' },
        { status: 400 },
      );
    }

    const service = buildServiceClient();

    // 1. Create the auth user (service-role admin API)
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    const userId = authData.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
    }

    // 2. Insert the role-specific profile row
    if (role === 'partner') {
      const { error: profileError } = await service.from('partners').insert({
        user_id: userId,
        email,
        company_name: fullName, // fallback; admin can update later
        contact_person: fullName,
        status: 'Active',
      });
      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    } else {
      const { error: profileError } = await service.from('admin_profiles').insert({
        user_id: userId,
        email,
        full_name: fullName,
        role,
      });
      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        message: `${role} user created successfully.`,
        user: { id: userId, email, fullName, role },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
