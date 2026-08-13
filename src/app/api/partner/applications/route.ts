import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv, buildServiceClient } from '@/lib/supabase-auth';
import { hydrateUserEmails } from '@/lib/partner-user-lookup';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
  parsePartnerApplicationStatus,
} from '@/lib/partner-application-mapper';
import { validatePartnerApplicationPayload } from '@/lib/partner-application-validation';

/**
 * GET /api/partner/applications
 *
 * List this partner's applications. Optional filters:
 *   - search : free-text on student_name + university + program
 *   - status : exact match (Draft | Submitted | In Review | Accepted | Rejected | Withdrawn)
 *   - decision: exact match
 *   - sort   : created_at | updated_at | student_name  (default created_at)
 *   - order  : asc | desc                             (default desc)
 *   - page, limit
 *
 * Response: { applications, total, page, limit, totalPages }
 *
 * Auth: requirePartner. Per-request authed client (RLS scopes it).
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = parsePartnerApplicationStatus(searchParams.get('status'));
    const decision = searchParams.get('decision')?.trim() || '';
    const priority = searchParams.get('priority')?.trim() || '';
    // Phase 1.12: filter by FK instead of soft name match when the
    // student detail page knows the partner_students.id. The
    // partner_student_id is in the standard UUID format, so we
    // just pass it through.
    const studentId = searchParams.get('studentId')?.trim() || '';
    const validPriorities = ['Low', 'Normal', 'High', 'Urgent'];
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    // Phase 50b: same soft-delete filter pattern as
    // /api/partner/students. ?archived=true includes archived
    // rows, ?archived=only returns ONLY archived, default
    // hides them.
    const archivedParam = searchParams.get('archived') || 'false';

    const allowedSort = ['created_at', 'updated_at', 'student_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    let query = auth.supabase
      .from('partner_applications')
      .select('*', { count: 'exact' })
      .order(sort, { ascending });

    // Phase 3: role='member' sees ONLY rows they created.
    if (auth.role === 'member') {
      query = query.eq('created_by_user_id', auth.user.id);
    }

    if (status) query = query.eq('status', status);
    if (decision) query = query.eq('decision', decision);
    if (priority && validPriorities.includes(priority)) {
      query = query.eq('priority', priority);
    }
    // Phase 50b: soft-delete filter
    if (archivedParam === 'only') {
      query = query.not('archived_at', 'is', null);
    } else if (archivedParam !== 'true') {
      query = query.is('archived_at', null);
    }
    if (studentId) {
      // Defense: the partner can only filter by their own students.
      // We re-verify via a separate query if we want to be paranoid,
      // but the auth context already scoped the partner_id so a
      // foreign studentId won't match anything in the result set.
      query = query.eq('student_id', studentId);
    }
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `student_name.ilike.%${safe}%,university.ilike.%${safe}%,program.ilike.%${safe}%`,
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[partner/applications GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Phase 18: hydrate created_by_email via the partner-user-lookup
    // helper. Was using auth.admin.listUsers({perPage: 200}) which
    // silently truncated at 201+ project users — the exact regression
    // Phase 12 was supposed to fix everywhere (caught the team GET
    // + 3 others, missed this one). The helper does parallel
    // getUserById calls with a 60s cache, so only the team members
    // who actually appear in the page are fetched, and the partner
    // server never holds the full user list in memory. Uses the
    // service client (auth.admin.* needs elevated access; the
    // session-bound client from requireTeamMember isn't enough).
    const userIds = Array.from(
      new Set(
        (data || [])
          .map((r) => (r as { created_by_user_id?: string | null }).created_by_user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const emailMap = userIds.length
      ? await hydrateUserEmails(buildServiceClient(), userIds)
      : new Map();
    const applications = (data || []).map((r) => {
      const id = (r as { created_by_user_id?: string | null }).created_by_user_id;
      const hydrated = id ? emailMap.get(id) : undefined;
      return mapPartnerApplicationFromDb({
        ...(r as Record<string, unknown>),
        created_by_email: hydrated?.email ?? null,
      } as Parameters<typeof mapPartnerApplicationFromDb>[0]);
    });
    const total = count || 0;

    return NextResponse.json({
      applications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/partner/applications
 *
 * Create a new application in the partner's pipeline. Body (camelCase):
 *   - studentName (required)
 *   - university (required)
 *   - program (required)
 *   - studentEmail, studentPhone, intake, degree, nationality, priority,
 *     notes, applicationNumber (all optional)
 *   - any of the 26 S26 extended application fields (passport,
 *     academic, language, personal statement, funding) — all optional
 *
 * Status / decision / submitted_at / created_by_user_id are server-
 * derived — never trust the client. The partner can't create a row
 * in any state other than Draft / Pending.
 *
 * Response: { application }
 */
export async function POST(request: NextRequest) {
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();

    if (!body.studentName || !String(body.studentName).trim()) {
      return NextResponse.json({ error: 'studentName is required' }, { status: 400 });
    }
    // Phase 54: university and program are no longer hard-required.
    // The validation below enforces that notes describe the desired
    // school/program when either is missing.

    // S27: status / decision / submitted_at are admin-only. The
    // partner's job is intake; SICA's admin team drives the
    // workflow. Reject any attempt to set them on create.
    const partnerForbiddenFields = [
      'status',
      'decision',
      'submittedAt',
      'submitted_at',
    ];
    for (const key of partnerForbiddenFields) {
      if (body[key] !== undefined) {
        return NextResponse.json(
          {
            error: `Field '${key}' is admin-only. SICA's admin team sets the application status and decision.`,
          },
          { status: 403 },
        );
      }
    }

    // Phase A: server-side field validation before mapping. Catches
    // length overflows, malformed emails, invalid dates, and enum
    // typos before they hit the DB.
    const validationErrors = validatePartnerApplicationPayload(body, 'create');
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: validationErrors[0].message, errors: validationErrors },
        { status: 400 },
      );
    }

    let dbRow: Record<string, unknown>;
    try {
      dbRow = mapPartnerApplicationToDb(body);
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Invalid field value' },
        { status: 400 },
      );
    }
    // Belt-and-suspenders: drop any of the admin-only fields that
    // might have leaked through the mapper. The earlier 403 check
    // is the user-facing error path; this is the safety net.
    for (const key of ['status', 'decision', 'submitted_at']) {
      delete (dbRow as Record<string, unknown>)[key];
    }
    dbRow.partner_id = auth.partnerId;
    // Phase 3: server-derived created_by_user_id — never trust client
    dbRow.created_by_user_id = auth.user.id;
    // S27: always start as Draft / Pending. The admin team will
    // move it from there.
    dbRow.status = 'Draft';
    dbRow.decision = 'Pending';

    // Phase D: inherit the linked student profile from the parent
    // partner_students row so new applications show up in the admin
    // student detail immediately (not only after a re-link backfill).
    if (dbRow.student_id) {
      const service = buildServiceClient();
      const { data: psLink } = await service
        .from('partner_students')
        .select('linked_student_profile_id')
        .eq('id', dbRow.student_id as string)
        .maybeSingle();
      if (psLink?.linked_student_profile_id) {
        dbRow.linked_student_profile_id = psLink.linked_student_profile_id;
      }
    }

    // Auto-mint application_number (PA-YYYY-NNNN, per-partner counter)
    // if the partner didn't supply one. Done via RPC because the
    // counter is held in a side table and we want it atomic under
    // concurrent inserts.
    if (!dbRow.application_number) {
      const { data: minted, error: mintError } = await auth.supabase.rpc(
        'next_partner_app_number',
        { p_partner_id: auth.partnerId },
      );
      if (mintError) {
        // Non-fatal: insert will still succeed; partner can edit
        // the row later to set a number manually.
        console.warn('[partner/applications POST] next_partner_app_number failed:', mintError);
      } else if (typeof minted === 'string' && minted) {
        dbRow.application_number = minted;
      }
    }

    const { data, error } = await auth.supabase
      .from('partner_applications')
      .insert(dbRow)
      .select('*')
      .single();

    if (error) {
      console.error('[partner/applications POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { application: mapPartnerApplicationFromDb(data) },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
