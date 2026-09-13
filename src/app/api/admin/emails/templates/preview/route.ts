/**
 * Admin: preview a template with sample (or real) variables.
 *
 * POST /api/admin/emails/templates/preview
 * body: {
 *   subject?, body_text?,                    // use these OR
 *   template_id?,                             //   load from DB
 *   variables?: { ... },                      // context values
 *   locale?: 'en' | 'zh'                      // default 'en'
 * }
 *
 * Returns rendered { subject, text } so the admin UI can
 * show a live preview alongside the editor.
 *
 * If the request includes template_id, we load the row from DB
 * and apply the user-supplied subject/body if any. (This lets the
 * editor POST a "draft" before saving.)
 *
 * Phase 84: text-only — body_html removed.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  loadTemplate,
  renderTextTemplate,
  type EmailLocale,
} from '@/lib/email/index';

export const dynamic = 'force-dynamic';

interface PreviewBody {
  template_id?: string;
  subject?: string;
  body_text?: string;
  variables?: Record<string, string>;
  /** Use the bundled sample dataset instead of caller-provided variables. */
  useSample?: boolean;
  /** Locale for template lookup + render. Defaults to 'en'. */
  locale?: string;
}

const SAMPLE: Record<string, string> = {
  firstName: 'Sarah',
  country: 'Ghana',
  intendedMajor: 'Data Science',
  email: 'sarah@example.com',
  sourceKind: 'assessment',
  sourceId: '00000000-0000-0000-0000-000000000000',
  unsubToken: 'c2FyYWhAZXhhbXBsZS5jb20',
  siteUrl: 'https://studyinchina.academy',
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

  const locale: EmailLocale = body.locale === 'zh' ? 'zh' : 'en';

  let subject = body.subject || '';
  let bodyText = body.body_text || '';

  if (body.template_id) {
    // loadTemplate keys by slug, so resolve id → slug first
    const { data: tplMeta, error: metaErr } = await supabase
      .from('email_templates')
      .select('slug')
      .eq('id', body.template_id)
      .maybeSingle();
    if (metaErr) {
      return NextResponse.json({ error: metaErr.message }, { status: 500 });
    }
    if (!tplMeta) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    const tpl = await loadTemplate(tplMeta.slug, locale, supabase);
    if (!tpl) {
      return NextResponse.json(
        { error: 'Template not found or inactive' },
        { status: 404 },
      );
    }
    subject = body.subject || tpl.subject;
    bodyText = body.body_text || tpl.body_text;
  }

  if (!subject || !bodyText) {
    return NextResponse.json(
      { error: 'Provide template_id OR subject+body_text' },
      { status: 400 },
    );
  }

  const ctx: Record<string, unknown> = body.useSample
    ? { ...SAMPLE }
    : { ...(body.variables || {}) };
  // facts needs to be an array for the renderer; coerce string→array
  if (typeof ctx.facts === 'string') {
    try {
      const parsed = JSON.parse(ctx.facts);
      ctx.facts = Array.isArray(parsed) ? parsed : [];
    } catch {
      ctx.facts = [];
    }
  }

  // Cast through the renderer's accepted value type. Variables arrive
  // as `unknown` (SAMPLE strings + JSON-parsed facts arrays + caller
  // strings); the renderer treats missing values as `[varName]` so an
  // array coerced in above for `facts` is fine for the body_text.
  type RTVar = string | number | boolean | null | undefined;
  const renderCtx = ctx as Record<string, RTVar>;

  try {
    const renderedSubject = renderTextTemplate(subject, renderCtx);
    const renderedText = renderTextTemplate(bodyText, renderCtx);
    return NextResponse.json({
      rendered: { subject: renderedSubject, text: renderedText },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'render failed' },
      { status: 400 },
    );
  }
}
