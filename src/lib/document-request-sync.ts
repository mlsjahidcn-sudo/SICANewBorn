/**
 * Server-side: after a document is linked to a partner application,
 * close any SICA document request it now satisfies. Best-effort by
 * contract — a failure here must never fail the upload itself, so every
 * error is logged and swallowed.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { applyAutoFulfillment } from '@/lib/document-request-fulfillment';

export async function syncDocumentRequestsForApplication(
  service: SupabaseClient,
  partnerApplicationId: string,
  actorId: string | null,
): Promise<string[]> {
  try {
    const { data: app, error: appErr } = await service
      .from('partner_applications')
      .select('documents_requested')
      .eq('id', partnerApplicationId)
      .maybeSingle();
    if (appErr || !app) return [];
    const raw = (app as { documents_requested?: unknown }).documents_requested;
    if (!Array.isArray(raw) || raw.length === 0) return [];

    const { data: docs, error: docsErr } = await service
      .from('student_documents')
      .select('category, uploaded_at, status')
      .eq('partner_application_id', partnerApplicationId);
    if (docsErr) return [];

    const usable = (docs ?? [])
      // A rejected file does not answer the request.
      .filter((d: { status?: string | null }) => d.status !== 'Rejected')
      .map((d: { category?: string | null; uploaded_at?: string | null }) => ({
        category: d.category,
        uploadedAt: d.uploaded_at,
      }));

    const { requests, changedIds } = applyAutoFulfillment(
      raw,
      usable,
      new Date().toISOString(),
      actorId,
    );
    if (changedIds.length === 0) return [];

    const { error: updErr } = await service
      .from('partner_applications')
      .update({ documents_requested: requests })
      .eq('id', partnerApplicationId);
    if (updErr) {
      console.error('[document-request-sync] update failed:', updErr.message);
      return [];
    }
    return changedIds;
  } catch (err) {
    console.error('[document-request-sync] failed:', err);
    return [];
  }
}
