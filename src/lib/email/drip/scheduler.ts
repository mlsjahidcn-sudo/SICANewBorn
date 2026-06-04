/**
 * Drip email scheduler — schedules, sends, and tracks the 4-step
 * post-capture email sequence.
 *
 * Flow:
 *   1. scheduleDripSequence() — called when an assessment or
 *      contact form is submitted. Inserts 4 rows in email_drips
 *      (welcome scheduled NOW, day1/day3/day7 scheduled in the
 *      future).
 *   2. processPendingDrips() — called by the setInterval in
 *      server.ts AND by the /api/email/drip-cron endpoint
 *      (idempotent — safe to call from both). Picks up rows
 *      where status='pending' AND scheduled_at <= NOW(), sends
 *      via Resend, marks 'sent'.
 *   3. unsubscribe() — marks all future drips for a given email
 *      as 'skipped_unsubscribed' so they never go out.
 *
 * Concurrency note: this is a single-process scheduler. If the
 * site is scaled to multiple instances, add a `SELECT ... FOR
 * UPDATE SKIP LOCKED` to claim a row before sending. For
 * Railway's single-instance deploys, this is fine.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { DRIP_SEQUENCE, makeUnsubToken, type DripStepKey } from './templates';

const FROM = 'SICA <noreply@sica.com.cn>';

export interface DripLead {
  sourceKind: 'assessment' | 'contact';
  sourceId: string;
  email: string;
  firstName: string;
  country?: string;
  intendedMajor?: string;
}

interface DripRow {
  id: string;
  source_kind: 'assessment' | 'contact';
  source_id: string;
  recipient_email: string;
  recipient_first_name: string | null;
  recipient_country: string | null;
  recipient_field: string | null;
  step_key: DripStepKey;
  step_index: number;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped_unsubscribed';
}

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Insert the 4-step sequence for a new lead. Idempotent — if
 * rows for (source_kind, source_id, step_index) already exist,
 * the unique constraint blocks the insert and the sequence is
 * not duplicated. This is critical for retries / form re-submits.
 */
export async function scheduleDripSequence(lead: DripLead): Promise<{
  scheduled: number;
  skipped: number;
}> {
  const supabase = getSupabaseServer();
  if (!supabase) return { scheduled: 0, skipped: 4 };

  if (!process.env.RESEND_API_KEY) {
    console.log('[drip] RESEND_API_KEY not set, skipping schedule for', lead.email);
    return { scheduled: 0, skipped: 4 };
  }

  const now = Date.now();
  const rows = DRIP_SEQUENCE.map((step) => ({
    source_kind: lead.sourceKind,
    source_id: lead.sourceId,
    recipient_email: lead.email,
    recipient_first_name: lead.firstName || null,
    recipient_country: lead.country || null,
    recipient_field: lead.intendedMajor || null,
    step_key: step.key,
    step_index: step.index,
    scheduled_at: new Date(now + step.delayMs).toISOString(),
    status: 'pending' as const,
  }));

  // upsert with ignoreDuplicates — if a row already exists, do
  // nothing. This is the Postgres-native way to insert-or-skip
  // without try/catch boilerplate.
  const { data, error } = await supabase
    .from('email_drips')
    .upsert(rows, {
      onConflict: 'source_kind,source_id,step_index',
      ignoreDuplicates: true,
    })
    .select('id');

  if (error) {
    console.error('[drip] schedule failed for', lead.email, error);
    return { scheduled: 0, skipped: 4 };
  }

  const inserted = data?.length ?? 0;
  return { scheduled: inserted, skipped: rows.length - inserted };
}

/**
 * Process all pending drips that are due (scheduled_at <= NOW()).
 * Sends each one via Resend, marks the row as 'sent' or 'failed'.
 *
 * Returns a summary of what happened. Safe to call repeatedly.
 */
export async function processPendingDrips(opts: {
  /** Max rows to process per invocation. Default 50. */
  batchSize?: number;
  /** Allow override for testing. Default uses the global client. */
  supabase?: SupabaseClient;
} = {}): Promise<{
  picked: number;
  sent: number;
  failed: number;
  errors: string[];
}> {
  const supabase = opts.supabase ?? getSupabaseServer();
  if (!supabase) {
    return { picked: 0, sent: 0, failed: 0, errors: ['Supabase not configured'] };
  }

  const resend = getResend();
  if (!resend) {
    return { picked: 0, sent: 0, failed: 0, errors: ['Resend not configured'] };
  }

  const batchSize = opts.batchSize ?? 50;
  const errors: string[] = [];
  let sent = 0;
  let failed = 0;

  // Fetch due rows. We don't claim with FOR UPDATE SKIP LOCKED
  // because Railway runs a single instance; the setInterval-driven
  // loop runs every few minutes and the fetch is naturally rate-
  // limited. If you scale to multi-instance, add row-level
  // locking here.
  const { data: rows, error } = await supabase
    .from('email_drips')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(batchSize);

  if (error) {
    errors.push(`fetch: ${error.message}`);
    return { picked: 0, sent: 0, failed, errors };
  }
  if (!rows || rows.length === 0) {
    return { picked: 0, sent: 0, failed, errors };
  }

  for (const row of rows as DripRow[]) {
    const step = DRIP_SEQUENCE.find((s) => s.key === row.step_key);
    if (!step) {
      errors.push(`unknown step ${row.step_key}`);
      await supabase
        .from('email_drips')
        .update({ status: 'failed', error: 'unknown step' })
        .eq('id', row.id);
      failed++;
      continue;
    }

    const ctx = {
      firstName: row.recipient_first_name || 'there',
      email: row.recipient_email,
      country: row.recipient_country || undefined,
      intendedMajor: row.recipient_field || undefined,
      unsubToken: makeUnsubToken(row.recipient_email),
      sourceKind: row.source_kind,
      sourceId: row.source_id,
    };

    let rendered;
    try {
      rendered = step.render(ctx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'render error';
      errors.push(`render ${row.id}: ${msg}`);
      await supabase
        .from('email_drips')
        .update({ status: 'failed', error: msg })
        .eq('id', row.id);
      failed++;
      continue;
    }

    try {
      const result = await resend.emails.send({
        from: FROM,
        to: row.recipient_email,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      await supabase
        .from('email_drips')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_message_id: result.data?.id ?? null,
          error: null,
        })
        .eq('id', row.id);
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'send failed';
      errors.push(`send ${row.id}: ${msg}`);
      await supabase
        .from('email_drips')
        .update({ status: 'failed', error: msg })
        .eq('id', row.id);
      failed++;
    }
  }

  return { picked: rows.length, sent, failed, errors };
}

/**
 * Mark all future drips for a given email as unsubscribed.
 * Idempotent — running twice has the same effect.
 */
export async function unsubscribe(email: string): Promise<number> {
  const supabase = getSupabaseServer();
  if (!supabase) return 0;

  // Mark all pending and future-scheduled rows for this email
  // as skipped. We don't touch 'sent' rows — they already went
  // out, can't be unsent. (For one-click-list-unsubscribe we'd
  // also retract them; out of scope for now.)
  const { data, error } = await supabase
    .from('email_drips')
    .update({ status: 'skipped_unsubscribed' })
    .eq('recipient_email', email)
    .eq('status', 'pending')
    .select('id');

  if (error) {
    console.error('[drip] unsubscribe failed for', email, error);
    return 0;
  }
  return data?.length ?? 0;
}

/**
 * Get the drip history for a specific lead (used by the admin
 * panel in a future iteration). Returns rows in scheduled order.
 */
export async function getDripHistory(sourceKind: 'assessment' | 'contact', sourceId: string): Promise<DripRow[]> {
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from('email_drips')
    .select('*')
    .eq('source_kind', sourceKind)
    .eq('source_id', sourceId)
    .order('step_index', { ascending: true });
  return (data as DripRow[] | null) ?? [];
}

/**
 * Initialize the background scheduler. Called once from
 * src/server.ts after the HTTP server starts listening.
 *
 * Runs processPendingDrips() every 5 minutes. Idempotent — safe
 * to call from a module-load guard.
 */
let started = false;
export function startDripScheduler(): void {
  if (started) return;
  started = true;

  if (!isSupabaseServerConfigured() || !process.env.RESEND_API_KEY) {
    console.log('[drip] scheduler not started (Supabase or Resend not configured)');
    return;
  }

  console.log('[drip] scheduler started — running every 5 minutes');
  // Fire once on startup (catch up on anything missed), then
  // every 5 minutes. 5 min is a good balance between latency
  // and Resend API cost.
  processPendingDrips().catch((err) => console.error('[drip] initial run failed', err));
  setInterval(() => {
    processPendingDrips().catch((err) => console.error('[drip] tick failed', err));
  }, 5 * 60 * 1000);
}
