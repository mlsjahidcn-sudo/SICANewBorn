import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { trackServer } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const MAX_EMAILS = 1000;
const UUID_RE = /^[0-9a-f-]{36}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phase 161: import a Google Meet attendee CSV by email.
 *
 * The ADMIN UI parses the uploaded CSV client-side (small files,
 * no multipart handling needed) and POSTs the deduplicated email
 * list here. The server:
 *   1. loads the webinar's signup rows,
 *   2. matches case-insensitively on email,
 *   3. flips every matched row that isn't already 'Attended' to
 *      'Attended',
 *   4. returns the matched + not-found lists so the UI can show
 *      exactly who was missed (typos, unregistered attendees).
 *
 * Rows already marked 'Attended' count as matched but are not
 * re-written. Per-row lead_history audit rows follow the Phase 143
 * status-flip pattern (best-effort, batched insert).
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: { webinarId?: string; emails?: unknown };
  try {
    body = (await request.json()) as { webinarId?: string; emails?: unknown };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const webinarId = body.webinarId?.trim() ?? '';
  if (!UUID_RE.test(webinarId)) {
    return NextResponse.json({ error: 'webinarId (uuid) is required' }, { status: 400 });
  }

  const emails = Array.isArray(body.emails)
    ? body.emails
        .filter((e): e is string => typeof e === 'string')
        .map((e) => e.trim().toLowerCase())
        .filter((e) => EMAIL_RE.test(e))
    : [];
  if (emails.length === 0) {
    return NextResponse.json({ error: 'No valid emails in the CSV' }, { status: 400 });
  }
  const uniqueEmails = Array.from(new Set(emails)).slice(0, MAX_EMAILS);

  const { data: signups, error } = await auth.supabase
    .from('webinar_signups')
    .select('id, email, status')
    .eq('webinar_session_id', webinarId)
    .limit(1000);
  if (error) {
    console.error('[POST import-attended] lookup failed:', error);
    return NextResponse.json({ error: 'Failed to load signups' }, { status: 500 });
  }

  const emailToId = new Map<string, { id: string; status: string }>();
  for (const row of signups ?? []) {
    emailToId.set((row.email as string).trim().toLowerCase(), {
      id: row.id as string,
      status: row.status as string,
    });
  }

  const matchedIds: string[] = [];
  const notFound: string[] = [];
  for (const email of uniqueEmails) {
    const hit = emailToId.get(email);
    if (hit) matchedIds.push(hit.id);
    else notFound.push(email);
  }

  // Only flip rows that aren't already Attended.
  const toUpdate = (signups ?? []).filter(
    (row) =>
      matchedIds.includes(row.id as string) && (row.status as string) !== 'Attended',
  );

  let updated = 0;
  for (let i = 0; i < toUpdate.length; i += 100) {
    const chunk = toUpdate.slice(i, i + 100);
    const ids = chunk.map((row) => row.id as string);
    const { error: updateError } = await auth.supabase
      .from('webinar_signups')
      .update({ status: 'Attended' })
      .in('id', ids);
    if (updateError) {
      console.error('[POST import-attended] update chunk failed:', updateError);
      // Keep going — a partial import with a reported error beats an
      // all-or-nothing that loses the matched rows.
      continue;
    }
    updated += chunk.length;
  }

  // Best-effort audit rows (Phase 143 pattern) — never fails the import.
  if (toUpdate.length > 0) {
    try {
      await auth.supabase.from('lead_history').insert(
        toUpdate.map((row) => ({
          lead_type: 'webinar_signup' as const,
          lead_id: row.id as string,
          admin_id: auth.user.id,
          action: 'status_changed',
          from_value: row.status as string,
          to_value: 'Attended',
        })),
      );
    } catch (histErr) {
      console.warn('[POST import-attended] lead_history insert failed:', histErr);
    }
  }

  try {
    trackServer('webinar_attendance_imported', {
      locale: 'en',
      webinar_slug: null,
      matched: matchedIds.length,
      not_found: notFound.length,
    });
  } catch {
    // best-effort
  }

  return NextResponse.json({
    matched: matchedIds.length,
    updated,
    notFound,
  });
}
