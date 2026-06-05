/**
 * Admin: list + create email templates.
 *
 * GET  /api/admin/emails/templates?category=drip|status|oneoff
 * POST /api/admin/emails/templates
 *
 * Read returns the full editable content (subject + body_html +
 * body_text + variables + schedule fields). Updates happen on the
 * /[id] route, sends on /[id]/send.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['drip', 'status', 'oneoff'] as const;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';

  let q = supabase
    .from('email_templates')
    .select('id, slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms, updated_at, updated_by, created_at')
    .order('category', { ascending: true })
    .order('step_index', { ascending: true, nullsFirst: false })
    .order('slug', { ascending: true });
  if (category && (CATEGORIES as readonly string[]).includes(category)) {
    q = q.eq('category', category);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ templates: data || [] });
}

interface CreateBody {
  slug?: string;
  name?: string;
  description?: string;
  category?: string;
  subject?: string;
  body_html?: string;
  body_text?: string;
  variables?: string[];
  is_active?: boolean;
  step_index?: number | null;
  delay_ms?: number | null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.slug || !body.name || !body.category || !body.subject || !body.body_html || !body.body_text) {
    return NextResponse.json(
      {
        error:
          'slug, name, category, subject, body_html, body_text are required',
      },
      { status: 400 },
    );
  }
  if (!(CATEGORIES as readonly string[]).includes(body.category)) {
    return NextResponse.json(
      { error: `category must be one of: ${CATEGORIES.join(', ')}` },
      { status: 400 },
    );
  }

  // Slug must be lowercase, dots and underscores only
  if (!/^[a-z0-9._-]+$/.test(body.slug)) {
    return NextResponse.json(
      { error: 'slug must be lowercase, digits, dots, hyphens, underscores only' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      slug: body.slug,
      name: body.name,
      description: body.description || null,
      category: body.category,
      subject: body.subject,
      body_html: body.body_html,
      body_text: body.body_text,
      variables: body.variables || [],
      is_active: body.is_active !== false,
      step_index: body.category === 'drip' ? (body.step_index ?? null) : null,
      delay_ms: body.category === 'drip' ? (body.delay_ms ?? 0) : null,
      updated_by: auth.user.id,
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ template: data });
}
