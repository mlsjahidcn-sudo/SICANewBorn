/**
 * Shared SearchableSelect option builders for university / program
 * pickers across admin + partner + student surfaces.
 *
 * Gold-standard shape (student wizard S22 / PartnerApplicationForm):
 *   { value: slug, label: name, sublabel: "at {uni} · degree · language", logo }
 *
 * cmdk searches label + sublabel, so typing a university name filters
 * programs. Keep sublabel construction here so admin new/edit/list
 * filters and shortlist stay consistent.
 */

import type { SearchableSelectOption } from '@/components/ui/searchable-select';
import type { Program, University } from '@/lib/data';

/** Minimal university shape needed to build select options. */
export type UniversitySelectSource = Pick<
  University,
  'slug' | 'name' | 'nameCn' | 'city' | 'cityCn' | 'logo'
>;

/** Minimal program shape needed to build select options. */
export type ProgramSelectSource = Pick<
  Program,
  'slug' | 'name' | 'nameCn' | 'universitySlug' | 'degree' | 'language'
>;

export type CatalogLocale = 'en' | 'zh';

export interface BuildProgramSelectOptionsArgs {
  programs: readonly ProgramSelectSource[];
  universities: readonly UniversitySelectSource[];
  /** When set, only include programs whose degree matches. */
  degreeFilter?: string | null;
  /** When set, only include programs at this university slug. */
  universitySlugFilter?: string | null;
  /**
   * When set (and non-empty), only include programs whose
   * universitySlug is in this list. Used by the admin new-app
   * wizard to narrow to a student's preferred universities.
   * Takes precedence over `universitySlugFilter` when both are set.
   */
  universitySlugFilters?: readonly string[] | null;
  /**
   * Prefixed "at {name}" fragment. Pass the already-interpolated
   * i18n string (e.g. t('partnerAppForm.programSublabelAt', { name })).
   * When omitted, defaults to English `at ${name}`.
   */
  atLabel?: (universityName: string) => string;
  locale?: CatalogLocale;
  /** Cap options (partner form uses 500). Default: no cap. */
  limit?: number;
}

/**
 * Build SearchableSelect options for programs, with university logo
 * + "at {uni} · degree · language" sublabel so typeahead matches
 * either the program name or the university name.
 */
export function buildProgramSelectOptions(
  args: BuildProgramSelectOptionsArgs,
): SearchableSelectOption[] {
  const {
    programs,
    universities,
    degreeFilter,
    universitySlugFilter,
    universitySlugFilters,
    atLabel,
    locale = 'en',
    limit,
  } = args;

  const uniBySlug = new Map<string, UniversitySelectSource>();
  for (const u of universities) {
    if (u.slug) uniBySlug.set(u.slug, u);
  }

  const degree = degreeFilter?.trim() || null;
  const multiSlugs = (universitySlugFilters ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const uniSlugSet =
    multiSlugs.length > 0
      ? new Set(multiSlugs)
      : universitySlugFilter?.trim()
        ? new Set([universitySlugFilter.trim()])
        : null;

  let list = programs.filter((p) => {
    if (!p.slug) return false;
    if (degree && p.degree !== degree) return false;
    if (uniSlugSet && !uniSlugSet.has(p.universitySlug)) return false;
    return true;
  });

  if (typeof limit === 'number' && limit > 0 && list.length > limit) {
    list = list.slice(0, limit);
  }

  return list.map((program) => {
    const uni = uniBySlug.get(program.universitySlug);
    const uniName =
      locale === 'zh'
        ? uni?.nameCn?.trim() || uni?.name || null
        : uni?.name || null;
    const programLabel =
      locale === 'zh'
        ? program.nameCn?.trim() || program.name
        : program.name;

    const meta = `${program.degree} · ${program.language}`;
    let sublabel = meta;
    if (uniName) {
      const at =
        atLabel?.(uniName) ??
        (locale === 'zh' ? `就读于 ${uniName}` : `at ${uniName}`);
      sublabel = `${at} · ${meta}`;
    }

    return {
      value: program.slug,
      label: programLabel,
      sublabel,
      logo: uni?.logo || undefined,
    };
  });
}

export interface BuildUniversitySelectOptionsArgs {
  universities: readonly UniversitySelectSource[];
  locale?: CatalogLocale;
  limit?: number;
}

/**
 * Build SearchableSelect options for universities, with logo +
 * city sublabel.
 */
export function buildUniversitySelectOptions(
  args: BuildUniversitySelectOptionsArgs,
): SearchableSelectOption[] {
  const { universities, locale = 'en', limit } = args;

  let list = universities.filter((u) => Boolean(u.slug));
  if (typeof limit === 'number' && limit > 0 && list.length > limit) {
    list = list.slice(0, limit);
  }

  return list.map((u) => {
    const label =
      locale === 'zh' ? u.nameCn?.trim() || u.name : u.name;
    const city =
      locale === 'zh' ? u.cityCn?.trim() || u.city : u.city;
    return {
      value: u.slug,
      label,
      sublabel: city || undefined,
      logo: u.logo || undefined,
    };
  });
}
