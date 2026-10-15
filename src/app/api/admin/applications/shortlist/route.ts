/**
 * POST /api/admin/applications/shortlist
 *
 * Phase 175: create N applications for one student in a single call,
 * all sharing one `campaign_id`.
 *
 * WHY NOT N CALLS TO THE EXISTING POST
 * ------------------------------------
 * The existing POST /api/admin/applications is a well-tested single-row
 * create (duplicate guard, application_number via RPC, timeline event,
 * lead attribution). It stays exactly as it is. But calling it N times
 * from the client means N round-trips, N independent application_numbers
 * (fine), and — the real problem — a half-created shortlist if call 3 of
 * 5 fails. The admin is left with two targets and no indication that
 * three were meant.
 *
 * So this route mints ONE campaign_id, then creates the rows against it.
 * A row that fails individually is reported in `failed[]` and the
 * survivors still commit — a partial shortlist is strictly better than
 * an all-or-nothing abort, because the admin can retry the missing ones
 * and the campaign_id already groups them. The response always says
 * exactly what happened.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { validateShortlist } from '@/lib/application-campaign';

export const maxDuration = 30;

interface CreatedRow {
  id: string;
  applicationNumber: string;
  universityName: string;
  programName: string;
  role: string;
}

interface FailedRow {
  universityName: string;
  programName: string;
  error: string;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const service = supabaseServer;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // ── Who is this shortlist for? ────────────────────────────────────────
  // Mirrors the existing POST's XOR rule: a linked student OR a lead
  // email, never both, never neither. Reusing the same invariant means
  // the shortlist route can never create a row the single route would
  // have rejected.
  const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
  const applicantEmail = typeof body.applicantEmail === 'string' ? body.applicantEmail.trim() : '';
  const applicantName = typeof body.applicantName === 'string' ? body.applicantName.trim() : '';

  if (!studentId && !applicantEmail) {
    return NextResponse.json(
      { error: 'Either studentId or applicantEmail is required' },
      { status: 400 },
    );
  }
  if (studentId && applicantEmail) {
    return NextResponse.json(
      { error: 'Provide either studentId OR applicantEmail, not both' },
      { status: 400 },
    );
  }
  if (applicantEmail && !applicantName) {
    return NextResponse.json(
      { error: 'applicantName is required when applicantEmail is provided' },
      { status: 400 },
    );
  }

  const intake = typeof body.intake === 'string' ? body.intake.trim() : '';
  if (!intake) {
    return NextResponse.json({ error: 'intake is required' }, { status: 400 });
  }

  const validation = validateShortlist(body.targets);
  if (!validation.ok) {
    return NextResponse.json(
      { error: 'Invalid shortlist', issues: validation.issues },
      { status: 400 },
    );
  }

  // ── One campaign for the whole shortlist ─────────────────────────────
  const campaignId = crypto.randomUUID();

  const created: CreatedRow[] = [];
  const failed: FailedRow[] = [];

  for (const target of validation.targets) {
    // application_number comes from the SQL function — atomic and
    // race-free (the S5 fix). Never hand-roll it.
    const { data: rpcData, error: rpcError } = await service.rpc('generate_application_number');
    if (rpcError || !rpcData) {
      failed.push({
        universityName: target.universityName,
        programName: target.programName,
        error: 'Failed to generate application number',
      });
      continue;
    }

    const insert: Record<string, unknown> = {
      campaign_id: campaignId,
      campaign_role: target.role,
      university_id: target.universityId || 'manual',
      university_name: target.universityName,
      university_name_cn: target.universityNameCn ?? null,
      program_id: target.programId ?? null,
      program_name: target.programName,
      program_name_cn: target.programNameCn ?? null,
      degree: target.degree,
      degree_level: target.degree,
      intake,
      status: 'Submitted',
      priority: 'Medium',
      application_number: rpcData as string,
    };
    if (studentId) insert.student_id = studentId;
    if (applicantEmail) {
      insert.applicant_name = applicantName;
      insert.applicant_email = applicantEmail;
    }

    const { data, error } = await service
      .from('student_applications')
      .insert(insert)
      .select('id, application_number')
      .single();

    if (error || !data) {
      failed.push({
        universityName: target.universityName,
        programName: target.programName,
        error: error?.message ?? 'Insert failed',
      });
      continue;
    }

    created.push({
      id: String(data.id),
      applicationNumber: String(data.application_number ?? ''),
      universityName: target.universityName,
      programName: target.programName,
      role: target.role,
    });
  }

  // Nothing landed — don't hand back a campaign_id the admin can never
  // see anything for.
  if (created.length === 0) {
    return NextResponse.json(
      { error: 'No applications were created', campaignId: null, created: [], failed },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      campaignId,
      intake,
      created,
      failed,
      /** true when at least one target failed — the UI keeps the
       *  partial result and surfaces the failures rather than
       *  pretending the shortlist is complete. */
      partial: failed.length > 0,
    },
    { status: created.length < validation.targets.length ? 207 : 201 },
  );
}
