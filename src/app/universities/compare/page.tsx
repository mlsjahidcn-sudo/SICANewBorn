'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Check } from 'lucide-react';
import { universities as staticUniversities, type University } from '@/lib/data';

/**
 * Picker UI for the /universities/compare feature.
 *
 * User selects 2 universities from the grid, then clicks "Compare"
 * to navigate to the dedicated side-by-side page at
 * /universities/compare/[a]/vs/[b].
 *
 * The dedicated page is the SEO value — this picker is just for
 * users who don't have a specific pair in mind.
 *
 * Fetches the live university list on mount (DB first, static
 * fallback) so newly-added AI-generated or admin-imported
 * universidades show up here too — not just the 8 in the seed
 * data.
 */
export default function ComparePickerPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  // Start with static so the grid is never empty (avoids layout
  // shift on slow networks). On mount we replace this with the
  // merged live list.
  const [unis, setUnis] = useState<University[]>(() =>
    [...staticUniversities]
      .filter((u) => u.ranking > 0)
      .sort((a, b) => a.ranking - b.ranking),
  );

  // Fetch live universities. Merge with the static fallback by
  // slug so pre-seeded entries are always available. Sort by
  // ranking so top-3 pairs are visually adjacent.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/universities?limit=200');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const dbUnis: University[] = data.universities || [];
        if (dbUnis.length === 0) return;
        const merged = mergeBySlug(dbUnis, staticUniversities);
        setUnis(
          merged
            .filter((u) => (u.ranking ?? 0) > 0)
            .sort((a, b) => a.ranking - b.ranking),
        );
      } catch {
        // keep static fallback silently
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Total number of unique pairs: C(n, 2). Updates as the live
  // list grows so we never have a stale "28 pairs" footer once
  // universities are added.
  const totalPairs = (unis.length * (unis.length - 1)) / 2;

  const toggle = (slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) return [prev[1], slug]; // replace the older selection
      return [...prev, slug];
    });
  };

  const handleCompare = () => {
    if (selected.length !== 2) return;
    const [a, b] = [...selected].sort();
    router.push(`/universities/compare/${a}/vs/${b}`);
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-gray-500">/</span>
            <Link href="/universities" className="hover:text-white transition-colors">Universities</Link>
            <span className="text-gray-500">/</span>
            <span className="text-white font-medium">Compare</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Compare Chinese Universities
          </h1>
          <p className="mt-3 text-lg text-gray-300 max-w-2xl">
            Pick any two universities to see them side by side — rankings, tuition, scholarships,
            programs, and more. Or jump to one of the most popular comparisons below.
          </p>
        </div>
      </section>

      {/* Picker */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#1B2A4A]">
              Select 2 universities
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selected.length === 0 && 'Click any two cards to compare.'}
              {selected.length === 1 && 'Pick one more to continue.'}
              {selected.length === 2 && 'Ready to compare. Click the button below.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCompare}
            disabled={selected.length !== 2}
            className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Compare side by side
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {unis.map((u) => {
            const isSelected = selected.includes(u.slug);
            const order = selected.indexOf(u.slug) + 1;
            return (
              <button
                key={u.slug}
                type="button"
                onClick={() => toggle(u.slug)}
                className={[
                  'group relative text-left bg-white border-2 p-4 transition-all',
                  isSelected
                    ? 'border-[#9B1B30] shadow-md'
                    : 'border-gray-200 hover:border-[#1B2A4A] hover:shadow-sm',
                ].join(' ')}
                aria-pressed={isSelected}
              >
                {/* Selection badge */}
                <div
                  className={[
                    'absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center text-xs font-bold',
                    isSelected
                      ? 'bg-[#9B1B30] text-white'
                      : 'bg-white border border-gray-300 text-gray-400',
                  ].join(' ')}
                >
                  {isSelected ? (order === 1 ? 'A' : <Check className="h-4 w-4" />) : '+'}
                </div>

                {/* Logo */}
                <div className="h-16 w-16 bg-white border border-gray-100 flex items-center justify-center mb-3">
                  {u.logo && u.logo.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.logo} alt={u.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <GraduationCap className="h-7 w-7 text-[#1B2A4A]" />
                  )}
                </div>

                <h3 className="font-semibold text-[#1B2A4A] text-sm leading-tight">
                  {u.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  #{u.ranking} in China · QS #{u.qsWorldRanking}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{u.city}, China</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular comparisons — links directly to the side-by-side
          pages so users (and search engines) can find the top pairs
          without using the picker. */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">Popular comparisons</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {popularPairs.map(([a, b]) => {
            const uniA = unis.find((u) => u.slug === a);
            const uniB = unis.find((u) => u.slug === b);
            if (!uniA || !uniB) return null;
            return (
              <Link
                key={`${a}-${b}`}
                href={`/universities/compare/${a}/vs/${b}`}
                className="group flex items-center justify-between gap-2 bg-white border border-gray-200 hover:border-[#9B1B30] p-4 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors truncate">
                    {uniA.name} vs {uniB.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    #{uniA.ranking} vs #{uniB.ranking} · {uniA.city} vs {uniB.city}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          + {Math.max(0, totalPairs - popularPairs.length)} more pairs available — use the picker
          above.
        </p>
      </section>
    </main>
  );
}

// Top-of-mind pairs for users. These get indexed first and surface
// prominently on the picker page. Order matters: top of list = most
// commonly searched. The picker can still produce any pair from the
// live list. Pairs that don't have both sides in the live list are
// hidden automatically (popularPairs.map filters with the
// `if (!uniA || !uniB) return null;` guard above).
const popularPairs: Array<[string, string]> = [
  ['tsinghua-university', 'peking-university'],
  ['tsinghua-university', 'fudan-university'],
  ['tsinghua-university', 'shanghai-jiao-tong-university'],
  ['tsinghua-university', 'zhejiang-university'],
  ['peking-university', 'fudan-university'],
  ['peking-university', 'shanghai-jiao-tong-university'],
  ['fudan-university', 'shanghai-jiao-tong-university'],
  ['zhejiang-university', 'nanjing-university'],
  ['wuhan-university', 'sun-yat-sen-university'],
];

/** Merge DB-fetched universities with the static fallback by slug.
 *  DB wins on conflict (richer data, fresher edits). Static rows
 *  that have no DB counterpart are kept so pre-seeded entries
 *  always render even when the DB is empty / pre-migration. */
function mergeBySlug(primary: University[], secondary: University[]): University[] {
  const bySlug = new Map<string, University>();
  for (const u of secondary) bySlug.set(u.slug, u);
  for (const u of primary) bySlug.set(u.slug, u);
  return Array.from(bySlug.values());
}
