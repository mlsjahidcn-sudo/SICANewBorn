import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { sendContactNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Public lead capture. Accepts submissions from any of the web forms
 * (/contact, /partner/register) and persists them to the appropriate table.
 *
 * Request body:
 *   { kind: 'contact' | 'partner_application', name, email, phone?, subject?, message?, ... }
 *
 * The 'kind' field routes the submission to the right table.
 * Returns the inserted row (without PII beyond what the client sent).
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

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Common attribution fields from headers
  const sourcePage = body.sourcePage as string | undefined;
  const referrer = request.headers.get('referer') ?? null;
  const userAgent = request.headers.get('user-agent') ?? null;

  const kind = (body.kind as string) || 'contact';

  try {
    if (kind === 'contact') {
      // Validate required fields
      const name = (body.name as string)?.trim();
      const email = (body.email as string)?.trim();
      const subject = (body.subject as string)?.trim();
      const message = (body.message as string)?.trim();
      if (!name || !email || !subject || !message) {
        return NextResponse.json(
          { error: 'name, email, subject, and message are required' },
          { status: 400 },
        );
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('contact_submissions')
        .insert({
          name,
          email,
          phone: (body.phone as string)?.trim() || null,
          subject,
          message,
          source_page: sourcePage || null,
          referrer,
          user_agent: userAgent,
        })
        .select('id, created_at')
        .single();

      if (error) {
        console.error('[POST /api/leads] contact insert failed:', error);
        return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
      }
      // Send admin email notification (fire-and-forget, non-blocking)
      sendContactNotification({
        name,
        email,
        phone: (body.phone as string)?.trim() || null,
        subject,
        message,
        sourcePage: sourcePage || null,
        submittedAt: data.created_at,
      }).catch((err) => console.error('[POST /api/leads] email notification failed:', err));
      return NextResponse.json({ success: true, id: data.id });
    }

    if (kind === 'partner_application') {
      // Handled by /api/partner-applications (separate route) — but accept here as fallback
      const companyName = (body.companyName as string)?.trim();
      const contactPerson = (body.contactPerson as string)?.trim();
      const partnerEmail = (body.email as string)?.trim();
      const phone = (body.phone as string)?.trim();
      const country = (body.country as string)?.trim();
      if (!companyName || !contactPerson || !partnerEmail) {
        return NextResponse.json(
          { error: 'companyName, contactPerson, and email are required' },
          { status: 400 },
        );
      }

      // For now, just acknowledge — admin will review and create the partner user
      // via /api/admin/create-user once approved.
      // A future sprint can persist to a `partner_applications` table.
      console.log('[partner_application]', { companyName, contactPerson, partnerEmail, phone, country, notes: body.notes });
      return NextResponse.json({ success: true, status: 'received' });
    }

    return NextResponse.json(
      { error: `Unknown lead kind: ${kind}` },
      { status: 400 },
    );
  } catch (err) {
    console.error('[POST /api/leads] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
