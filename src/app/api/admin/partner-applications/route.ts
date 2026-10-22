import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';
import {
  mapPartnerApplicationFromDb,
  parsePartnerApplicationStatus,
  parsePartnerApplicationDecision,
  parsePartnerApplicationDegree,
} from '@/lib/partner-application-mapper';

/**
 * GET /api/admin/partner-applications
 *
 * Admin list of all partner_applications across every partner.
 *
 * Optional query params:
 *   - search      : free-text on student_name + university + program
 *   - status      : exact match (Draft | Submitted | In Review | Accepted | Rejected | Withdrawn)
 *   - decision    : exact match
 *   - priority    : Low | Normal | High | Urgent
 *   - partnerId   : filter to a single partner (e.g. drill from /admin/partners/[id])
 *   - sort        : created_at | updated_at | student_name (default created_at)
 *   - order       : asc | desc (default desc)
 *   - page, limit : pagination (default 20, max 100)
 *
 * Response: { applications, total, page, limit, totalPages }
 *
 * Auth: requireAdmin. Uses the service client so RLS doesn't hide any
 * partner's rows from the admin.
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const statusRaw = searchParams.get('status')?.trim() || '';
    const decisionRaw = searchParams.get('decision')?.trim() || '';
    const priorityRaw = searchParams.get('priority')?.trim() || '';
    const partnerId = searchParams.get('partnerId')?.trim() || '';
    const sortRaw = searchParams.get('sort') || 'created_at';
    const orderRaw = searchParams.get('order') || 'desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10)),
    );

    const allowedSort = ['created_at', 'updated_at', 'student_name'];
    const sort = allowedSort.includes(sortRaw) ? sortRaw : 'created_at';
    const ascending = orderRaw === 'asc';

    const status = parsePartnerApplicationStatus(statusRaw);
    const decision = parsePartnerApplicationDecision(decisionRaw);

    const service = buildServiceClient();
    let query = service
      .from('partner_applications')
      .select('*', { count: 'exact' })
      .order(sort, { ascending });

    if (status) query = query.eq('status', status);
    if (decision) query = query.eq('decision', decision);
    if (
      priorityRaw &&
      ['Low', 'Normal', 'High', 'Urgent'].includes(priorityRaw)
    ) {
      query = query.eq('priority', priorityRaw);
    }
    if (partnerId) query = query.eq('partner_id', partnerId);
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
      console.error('[admin/partner-applications GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Hydrate partner name for each row so the list page can show
    // "Partner: SICA Education Group" without a second round-trip.
    const partnerIds = Array.from(
      new Set(
        (data || [])
          .map((r) => (r as { partner_id?: string }).partner_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const partnerNameById = new Map<string, string>();
    if (partnerIds.length) {
      const { data: partners } = await service
        .from('partners')
        .select('id, company_name, contact_person')
        .in('id', partnerIds);
      for (const p of partners || []) {
        partnerNameById.set(
          p.id,
          p.company_name || p.contact_person || p.id.slice(0, 8),
        );
      }
    }

    // Hydrate created_by_email via auth.admin.listUsers (same as partner list)
    const userIds = Array.from(
      new Set(
        (data || [])
          .map((r) => (r as { created_by_user_id?: string | null }).created_by_user_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );
    const emailMap = new Map<string, string>();
    if (userIds.length) {
      const { data: usersPage } = await service.auth.admin.listUsers({
        perPage: 200,
      });
      for (const u of usersPage?.users || []) {
        if (userIds.includes(u.id)) {
          emailMap.set(u.id, u.email || '');
        }
      }
    }

    const applications = (data || []).map((r) => {
      const row = r as Record<string, unknown>;
      const partnerId = (row.partner_id as string) || '';
      return {
        ...mapPartnerApplicationFromDb(
          row as unknown as Parameters<typeof mapPartnerApplicationFromDb>[0],
        ),
        partnerName: partnerNameById.get(partnerId) || null,
        createdByEmail:
          (emailMap.get((row.created_by_user_id as string) || '') as string) || null,
      };
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
    console.error('[admin/partner-applications GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/partner-applications
 *
 * Create another application for an existing partner student. Identity
 * fields are copied from the student row. Documents, notes, and status
 * are not. A second program or intake is allowed; the same open
 * university + program + intake is refused.
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const studentId = String(body.studentId || '').trim();
    const university = String(body.university || '').trim();
    const program = String(body.program || '').trim();
    const programSlug = String(body.programSlug || '').trim();
    const degree = String(body.degree || '').trim();
    const intake = String(body.intake || '').trim();

    if (!studentId || !university || !program || !programSlug || !degree || !intake) {
      return NextResponse.json(
        { error: 'studentId, university, program, programSlug, degree, and intake are required' },
        { status: 400 },
      );
    }
    if (!parsePartnerApplicationDegree(degree)) {
      return NextResponse.json(
        { error: 'degree is not a catalog degree' },
        { status: 400 },
      );
    }

    const service = buildServiceClient();
    const { data: student, error: studentError } = await service
      .from('partner_students')
      .select('id, partner_id, student_name, student_email, student_phone, nationality, linked_student_profile_id, archived_at')
      .eq('id', studentId)
      .maybeSingle();
    if (studentError) {
      console.error('[admin/partner-applications POST] student lookup:', studentError);
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }
    if (!student || student.archived_at) {
      return NextResponse.json({ error: 'Partner student not found' }, { status: 404 });
    }
    if (!String(student.student_name || '').trim()) {
      return NextResponse.json({ error: 'Partner student has no name' }, { status: 400 });
    }

    const { data: existing, error: duplicateError } = await service
      .from('partner_applications')
      .select('id, application_number, status')
      .eq('student_id', studentId)
      .eq('university', university)
      .eq('program', program)
      .eq('intake', intake)
      .is('archived_at', null)
      .not('status', 'in', '("Rejected","Withdrawn")')
      .limit(1)
      .maybeSingle();
    if (duplicateError) {
      console.error('[admin/partner-applications POST] duplicate lookup:', duplicateError);
      return NextResponse.json({ error: duplicateError.message }, { status: 500 });
    }
    if (existing) {
      const row = existing as { id: string; application_number?: string | null; status: string };
      return NextResponse.json(
        {
          error: `An open application already exists for this university, program, and intake${row.application_number ? ` (${row.application_number})` : ''}.`,
          code: 'DUPLICATE_APPLICATION',
          existingId: row.id,
          existingApplicationNumber: row.application_number ?? null,
          existingStatus: row.status,
        },
        { status: 409 },
      );
    }

    let applicationNumber: string | null = null;
    const { data: minted, error: mintError } = await service.rpc('next_partner_app_number', {
      p_partner_id: student.partner_id,
    });
    if (mintError) {
      console.warn('[admin/partner-applications POST] next_partner_app_number failed:', mintError);
    } else if (typeof minted === 'string' && minted) {
      applicationNumber = minted;
    }

    const insert = {
      partner_id: student.partner_id,
      student_id: student.id,
      student_name: String(student.student_name).trim(),
      student_email: student.student_email || null,
      student_phone: student.student_phone || null,
      nationality: student.nationality || null,
      linked_student_profile_id: student.linked_student_profile_id || null,
      university,
      program,
      program_slug: programSlug,
      degree,
      intake,
      status: 'Draft',
      decision: 'Pending',
      source: 'admin_manual',
      application_number: applicationNumber,
      created_by_user_id: auth.user.id,
    };

    const { data, error } = await service
      .from('partner_applications')
      .insert(insert)
      .select('*')
      .single();
    if (error) {
      console.error('[admin/partner-applications POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { application: mapPartnerApplicationFromDb(data) },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/partner-applications POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
