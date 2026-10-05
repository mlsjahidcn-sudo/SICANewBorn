/**
 * Last-sent-email lookup for admin list surfaces (Phase 136b).
 *
 * The leads page and students page show a "✓ Email sent <date>" chip
 * per row. Both derive it from email_log: the newest status='sent'
 * row per (lead_type, lead_id). Test sends (send_test=true) redirect
 * to ADMIN_EMAIL, so filtering to_email != ADMIN_EMAIL keeps admin
 * self-tests from counting as "we emailed this lead".
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type EmailLogLeadType = 'contact' | 'chat' | 'assessment' | 'student';

/**
 * Batched lookup: newest successful send timestamp per lead id.
 * Returns a Map<leadId, ISO string>. Empty input → empty Map.
 * Best-effort by design — on a query error the surfaces render no
 * chip (an email-date label must never break the list itself).
 * `limit` is a payload guard: 2000 rows of two small columns covers
 * a page of leads even at 20+ historical emails per lead.
 */
export async function fetchLastEmailSentAt(
  supabase: SupabaseClient,
  opts: { leadType: EmailLogLeadType; leadIds: string[]; adminEmail?: string | null },
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (opts.leadIds.length === 0) return result;

  let query = supabase
    .from('email_log')
    .select('lead_id, sent_at, to_email')
    .eq('lead_type', opts.leadType)
    .eq('status', 'sent')
    .not('sent_at', 'is', null)
    .in('lead_id', opts.leadIds)
    .limit(2000);
  if (opts.adminEmail) query = query.neq('to_email', opts.adminEmail);

  const { data, error } = await query;
  if (error) {
    console.error(`[last-email-lookup:${opts.leadType}]`, error.message);
    return result;
  }

  for (const row of (data || []) as Array<{ lead_id?: string | null; sent_at?: string | null }>) {
    if (!row.lead_id || !row.sent_at) continue;
    const existing = result.get(row.lead_id);
    if (!existing || row.sent_at > existing) result.set(row.lead_id, row.sent_at);
  }
  return result;
}
