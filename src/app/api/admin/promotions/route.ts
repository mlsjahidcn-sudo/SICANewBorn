import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  mapPartnerPromotionFromDb,
  mapPartnerPromotionToDb,
  type PartnerPromotionWithDetails,
} from '@/lib/partner-promotion-mapper';

export const dynamic = 'force-dynamic';

function mapDetails(row: Record<string, unknown>): PartnerPromotionWithDetails {
  const base = mapPartnerPromotionFromDb(row as unknown as Parameters<typeof mapPartnerPromotionFromDb>[0]);

  const rawUniversity = row.university as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null
    | undefined;
  const rawProgram = row.program as
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null
    | undefined;

  const uniObj = Array.isArray(rawUniversity) ? rawUniversity[0] : rawUniversity;
  const progObj = Array.isArray(rawProgram) ? rawProgram[0] : rawProgram;

  return {
    ...base,
    university: uniObj
      ? {
          id: String(uniObj.id),
          slug: String(uniObj.slug),
          name: String(uniObj.name),
          nameCn: uniObj.name_cn ? String(uniObj.name_cn) : null,
          city: uniObj.city ? String(uniObj.city) : null,
          logo: uniObj.logo ? String(uniObj.logo) : null,
        }
      : null,
    program: progObj
      ? {
          id: String(progObj.id),
          slug: String(progObj.slug),
          name: String(progObj.name),
          nameCn: progObj.name_cn ? String(progObj.name_cn) : null,
          degree: progObj.degree ? String(progObj.degree) : null,
          language: progObj.language ? String(progObj.language) : null,
          discipline: progObj.discipline ? String(progObj.discipline) : null,
          universitySlug: progObj.university_slug ? String(progObj.university_slug) : null,
        }
      : null,
  };
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string' && v.trim()).map(String);
  return [];
}

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status')?.trim();
    const visibility = searchParams.get('visibility')?.trim();
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const service = buildServiceClient();
    let query = service
      .from('partner_promotions')
      .select(
        `*,
         university:university_id (id, slug, name, name_cn, city, logo),
         program:program_id (id, slug, name, name_cn, degree, language, discipline, university_slug)`,
        { count: 'exact' },
      )
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (visibility) query = query.eq('visibility', visibility);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.or(
        `university.name.ilike.%${safe}%,program.name.ilike.%${safe}%,internal_notes.ilike.%${safe}%`,
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('[admin/promotions GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const promotions = ((data || []) as Record<string, unknown>[]).map(mapDetails);

    return NextResponse.json({
      promotions,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();

    if (!body.universityId || typeof body.universityId !== 'string') {
      return NextResponse.json({ error: 'universityId is required' }, { status: 400 });
    }
    if (!body.programId || typeof body.programId !== 'string') {
      return NextResponse.json({ error: 'programId is required' }, { status: 400 });
    }
    const amount = typeof body.serviceFeeAmount === 'string'
      ? parseFloat(body.serviceFeeAmount)
      : Number(body.serviceFeeAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'serviceFeeAmount must be a positive number' }, { status: 400 });
    }

    const insert = {
      ...mapPartnerPromotionToDb({
        universityId: body.universityId,
        programId: body.programId,
        serviceFeeAmount: amount,
        serviceFeeCurrency: body.serviceFeeCurrency || 'CNY',
        visibility: body.visibility || 'partner_only',
        targetCountries: asStringArray(body.targetCountries),
        restrictedCountries: asStringArray(body.restrictedCountries),
        status: body.status || 'active',
        priority: typeof body.priority === 'number' ? body.priority : parseInt(String(body.priority ?? '0'), 10) || 0,
        internalNotes: body.internalNotes || null,
        partnerNotes: body.partnerNotes || null,
      }),
      created_by: auth.user.id,
    };

    const service = buildServiceClient();
    const { data, error } = await service
      .from('partner_promotions')
      .insert(insert)
      .select(
        `*,
         university:university_id (id, slug, name, name_cn, city, logo),
         program:program_id (id, slug, name, name_cn, degree, language, discipline, university_slug)`,
      )
      .single();

    if (error) {
      console.error('[admin/promotions POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ promotion: mapDetails(data) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
