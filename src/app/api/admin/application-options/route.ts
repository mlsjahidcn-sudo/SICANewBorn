import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
import { queryPrograms, parseProgramQueryParams } from '@/lib/program-query';
import { mapProgramFromDb, mapUniversityFromDb } from '@/lib/catalog-mappers';

const PAGE_SIZE = 50;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const params = new URL(request.url).searchParams;
    const service = buildServiceClient();
    const page = parseIntParam(params.get('page'), 1);
    const kind = params.get('kind');
    const value = params.get('value')?.trim() || '';

    if (kind === 'student') {
      let q = service.from('student_profiles').select('id, first_name, last_name, email', { count: 'exact' }).order('last_name').order('id');
      if (value) q = q.eq('id', value);
      if (params.get('search')) {
        const safe = sanitizeOrTerm(params.get('search') || '');
        q = q.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%`);
      }
      const { data, count, error } = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      return NextResponse.json({
        options: (data || []).map(row => {
          // The name travels with the record so a caller that stores
          // the id (the applications filter) can also name the
          // student in its own UI without a second lookup.
          const name = [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email || row.id;
          return {
            value: row.id,
            label: name,
            sublabel: row.email || '',
            record: { id: row.id, name },
          };
        }),
        hasMore: value ? false : page * PAGE_SIZE < (count || 0),
      });
    }

    if (kind === 'university') {
      let q = service.from('universities').select('slug, name, name_cn, city', { count: 'exact' }).order('name');
      if (value) q = q.eq('slug', value);
      if (params.get('search')) {
        const safe = sanitizeOrTerm(params.get('search') || '');
        q = q.or(`name.ilike.%${safe}%,name_cn.ilike.%${safe}%,city.ilike.%${safe}%`);
      }
      const { data, count, error } = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      return NextResponse.json({
        options: (data || []).map(row => ({
          value: row.slug,
          label: row.name,
          sublabel: row.city || '',
          record: { slug: row.slug, name: row.name },
        })),
        hasMore: value ? false : page * PAGE_SIZE < (count || 0),
      });
    }

    if (value) {
      const { data, error } = await service.from('programs').select('*').eq('slug', value).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return NextResponse.json({ options: [], hasMore: false });
      const program = mapProgramFromDb(data as Record<string, unknown>);
      const universitySlug = String(program.universitySlug ?? '');
      const { data: universityRow } = universitySlug
        ? await service.from('universities').select('*').eq('slug', universitySlug).maybeSingle()
        : { data: null };
      const university = universityRow ? mapUniversityFromDb(universityRow as Record<string, unknown>) : null;
      return NextResponse.json({
        options: [{
          value: String(program.slug),
          label: String(program.name ?? ''),
          sublabel: `${university?.name || universitySlug} · ${String(program.degree ?? '')}`,
          record: { program, university },
        }],
        hasMore: false,
      });
    }

    const programParams = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort: 'name' });
    if (params.get('search')) programParams.set('search', params.get('search') || '');
    if (params.get('degree')) programParams.set('degree', params.get('degree') || '');
    if (params.get('university')) programParams.set('university', params.get('university') || '');
    const result = await queryPrograms(parseProgramQueryParams(programParams));
    if ('error' in result) throw new Error(String(result.error));
    const slugs = [...new Set(result.programs.map(p => p.universitySlug))];
    const { data: universities, error } = slugs.length
      ? await service.from('universities').select('*').in('slug', slugs)
      : { data: [], error: null };
    if (error) throw new Error(error.message);
    return NextResponse.json({
      options: result.programs.map(program => {
        const universityRow = universities?.find(u => u.slug === program.universitySlug);
        const university = universityRow ? mapUniversityFromDb(universityRow) : null;
        return {
          value: program.slug,
          label: program.name,
          sublabel: `${university?.name || program.universitySlug} · ${program.degree}`,
          record: { program, university },
        };
      }),
      hasMore: page < result.totalPages,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load options' }, { status: 500 });
  }
}
