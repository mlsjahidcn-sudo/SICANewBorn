import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { universities as seedUniversities, programs as seedPrograms } from '@/lib/data';
import { buildCityIndex, citySlug, type CityInfo, type CityProgram, type CityUniversity } from '@/lib/city-index';

export interface CityCatalog {
  cities: CityInfo[];
  source: 'live' | 'stale' | 'fallback';
  programsAvailable: boolean;
}
const COLUMNS = 'slug,name,name_cn,city,city_cn,ranking,type,type_cn,established,description,description_cn,logo,image,tuition_undergrad,tuition_graduate';
const text = (value: unknown): string => typeof value === 'string' ? value : '';
function mapUniversity(row: Record<string, unknown>): CityUniversity {
  return {
    slug: text(row.slug), name: text(row.name), nameCn: text(row.name_cn), city: text(row.city), cityCn: text(row.city_cn),
    ranking: Number(row.ranking) || 0, type: text(row.type), typeCn: text(row.type_cn), established: Number(row.established) || 0,
    description: text(row.description), descriptionCn: text(row.description_cn), logo: text(row.logo), image: text(row.image),
    tuitionUndergrad: text(row.tuition_undergrad), tuitionGraduate: text(row.tuition_graduate),
  };
}

/** Complete, narrow reads. Never turn a truncated or failed page into a valid total. */
export async function readCityRows(client: SupabaseClient, table: 'universities' | 'programs'): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 1000) {
    let query = client.from(table).select(table === 'universities' ? COLUMNS : 'slug,university_slug,language');
    if (table === 'programs') query = query.eq('is_published', true).is('archived_at', null);
    const { data, error } = await query.order('slug', { ascending: true }).range(offset, offset + 999).abortSignal(AbortSignal.timeout(5000));
    if (error || !data) throw new Error(`Unable to load city ${table}`);
    rows.push(...(data as unknown as Record<string, unknown>[]));
    if (data.length < 1000) return rows;
  }
}

export const seedCities = buildCityIndex(seedUniversities, seedPrograms);
let cached: { expires: number; value: CityCatalog } | null = null;
let lastComplete: CityCatalog | null = null;
let pending: Promise<CityCatalog> | null = null;

export async function loadCityCatalog(): Promise<CityCatalog> {
  if (!isSupabaseServerConfigured()) return { cities: seedCities, source: 'fallback', programsAvailable: true };
  if (cached && cached.expires > Date.now()) return cached.value;
  if (pending) return pending;
  pending = (async (): Promise<CityCatalog> => {
    // Both datasets must use the same source: never merge removed seed schools into live results.
    const [universities, programs] = await Promise.allSettled([
      readCityRows(supabaseServer, 'universities'), readCityRows(supabaseServer, 'programs'),
    ]);
    let value: CityCatalog;
    if (universities.status === 'rejected') {
      value = lastComplete ? { ...lastComplete, source: 'stale' } : { cities: seedCities, source: 'fallback', programsAvailable: true };
    } else {
      const programRows: CityProgram[] | null = programs.status === 'fulfilled' ? programs.value.map((row) => ({
        slug: text(row.slug), universitySlug: text(row.university_slug), language: text(row.language),
      })) : null;
      value = { cities: buildCityIndex(universities.value.map(mapUniversity), programRows), source: 'live', programsAvailable: programRows !== null };
      if (programRows !== null) lastComplete = value;
    }
    cached = { expires: Date.now() + 60_000, value };
    return value;
  })().finally(() => { pending = null; });
  return pending;
}
export const getCityCatalog = cache(loadCityCatalog);
export const getCitiesAsync = cache(async (): Promise<CityInfo[]> => (await getCityCatalog()).cities);
export const getCityBySlugAsync = cache(async (slug: string): Promise<CityInfo | null> => (await getCitiesAsync()).find((city) => city.slug === citySlug(slug)) ?? null);
export const getUniversitiesByCityAsync = cache(async (slug: string): Promise<CityUniversity[]> => (await getCityBySlugAsync(slug))?.universities ?? []);
