import { NextRequest, NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/cron-auth';
import { buildServiceClient } from '@/lib/supabase-auth';
import { sendWebinarReminder } from '@/lib/email';
import { trackServer } from '@/lib/analytics';
import { formatWebinarDate } from '@/lib/webinar-sessions';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Phase 161: POST /api/cron/webinar-reminders
 *
 * Sends the 24h + 1h reminder emails for every upcoming webinar
 * (webinar_sessions with session_date in the future and status
 * Scheduled/Live). Exactly-once per recipient is enforced by the
 * reminder_24h_sent_at / reminder_1h_sent_at flags on
 * webinar_signups — the flag is stamped only after a successful
 * send, so a transient failure retries on the next cron tick.
 *
 * Eligibility windows (cron runs every 10–15 min):
 *   24h flag: starts_at − 24h ≤ now < starts_at
 *   1h  flag: starts_at −  1h ≤ now < starts_at
 * A cron outage that spans a whole window skips that reminder —
 * the run log below shows it so staff can hand-send.
 *
 * Recipients = seat holders (status Registered/Attended) linked to
 * the session. The reminder carries the session's join_url.
 *
 * Auth: `x-cron-secret` matched against WEBINAR_CRON_SECRET
 * (fails CLOSED in production when unset — same contract as the
 * other three cron endpoints). Schedule every 10–15 min via
 * cron-job.org.
 */
interface ReminderRunSummary {
  webinarSlug: string;
  sent24h: number;
  sent1h: number;
  failed: number;
}

export async function POST(request: NextRequest) {
  return runReminderCron(request);
}

export async function GET(request: NextRequest) {
  return runReminderCron(request);
}

async function runReminderCron(request: NextRequest) {
  const cron = verifyCronSecret(request, 'WEBINAR_CRON_SECRET');
  if (!cron.ok) {
    return NextResponse.json({ error: cron.error }, { status: cron.status });
  }

  const service = buildServiceClient();
  const now = new Date();
  const in24hWindowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Upcoming webinars starting within the next 24h — covers both the
  // 24h and the 1h reminder windows (1h-before is inside 24h-before).
  const { data: sessions, error: sessionErr } = await service
    .from('webinar_sessions')
    .select('id, slug, session_date, session_time, join_url, title_en, status')
    .in('status', ['Scheduled', 'Live'])
    .not('session_date', 'is', null)
    .gte('session_date', now.toISOString())
    .lte('session_date', in24hWindowEnd.toISOString());
  if (sessionErr) {
    return NextResponse.json({ error: sessionErr.message }, { status: 500 });
  }

  const runs: ReminderRunSummary[] = [];

  for (const session of sessions ?? []) {
    const startsAt = new Date(session.session_date as string);
    const summary: ReminderRunSummary = {
      webinarSlug: session.slug as string,
      sent24h: 0,
      sent1h: 0,
      failed: 0,
    };

    const within24hWindow = startsAt.getTime() - now.getTime() <= 24 * 60 * 60 * 1000;
    const within1hWindow = startsAt.getTime() - now.getTime() <= 60 * 60 * 1000;

    if (within24hWindow) {
      const { rows, sent } = await sendRemindersForFlag(service, session, {
        flagColumn: 'reminder_24h_sent_at',
        kind: '24h',
      });
      summary.sent24h = sent;
      summary.failed += rows - sent;
    }
    if (within1hWindow) {
      const { rows, sent } = await sendRemindersForFlag(service, session, {
        flagColumn: 'reminder_1h_sent_at',
        kind: '1h',
      });
      summary.sent1h = sent;
      summary.failed += rows - sent;
    }

    if (summary.sent24h + summary.sent1h > 0) {
      runs.push(summary);
    }
  }

  const totalSent = runs.reduce((acc, r) => acc + r.sent24h + r.sent1h, 0);
  try {
    trackServer('webinar_reminders_sent', { locale: 'en', count: totalSent });
  } catch {
    // Analytics is best-effort — the sends already happened.
  }

  return NextResponse.json({
    ok: true,
    webinarsScanned: sessions?.length ?? 0,
    totalSent,
    runs,
    ranAt: now.toISOString(),
  });
}

/**
 * Fetch un-flagged seat holders for one reminder kind, send, stamp.
 * Returns how many rows were attempted vs successfully sent+stamped.
 */
async function sendRemindersForFlag(
  service: ReturnType<typeof buildServiceClient>,
  session: Record<string, unknown>,
  opts: { flagColumn: 'reminder_24h_sent_at' | 'reminder_1h_sent_at'; kind: '24h' | '1h' },
): Promise<{ rows: number; sent: number }> {
  const { data: recipients, error } = await service
    .from('webinar_signups')
    .select('id, first_name, email, country')
    .eq('webinar_session_id', session.id as string)
    .in('status', ['Registered', 'Attended'])
    .is(opts.flagColumn, null)
    .limit(500);
  if (error || !recipients) {
    console.error('[cron/webinar-reminders] recipient query failed:', error);
    return { rows: 0, sent: 0 };
  }

  const dateLabel = formatWebinarDate((session.session_date as string) ?? null) || 'See invite';
  const timeLabel = (session.session_time as string | null) ?? 'See invite';
  const title = (session.title_en as string) ?? 'SICA Webinar';
  let sent = 0;

  for (const row of recipients) {
    const result = await sendWebinarReminder({
      toEmail: row.email as string,
      name: (row.first_name as string) ?? 'there',
      reference: `SICA-WEB-${(row.id as string).slice(0, 8).toUpperCase()}`,
      // Reminder bodies are bilingual single blocks (Phase 124b
      // convention) — locale 'en' only picks the subject line variant.
      locale: 'en',
      kind: opts.kind,
      webinarTitle: title,
      joinLink: (session.join_url as string | null) ?? null,
      dateLabel,
      timeLabel,
    });
    if (result.ok) {
      sent += 1;
      // Stamp only on success so transient failures retry next tick.
      await service
        .from('webinar_signups')
        .update({ [opts.flagColumn]: new Date().toISOString() })
        .eq('id', row.id as string);
    } else {
      console.warn(
        `[cron/webinar-reminders] ${opts.kind} send failed for ${row.email}:`,
        result.error,
      );
    }
  }
  return { rows: recipients.length, sent };
}
