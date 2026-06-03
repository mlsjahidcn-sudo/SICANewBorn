import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { sendAssessmentNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Public student-assessment intake (from /assessment form). Persists to
 * student_assessments table so admins can review and respond.
 *
 * If the form included a file upload, transcriptStoragePath is passed
 * after the client uploads directly to Supabase Storage.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Required fields
  const firstName = (body.firstName as string)?.trim();
  const lastName = (body.lastName as string)?.trim();
  const email = (body.email as string)?.trim();
  const whatsapp = (body.whatsapp as string)?.trim();
  const country = (body.country as string)?.trim();
  if (!firstName || !lastName || !email || !whatsapp || !country) {
    return NextResponse.json(
      { error: 'firstName, lastName, email, whatsapp, and country are required' },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const userAgent = request.headers.get('user-agent') ?? null;
  const sourcePage = (body.sourcePage as string) || '/assessment';

  const transcript = (body.transcript as { name?: string; size?: number; type?: string }) || {};
  const transcriptStoragePath = (body.transcriptStoragePath as string) || null;

  try {
    const insertPayload: Record<string, unknown> = {
      first_name: firstName,
      last_name: lastName,
      email,
      whatsapp,
      country,
      date_of_birth: (body.dateOfBirth as string) || null,
      current_education: (body.currentEducation as string) || null,
      intended_major: (body.intendedMajor as string) || null,
      target_universities: (body.targetUniversities as string) || null,
      transcript_file_name: transcript.name || null,
      transcript_file_size: transcript.size || null,
      transcript_file_type: transcript.type || null,
      has_transcript: Boolean(transcript.name) || Boolean(transcriptStoragePath),
      notes: (body.notes as string) || null,
      source_page: sourcePage,
      user_agent: userAgent,
    };
    if (transcriptStoragePath) {
      insertPayload.transcript_storage_path = transcriptStoragePath;
    }
    const { data, error } = await supabase
      .from('student_assessments')
      .insert(insertPayload)
      .select('id, created_at')
      .single();

    if (error) {
      console.error('[POST /api/assessments] insert failed:', error);
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
    }
    // Send admin email notification (fire-and-forget, non-blocking)
    sendAssessmentNotification({
      firstName,
      lastName,
      email,
      whatsapp,
      country,
      currentEducation: (body.currentEducation as string) || null,
      intendedMajor: (body.intendedMajor as string) || null,
      targetUniversities: (body.targetUniversities as string) || null,
      hasTranscript: Boolean(transcript.name) || Boolean(transcriptStoragePath),
      transcriptFileName: transcript.name || null,
      sourcePage,
      submittedAt: data.created_at,
    }).catch((err) =>
      console.error('[POST /api/assessments] email notification failed:', err),
    );
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[POST /api/assessments] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
