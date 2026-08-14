import { translations } from './i18n-translations';
import { getServerLocale } from './server-t';

import { SITE_URL } from '@/lib/site-url';
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'EducationalOrganization'],
    '@id': `${SITE_URL}/#organization`,
    name: 'SICA',
    alternateName: 'Study in China Academy',
    description:
      'SICA is a professional study-in-China consultancy helping international students gain admission to top Chinese universities, secure scholarships, and navigate the application and visa process end-to-end.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@studyinchina.academy',
      telephone: '+86-173-2576-4171',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Chinese'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Guangzhou',
      addressRegion: 'Guangdong',
      addressCountry: 'CN',
    },
    sameAs: [
      // Add real social URLs when available
    ],
    knowsAbout: [
      'Chinese universities',
      'Tsinghua University',
      'Peking University',
      'Fudan University',
      'Shanghai Jiao Tong University',
      'Zhejiang University',
      'Nanjing University',
      'Wuhan University',
      'Sun Yat-sen University',
      'Chinese Government Scholarship',
      'CSC Scholarship',
      'Confucius Institute Scholarship',
      'Study in China',
      'International student admissions',
    ],
    // Author/editor entity. Tying editorial content to an
    // organization with a named "editorial team" boosts E-E-A-T
    // signals for LLMs and Google's Helpful Content system.
    member: { '@id': `${SITE_URL}/#editorial-team` },
  };
}

/**
 * Person schema for the SICA Editorial Team. Used as the author
 * on Article JSON-LD across all guides. Gives LLMs and Google
 * a consistent author entity to attribute quotes and citations.
 */
export function getEditorialTeamSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#editorial-team`,
    name: 'SICA Editorial Team',
    url: SITE_URL,
    description:
      'The SICA Editorial Team researches and writes all SICA guides, university profiles, and scholarship content. Team members include former international students and education consultants based in Guangzhou, China.',
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
    knowsAbout: [
      'Chinese higher education',
      'International student admissions',
      'Chinese Government Scholarship (CSC)',
      'University rankings (QS, Times Higher Education, ARWU)',
      'Student visa policy (X1, X2)',
    ],
  };
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'SICA — Study in China',
    description:
      'Explore top Chinese universities, programs, and scholarships with SICA.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['en', 'zh'],
    // SearchAction enables the sitelinks search box in Google SERPs
    // when the site becomes a recognizable brand. Helps Google
    // understand the site has searchable content.
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/universities?q={search_term_string}`,
      },
      // 'required query input' for SearchAction
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Phase 66: use the cached `getServerLocale()` helper (request-scoped
 * via React's `cache()`) instead of a fresh cookie read. The locale
 * lookup is now shared with the rest of the homepage render path
 * (layout's generateMetadata + page's getServerT) — 3x cookie reads
 * collapse to 1x per request.
 *
 * Kept async because getServerLocale() returns a Promise<Locale>;
 * callers `await` it inside a Promise.all.
 */
export async function getServiceSchema() {
  const locale = await getServerLocale();
  const t = (k: string) => translations[locale]?.[k] ?? k;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/#consultation`,
    name: t('sica.title'),
    description: t('sica.subtitle'),
    provider: { '@id': `${SITE_URL}/#organization` },
    serviceType: 'Education consulting',
    areaServed: 'Worldwide',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'SICA Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: t('sica.consult'),
            description: t('sica.consult.desc'),
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: t('sica.application'),
            description: t('sica.application.desc'),
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: t('sica.visa'),
            description: t('sica.visa.desc'),
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: t('sica.arrival'),
            description: t('sica.arrival.desc'),
          },
        },
      ],
    },
  };
}

/**
 * Returns an array of all structured data schemas. Inject as JSON-LD in
 * the layout or relevant pages.
 */
export async function getAllSchemas() {
  return [
    getOrganizationSchema(),
    getWebsiteSchema(),
    getEditorialTeamSchema(),
    await getServiceSchema(),
  ];
}
