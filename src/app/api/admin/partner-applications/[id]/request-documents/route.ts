import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * Phase 76: Admin "Request documents" for public-form submissions.
 *
 * POST /api/admin/partner-applications/[id]/request-documents
 *
 * Body:
 *   - categories: string[] — one or more of: passport, transcript,
 *     english_test, photo, other
 *   - message: string (optional) — short message from admin, e.g.
 *     "Please upload your passport and most recent transcript"
 *
 * Behavior:
 *   - Pushes a new request event into partner_applications.documents_requested
 *     (JSONB). Open requests have fulfilled_at/fulfilled_by = null.
 *   - Each event has a server-generated `id` so the admin UI can
 *     "mark fulfilled" by patching the same array (idempotency key
 *     for future PATCH/fulfill endpoint).
 *
 * Auth: requireAdmin (admin or super_admin).
 */
const RequestPayload = z.object({
  categories: z
    .array(z.enum(['passport', 'transcript', 'english_test', 'photo', 'other']))
    .min(1, 'Select at least one document category')
    .max(5),
  message: z.string().max(1000).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = RequestPayload.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const service = buildServiceClient();
  // Read the current documents_requested array (and confirm the
  // application exists + is a public_form one — admin requests
  // make sense for any source, but the badge is what triggers the
  // action so we don't gate on source).
  const { data: existing, error: exErr } = await service
    .from('partner_applications')
    .select('id, documents_requested, source')
    .eq('id', id)
    .maybeSingle();
  if (exErr) {
    console.error('[admin/partner-applications/:id/request-documents] lookup error:', exErr);
    return NextResponse.json({ error: exErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }
  // Don't bother if the application is the sentinel Direct / Unassigned
  // with no source — wait, the sentinel IS valid for public_form. Just
  // continue.

  const current = Array.isArray(existing.documents_requested)
    ? (existing.documents_requested as unknown[])
    : [];

  const newEvent = {
    id: crypto.randomUUID(),
    categories: parsed.data.categories,
    message: parsed.data.message ?? null,
    requested_at: new Date().toISOString(),
    requested_by: auth.user.id,
    // Best-effort email hydration — auth.user doesn't carry email in
    // the request context; admin UI displays the user-id if we
    // can't pull the email here. (The existing partner hydration
    // helper does a getUserById round-trip; we keep this endpoint
    // cheap and let the UI fetch the email if it needs to.)
    fulfilled_at: null,
    fulfilled_by: null,
  };

  const updated = [...current, newEvent];
  const { error: upErr } = await service
    .from('partner_applications')
    .update({ documents_requested: updated })
    .eq('id', id);

  if (upErr) {
    console.error('[admin/partner-applications/:id/request-documents] update error:', upErr);
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  return NextResponse.json({ request: newEvent, documents_requested: updated }, { status: 201 });
}
