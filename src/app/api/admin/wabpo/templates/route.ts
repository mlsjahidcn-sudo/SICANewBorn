/**
 * Admin: list approved WhatsApp templates from WABPO.
 *
 * GET /api/admin/wabpo/templates
 * → { configured: boolean, templates: WabpoTemplate[] }
 *
 * Pure proxy — the browser never sees the WABPO API key. The frontend
 * uses this to populate the template picker on the Send WhatsApp modal.
 * Empty array (with `configured: false`) when env vars are missing so
 * the UI can render a clear "WABPO not configured" tooltip instead of
 * pretending to send.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { isWabpoConfigured, listApprovedTemplates } from '@/lib/wabpo';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Surface "not configured" as a non-error response so the UI can
  // render the empty-picker tooltip distinctly from a real failure.
  if (!isWabpoConfigured()) {
    return NextResponse.json({
      configured: false,
      templates: [],
      reason: 'WABPO_API_KEY / WABPO_PROJECT_ID / WABPO_CAMPAIGN_ID missing',
    });
  }

  try {
    const templates = await listApprovedTemplates();
    return NextResponse.json({ configured: true, templates });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json(
      { configured: true, templates: [], error: message },
      { status: 502 },
    );
  }
}
