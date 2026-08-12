import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const service = buildServiceClient();

    const { data: universities, error: uErr } = await service
      .from('universities')
      .select('id, slug, name, name_cn, city, logo')
      .order('name', { ascending: true });

    if (uErr) {
      console.error('[admin/promotions/options] universities error:', uErr);
      return NextResponse.json({ error: uErr.message }, { status: 500 });
    }

    const { data: programs, error: pErr } = await service
      .from('programs')
      .select('id, slug, name, name_cn, degree, language, discipline, university_slug')
      .order('name', { ascending: true });

    if (pErr) {
      console.error('[admin/promotions/options] programs error:', pErr);
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    return NextResponse.json({
      universities: (universities || []).map((u) => ({
        id: String(u.id),
        slug: String(u.slug),
        name: String(u.name),
        nameCn: u.name_cn ? String(u.name_cn) : null,
        city: u.city ? String(u.city) : null,
        logo: u.logo ? String(u.logo) : null,
      })),
      programs: (programs || []).map((p) => ({
        id: String(p.id),
        slug: String(p.slug),
        name: String(p.name),
        nameCn: p.name_cn ? String(p.name_cn) : null,
        degree: p.degree ? String(p.degree) : null,
        language: p.language ? String(p.language) : null,
        discipline: p.discipline ? String(p.discipline) : null,
        universitySlug: p.university_slug ? String(p.university_slug) : null,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
