import { SITE_URL } from '@/lib/site-url';
/**
 * Admin: preview a template with sample (or real) variables.
 *
 * POST /api/admin/emails/templates/preview
 * body: {
 *   subject?, body_html?, body_text?,        // use these OR
 *   template_id?,                             //   load from DB
 *   variables?: { ... }                       // context values
 * }
 *
 * Returns rendered { subject, html, text } so the admin UI can
 * show a live preview alongside the editor.
 *
 * If the request includes template_id, we load the row from DB
 * and apply the user-supplied subject/body if any. (This lets the
 * editor POST a "draft" before saving.)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { renderTemplate } from '@/lib/email/renderer';

export const dynamic = 'force-dynamic';

interface PreviewBody {
  template_id?: string;
  subject?: string;
  body_html?: string;
  body_text?: string;
  variables?: Record<string, string>;
  /** Use the bundled sample dataset instead of caller-provided variables. */
  useSample?: boolean;
}

const SAMPLE: Record<string, string> = {
  firstName: 'Sarah',
  country: 'Ghana',
  intendedMajor: 'Data Science',
  email: 'sarah@example.com',
  sourceKind: 'assessment',
  sourceId: '00000000-0000-0000-0000-000000000000',
  unsubToken: 'c2FyYWhAZXhhbXBsZS5jb20',
  siteUrl: SITE_URL,
  universityName: 'Tsinghua University',
  programName: 'MSc Data Science',
  programLine: 'MSc Data Science · Master · Fall 2026',
  degree: 'Master',
  intake: 'Fall 2026',
  applicationNumber: 'SICA-2026-0042',
  newStatus: 'Accepted',
  extraNote: 'Please confirm your passport details by next Friday.',
  facts: '[]',
};

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: PreviewBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  let subject = body.subject || '';
  let bodyHtml = body.body_html || '';
  let bodyText = body.body_text || '';
  let allowed: string[] | undefined;

  if (body.template_id) {
    const { data: tpl, error } = await supabase
      .from('email_templates')
      .select('subject, body_html, body_text, variables')
      .eq('id', body.template_id)
      .maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!tpl) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    subject = body.subject || tpl.subject;
    bodyHtml = body.body_html || tpl.body_html;
    bodyText = body.body_text || tpl.body_text;
    allowed = Array.isArray(tpl.variables) ? (tpl.variables as string[]) : undefined;
  }

  if (!subject || !bodyHtml || !bodyText) {
    return NextResponse.json(
      { error: 'Provide template_id OR subject+body_html+body_text' },
      { status: 400 },
    );
  }

  const ctx: Record<string, unknown> = body.useSample
    ? { ...SAMPLE }
    : { ...(body.variables || {}) };
  // facts needs to be an array for the renderer; coerce string→array
  if (typeof ctx.facts === 'string') {
    try {
      ctx.facts = JSON.parse(ctx.facts);
    } catch {
      ctx.facts = [];
    }
  }

  try {
    const rendered = renderTemplate({
      subject,
      bodyHtml,
      bodyText,
      context: ctx as Parameters<typeof renderTemplate>[0]['context'],
      allowedVariables: allowed,
    });
    return NextResponse.json({ rendered });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render failed' },
      { status: 400 },
    );
  }
}
