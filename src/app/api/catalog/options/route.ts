import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuth, buildServiceClient } from '@/lib/supabase-auth';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
import { queryPrograms, parseProgramQueryParams } from '@/lib/program-query';
import { mapProgramFromDb, mapUniversityFromDb } from '@/lib/catalog-mappers';
import {
  PROGRAM_OPTION_COLUMNS,
  UNIVERSITY_OPTION_COLUMNS,
} from '@/lib/catalog-list-columns';

const PAGE_SIZE = 50;

/**
 * Authenticated typeahead for portal pickers (partner / student / admin).
 * Narrow columns only — never ships full catalog rows.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await getRequestAuth(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const params = new URL(request.url).searchParams;
    const service = buildServiceClient();
    const page = parseIntParam(params.get('page'), 1);
    const kind = params.get('kind');
    const value = params.get('value')?.trim() || '';
    /** When `name`, option.value is the display name (partner student free-text fields). */
    const valueAsName = params.get('valueAs') === 'name';

    if (kind === 'university') {
      if (value) {
        const { data: initialData, error } = await service
          .from('universities')
          .select(UNIVERSITY_OPTION_COLUMNS)
          .eq('slug', value)
          .maybeSingle();
        let data = initialData;
        if (error) throw new Error(error.message);
        if (!data) {
          const byName = await service
            .from('universities')
            .select(UNIVERSITY_OPTION_COLUMNS)
            .eq('name', value)
            .limit(1)
            .maybeSingle();
          if (byName.error) throw new Error(byName.error.message);
          data = byName.data;
        }
        if (!data) return NextResponse.json({ options: [], hasMore: false });
        return NextResponse.json({
          options: [
            {
              value: valueAsName ? data.name : data.slug,
              label: data.name,
              sublabel: data.city || '',
              logo: data.logo || undefined,
              record: mapUniversityFromDb(data as Record<string, unknown>),
            },
          ],
          hasMore: false,
        });
      }
      let q = service
        .from('universities')
        .select(UNIVERSITY_OPTION_COLUMNS, { count: 'exact' })
        .order('name');
      if (params.get('search')) {
        const safe = sanitizeOrTerm(params.get('search') || '');
        q = q.or(`name.ilike.%${safe}%,name_cn.ilike.%${safe}%,city.ilike.%${safe}%`);
      }
      const { data, count, error } = await q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      return NextResponse.json({
        options: (data || []).map((row) => ({
          value: valueAsName ? row.name : row.slug,
          label: row.name,
          sublabel: row.city || '',
          logo: row.logo || undefined,
          record: mapUniversityFromDb(row as Record<string, unknown>),
        })),
        hasMore: page * PAGE_SIZE < (count || 0),
      });
    }

    // Default: programs
    if (value) {
      const { data: initialData, error } = await service
        .from('programs')
        .select(PROGRAM_OPTION_COLUMNS)
        .eq('slug', value)
        .maybeSingle();
      let data = initialData;
      if (error) throw new Error(error.message);
      if (!data) {
        const byName = await service
          .from('programs')
          .select(PROGRAM_OPTION_COLUMNS)
          .eq('name', value)
          .limit(1)
          .maybeSingle();
        if (byName.error) throw new Error(byName.error.message);
        data = byName.data;
      }
      if (!data) return NextResponse.json({ options: [], hasMore: false });
      const program = mapProgramFromDb(data as Record<string, unknown>);
      const universitySlug = String(program.universitySlug ?? '');
      const { data: universityRow } = universitySlug
        ? await service
            .from('universities')
            .select(UNIVERSITY_OPTION_COLUMNS)
            .eq('slug', universitySlug)
            .maybeSingle()
        : { data: null };
      const university = universityRow
        ? mapUniversityFromDb(universityRow as Record<string, unknown>)
        : null;
      return NextResponse.json({
        options: [
          {
            value: valueAsName ? String(program.name ?? '') : String(program.slug),
            label: String(program.name ?? ''),
            sublabel: `${university?.name || universitySlug} · ${String(program.degree ?? '')}`,
            logo: university?.logo || undefined,
            record: { program, university },
          },
        ],
        hasMore: false,
      });
    }

    const programParams = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      sort: 'name',
    });
    if (params.get('search')) programParams.set('search', params.get('search') || '');
    if (params.get('degree')) programParams.set('degree', params.get('degree') || '');
    if (params.get('university')) programParams.set('university', params.get('university') || '');
    const result = await queryPrograms(parseProgramQueryParams(programParams));
    if ('error' in result) throw new Error(String(result.error));
    const slugs = [...new Set(result.programs.map((p) => p.universitySlug).filter(Boolean))];
    const { data: universities, error } = slugs.length
      ? await service.from('universities').select(UNIVERSITY_OPTION_COLUMNS).in('slug', slugs)
      : { data: [], error: null };
    if (error) throw new Error(error.message);
    return NextResponse.json({
      options: result.programs.map((program) => {
        const universityRow = universities?.find((u) => u.slug === program.universitySlug);
        const university = universityRow
          ? mapUniversityFromDb(universityRow as Record<string, unknown>)
          : null;
        return {
          value: valueAsName ? String(program.name ?? '') : String(program.slug),
          label: String(program.name ?? ''),
          sublabel: `${university?.name || program.universitySlug} · ${String(program.degree ?? '')} · ${String(program.language ?? '')}`,
          logo: university?.logo || undefined,
          record: { program, university },
        };
      }),
      hasMore: page * PAGE_SIZE < result.total,
    });
  } catch (err) {
    console.error('[catalog/options]', err);
    return NextResponse.json({ error: 'Unable to load catalog options' }, { status: 500 });
  }
}
