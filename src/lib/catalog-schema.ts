/**
 * Structured data for the catalog and conversion pages.
 *
 * ─────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS (Phase 185)
 * ─────────────────────────────────────────────────────────────────
 * A live audit of the deployed site on 2026-10-16 found that the
 * editorial guides were richly marked up — FAQPage, HowTo, Article,
 * BreadcrumbList — while the pages carrying the actual commercial and
 * catalog intent emitted ZERO JSON-LD:
 *
 *     /programs       0 blocks      /assessment    0 blocks
 *     /universities   0 blocks      /contact       0 blocks
 *     /scholarships   0 blocks
 *
 * That is backwards. The guides win long-tail informational queries;
 * these five are the pages an answer engine wants when a student asks
 * "what can I study in China", "how much does it cost" or "how do I
 * contact an agency" — and `ItemList` + `ContactPage` + `Service` are
 * the types that let a crawler resolve those.
 *
 * Every object here is built ONLY from data already rendered on the
 * page. Nothing is asserted that a user cannot see, and there is no
 * AggregateRating anywhere — see the note in app/universities/[slug].
 */
import { SITE_URL } from './site-url';

export interface ProgramListItem {
  name: string;
  url: string;
}

export interface UniversityListItem {
  name: string;
  url: string;
}

export interface ScholarshipListItem {
  name: string;
  url?: string;
  /** Provider or awarding body, e.g. "Chinese Government Scholarship". */
  provider?: string;
}

export interface ServiceInput {
  name: string;
  description: string;
  url: string;
  providerName?: string;
  areaServed?: string[];
}

/**
 * An ItemList of the catalog entries actually shown on the page.
 *
 * Only include entries that are rendered — a list of 200 scholarships
 * where 12 are visible is a mismatch between the markup and the page,
 * and a mismatch is worse than no markup.
 */
export function buildItemListSchema(
  name: string,
  items: Array<{ name: string; url: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

/**
 * Breadcrumb trail. Pass the segments leading to the current page, NOT
 * including it — the current page is the WebPage, not a crumb.
 */
export function buildBreadcrumbSchema(
  segments: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      ...segments.map((seg, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: seg.name,
        item: `${SITE_URL}${seg.path}`,
      })),
    ],
  };
}

/**
 * The consultancy as a Service, for the conversion pages.
 *
 * `areaServed` and `provider` are omitted when not passed rather than
 * being defaulted to a guess — an empty or invented areaServed is a
 * claim the page cannot support.
 */
export function buildServiceSchema(input: ServiceInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: `${SITE_URL}${input.url}`,
    provider: {
      '@type': 'EducationalOrganization',
      name: input.providerName ?? 'SICA',
      url: SITE_URL,
    },
  };
  if (input.areaServed?.length) {
    schema.areaServed = input.areaServed;
  }
  return schema;
}

/**
 * ContactPage + ContactPoint for /contact.
 *
 * Only the channels the page actually displays are emitted. Declaring
 * an `email` the site does not receive mail on is a broken promise to a
 * crawler and to the person who acts on the rich result.
 */
export function buildContactPageSchema(input: {
  email?: string;
  telephone?: string;
  addressCountry?: string;
  addressLocality?: string;
}): Record<string, unknown> {
  const contactPoint: Record<string, unknown> = {
    '@type': 'ContactPoint',
    contactType: 'admissions',
  };
  if (input.telephone) contactPoint.telephone = input.telephone;
  if (input.email) contactPoint.email = input.email;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: `${SITE_URL}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'SICA',
      url: SITE_URL,
      contactPoint,
    },
  };
  if (input.addressLocality || input.addressCountry) {
    (schema.mainEntity as Record<string, unknown>).address = {
      '@type': 'PostalAddress',
      ...(input.addressLocality ? { addressLocality: input.addressLocality } : {}),
      ...(input.addressCountry ? { addressCountry: input.addressCountry } : {}),
    };
  }
  return schema;
}
