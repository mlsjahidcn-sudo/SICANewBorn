import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

/**
 * Return the calling admin's own profile.
 * (Was: a hard-coded "first admin" lookup with no caller check — anyone could
 * fetch the admin list.)
 */
export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.supabase
      .from('admin_profiles')
      .select('full_name, email, role')
      .eq('user_id', auth.user.id)
      .single();

    if (error) {
      return NextResponse.json({ profile: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
