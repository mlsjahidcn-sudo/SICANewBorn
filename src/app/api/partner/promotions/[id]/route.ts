import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember } from '@/lib/supabase-auth';
import {
  mapPartnerPromotionFromDb,
  isPromotionEligibleForCountry,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireTeamMember(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const partnerCountry = (auth.partner.country as string | null | undefined) || '';

    const { data, error } = await auth.supabase
      .from('partner_promotions')
      .select(
        `*,
         university:university_id (id, slug, name, name_cn, city, logo),
         program:program_id (id, slug, name, name_cn, degree, language, discipline, university_slug)`,
      )
      .eq('id', id)
      .in('status', ['active', 'paused'])
      .maybeSingle();

    if (error) {
      console.error('[partner/promotions/[id] GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    const promotion = mapDetails(data);
    const isCountryEligible =
      !partnerCountry || isPromotionEligibleForCountry(promotion, partnerCountry);

    return NextResponse.json({ promotion: { ...promotion, isCountryEligible } });
  } catch (error) {
    console.error('[partner/promotions/[id] GET] error:', error);
    return NextResponse.json({ error: 'Failed to fetch promotion' }, { status: 500 });
  }
}
