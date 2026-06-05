/**
 * Admin: list team members (admin_profiles) for assignee pickers.
 *
 * Returns a small array of { id, email, display_name, role } — enough
 * to populate a dropdown without exposing auth secrets. RLS would
 * normally hide admin_profiles from a non-admin caller, so we go
 * through the service-role client.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('id, role, full_name, email, user_id, is_active')
    .order('full_name', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // The user_id FK is what we write to lead.assigned_to.
  const team = (data || [])
    .filter((r) => (r as { is_active?: boolean }).is_active !== false)
    .map((row) => {
      const r = row as {
        id: string;
        role: string;
        full_name: string | null;
        email: string | null;
        user_id: string;
      };
      const display = r.full_name || r.email || r.id.slice(0, 8);
      return {
        id: r.id, // admin_profiles.id
        user_id: r.user_id, // auth.users.id — what we save to assigned_to
        email: r.email,
        display_name: display,
        role: r.role,
      };
    });

  return NextResponse.json({ team });
}
