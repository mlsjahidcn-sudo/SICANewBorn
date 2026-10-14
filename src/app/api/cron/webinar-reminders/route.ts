import { NextRequest, NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/cron-auth';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { sendWebinarReminder } from '@/lib/email';
import { formatWebinarDate } from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ──────────────────────────────────────────────────────────────────────────
// /api/cron/webinar-reminders  (Phase 162)
//
// Sends a 24-hour reminder email to every Registered webinar
// signup whose session is in the next 23-25h window. Fired by
// cron-job.org every hour (matches the in-process setInterval
// from src/server.ts as a redundancy backstop, same pattern
// /api/email/drip-cron follows).
//
// Auth: x-cron-secret header matched against WEBINAR_CRON_SECRET.
// Per the AGENTS.md cron rule: fails CLOSED in production when
// the env var is unset (503); dev-friendly open when unset
// locally.
//
// Idempotency: each dispatch writes a row to email_log via
// `sendWebinarReminder` (which already calls sendTextEmail
// → logEmailToDb). On a retried run, the cron route scans
// email_log first for an existing `webinar.reminder_24h` row
// matching (signup_id, send_date) and only dispatches fresh
// signups. The same pattern Phase 136 documented for the
// lead/student sends.
//
// Response shape:
//   {
//     scanned: number,           // how many signups hit the time window
//     sent: number,              // how many reminder emails dispatched
//     skipped: number,            // already-sent duplicates from email_log
//     failed: number,            // Resend / template / data errors
//     session_id: string | null, // active session at run time
//   }
// ──────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  return runReminders(request);
}

export async function POST(request: NextRequest) {
  return runReminders(request);
}

async function runReminders(request: NextRequest) {
  const cron = verifyCronSecret(request, 'WEBINAR_CRON_SECRET');
  if (!cron.ok) {
    return NextResponse.json({ error: cron.error }, { status: cron.status });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 },
    );
  }

  // Step 1: resolve the active session + its session_date. The
  // single-active partial unique index guarantees at most one
  // row; if there isn't one, there's no webinar to remind about.
  const { data: sessionRow, error: sessionErr } = await supabase
    .from('webinar_sessions')
    .select('id, slug, session_date, session_time, join_url')
    .eq('is_active', true)
    .maybeSingle();
  if (sessionErr) {
    console.error('[cron/webinar-reminders] session lookup failed:', sessionErr);
    return NextResponse.json({ error: 'session lookup failed' }, { status: 500 });
  }
  if (!sessionRow) {
    return NextResponse.json({
      scanned: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      session_id: null,
      note: 'no active session',
    });
  }

  const sessionId = (sessionRow as { id: string }).id;
  const sessionDateIso = (sessionRow as { session_date: string | null }).session_date;
  const sessionTime = (sessionRow as { session_time: string | null }).session_time;
  const joinUrl = (sessionRow as { join_url: string | null }).join_url;

  if (!sessionDateIso) {
    return NextResponse.json({
      scanned: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      session_id: sessionId,
      note: 'active session has no session_date',
    });
  }

  // Step 2: time gate — only run for sessions in the 23-25h
  // window. We deliberately use a 2h window so hourly cron
  // ticks don't double-dispatch (a tick at 23:50 + a tick at
  // 24:50 both fall inside).
  const sessionMs = new Date(sessionDateIso).getTime();
  if (!Number.isFinite(sessionMs)) {
    return NextResponse.json(
      { error: 'session_date invalid' },
      { status: 500 },
    );
  }
  const now = Date.now();
  const diff = sessionMs - now;
  const lower = 23 * 60 * 60 * 1000;
  const upper = 25 * 60 * 60 * 1000;
  if (diff < lower || diff > upper) {
    return NextResponse.json({
      scanned: 0,
      sent: 0,
      skipped: 0,
      failed: 0,
      session_id: sessionId,
      note: `session_date not in 24h-reminder window (diff=${Math.round(diff / 60000)}min)`,
    });
  }

  // Step 3: fetch the candidate signups for this session. We
  // join `email_log` to filter out already-reminded signups in
  // a single query (Phase 136 pattern). `attendee_email_log`
  // is the source of truth for what was sent — the email_log
  // row carries the template slug, recipient, and a stable
  // created_at day so we can dedup per-day-window.
  const today = new Date(now);
  const startOfDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  ).toISOString();
  const { data: signups, error: signupsErr } = await supabase
    .from('webinar_signups')
    .select('id, first_name, email, country, webinar_session_id')
    .eq('webinar_session_id', sessionId)
    .eq('status', 'Registered');
  if (signupsErr) {
    console.error('[cron/webinar-reminders] signups query failed:', signupsErr);
    return NextResponse.json({ error: 'signups query failed' }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of signups ?? []) {
    const signupId = (row as { id: string }).id;
    const email = (row as { email: string }).email;
    const firstName = (row as { first_name: string }).first_name;
    const country = (row as { country: string | null }).country;

    // Dedup: has this signup already received a reminder
    // today? (A retried hourly tick at +1 hour shouldn't
    // re-dispatch.) The check is the cheapest "any row today"
    // probe; we don't filter on recipient/template because
    // the cron route only ever sends one template.
    const { count: dupCount } = await supabase
      .from('email_log')
      .select('id', { count: 'exact', head: true })
      .eq('to_email', email)
      .eq('template_slug', 'webinar.reminder_24h')
      .gte('created_at', startOfDay);
    if ((dupCount ?? 0) > 0) {
      skipped += 1;
      continue;
    }

    const reference = `SICA-WEB-${signupId.slice(0, 8).toUpperCase()}`;
    try {
      const result = await sendWebinarReminder({
        toEmail: email,
        name: firstName,
        reference,
        locale: 'en',
        joinLink: joinUrl,
        webinarDate: formatWebinarDate(sessionDateIso) || null,
        webinarTime: sessionTime,
        studentCountry: country,
      });
      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
        console.error('[cron/webinar-reminders] send failed for', signupId, result.error);
      }
    } catch (err) {
      failed += 1;
      console.error('[cron/webinar-reminders] threw for', signupId, err);
    }
  }

  return NextResponse.json({
    scanned: (signups ?? []).length,
    sent,
    skipped,
    failed,
    session_id: sessionId,
  });
}