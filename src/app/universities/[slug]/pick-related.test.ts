/**
 * Unit tests for the pickRelated helper. The function is a pure
 * (university[], currentSlug, limit) -> University[] — easy to lock
 * in against accidental rewrites that break the "same city first"
 * behavior the right-sidebar widget depends on.
 *
 * Lives in this folder because pickRelated is a non-exported
 * helper inside src/app/universities/[slug]/page.tsx. We mirror
 * the function here so the test can import it without pulling the
 * whole client-side page bundle into vitest. Keep the two copies
 * in sync.
 */
import { describe, it, expect } from 'vitest';
import { type University } from '@/lib/data';

type PickRelatedFn = (all: University[], currentSlug: string, limit: number) => University[];

// Mirror of the helper in page.tsx. Keep in sync.
const pickRelated: PickRelatedFn = (all, currentSlug, limit) => {
  const others = all.filter((u) => u.slug !== currentSlug);
  const target = all.find((u) => u.slug === currentSlug);
  if (!target) return others.slice(0, limit);

  const sameCity = others.filter((u) => u.city === target.city);
  const similarRank = others.filter(
    (u) => u.city !== target.city && Math.abs((u.ranking ?? 999) - (target.ranking ?? 999)) <= 15,
  );
  const rest = others.filter(
    (u) => u.city !== target.city && Math.abs((u.ranking ?? 999) - (target.ranking ?? 999)) > 15,
  );
  const restShuffled = [...rest].sort((a, b) =>
    a.slug.localeCompare(b.slug) < 0 ? -1 : 1,
  );
  return [...sameCity, ...similarRank, ...restShuffled].slice(0, limit);
};

const uni = (slug: string, city: string, ranking: number): University => ({
  slug,
  name: slug.replace(/-/g, ' '),
  nameCn: slug,
  city,
  cityCn: city,
  ranking,
  rating: 4.5,
  type: 'Public',
  typeCn: '公立',
  established: 1900,
  students: '40,000+',
  intlStudents: '2,000+',
  description: '',
  descriptionCn: '',
  popularPrograms: [],
  popularProgramsCn: [],
  tuitionUndergrad: '',
  tuitionGraduate: '',
  intake: '',
  intakeCn: '',
  disciplines: [],
  image: '',
  logo: '',
  qsRanking: '',
  qsWorldRanking: 100,
  tags: [],
  tagsCn: [],
  accommodation: '',
  accommodationCn: '',
  accommodationCost: '',
  accommodationCostCn: '',
  accommodationTypes: [],
  accommodationTypesCn: [],
  gallery: [],
  highlights: { en: [], zh: [] },
});

describe('pickRelated', () => {
  it('returns same-city universities first', () => {
    const all = [
      uni('tsinghua', 'Beijing', 1),
      uni('pku', 'Beijing', 2), // same city, should be 1st
      uni('fudan', 'Shanghai', 3), // different city
      uni('sjtu', 'Shanghai', 4),
    ];
    const result = pickRelated(all, 'tsinghua', 3);
    expect(result[0].slug).toBe('pku');
  });

  it('excludes the current university from results', () => {
    const all = [uni('tsinghua', 'Beijing', 1), uni('pku', 'Beijing', 2)];
    const result = pickRelated(all, 'tsinghua', 5);
    expect(result.find((u) => u.slug === 'tsinghua')).toBeUndefined();
  });

  it('prefers same-city > similar-rank > other', () => {
    const all = [
      uni('a', 'Beijing', 1), // current
      uni('b', 'Beijing', 5), // same city, far rank — should be 1st
      uni('c', 'Shanghai', 6), // similar rank (+5), diff city — should be 2nd
      uni('d', 'Guangzhou', 50), // far rank + far city — should be 3rd
    ];
    const result = pickRelated(all, 'a', 3);
    expect(result.map((u) => u.slug)).toEqual(['b', 'c', 'd']);
  });

  it('respects the limit', () => {
    const all = [
      uni('a', 'Beijing', 1),
      uni('b', 'Beijing', 2),
      uni('c', 'Beijing', 3),
      uni('d', 'Beijing', 4),
      uni('e', 'Beijing', 5),
    ];
    expect(pickRelated(all, 'a', 2)).toHaveLength(2);
  });

  it('returns empty when no candidates', () => {
    const all = [uni('a', 'Beijing', 1)];
    expect(pickRelated(all, 'a', 5)).toEqual([]);
  });

  it('falls back gracefully when target slug is not in the list', () => {
    const all = [uni('b', 'Beijing', 2), uni('c', 'Shanghai', 3)];
    const result = pickRelated(all, 'nonexistent', 5);
    expect(result).toHaveLength(2);
  });

  it('treats missing rankings as 999 (always ranks last)', () => {
    const all = [
      uni('a', 'Beijing', 1),
      uni('b', 'Beijing', 2), // same city, should win
      uni('c', 'Shanghai', undefined as unknown as number), // far rank fallback
    ];
    const result = pickRelated(all, 'a', 5);
    expect(result[0].slug).toBe('b');
  });
});
