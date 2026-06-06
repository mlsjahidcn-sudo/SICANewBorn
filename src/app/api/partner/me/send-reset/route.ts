/**
 * Partner: send a password reset email to the calling user.
 *
 * POST /api/partner/me/send-reset
 *
 * Calls Supabase's resetPasswordForEmail with the redirect
 * pointing at the partner login page. The user clicks the link in
 * the email, lands on /partner/login?reset=1, and Supabase's
 * client picks up the access_token from the URL fragment to
 * authenticate the password-update form.
 *
 * Auth: any logged-in partner team member (the route just needs
 * to know the email, which is the calling user's email — we never
 * let one partner request a reset for a different account).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRequestAuth, getServerEnv } from '@/lib/supabase-auth';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const env = getServerEnv();
  if (!env.url || !env.anonKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Use the anon client (not service-role) for resetPasswordForEmail —
  // Supabase's password-reset flow is designed to be called by the
  // end-user's client, and uses the anon key + the user's email.
  const sb = createClient(env.url, env.anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await sb.auth.resetPasswordForEmail(auth.user.email ?? '', {
    redirectTo: `${SITE_URL}/partner/login?reset=1`,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ sent: true });
}
