/**
 * Partner: fee by id — DENIED (Phase 3).
 *
 * Same as the parent fees route. See /api/partner/fees/route.ts for
 * the policy rationale.
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FORBIDDEN = {
  error: 'Partners do not have access to fees or service charges. Please contact SICA support.',
};

function deny() {
  return NextResponse.json(FORBIDDEN, { status: 403 });
}

export async function GET(
  _request: NextRequest,
  _context: { params: Promise<{ id: string }> },
) {
  return deny();
}

export async function PATCH(
  _request: NextRequest,
  _context: { params: Promise<{ id: string }> },
) {
  return deny();
}

export async function DELETE(
  _request: NextRequest,
  _context: { params: Promise<{ id: string }> },
) {
  return deny();
}
