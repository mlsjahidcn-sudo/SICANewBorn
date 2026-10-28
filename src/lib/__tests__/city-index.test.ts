import { describe, expect, it } from 'vitest';
import { buildCityIndex, cityPageHref, cityPageNumber, citySlug, findCities, findCityUniversities, type CityUniversity } from '@/lib/city-index';

export function university(slug: string, city = 'Beijing', ranking = 10): CityUniversity {
  return { slug, name: `${slug} University`, nameCn: `${slug}大学`, city, cityCn: city === 'Beijing' ? '北京' : '成都', ranking, type: '', typeCn: '', established: 0, description: '', descriptionCn: '', logo: '', image: '', tuitionUndergrad: '', tuitionGraduate: '' };
}
const schools = [university('Tsinghua', 'Beijing', 1), university('Peking', 'Beijing', 2), university('Sichuan', 'Chengdu', 0)];

describe('city index', () => {
  it('counts published program rows, never university popularity tags or orphan programs', () => {
    const cities = buildCityIndex(schools, [
      { slug: 'a', universitySlug: 'Tsinghua', language: 'English' },
      { slug: 'b', universitySlug: 'Peking', language: 'Bilingual' },
      { slug: 'c', universitySlug: 'Peking', language: 'Chinese' },
      { slug: 'draft', universitySlug: 'Peking', language: 'English', isPublished: false },
      { slug: 'archived', universitySlug: 'Peking', language: 'English', archivedAt: '2026-01-01' },
      { slug: 'orphan', universitySlug: 'removed-school', language: 'English' },
      { slug: 'a', universitySlug: 'Tsinghua', language: 'English' },
    ]);
    expect(cities[0]).toMatchObject({ universityCount: 2, programCount: 3, englishProgramCount: 1 });
    expect(cities[1]).toMatchObject({ programCount: 0, englishProgramCount: 0 });
  });
  it('distinguishes unavailable counts from an empty published catalog', () => {
    expect(buildCityIndex(schools, null)[0].programCount).toBeNull();
    expect(buildCityIndex(schools, [])[0].programCount).toBe(0);
  });
  it('normalizes city variants, rejects blank cities and deduplicates universities', () => {
    const cities = buildCityIndex([university('A', ' Beijing '), university('B', 'beijing'), university('A', 'Beijing'), university('none', ' ')], []);
    expect(cities).toHaveLength(1);
    expect(cities[0]).toMatchObject({ slug: 'beijing', universityCount: 2 });
  });
  it.each([["Xi'an", 'xian'], ['Xi’an', 'xian'], ['New City', 'new-city'], [' BEIJING ', 'beijing']])('normalizes %s while preserving established simple URLs', (name, slug) => {
    expect(citySlug(name)).toBe(slug);
  });
  it('searches English, Chinese and university names', () => {
    const cities = buildCityIndex(schools, []);
    expect(findCities(cities, '北京', 'name').map((c) => c.slug)).toEqual(['beijing']);
    expect(findCities(cities, 'Sichuan', 'name').map((c) => c.slug)).toEqual(['chengdu']);
    expect(findCities(cities, 'not a city', 'name')).toEqual([]);
  });
  it('sorts cities by university/program count and universities by a real rank before missing ranks', () => {
    const cities = buildCityIndex(schools, [{ slug: 'one', universitySlug: 'Sichuan', language: 'English' }]);
    expect(findCities(cities, '', 'universities')[0].slug).toBe('beijing');
    expect(findCities(cities, '', 'programs')[0].slug).toBe('chengdu');
    const city = buildCityIndex([university('Missing', 'Beijing', 0), ...schools], [])[0];
    expect(findCityUniversities(city, '', 'ranking').at(-1)?.slug).toBe('Missing');
    expect(findCityUniversities(city, 'Peking大学', 'name')).toHaveLength(1);
  });
  it('bounds pagination and keeps the search, sorting and language in page links', () => {
    expect(cityPageNumber('900', 29)).toBe(3);
    expect(cityPageNumber('-1', 29)).toBe(1);
    expect(cityPageNumber('NaN', 29)).toBe(1);
    expect(cityPageNumber('3', 0)).toBe(1);
    const href = cityPageHref('/study-in-china/beijing', '科技 大学', 'name', 2, 'zh');
    const params = new URL(href, 'https://sica.test').searchParams;
    expect(Object.fromEntries(params)).toEqual({ q: '科技 大学', sort: 'name', page: '2', lang: 'zh' });
  });
});
