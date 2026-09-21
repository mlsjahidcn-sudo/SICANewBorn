/**
 * Reminder worker for confirmed counselling sessions (Phase 123).
 *
 * Sends each Confirmed booking up to two reminders: one 24h before
 * the slot and one 2h before. Each fires exactly once per booking —
 * the `reminder_24h_at` / `reminder_2h_at` stamp columns (migration
 * database/2026-09-21_counselling_reminders.sql) are the idempotency
 * markers, so the worker is safe to run on every tick and after every
 * restart.
 *
 * Timing semantics:
 *  - The 24h reminder is only claimed while the slot is still MORE
 *    than 2h away. An admin confirming a booking inside the last 2h
 *    therefore gets a single "starting soon" reminder instead of a
 *    misleading "in 24 hours" one.
 *  - A transient send failure (throw) leaves the stamp unset, so the
 *    next tick retries until the slot passes. A definitive Resend
 *    rejection is stamped as attempted (failed) so we don't retry a
 *    dead address every 5 minutes until the session.
 *
 * Single-instance assumption, same as the drip worker: if this ever
 * scales to multi-instance, add row-level claiming here.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import {
  isEmailConfigured,
  sendCounsellingReminder,
  type LoggedSendTextResult,
} from '@/lib/email';

interface ConfirmedBookingRow {
  id: string;
  reference: string;
  name: string;
  email: string;
  slot_start: string;
  meeting_link: string | null;
  locale: string | null;
}

export interface ReminderRunSummary {
  picked24h: number;
  picked2h: number;
  sent: number;
  failed: number;
  errors: string[];
}

const REMINDER24_WINDOW_HOURS = 24;
const REMINDER2_WINDOW_HOURS = 2;
const REMINDER_SKIP24_WITHIN_HOURS = 2;

export interface ReminderWindows {
  /** Slots at or before this instant are due for the 24h reminder. */
  due24hUpper: Date;
  /** Slots at or before this instant are due for the 2h reminder. */
  due2hUpper: Date;
  /**
   * The 24h reminder only claims slots AFTER this instant — the 2h
   * window owns anything closer, so a booking confirmed late still
   * gets exactly one correctly-worded reminder.
   */
  skip24Below: Date;
}

export function computeReminderWindows(now: Date): ReminderWindows {
  return {
    due24hUpper: new Date(now.getTime() + REMINDER24_WINDOW_HOURS * 60 * 60 * 1000),
    due2hUpper: new Date(now.getTime() + REMINDER2_WINDOW_HOURS * 60 * 60 * 1000),
    skip24Below: new Date(now.getTime() + REMINDER_SKIP24_WITHIN_HOURS * 60 * 60 * 1000),
  };
}

async function claimAndSend(params: {
  supabase: SupabaseClient;
  rows: ConfirmedBookingRow[];
  kind: '24h' | '2h';
  stampColumn: 'reminder_24h_at' | 'reminder_2h_at';
}): Promise<{ sent: number; failed: number; errors: string[] }> {
  const { supabase, rows, kind, stampColumn } = params;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    let result: LoggedSendTextResult;
    try {
      result = await sendCounsellingReminder({
        toEmail: row.email,
        name: row.name,
        reference: row.reference,
        slotStartIso: row.slot_start,
        meetingLink: row.meeting_link,
        locale: row.locale === 'zh' ? 'zh' : 'en',
        kind,
      });
    } catch (err) {
      // Transient — leave the stamp unset so the next tick retries.
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${kind} ${row.reference}: ${msg}`);
      continue;
    }
    if (result.subject === null) {
      // Pipeline unconfigured — nothing attempted; don't stamp.
      errors.push(`${kind} ${row.reference}: Resend not configured`);
      continue;
    }

    // Stamp first (with the attempt time), then log — the stamp is the
    // once-only guarantee, the log is best-effort audit.
    const nowIso = new Date().toISOString();
    const { error: stampErr } = await supabase
      .from('counselling_bookings')
      .update({ [stampColumn]: nowIso })
      .eq('id', row.id);
    if (stampErr) {
      errors.push(`${kind} ${row.reference}: stamp failed: ${stampErr.message}`);
      continue;
    }

    if (result.ok) sent += 1;
    else failed += 1;

    const { error: logErr } = await supabase.from('email_log').insert({
      lead_type: 'counselling',
      lead_id: row.id,
      template_slug: `counselling.reminder_${kind}`,
      to_email: row.email,
      to_name: row.name,
      subject: result.subject,
      body_text: result.text,
      resend_message_id: result.id ?? null,
      status: result.ok ? 'sent' : 'failed',
      error: result.error ?? null,
      sent_by: null,
      sent_at: result.ok ? nowIso : null,
    });
    if (logErr) {
      errors.push(`${kind} ${row.reference}: email_log failed: ${logErr.message}`);
    }
  }

  return { sent, failed, errors };
}

/**
 * Send due reminders for confirmed sessions. Returns a summary;
 * safe to call repeatedly (stamps make it idempotent).
 */
export async function processCounsellingReminders(opts: {
  /** Max rows per window per invocation. Default 50. */
  batchSize?: number;
  /** Allow override for testing. Default uses the global client. */
  supabase?: SupabaseClient;
  /** Allow override for testing. Default is now. */
  now?: Date;
} = {}): Promise<ReminderRunSummary> {
  const summary: ReminderRunSummary = { picked24h: 0, picked2h: 0, sent: 0, failed: 0, errors: [] };
  const supabase = opts.supabase ?? getSupabaseServer();
  if (!supabase) {
    summary.errors.push('Supabase not configured');
    return summary;
  }
  if (!isEmailConfigured()) {
    summary.errors.push('Resend not configured');
    return summary;
  }

  const now = opts.now ?? new Date();
  const windows = computeReminderWindows(now);
  const batchSize = opts.batchSize ?? 50;

  // 24h window: due within 24h, still more than 2h out (later window
  // owns the "starting soon" wording), no stamp yet. The >2h lower
  // bound supersedes "> now".
  const { data: due24h, error: err24 } = await supabase
    .from('counselling_bookings')
    .select('id, reference, name, email, slot_start, meeting_link, locale')
    .eq('status', 'Confirmed')
    .gt('slot_start', windows.skip24Below.toISOString())
    .lte('slot_start', windows.due24hUpper.toISOString())
    .is('reminder_24h_at', null)
    .order('slot_start', { ascending: true })
    .limit(batchSize);
  if (err24) {
    summary.errors.push(`fetch 24h: ${err24.message}`);
  } else if (due24h && due24h.length > 0) {
    summary.picked24h = due24h.length;
    const r = await claimAndSend({
      supabase,
      rows: due24h as ConfirmedBookingRow[],
      kind: '24h',
      stampColumn: 'reminder_24h_at',
    });
    summary.sent += r.sent;
    summary.failed += r.failed;
    summary.errors.push(...r.errors);
  }

  // 2h window: due within 2h, no stamp yet.
  const { data: due2h, error: err2 } = await supabase
    .from('counselling_bookings')
    .select('id, reference, name, email, slot_start, meeting_link, locale')
    .eq('status', 'Confirmed')
    .gt('slot_start', now.toISOString())
    .lte('slot_start', windows.due2hUpper.toISOString())
    .is('reminder_2h_at', null)
    .order('slot_start', { ascending: true })
    .limit(batchSize);
  if (err2) {
    summary.errors.push(`fetch 2h: ${err2.message}`);
  } else if (due2h && due2h.length > 0) {
    summary.picked2h = due2h.length;
    const r = await claimAndSend({
      supabase,
      rows: due2h as ConfirmedBookingRow[],
      kind: '2h',
      stampColumn: 'reminder_2h_at',
    });
    summary.sent += r.sent;
    summary.failed += r.failed;
    summary.errors.push(...r.errors);
  }

  return summary;
}

/**
 * Initialize the background scheduler. Called once from
 * src/server.ts after the HTTP server starts listening. Idempotent —
 * mirrors startDripScheduler (5-minute tick, one catch-up run at
 * startup).
 */
let started = false;
export function startCounsellingReminderScheduler(): void {
  if (started) return;
  started = true;

  if (!isSupabaseServerConfigured() || !isEmailConfigured()) {
    console.log('[counselling-reminders] scheduler not started (Supabase or Resend not configured)');
    return;
  }

  console.log('[counselling-reminders] scheduler started — running every 5 minutes');
  processCounsellingReminders().catch((err) =>
    console.error('[counselling-reminders] initial run failed', err),
  );
  setInterval(() => {
    processCounsellingReminders().catch((err) =>
      console.error('[counselling-reminders] tick failed', err),
    );
  }, 5 * 60 * 1000);
}
