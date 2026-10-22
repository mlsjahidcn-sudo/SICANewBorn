import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';
import { sanitizeOrTerm, parseIntParam } from '@/lib/postgrest';
import { queryPrograms, parseProgramQueryParams } from '@/lib/program-query';
import { mapUniversityFromDb } from '@/lib/catalog-mappers';
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const params = new URL(request.url).searchParams;
    const service = buildServiceClient();
    const page = parseIntParam(params.get('page'), 1); const limit = 50;
    if (params.get('kind') === 'student') {
      let q = service.from('student_profiles').select('id, first_name, last_name, email', { count: 'exact' }).order('last_name').order('id');
      if (params.get('value')) q = q.eq('id', params.get('value'));
      if (params.get('search')) { const safe = sanitizeOrTerm(params.get('search') || ''); q = q.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%`); }
      const { data, count, error } = await q.range((page - 1) * limit, page * limit - 1);
      if (error) throw new Error(error.message);
      return NextResponse.json({ options: (data || []).map(row => ({ value: row.id, label: [row.first_name, row.last_name].filter(Boolean).join(' ') || row.email || row.id, sublabel: row.email || '', record: { id: row.id } })), hasMore: page * limit < (count || 0) });
    }
    const programParams = new URLSearchParams({ page: String(page), limit: String(limit), sort: 'name' });
    if (params.get('search')) programParams.set('search', params.get('search') || '');
    if (params.get('degree')) programParams.set('degree', params.get('degree') || '');
    const result = await queryPrograms(parseProgramQueryParams(programParams));
    if ('error' in result) throw new Error(String(result.error));
    const slugs = [...new Set(result.programs.map(p => p.universitySlug))];
    const { data: universities, error } = slugs.length ? await service.from('universities').select('*').in('slug', slugs) : { data: [], error: null };
    if (error) throw new Error(error.message);
    return NextResponse.json({ options: result.programs.map(program => {
      const universityRow = universities?.find(u => u.slug === program.universitySlug);
      const university = universityRow ? mapUniversityFromDb(universityRow) : null;
      return { value: program.slug, label: program.name, sublabel: `${university?.name || program.universitySlug} · ${program.degree}`, disabled: !university, record: { program, university } };
    }), hasMore: page < result.totalPages });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load options' }, { status: 500 });
  }
}
