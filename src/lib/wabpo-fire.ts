/**
 * WABPO fire-and-forget helper — Phase 46.
 *
 * Wraps `sendTemplateMessage` from `./wabpo` with the patterns all the
 * Phase 46 automation needs (auto-welcome, status-change notify, bulk
 * promo, intake reminders) so the call sites stay one-liners:
 *
 *   await fireAndForget({ leadType, leadId, leadRow, templateName,
 *                         historyAction: 'whatsapp_welcome_sent' })
 *     .catch(() => {});  // never throws — defensive only
 *
 * Contract — this function NEVER throws. Every error path returns a
 * `FireResult` with `skipped: true` and a `skipReason`. The caller can
 * safely `.catch()` defensively but the promise always resolves.
 *
 * Skip reasons (all silent at the call site, logged server-side):
 *   - 'not_configured'   — WABPO_* env vars missing
 *   - 'no_phone'         — lead row has no usable phone/whatsapp
 *   - 'do_not_contact'   — lead row has do_not_contact=true (opt-out)
 *   - 'template_missing' — no template with that name in WABPO
 *   - 'template_pending' — template exists but not APPROVED yet
 *   - 'send_failed'      — WABPO returned an error (logged to Sentry)
 *
 * Variables are auto-filled from the lead row (name, country, intended
 * major). WABPO matches them by name to the template's `{{N}}` slots —
 * extra variables are ignored by WABPO so we just pass everything we can.
 */
import { randomUUID } from 'node:crypto';
import {
  getWabpoConfig,
  listApprovedTemplates,
  normalizePhone,
  sendTemplateMessage,
  WabpoApiError,
  WabpoNotConfiguredError,
  type WabpoTemplate,
} from './wabpo';
import { getSupabaseServer } from './supabase-server';

export type FireLeadType = 'contact' | 'chat' | 'assessment';
export type FireHistoryAction =
  | 'whatsapp_welcome_sent'
  | 'whatsapp_status_sent'
  | 'whatsapp_promo_sent'
  | 'whatsapp_intake_reminder_sent';

export type FireSkipReason =
  | 'not_configured'
  | 'no_phone'
  | 'do_not_contact'
  | 'template_missing'
  | 'template_pending'
  | 'send_failed';

export interface FireArgs {
  leadType: FireLeadType;
  leadId: string;
  /** The lead row from Supabase — used to auto-fill template variables. */
  leadRow: Record<string, unknown>;
  /** WABPO template name, e.g. 'lead_welcome_v1'. Matched against `templateName`. */
  templateName: string;
  historyAction: FireHistoryAction;
  /** Free-form extra context for the lead_history.note column. */
  historyNote?: string;
  /** Override the default idempotency key (rarely needed). */
  idempotencyKey?: string;
}

export interface FireResult {
  ok: boolean;
  skipped: boolean;
  skipReason?: FireSkipReason;
  messageId?: string;
  error?: string;
}

// ---- Template cache (5-min TTL) ----
//
// listApprovedTemplates hits the WABPO API on every call. For bulk-send
// firing 50+ messages in a tight loop, that's 50 redundant round-trips.
// This cache refreshes on miss + every 5 minutes.
let _templateCache: { fetchedAt: number; byName: Map<string, WabpoTemplate> } | null = null;
const TEMPLATE_CACHE_TTL_MS = 5 * 60_000;

async function getTemplateByName(name: string): Promise<WabpoTemplate | null> {
  const now = Date.now();
  if (!_templateCache || now - _templateCache.fetchedAt > TEMPLATE_CACHE_TTL_MS) {
    const templates = await listApprovedTemplates();
    const byName = new Map<string, WabpoTemplate>();
    for (const t of templates) byName.set(t.templateName, t);
    _templateCache = { fetchedAt: now, byName };
  }
  return _templateCache.byName.get(name) ?? null;
}

/** Clear the template cache. Useful in tests + after WABPO template changes. */
export function clearWabpoTemplateCache(): void {
  _templateCache = null;
}

// ---- Variable auto-fill ----
//
// Mirrors the logic in /api/admin/leads/[id]/send-whatsapp/route.ts so
// the manual and auto paths produce the same variable map per lead.
function pickString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function deriveVariables(leadType: FireLeadType, row: Record<string, unknown>): Record<string, string> {
  const firstName =
    pickString(row, ['name'])?.split(' ')[0] ||
    pickString(row, ['first_name']) ||
    'there';
  const fullName =
    pickString(row, ['name']) ||
    [pickString(row, ['first_name']), pickString(row, ['last_name'])]
      .filter(Boolean)
      .join(' ') ||
    '';
  return {
    first_name: firstName,
    last_name: pickString(row, ['last_name']) ?? '',
    full_name: fullName,
    name: fullName || firstName,
    country: pickString(row, ['country']) ?? '',
    intended_major:
      pickString(row, ['intended_major']) ||
      pickString(row, ['interested_program']) ||
      pickString(row, ['program']) ||
      '',
    message: pickString(row, ['message']) || pickString(row, ['subject']) || '',
  };
}

function tableFor(t: FireLeadType): string {
  switch (t) {
    case 'contact':
      return 'contact_submissions';
    case 'chat':
      return 'chat_leads';
    case 'assessment':
      return 'student_assessments';
  }
}

function derivePhone(row: Record<string, unknown>): string {
  return normalizePhone(
    pickString(row, ['phone']) ||
      pickString(row, ['whatsapp']) ||
      '',
  );
}

// ---- Main entry point ----

export async function fireAndForget(args: FireArgs): Promise<FireResult> {
  const skip = (reason: FireSkipReason, error?: string): FireResult => ({
    ok: false,
    skipped: true,
    skipReason: reason,
    error: error,
  });
  const sent = (messageId: string): FireResult => ({
    ok: true,
    skipped: false,
    messageId,
  });

  // 1. WABPO configured?
  const config = getWabpoConfig();
  if (!config) {
    console.info(`[wabpo-fire] skipped ${args.leadType}/${args.leadId}: WABPO not configured`);
    return skip('not_configured');
  }

  // 2. do_not_contact opt-out? (Phase 46 — set when lead replies STOP
  //    in the future 2-way inbox, or manually via admin.)
  if (args.leadRow.do_not_contact === true) {
    console.info(`[wabpo-fire] skipped ${args.leadType}/${args.leadId}: do_not_contact=true`);
    return skip('do_not_contact');
  }

  // 3. Has a usable phone?
  const phone = derivePhone(args.leadRow);
  if (phone.length < 7) {
    console.info(`[wabpo-fire] skipped ${args.leadType}/${args.leadId}: no phone`);
    return skip('no_phone');
  }

  // 4. Template exists + is approved?
  let template: WabpoTemplate | null;
  try {
    template = await getTemplateByName(args.templateName);
  } catch (err) {
    console.error(`[wabpo-fire] template lookup failed for ${args.templateName}:`, err);
    return skip('template_missing', err instanceof Error ? err.message : 'lookup failed');
  }
  if (!template) {
    console.warn(`[wabpo-fire] skipped ${args.leadType}/${args.leadId}: template ${args.templateName} not in approved list`);
    return skip('template_missing');
  }
  if (template.status !== 'APPROVED' && template.metaStatus !== 'APPROVED') {
    console.info(`[wabpo-fire] skipped ${args.leadType}/${args.leadId}: template ${args.templateName} status=${template.status}/${template.metaStatus}`);
    return skip('template_pending');
  }

  // 5. Fire the send
  const variables = deriveVariables(args.leadType, args.leadRow);
  let result;
  try {
    result = await sendTemplateMessage({
      templateId: template.id,
      recipientNumber: phone,
      variables,
      externalReference: `lead:${args.leadType}:${args.leadId}`,
      idempotencyKey: args.idempotencyKey ?? `sica-${args.historyAction}-${args.leadId}-${Date.now()}-${randomUUID()}`,
    });
  } catch (err) {
    if (err instanceof WabpoNotConfiguredError) {
      return skip('not_configured', err.message);
    }
    const code = err instanceof WabpoApiError ? `${err.status}/${err.code}` : 'unknown';
    console.error(`[wabpo-fire] send failed for ${args.leadType}/${args.leadId}: ${code}`, err);
    return skip('send_failed', code);
  }

  const firstDetail = result.details?.[0];
  const messageId = firstDetail?.messageId ?? null;
  if (!messageId) {
    console.warn(`[wabpo-fire] sent but no messageId returned for ${args.leadType}/${args.leadId}`);
  }

  // 6. Log to lead_history (best-effort). The DB trigger on the new
  //    whatsapp_* actions will bump last_contacted_at + contact_attempts.
  const supabase = getSupabaseServer();
  if (supabase) {
    const noteParts = [
      `whatsapp`,
      `template=${args.templateName}`,
      messageId ? `msgId=${messageId}` : '(no msgId)',
    ];
    if (args.historyNote) noteParts.push(args.historyNote);
    await supabase
      .from('lead_history')
      .insert({
        lead_type: args.leadType,
        lead_id: args.leadId,
        admin_id: null, // system-initiated
        action: args.historyAction,
        from_value: null,
        to_value: null,
        note: noteParts.join(' | '),
      })
      .then(({ error }) => {
        if (error) console.error(`[wabpo-fire] lead_history insert failed:`, error);
      });
  }

  return sent(messageId ?? 'unknown');
}
