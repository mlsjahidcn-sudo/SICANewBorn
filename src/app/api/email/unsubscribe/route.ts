import { NextRequest, NextResponse } from 'next/server';
import { unsubscribe } from '@/lib/email/drip/scheduler';
import { decodeUnsubToken } from '@/lib/email/drip/templates';

export const dynamic = 'force-dynamic';

/**
 * GET/POST /api/email/unsubscribe?token=<base64url-email>
 *
 * One-click unsubscribe. Marks all future pending drips for the
 * email as 'skipped_unsubscribed'. The token is a base64url
 * encoding of the email — not cryptographically secret, but it
 * keeps the unsubscribe URL short and prevents trivial scraping
 * of email addresses from the email body.
 *
 * Returns a simple HTML confirmation page (works in browsers
 * when the user clicks the link in the email footer).
 */
async function handle(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new NextResponse('Missing token', { status: 400 });
  }
  const email = decodeUnsubToken(token);
  if (!email || !email.includes('@')) {
    return new NextResponse('Invalid token', { status: 400 });
  }

  const skipped = await unsubscribe(email);
  console.log('[unsubscribe] email=', email, 'skipped=', skipped);

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Unsubscribed — SICA</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #FAFAF8; color: #1F2937; padding: 60px 20px; text-align: center; }
    .card { max-width: 480px; margin: 0 auto; background: #fff; border: 1px solid #E5E7EB; padding: 48px 32px; }
    h1 { color: #1B2A4A; margin: 0 0 16px 0; font-size: 24px; }
    p { line-height: 1.6; color: #4B5563; }
    a { color: #9B1B30; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <h1>You've been unsubscribed</h1>
    <p>
      We've removed <strong>${escapeHtml(email)}</strong> from the SICA email drip sequence.
      You won't receive any further automated follow-up emails.
    </p>
    <p>
      Your inquiry and transcript are still on file. Our team will still reach out
      directly if you've asked for a follow-up call.
    </p>
    <p>
      Changed your mind? <a href="/contact">Send us a message</a> and we'll add
      you back to the list.
    </p>
  </div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    },
  );
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
