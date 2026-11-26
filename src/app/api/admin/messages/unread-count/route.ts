import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/** GET → `{ unreadCount }`: student/partner messages no admin has read yet (sidebar badge). */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!getServerEnv().serviceKey) return NextResponse.json({ unreadCount: 0 });

  const { count, error } = await buildServiceClient()
    .from('application_messages')
    .select('id', { count: 'exact', head: true })
    .neq('sender_role', 'admin')
    .is('read_at', null);
  if (error) {
    // Table missing before the migration is applied → just show no badge.
    return NextResponse.json({ unreadCount: 0 });
  }
  return NextResponse.json({ unreadCount: count ?? 0 });
}
