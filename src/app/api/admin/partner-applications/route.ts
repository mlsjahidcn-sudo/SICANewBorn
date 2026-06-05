import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';
import {
  mapPartnerApplicationFromDb,
  mapPartnerApplicationToDb,
  parsePartnerApplicationStatus,
  parsePartnerApplicationDecision,
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
    let partnerNameById = new Map<string, string>();
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
    let emailMap = new Map<string, string>();
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
