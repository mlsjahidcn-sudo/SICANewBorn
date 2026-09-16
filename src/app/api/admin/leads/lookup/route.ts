import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';

/**
 * Phase 107 / Batch 5 — find leads across all three lead surfaces
 * by exact email match (case-insensitive).
 *
 * Returns up to 10 matches across chat_leads / student_assessments /
 * contact_submissions. The admin "Create application" wizard uses
 * the result to surface a "Found existing lead(s)" picker; the
 * selected (id, type) pair is then POSTed back to
 * /api/admin/applications as leadId + leadType for back-linking.
 *
 * Used in the admin app wizard's lead path only (when the admin is
 * creating an unlinked application, not a student-linked one).
 */

interface MatchRow {
  id: string;
  type: 'chat_lead' | 'student_assessment' | 'contact_submission';
  label: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.COZE_SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const emailParam = new URL(request.url).searchParams.get('email') ?? '';
  const email = emailParam.trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return NextResponse.json({ matches: [] });
  }

  const service = buildServiceClient();

  // Three queries in parallel — each table has its own 'email' column
  // we ILIKE-match against. The shape we want per row is normalized
  // before returning so the wizard doesn't have to know which table
  // it came from.
  const [chatRes, assessRes, contactRes] = await Promise.all([
    service
      .from('chat_leads')
      .select('id, name, country, status, created_at')
      .ilike('email', email)
      .order('created_at', { ascending: false })
      .limit(5),
    service
      .from('student_assessments')
      .select('id, first_name, last_name, country, status, created_at')
      .ilike('email', email)
      .order('created_at', { ascending: false })
      .limit(5),
    service
      .from('contact_submissions')
      .select('id, name, subject, status, created_at')
      .ilike('email', email)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const matches: MatchRow[] = [];

  if (!chatRes.error && chatRes.data) {
    for (const row of chatRes.data) {
      const r = row as { id: string; name: string | null; country: string | null; status: string; created_at: string };
      matches.push({
        id: r.id,
        type: 'chat_lead',
        label: `Chat lead — ${r.name || '(no name)'}${r.country ? ` · ${r.country}` : ''} · ${r.status}`,
        createdAt: r.created_at,
      });
    }
  }
  if (!assessRes.error && assessRes.data) {
    for (const row of assessRes.data) {
      const r = row as { id: string; first_name: string | null; last_name: string | null; country: string | null; status: string; created_at: string };
      const name = [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || '(no name)';
      matches.push({
        id: r.id,
        type: 'student_assessment',
        label: `Assessment — ${name}${r.country ? ` · ${r.country}` : ''} · ${r.status}`,
        createdAt: r.created_at,
      });
    }
  }
  if (!contactRes.error && contactRes.data) {
    for (const row of contactRes.data) {
      const r = row as { id: string; name: string | null; subject: string | null; status: string; created_at: string };
      matches.push({
        id: r.id,
        type: 'contact_submission',
        label: `Contact — ${r.name || '(no name)'}${r.subject ? ` · ${r.subject}` : ''} · ${r.status}`,
        createdAt: r.created_at,
      });
    }
  }

  // Sort newest first across all surfaces, cap at 10.
  matches.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return NextResponse.json({ matches: matches.slice(0, 10) });
}