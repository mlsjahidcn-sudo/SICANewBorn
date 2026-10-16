import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { buildPageOpenGraph } from '@/lib/page-opengraph';
import { getServerT } from '@/lib/server-t';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as staticUniversities } from '@/lib/data';
import {
  parseProgramQueryParams,
  queryPrograms,
  DEFAULT_PROGRAM_PAGE_SIZE,
} from '@/lib/program-query';
import ProgramsClient, { type UniversityOption } from './_components/programs-client';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/catalog-schema';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('seo.programsTitle'),
    description: t('seo.programsDescription'),
    alternates: await buildLanguageAlternates('/programs'),
    ...buildPageOpenGraph({ title: t('seo.programsTitle'), description: t('seo.programsDescription'), path: '/programs' }),
  };
}

/**
 * Phase 173: the page renders the *current* query server-side and hands
 * the client exactly one page of rows.
 *
 * Previously this called `getPrograms()` with `limit: Infinity` and
 * filtered the entire catalogue in a client-side `useMemo` — every
 * visitor downloaded the whole programs table plus every university's
 * full record (description, gallery, highlights, scholarship prose) just
 * to filter it in the browser.
 */
export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = new URLSearchParams();
  const raw = await searchParams;
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') sp.set(k, v);
  }

  const [initialResult, universityOptions] = await Promise.all([
    queryPrograms(parseProgramQueryParams(sp)),
    getUniversityOptions(),
  ]);

  // Built from the same page of results handed to the client, so the
  // ItemList is exactly the rows this page rendered — not the whole
  // catalogue. Claiming 10,000 programs on a paginated page is a
  // mismatch between markup and content, and a mismatch is worse than
  // no markup at all.
  const itemListSchema = buildItemListSchema(
    'Study programs in China for international students',
    initialResult.programs
      .filter((p) => p.slug)
      .map((p) => ({ name: p.name, url: `/programs/${p.slug}` }))
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Programs', path: '/programs' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProgramsClient
        initialResult={initialResult}
        universityOptions={universityOptions}
        pageSize={DEFAULT_PROGRAM_PAGE_SIZE}
      />
    </>
  );
}

/**
 * Only `slug` / `name` / `nameCn` are needed to render the university
 * dropdown and the card label, so that's all we send. Falls back to the
 * static seed when Supabase isn't configured.
 */
async function getUniversityOptions(): Promise<UniversityOption[]> {
  if (isSupabaseServerConfigured() && supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('universities')
        .select('slug, name, name_cn')
        .order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        return (data as { slug: string; name: string; name_cn: string | null }[]).map((u) => ({
          slug: u.slug,
          name: u.name,
          nameCn: u.name_cn || u.name,
        }));
      }
    } catch {
      // fall through to static seed
    }
  }
  return staticUniversities.map((u) => ({ slug: u.slug, name: u.name, nameCn: u.nameCn }));
}
