import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { captureAIError } from '@/lib/ai/with-capture';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';
import { getAIProvider } from '@/lib/ai/provider';
import {
  buildComposeSystemPrompt,
  buildComposeUserPrompt,
  extractEmailDraft,
} from '@/lib/ai/email-compose';

export const maxDuration = 60;

/**
 * POST /api/admin/ai/compose-email
 *
 * Phase 136 — the AI half of the admin "Send email" dialog. The
 * admin types a theme ("invite them to book a free consultation"),
 * the model drafts a subject + plain-text body weaving in the RIGHT
 * site links (WhatsApp group, WhatsApp 1:1, free 10-min consultation
 * booking, scholarships, …) from a fixed library — never invented
 * URLs. The dialog then lets the admin edit before sending via the
 * per-surface send endpoints (leads: /api/admin/leads/[id]/send-email,
 * students: /api/admin/students/[id]/send-email).
 *
 * Auth: requireAdmin. Rate limit: 20 / 15 min per admin.
 *
 * Body: {
 *   theme: string,            // required, the email's purpose
 *   recipientName?: string,
 *   country?: string,
 *   sourceKind?: string,      // contact | chat | assessment | student
 *   notes?: string            // free-form context / original message
 * }
 *
 * Response 200: { subject, body, model }
 *   400 bad payload · 401 not admin · 429 rate limited
 *   502 unparseable AI reply · 503 provider not configured
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rl = checkAdminAIRateLimit(auth.user.id, 'compose-email');
  if (rl.blocked) return rl.response;

  const provider = getAIProvider();
  if (!provider.isConfigured) {
    return NextResponse.json(
      {
        error:
          'AI provider not configured. Set DEEPSEEK_API_KEY or DOUBAO_API_KEY on the server.',
      },
      { status: 503 },
    );
  }

  let body: {
    theme?: unknown;
    recipientName?: unknown;
    country?: unknown;
    sourceKind?: unknown;
    notes?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const str = (v: unknown, max: number): string =>
    typeof v === 'string' ? v.trim().slice(0, max) : '';

  const theme = str(body.theme, 1000);
  if (!theme) {
    return NextResponse.json(
      { error: 'theme is required — describe what this email should accomplish.' },
      { status: 400 },
    );
  }

  try {
    const response = await provider.chat(
      [
        { role: 'system', content: buildComposeSystemPrompt() },
        {
          role: 'user',
          content: buildComposeUserPrompt({
            theme,
            recipientName: str(body.recipientName, 200) || undefined,
            country: str(body.country, 100) || undefined,
            sourceKind: str(body.sourceKind, 50) || undefined,
            notes: str(body.notes, 2000) || undefined,
          }),
        },
      ],
      { temperature: 0.6, maxTokens: 1200 },
    );

    const draft = extractEmailDraft(response.content);
    if (!draft) {
      return NextResponse.json(
        { error: 'Could not read the AI draft — try generating again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      subject: draft.subject,
      body: draft.body,
      model: response.model,
    });
  } catch (err) {
    captureAIError('admin compose-email', err);
    return NextResponse.json(
      { error: 'The AI request failed — try again in a moment.' },
      { status: 502 },
    );
  }
}
