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
// Phase 72: emit B2B webhook events on program mutations.
import { dispatchEvent } from '@/lib/webhook-emitter';
// Track 1.3 U4 #1: cascade delete helpers.
import { isForceDelete, summarizeCascade } from '@/lib/cascade-delete';

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
    // Phase 72: fire program.updated webhook
    void dispatchEvent('program.updated', mapProgramFromDb(data));
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
  const url = new URL(request.url);
  const force = isForceDelete(url);

  // Track 1.3 U4 #1: count dependent partner_promotions. partner_applications
  // also FK to program_slug (CASCADE) but they're transparent — we surface
  // their count separately so admins know what they're deleting.
  const [{ count: promoCount }, { count: appCount }] = await Promise.all([
    supabaseServer
      .from('partner_promotions')
      .select('id', { count: 'exact', head: true })
      .eq('program_slug', slug),
    supabaseServer
      .from('partner_applications')
      .select('id', { count: 'exact', head: true })
      .eq('program_slug', slug),
  ]);

  // For the cascade-summary helper we lump both into partnerPromotions
  // (it's the only count the helper knows about). Real response shape
  // below surfaces both numbers separately.
  const summary = summarizeCascade({
    programs: 0, // no nested programs under a program
    partnerPromotions: (promoCount ?? 0) + (appCount ?? 0),
  });

  if (!summary.ok) {
    return NextResponse.json(
      {
        error: summary.hint,
        code: 'CASCADE_BLOCKED',
        counts: {
          partnerPromotions: promoCount ?? 0,
          partnerApplications: appCount ?? 0,
          total: (promoCount ?? 0) + (appCount ?? 0),
        },
        requiresForce: true,
      },
      { status: 409 },
    );
  }

  // When force=true, delete the dependents first. partner_applications
  // has ON DELETE CASCADE on program_slug, so it'll go automatically when
  // the program row dies — but we explicitly delete partner_promotions
  // first since that's a real FK with CASCADE we want to surface in the
  // return counts.
  if (force && (promoCount ?? 0) > 0) {
    const { error: promoErr } = await supabaseServer
      .from('partner_promotions')
      .delete()
      .eq('program_slug', slug);
    if (promoErr) {
      console.error('[programs/:slug DELETE] promotions cascade error:', promoErr);
      return NextResponse.json(
        { error: 'Failed to delete dependent promotions', code: 'CASCADE_FAILED' },
        { status: 500 },
      );
    }
  }

  const { error, count: deletedCount } = await supabaseServer
    .from('programs')
    .delete({ count: 'exact' })
    .eq('slug', slug);

  if (error) {
    console.error('[programs/:slug DELETE] supabase error:', error);
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 400 });
  }

  revalidateTag(CACHE_TAGS.programs, 'default');
  revalidateTag(CACHE_TAGS.program(slug), 'default');
  // Phase 72: fire program.deleted webhook
  void dispatchEvent('program.deleted', { slug });
  return NextResponse.json({
    success: true,
    counts: {
      partnerPromotions: promoCount ?? 0,
      partnerApplications: appCount ?? 0,
    },
    deleted: (deletedCount ?? 0) > 0,
  });
}

