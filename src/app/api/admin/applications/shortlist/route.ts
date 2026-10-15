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

  // ─────────────────────────────────────────────────────────────────
  // Phase 180: appending to an EXISTING shortlist
  // ─────────────────────────────────────────────────────────────────
  // Previously this route always minted a fresh campaign_id, so an
  // advisor who built 3 targets and later wanted a 4th got a SECOND
  // shortlist for the same student — which Phase 176's grouped view
  // then renders as two unrelated cards. The campaign is authoritative
  // for student + intake; we inherit rather than trust the client, and
  // reject a mismatched body outright.
  const campaignIdIn = typeof body.campaignId === 'string' ? body.campaignId.trim() : '';

  let campaignId = campaignIdIn;
  const effectiveStudentId = studentId;
  let effectiveIntake = intake;

  if (campaignIdIn) {
    const { data: existing, error: existingErr } = await service
      .from('student_applications')
      .select('student_id, intake, university_id')
      .eq('campaign_id', campaignIdIn)
      .limit(1)
      .maybeSingle();
    if (existingErr) {
      console.error('[shortlist] campaign lookup failed:', existingErr);
      return NextResponse.json({ error: 'Could not read that shortlist' }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Shortlist not found' }, { status: 404 });
    }
    const owner = existing as { student_id: string | null; intake: string | null; university_id: string };

    if (owner.student_id !== studentId) {
      return NextResponse.json(
        { error: 'That shortlist belongs to a different student' },
        { status: 400 },
      );
    }
    if (owner.intake && owner.intake !== intake) {
      return NextResponse.json(
        { error: `That shortlist is for intake "${owner.intake}", not "${intake}"` },
        { status: 400 },
      );
    }

    // ── One university per shortlist ──
    // Phase 176's grouped view assumes a campaign's targets are
    // distinct schools. Appending a university already in this
    // campaign would silently violate that assumption and render a
    // card with the same school twice.
    const { data: existingUnis } = await service
      .from('student_applications')
      .select('university_id')
      .eq('campaign_id', campaignIdIn);

    const taken = new Set(
      ((existingUnis ?? []) as { university_id: string }[]).map((r) => r.university_id),
    );

    effectiveIntake = owner.intake || intake;

    // Re-validate with the duplicate rule folded in. validateShortlist
    // already rejects duplicates WITHIN the submitted batch; this
    // catches them against the campaign's EXISTING rows.
    const collisions = validation.targets
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => taken.has(t.universityId || 'manual'));
    if (collisions.length > 0) {
      return NextResponse.json(
        {
          error: 'Already in this shortlist',
          issues: collisions.map(({ t, i }) => ({
            index: i,
            field: 'universityId',
            reason: `${t.universityName} is already a target in this shortlist`,
          })),
        },
        { status: 400 },
      );
    }
  }

  // ── One campaign for the whole shortlist ─────────────────────────────
  // Append mode reuses the caller's campaignId; create mode mints one.
  if (!campaignId) campaignId = crypto.randomUUID();

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
      intake: effectiveIntake,
      status: 'Submitted',
      priority: 'Medium',
      application_number: rpcData as string,
    };
    if (effectiveStudentId) insert.student_id = effectiveStudentId;
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
      intake: effectiveIntake,
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
