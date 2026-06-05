import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { sendChatLeadNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * POST /api/leads/chat
 *
 * Captures a lead submitted from inside the SICA AI assistant
 * chat window. The visitor optionally fills in a 6-field form
 * (name, email, WhatsApp, country, interested degree, interested
 * program) to "save their progress" — typically after they've
 * asked a few questions and want personalized follow-up.
 *
 * Persists to chat_leads and (if the client passed a session_token)
 * links the row to its chat_sessions row. The last few messages
 * from the conversation are stored as JSONB so admin reviewers
 * can read what the visitor was asking about when they decided
 * to share their info.
 *
 * Body:
 *   { name, email, whatsapp, country,
 *     interested_degree, interested_program, interested_university?,
 *     session_token?, conversation_context?: Message[] }
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = ((body.name as string) ?? '').trim();
  const email = ((body.email as string) ?? '').trim();
  const whatsapp = ((body.whatsapp as string) ?? '').trim();
  const country = ((body.country as string) ?? '').trim();
  const interested_degree = ((body.interested_degree as string) ?? '').trim();
  const interested_program = ((body.interested_program as string) ?? '').trim();
  const interested_university = ((body.interested_university as string) ?? '').trim();
  const session_token = ((body.session_token as string) ?? '').trim();
  const conversation_context = body.conversation_context;

  // Email is the only required field — the form is "save your
  // progress" so any of the other fields can be blank and we
  // still want to capture the contact.
  if (!email) {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  if (interested_degree && !['Bachelor', 'Master', 'PhD', 'Language', 'Other'].includes(interested_degree)) {
    return NextResponse.json({ error: 'Invalid degree' }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Attribution
  const sourcePage = (body.sourcePage as string | undefined) ?? null;
  const referrer = request.headers.get('referer') ?? null;
  const userAgent = request.headers.get('user-agent') ?? null;

  // 1. Insert the chat_leads row
  const { data: lead, error: leadErr } = await supabase
    .from('chat_leads')
    .insert({
      name: name || null,
      email,
      whatsapp: whatsapp || null,
      country: country || null,
      interested_degree: interested_degree || null,
      interested_program: interested_program || null,
      interested_university: interested_university || null,
      conversation_context: conversation_context ?? null,
      source_page: sourcePage,
      referrer,
      user_agent: userAgent,
    })
    .select('id, created_at')
    .single();

  if (leadErr || !lead) {
    console.error('[POST /api/leads/chat] insert failed:', leadErr);
    return NextResponse.json(
      { error: leadErr?.message ?? 'Failed to submit' },
      { status: 500 },
    );
  }

  // 2. Link the lead to the chat_sessions row (if a session_token
  // was provided) so admin can see the full transcript alongside
  // the lead.
  if (session_token) {
    const { error: linkErr } = await supabase
      .from('chat_sessions')
      .update({ lead_id: lead.id, last_seen_at: new Date().toISOString() })
      .eq('session_token', session_token);
    if (linkErr) {
      // Non-fatal: the lead is still saved, just not linked to
      // the session. Log it and move on.
      console.warn('[POST /api/leads/chat] session link failed:', linkErr);
    }
  }

  // 3. Fire-and-forget admin email notification. Don't block the
  // response — the lead is saved regardless.
  sendChatLeadNotification({
    name: name || null,
    email,
    whatsapp: whatsapp || null,
    country: country || null,
    interested_degree: interested_degree || null,
    interested_program: interested_program || null,
    interested_university: interested_university || null,
    sourcePage,
    submittedAt: lead.created_at,
  }).catch((err) => console.error('[POST /api/leads/chat] email notification failed:', err));

  return NextResponse.json({ success: true, id: lead.id });
}
