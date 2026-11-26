import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';
import { loadMessageApplicationContext } from '@/lib/application-messages-server';
import { handleMessagePost, respondWithThread } from '@/lib/application-messages-route';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/** SICA admin side of the conversation on a partner application. */
async function authorize(request: NextRequest, params: Params['params']) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return { error: NextResponse.json({ error: auth.error }, { status: auth.status }) };
  if (!getServerEnv().serviceKey) {
    return { error: NextResponse.json({ error: 'Messaging is not configured' }, { status: 503 }) };
  }
  const { id } = await params;
  const service = buildServiceClient();
  const ctx = await loadMessageApplicationContext(service, 'partner', id);
  if (!ctx) return { error: NextResponse.json({ error: 'Application not found' }, { status: 404 }) };
  return { error: undefined, auth, service, ctx };
}

export async function GET(request: NextRequest, { params }: Params) {
  const r = await authorize(request, params);
  if (r.error) return r.error;
  return respondWithThread(request, r.service, r.ctx, 'admin');
}

export async function POST(request: NextRequest, { params }: Params) {
  const r = await authorize(request, params);
  if (r.error) return r.error;
  return handleMessagePost(request, r.service, r.ctx, {
    role: 'admin',
    userId: r.auth.user.id,
    name: 'SICA team',
  });
}
