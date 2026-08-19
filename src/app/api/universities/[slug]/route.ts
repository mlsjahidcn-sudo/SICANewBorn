import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities } from '@/lib/data';
import { CACHE_TAGS } from '@/lib/cache';
import { universitySchema } from '@/lib/validators/university';
import { validationErrorResponse, pickSentFields } from '@/lib/validators/shared';
import { requireAdmin } from '@/lib/supabase-auth';
// Track 1.3 U2: DB mappers consolidated into src/lib/catalog-mappers.ts.
import { mapUniversityFromDb, mapUniversityToDb } from '@/lib/catalog-mappers';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Try Supabase first
  if (isSupabaseServerConfigured() && supabaseServer) {
    const { data, error } = await supabaseServer
      .from('universities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return NextResponse.json({ university: mapUniversityFromDb(data) });
    }
  }

  // Fallback to static data
  const university = staticUniversities.find((u) => u.slug === slug);
  if (!university) {
    return NextResponse.json({ error: 'University not found' }, { status: 404 });
  }
  return NextResponse.json({ university });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Phase 71: catalog mutations are admin-only. This route uses the
  // service-role client (RLS bypass), so without this gate anyone
  // could rewrite the catalog.
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
    // overlay only the fields the client sent. Previously the full
    // schema's zod defaults ('' / [] / 0) blanked any omitted field.
    const { data: existing, error: fetchError } = await supabaseServer
      .from('universities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    const raw = await request.json();
    const parsed = universitySchema.partial().safeParse(raw);
    if (!parsed.success) return validationErrorResponse(parsed.error);

    // Slug is excluded from the update payload: the path slug is the
    // identifier and renaming slugs is out of scope for PUT (U4).
    const merged = { ...mapUniversityFromDb(existing), ...pickSentFields(parsed.data, raw) };
    const { slug: _ignored, ...updateRecord } = mapUniversityToDb(merged);

    const { data, error } = await supabaseServer
      .from('universities')
      .update(updateRecord)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('[universities/:slug PUT] supabase error:', error);
      return NextResponse.json({ error: 'Failed to update university' }, { status: 400 });
    }
    if (!data) return NextResponse.json({ error: 'University not found' }, { status: 404 });
    revalidateTag(CACHE_TAGS.universities, 'default');
    revalidateTag(CACHE_TAGS.university(slug), 'default');
    return NextResponse.json({ university: mapUniversityFromDb(data) });
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
    .from('universities')
    .delete()
    .eq('slug', slug);

  if (error) {
    console.error('[universities/:slug DELETE] supabase error:', error);
    return NextResponse.json({ error: 'Failed to delete university' }, { status: 400 });
  }
  revalidateTag(CACHE_TAGS.universities, 'default');
  revalidateTag(CACHE_TAGS.university(slug), 'default');
  return NextResponse.json({ success: true });
}

