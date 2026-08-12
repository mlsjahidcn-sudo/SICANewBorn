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

function asStringArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string' && v.trim()).map(String);
  return [];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const service = buildServiceClient();
    const { data, error } = await service
      .from('partner_promotions')
      .select(
        `*,
         university:university_id (id, slug, name, name_cn, city, logo),
         program:program_id (id, slug, name, name_cn, degree, language, discipline, university_slug)`,
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('[admin/promotions/[id] GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ promotion: mapDetails(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await request.json();

    const update: Record<string, unknown> = {};

    if (body.universityId !== undefined) update.university_id = body.universityId;
    if (body.programId !== undefined) update.program_id = body.programId;
    if (body.serviceFeeAmount !== undefined) {
      const amount = typeof body.serviceFeeAmount === 'string'
        ? parseFloat(body.serviceFeeAmount)
        : Number(body.serviceFeeAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json({ error: 'serviceFeeAmount must be a positive number' }, { status: 400 });
      }
      update.service_fee_amount = amount;
    }
    if (body.serviceFeeCurrency !== undefined) update.service_fee_currency = String(body.serviceFeeCurrency).trim() || 'CNY';
    if (body.visibility !== undefined) update.visibility = body.visibility;
    if (body.targetCountries !== undefined) update.target_countries = asStringArray(body.targetCountries);
    if (body.restrictedCountries !== undefined) update.restricted_countries = asStringArray(body.restrictedCountries);
    if (body.status !== undefined) update.status = body.status;
    if (body.priority !== undefined) {
      update.priority = typeof body.priority === 'number' ? body.priority : parseInt(String(body.priority ?? '0'), 10) || 0;
    }
    if (body.internalNotes !== undefined) update.internal_notes = body.internalNotes || null;
    if (body.partnerNotes !== undefined) update.partner_notes = body.partnerNotes || null;

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('partner_promotions')
      .update(update)
      .eq('id', id)
      .select(
        `*,
         university:university_id (id, slug, name, name_cn, city, logo),
         program:program_id (id, slug, name, name_cn, degree, language, discipline, university_slug)`,
      )
      .single();

    if (error) {
      console.error('[admin/promotions/[id] PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ promotion: mapDetails(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const service = buildServiceClient();
    const { error } = await service.from('partner_promotions').delete().eq('id', id);

    if (error) {
      console.error('[admin/promotions/[id] DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
