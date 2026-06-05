/**
 * Drip email scheduler — schedules, sends, and tracks the 4-step
 * post-capture email sequence.
 *
 * Flow:
 *   1. scheduleDripSequence() — called when an assessment or
 *      contact form is submitted. Reads the active drip templates
 *      from email_templates (category='drip') and inserts one row
 *      in email_drips per step. Schedules based on each template's
 *      step_index + delay_ms.
 *   2. processPendingDrips() — called by the setInterval in
 *      server.ts AND by the /api/email/drip-cron endpoint
 *      (idempotent — safe to call from both). Picks up rows
 *      where status='pending' AND scheduled_at <= NOW(), reads
 *      the template by slug, renders with the renderer, sends via
 *      Resend, marks 'sent'.
 *   3. unsubscribe() — marks all future drips for a given email
 *      as 'skipped_unsubscribed' so they never go out.
 *
 * Phase 2.5: templates moved from hard-coded TS into the
 * email_templates table. The old templates.ts DRIP_SEQUENCE is
 * gone — schedules are now driven by the DB. Admins can edit copy
 * without redeploying.
 *
 * Concurrency note: this is a single-process scheduler. If the
 * site is scaled to multiple instances, add a `SELECT ... FOR
 * UPDATE SKIP LOCKED` to claim a row before sending. For
 * Railway's single-instance deploys, this is fine.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { renderTemplate } from '@/lib/email/renderer';
import { makeUnsubToken } from './tokens';

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
  step_key: string;
  step_index: number;
  scheduled_at: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped_unsubscribed';
}

interface DripTemplate {
  id: string;
  slug: string;
  subject: string;
  body_html: string;
  body_text: string;
  variables: string[];
  step_index: number;
  delay_ms: number;
}

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Read the active drip templates from the DB. We sort by step_index
 * so the schedule is always in the right order even if the admin
 * re-orders them in the UI.
 */
async function loadDripTemplates(supabase: SupabaseClient): Promise<DripTemplate[]> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('id, slug, subject, body_html, body_text, variables, step_index, delay_ms')
    .eq('category', 'drip')
    .eq('is_active', true)
    .not('step_index', 'is', null)
    .order('step_index', { ascending: true });
  if (error) {
    console.error('[drip] failed to load templates:', error);
    return [];
  }
  return (data || []).map((r) => {
    const row = r as {
      id: string;
      slug: string;
      subject: string;
      body_html: string;
      body_text: string;
      variables: unknown;
      step_index: number;
      delay_ms: number;
    };
    return {
      id: row.id,
      slug: row.slug,
      subject: row.subject,
      body_html: row.body_html,
      body_text: row.body_text,
      variables: Array.isArray(row.variables) ? (row.variables as string[]) : [],
      step_index: row.step_index,
      delay_ms: row.delay_ms,
    };
  });
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
  templates: number;
}> {
  const supabase = getSupabaseServer();
  if (!supabase) return { scheduled: 0, skipped: 0, templates: 0 };

  if (!process.env.RESEND_API_KEY) {
    console.log('[drip] RESEND_API_KEY not set, skipping schedule for', lead.email);
    return { scheduled: 0, skipped: 0, templates: 0 };
  }

  const templates = await loadDripTemplates(supabase);
  if (templates.length === 0) {
    console.warn('[drip] no active drip templates in email_templates — skipping schedule');
    return { scheduled: 0, skipped: 0, templates: 0 };
  }

  const now = Date.now();
  const rows = templates.map((tpl) => ({
    source_kind: lead.sourceKind,
    source_id: lead.sourceId,
    recipient_email: lead.email,
    recipient_first_name: lead.firstName || null,
    recipient_country: lead.country || null,
    recipient_field: lead.intendedMajor || null,
    step_key: tpl.slug, // e.g. 'drip.welcome'
    step_index: tpl.step_index,
    scheduled_at: new Date(now + tpl.delay_ms).toISOString(),
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
    return { scheduled: 0, skipped: rows.length, templates: templates.length };
  }

  const inserted = data?.length ?? 0;
  return { scheduled: inserted, skipped: rows.length - inserted, templates: templates.length };
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

  // Load all drip templates once (we'll look up by slug for each row)
  const templates = await loadDripTemplates(supabase);
  const templateBySlug = new Map(templates.map((t) => [t.slug, t]));

  for (const row of rows as DripRow[]) {
    const tpl = templateBySlug.get(row.step_key);
    if (!tpl) {
      errors.push(`no template for slug ${row.step_key}`);
      await supabase
        .from('email_drips')
        .update({ status: 'failed', error: `template ${row.step_key} not found or inactive` })
        .eq('id', row.id);
      failed++;
      continue;
    }

    const ctx = {
      firstName: row.recipient_first_name || 'there',
      email: row.recipient_email,
      country: row.recipient_country || undefined,
      intendedMajor: row.recipient_field || undefined,
      sourceKind: row.source_kind,
      sourceId: row.source_id,
      unsubToken: makeUnsubToken(row.recipient_email),
    };

    let rendered;
    try {
      rendered = renderTemplate({
        subject: tpl.subject,
        bodyHtml: tpl.body_html,
        bodyText: tpl.body_text,
        context: ctx,
        allowedVariables: tpl.variables,
      });
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
