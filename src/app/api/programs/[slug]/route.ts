import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { programs as staticPrograms } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { programSchema } from '@/lib/validators/program';
import { validationErrorResponse, pickSentFields } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';
// Track 1.3 U2: DB mappers consolidated into src/lib/catalog-mappers.ts.
import { mapProgramFromDb, mapProgramToDb } from '@/lib/catalog-mappers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return NextResponse.json({ program: mapProgramFromDb(data) });
    }
  }

  const program = staticPrograms.find((p) => p.slug === slug);
  if (!program) {
    return NextResponse.json({ error: 'Program not found' }, { status: 404 });
  }
  return NextResponse.json({ program });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Phase 71: catalog mutations are admin-only (service-role client,
  // RLS bypass — see /api/universities/[slug]).
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { slug } = await params;
  try {
    // Track 1.3 U2: partial PUT — fetch the existing row first, then
    // overlay only the fields the client sent (see universities/[slug]).
    const { data: existing, error: fetchError } = await supabaseServer
      .from('programs')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const raw = await request.json();
    const parsed = programSchema.partial().safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    // Slug is excluded from the update payload (immutable in PUT; U4).
    const merged = { ...mapProgramFromDb(existing), ...pickSentFields(parsed.data, raw) };
    const { slug: _ignored, ...updateRecord } = mapProgramToDb(merged);

    const { data, error } = await supabaseServer
      .from('programs')
      .update(updateRecord)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('[programs/:slug PUT] supabase error:', error);
      return NextResponse.json({ error: 'Failed to update program' }, { status: 400 });
    }
    if (!data) return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    revalidateTag(CACHE_TAGS.programs, 'default');
    revalidateTag(CACHE_TAGS.program(slug), 'default');
    return NextResponse.json({ program: mapProgramFromDb(data) });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Phase 71: admin-only (see PUT above).
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { slug } = await params;
  const { error } = await supabaseServer
    .from('programs')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error('[programs/:slug DELETE] supabase error:', error);
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 400 });
  }
  revalidateTag(CACHE_TAGS.programs, 'default');
  revalidateTag(CACHE_TAGS.program(slug), 'default');
  return NextResponse.json({ success: true });
}

