import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, GraduationCap, ChevronRight } from 'lucide-react';
import { getAllPrograms } from '@/lib/data-fetcher';

import { SITE_URL } from '@/lib/site-url';
const slugifyDiscipline = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

// Render on demand with ISR — reads the live DB so newly-added
// programs / disciplines show up automatically. Cached at the
// edge for 60s.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Study by Major in China: All Fields of Study (2026)',
  description:
    'Browse all academic fields (majors) available to international students at top Chinese universities. Computer Science, Engineering, Business, Medicine, and more.',
  alternates: { canonical: `${SITE_URL}/majors` },
};

export default async function MajorsIndexPage() {
  const programs = await getAllPrograms();

  const counts: Record<string, number> = {};
  for (const p of programs) {
    counts[p.discipline] = (counts[p.discipline] || 0) + 1;
  }

  // Build a unique university count per discipline
  const uniCountPerDisc: Record<string, number> = {};
  const seen: Record<string, Set<string>> = {};
  for (const p of programs) {
    if (!seen[p.discipline]) seen[p.discipline] = new Set();
    seen[p.discipline].add(p.universitySlug);
  }
  for (const [d, set] of Object.entries(seen)) {
    uniCountPerDisc[d] = set.size;
  }

  const disciplines = Object.keys(counts).sort();

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#9B1B30] transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#1B2A4A] font-medium">Majors</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4A853] mb-3">
            <GraduationCap className="h-4 w-4" />
            Browse by Major
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Study by Major in China
          </h1>
          <p className="mt-3 text-lg text-gray-300 max-w-3xl">
            Pick a field of study to see every program available at top Chinese universities —
            undergraduate, graduate, and doctoral tracks, in English, Chinese, and bilingual.
          </p>
        </div>
      </section>

      {/* Majors grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disciplines.map((d) => (
            <Link
              key={d}
              href={`/majors/${slugifyDiscipline(d)}`}
              className="group flex items-center justify-between gap-3 bg-white border-2 border-gray-200 hover:border-[#9B1B30] p-5 transition-colors"
            >
              <div>
                <h2 className="text-lg font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                  {d}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {counts[d]} program{counts[d] === 1 ? '' : 's'} · {uniCountPerDisc[d]} universit{uniCountPerDisc[d] === 1 ? 'y' : 'ies'}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
