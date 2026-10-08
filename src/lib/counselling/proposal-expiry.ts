/**
 * Proposal-expiry worker (Phase 152 #14).
 *
 * Companion to the Phase 123 reminders worker. Where reminders
 * notifies a student about an upcoming confirmed session, this
 * worker flips an admin-proposed-but-unanswered proposal back to
 * `Pending` and emails the admin that the student dropped off.
 *
 * Lifecycle of a row in `counselling_bookings` after admin propose:
 *
 *   status='Proposed'
 *     + proposal_token (the magic link)
 *     + proposed_slot_start
 *     + proposal_expires_at
 *
 *   … student responds …                                … nothing happens …
 *   status='Confirmed' OR Pending (after counter/decline)     ↓
 *   proposal_token cleared                                   time passes
 *                                                            ↓
 *                                                proposal_expires_at < now()
 *                                                            ↓
 *                                                this worker picks it up
 *                                                            ↓
 *   status='Pending'                                  email admin
 *   proposal_token = NULL                            "student didn't
 *   proposal_expires_at = NULL                         respond, re-propose
 *   proposed_slot_start = NULL                        or close"
 *   proposal_expired_at = now() (stamp)
 *
 * The `proposal_expired_at` stamp is the once-only guarantee — the
 * partial index `idx_counselling_proposal_expired_at_null` keeps
 * the hot path small.
 *
 * Single-instance assumption, same as reminders / drip: multi-
 * instance deploys need row-level claiming.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import {
  isEmailConfigured,
  sendCounsellingProposalExpiredAdmin,
  formatCounsellingSlotBeijing,
  type LoggedSendTextResult,
} from '@/lib/email';

interface ExpiredProposalRow {
  id: string;
  reference: string;
  name: string;
  email: string;
  proposed_slot_start: string;
  proposal_expires_at: string;
  locale: string | null;
}

export interface ProposalExpiryRunSummary {
  picked: number;
  flipped: number;
  emailed: number;
  failed: number;
  errors: string[];
}

export async function processCounsellingProposalExpiry(opts: {
  /** Max rows per invocation. Default 50. */
  batchSize?: number;
  /** Allow override for testing. Default uses the global client. */
  supabase?: SupabaseClient;
  /** Allow override for testing. Default is now. */
  now?: Date;
} = {}): Promise<ProposalExpiryRunSummary> {
  const summary: ProposalExpiryRunSummary = {
    picked: 0,
    flipped: 0,
    emailed: 0,
    failed: 0,
    errors: [],
  };
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
  const batchSize = opts.batchSize ?? 50;

  // Phase 152 (#14): pick every row where status='Proposed' AND
  // proposal_expires_at < now AND proposal_expired_at IS NULL.
  // The partial index keeps the planner on the small "never processed"
  // subset; we add the .lt() filter here to match only the ones whose
  // deadline has actually passed.
  const { data: dueRows, error: fetchErr } = await supabase
    .from('counselling_bookings')
    .select(
      'id, reference, name, email, proposed_slot_start, proposal_expires_at, locale',
    )
    .eq('status', 'Proposed')
    .lt('proposal_expires_at', now.toISOString())
    .is('proposal_expired_at', null)
    .order('proposal_expires_at', { ascending: true })
    .limit(batchSize);

  if (fetchErr) {
    summary.errors.push(`fetch: ${fetchErr.message}`);
    return summary;
  }
  if (!dueRows || dueRows.length === 0) {
    return summary;
  }
  summary.picked = dueRows.length;

  for (const row of dueRows as ExpiredProposalRow[]) {
    // Atomically stamp + clear proposal columns. The
    // `.is('proposal_expired_at', null)` guard prevents a
    // double-process race if two workers pick the same row.
    const { error: stampErr } = await supabase
      .from('counselling_bookings')
      .update({
        status: 'Pending',
        proposed_slot_start: null,
        proposal_token: null,
        proposal_expires_at: null,
        proposal_expired_at: now.toISOString(),
      })
      .eq('id', row.id)
      .is('proposal_expired_at', null);

    if (stampErr) {
      summary.failed += 1;
      summary.errors.push(`${row.reference}: flip failed: ${stampErr.message}`);
      continue;
    }
    summary.flipped += 1;

    // Fire admin notification (best-effort, never throws to the caller).
    let result: LoggedSendTextResult & { to: string | null };
    try {
      result = await sendCounsellingProposalExpiredAdmin({
        name: row.name,
        reference: row.reference,
        proposedSlotLabel: formatCounsellingSlotBeijing(row.proposed_slot_start),
        proposalExpiresAtIso: row.proposal_expires_at,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      summary.failed += 1;
      summary.errors.push(`${row.reference}: send failed: ${msg}`);
      continue;
    }
    if (result.subject === null) {
      // Pipeline unconfigured — already counted above; no log row.
      continue;
    }

    const { error: logErr } = await supabase.from('email_log').insert({
      lead_type: 'counselling',
      lead_id: row.id,
      template_slug: 'counselling.proposal_expired_admin',
      to_email: result.to ?? process.env.ADMIN_EMAIL ?? '',
      to_name: 'SICA Admissions',
      subject: result.subject,
      body_text: result.text,
      resend_message_id: result.id ?? null,
      status: result.ok ? 'sent' : 'failed',
      error: result.error ?? null,
      sent_at: result.ok ? now.toISOString() : null,
    });
    if (logErr) {
      summary.errors.push(`${row.reference}: email_log failed: ${logErr.message}`);
    }
    if (result.ok) summary.emailed += 1;
    else summary.failed += 1;
  }

  return summary;
}

/**
 * Initialize the background scheduler. Called once from
 * src/server.ts. Idempotent — mirrors startCounsellingReminderScheduler.
 * 5-minute tick; safe to also wire to an external cron backstop.
 */
let started = false;
export function startCounsellingProposalExpiryScheduler(): void {
  if (started) return;
  started = true;

  if (!isSupabaseServerConfigured() || !isEmailConfigured()) {
    console.log('[counselling-proposal-expiry] scheduler not started (Supabase or Resend not configured)');
    return;
  }

  console.log('[counselling-proposal-expiry] scheduler started — running every 5 minutes');
  processCounsellingProposalExpiry().catch((err) =>
    console.error('[counselling-proposal-expiry] initial run failed', err),
  );
  setInterval(() => {
    processCounsellingProposalExpiry().catch((err) =>
      console.error('[counselling-proposal-expiry] tick failed', err),
    );
  }, 5 * 60 * 1000);
}
