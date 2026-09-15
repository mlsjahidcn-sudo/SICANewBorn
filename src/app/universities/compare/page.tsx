import type { Metadata } from 'next';
import { getAllUniversities } from '@/lib/data-fetcher';
import { universities as staticUniversities, type University } from '@/lib/data';
import { buildLanguageAlternates } from '@/lib/alternates';
import ComparePicker, { type CompareUni } from './compare-picker';

/**
 * Phase 92: this page used to be one 'use client' component that
 * imported the full static universities array from data.ts (~101KB
 * module) into the client bundle, then re-fetched the live list on
 * mount. Both halves now run on the server: `getAllUniversities()`
 * (DB first, static fallback, request-memoized) merged with the
 * static seed rows by slug — the same merge semantics the client
 * used to implement — and only a slim 6-field projection is
 * serialized into the RSC payload for the picker island.
 */

// Hourly revalidation: the picker is a browse tool, not a realtime
// surface, and this keeps the route out of per-request DB paths.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Compare Chinese Universities | SICA',
  description:
    'Pick any two Chinese universities to see them side by side — rankings, tuition, scholarships, programs, and more.',
  alternates: buildLanguageAlternates('/universities/compare'),
};

export default async function ComparePickerPage() {
  const live = await getAllUniversities();

  // DB wins by slug; static rows that have no DB counterpart are kept
  // so pre-seeded entries always render even when the DB is empty /
  // pre-migration.
  const bySlug = new Map<string, University>();
  for (const u of staticUniversities) bySlug.set(u.slug, u);
  for (const u of live) bySlug.set(u.slug, u);

  const unis: CompareUni[] = Array.from(bySlug.values())
    .filter((u) => (u.ranking ?? 0) > 0)
    .sort((a, b) => (a.ranking ?? 0) - (b.ranking ?? 0))
    .map((u) => ({
      slug: u.slug,
      name: u.name,
      logo: u.logo,
      ranking: u.ranking,
      qsWorldRanking: u.qsWorldRanking ?? null,
      city: u.city,
    }));

  return <ComparePicker unis={unis} />;
}
