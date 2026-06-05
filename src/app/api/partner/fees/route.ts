/**
 * Partner: fees / service charge — DENIED (Phase 3).
 *
 * Per the new partner portal model, partner orgs never see or manage
 * fees. Admin manages those in /admin/fees. Every handler here
 * returns 403 with a helpful message — the routes still exist so
 * legacy API clients get a clear error instead of 404.
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FORBIDDEN = {
  error: 'Partners do not have access to fees or service charges. Please contact SICA support.',
};

function deny() {
  return NextResponse.json(FORBIDDEN, { status: 403 });
}

export async function GET(_request: NextRequest) {
  return deny();
}

export async function POST(_request: NextRequest) {
  return deny();
}

export async function PATCH(_request: NextRequest) {
  return deny();
}

export async function DELETE(_request: NextRequest) {
  return deny();
}
