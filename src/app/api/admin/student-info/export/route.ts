import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { STUDENT_EXPORT_KINDS, buildStudentMarkdown, studentMarkdownFilename, type StudentExportKind } from '@/lib/student-markdown';
import { loadStudentMarkdownData, StudentExportError, StudentExportReadError } from '@/lib/student-markdown-data';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };

export async function GET(request: NextRequest): Promise<Response> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status, headers: PRIVATE_HEADERS });
  const kind = request.nextUrl.searchParams.get('kind');
  const id = request.nextUrl.searchParams.get('id') ?? '';
  if (!kind || !(STUDENT_EXPORT_KINDS as readonly string[]).includes(kind) || !UUID.test(id)) {
    return NextResponse.json({ error: 'A valid student or application reference is required' }, { status: 400, headers: PRIVATE_HEADERS });
  }
  if (!getServerEnv().serviceKey) return NextResponse.json({ error: 'Database not configured' }, { status: 503, headers: PRIVATE_HEADERS });
  try {
    const data = await loadStudentMarkdownData(buildServiceClient(), kind as StudentExportKind, id);
    return new Response(buildStudentMarkdown(data, new Date().toISOString()), { headers: {
      ...PRIVATE_HEADERS,
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${studentMarkdownFilename(data.identity)}"`,
    } });
  } catch (error) {
    if (error instanceof StudentExportError) return NextResponse.json({ error: error.message }, { status: error.status, headers: PRIVATE_HEADERS });
    console.error('[student-info/export] Could not read complete student information', error instanceof StudentExportReadError ? { resource: error.resource, code: error.code } : { code: 'UNKNOWN' });
    return NextResponse.json({ error: 'Could not export student information. Please retry.' }, { status: 500, headers: PRIVATE_HEADERS });
  }
}
