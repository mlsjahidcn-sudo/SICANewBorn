/**
 * Admin: update / delete an email template.
 *
 * PATCH  /api/admin/emails/templates/[id]
 *   body: partial of any writable field
 *
 * DELETE /api/admin/emails/templates/[id]
 *   - Drip templates: refused if there are pending email_drips rows
 *     (would break the scheduler). Admin must mark is_active=false
 *     instead.
 *   - Other categories: hard delete.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Whitelist writable fields
  const updates: Record<string, unknown> = { updated_by: auth.user.id };
  const allowed: string[] = [
    'name',
    'description',
    'subject',
    'body_html',
    'body_text',
    'variables',
    'is_active',
    'step_index',
    'delay_ms',
  ];
  for (const k of allowed) {
    if (k in body) updates[k] = body[k];
  }
  if (Object.keys(updates).length === 1) {
    return NextResponse.json({ error: 'No writable fields provided' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ template: data });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Look up the template to decide
  const { data: tpl, error: tplErr } = await supabase
    .from('email_templates')
    .select('id, slug, category')
    .eq('id', id)
    .maybeSingle();
  if (tplErr) {
    return NextResponse.json({ error: tplErr.message }, { status: 500 });
  }
  if (!tpl) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  // Drip templates: refuse if any pending email_drips reference this slug
  if (tpl.category === 'drip') {
    const { count } = await supabase
      .from('email_drips')
      .select('id', { count: 'exact', head: true })
      .eq('step_key', tpl.slug)
      .eq('status', 'pending');
    if (count && count > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete — ${count} pending drip(s) reference this template. Mark is_active=false instead.`,
        },
        { status: 409 },
      );
    }
  }

  const { error } = await supabase.from('email_templates').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
