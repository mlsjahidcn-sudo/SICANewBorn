import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';
import {
  mapEnrollmentFromDb,
  type ApplicationEnrollment,
  type ApplicationEnrollmentDbRow,
} from '@/lib/application-history-mapper';

/**
 * Phase 107 / Batch 3 — GET the enrollment row for an application.
 *
 * Returns `{ enrollment: ApplicationEnrollment | null }`. Admin-only —
 * used by the detail page's Enrollment card to render the read-only
 * summary after the POST /enroll write.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.COZE_SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const service = buildServiceClient();

  const { data: row, error } = await service
    .from('application_enrollments')
    .select('*')
    .eq('application_id', id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!row) {
    return NextResponse.json({ enrollment: null });
  }

  const enrollment: ApplicationEnrollment = mapEnrollmentFromDb(row as ApplicationEnrollmentDbRow);
  return NextResponse.json({ enrollment });
}