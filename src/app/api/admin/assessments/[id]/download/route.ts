import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { createTranscriptDownloadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * Admin: get a signed download URL for an assessment's transcript.
 * GET /api/admin/assessments/[id]/download
 * Returns: { downloadUrl: string }
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Fetch the storage path from the assessment record
  const { data: assessment, error } = await supabase
    .from('student_assessments')
    .select('transcript_storage_path, transcript_file_name')
    .eq('id', id)
    .single();

  if (error || !assessment) {
    return NextResponse.json(
      { error: 'Assessment not found or transcript missing' },
      { status: 404 },
    );
  }

  if (!assessment.transcript_storage_path) {
    return NextResponse.json(
      { error: 'No transcript uploaded for this assessment' },
      { status: 404 },
    );
  }

  const downloadUrl = await createTranscriptDownloadUrl(assessment.transcript_storage_path);
  if (!downloadUrl) {
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 503 },
    );
  }

  return NextResponse.json({
    downloadUrl,
    fileName: assessment.transcript_file_name,
  });
}
