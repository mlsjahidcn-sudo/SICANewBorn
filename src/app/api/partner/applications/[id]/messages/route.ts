import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireTeamMember } from '@/lib/supabase-auth';
import { loadMessageApplicationContext } from '@/lib/application-messages-server';
import { handleMessagePost, respondWithThread } from '@/lib/application-messages-route';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/**
 * The partner team's conversation with SICA about one partner application.
 * Same visibility as the application itself: owners see every application of
 * their org, members only the ones they created. Anything else → 404.
 */
async function authorize(request: NextRequest, params: Params['params']) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) return { error: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  if (!getServerEnv().serviceKey) {
    return { error: NextResponse.json({ error: 'Messaging is not configured' }, { status: 503 }) };
  }
  const { id } = await params;
  const service = buildServiceClient();
  const ctx = await loadMessageApplicationContext(service, 'partner', id);
  const visible =
    !!ctx &&
    ctx.partnerId === auth.partnerId &&
    (auth.role === 'owner' || ctx.createdByUserId === auth.user.id);
  if (!visible || !ctx) {
    return { error: NextResponse.json({ error: 'Application not found' }, { status: 404 }) };
  }
  return { error: undefined, auth, service, ctx };
}

export async function GET(request: NextRequest, { params }: Params) {
  const r = await authorize(request, params);
  if (r.error) return r.error;
  return respondWithThread(request, r.service, r.ctx, 'partner');
}

export async function POST(request: NextRequest, { params }: Params) {
  const r = await authorize(request, params);
  if (r.error) return r.error;
  const companyName = typeof r.auth.partner.company_name === 'string' ? r.auth.partner.company_name : '';
  return handleMessagePost(request, r.service, r.ctx, {
    role: 'partner',
    userId: r.auth.user.id,
    name: companyName || r.ctx.companyName,
  });
}
