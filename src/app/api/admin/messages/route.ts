import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export interface AdminMessageInboxRow {
  surface: 'student' | 'partner';
  applicationId: string;
  applicationNumber: string | null;
  personName: string;
  partnerName: string | null;
  university: string | null;
  program: string | null;
  lastBody: string;
  lastSenderRole: 'admin' | 'student' | 'partner';
  lastAt: string;
  unreadCount: number;
  oldestUnreadAt: string | null;
}

interface RawInboxRow {
  surface: string;
  application_id: string;
  application_number: string | null;
  person_name: string | null;
  partner_name: string | null;
  university: string | null;
  program: string | null;
  last_body: string | null;
  last_sender_role: string;
  last_at: string;
  unread_count: number | string;
  oldest_unread_at: string | null;
  total_count: number | string;
}

/**
 * GET /api/admin/messages?filter=waiting|all&page=&limit=
 * One row per conversation; conversations waiting for a SICA reply first,
 * oldest-waiting first.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Messaging is not configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const onlyUnread = url.searchParams.get('filter') !== 'all';
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 25));
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);

  const service = buildServiceClient();
  const { data, error } = await service.rpc('admin_message_inbox', {
    p_only_unread: onlyUnread,
    p_limit: limit,
    p_offset: (page - 1) * limit,
  });
  if (error) {
    console.error('[admin/messages] inbox failed:', error.message);
    return NextResponse.json({ error: 'Could not load messages' }, { status: 500 });
  }

  const raw = (data ?? []) as RawInboxRow[];
  const total = raw.length > 0 ? Number(raw[0].total_count) : 0;
  const conversations: AdminMessageInboxRow[] = raw.map((r) => ({
    surface: r.surface === 'partner' ? 'partner' : 'student',
    applicationId: r.application_id,
    applicationNumber: r.application_number,
    personName: r.person_name ?? '',
    partnerName: r.partner_name,
    university: r.university,
    program: r.program,
    lastBody: r.last_body ?? '',
    lastSenderRole:
      r.last_sender_role === 'student' || r.last_sender_role === 'partner' ? r.last_sender_role : 'admin',
    lastAt: r.last_at,
    unreadCount: Number(r.unread_count) || 0,
    oldestUnreadAt: r.oldest_unread_at,
  }));

  return NextResponse.json({
    conversations,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
}
