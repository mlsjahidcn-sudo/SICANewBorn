import type { MetadataRoute } from 'next';
import { cookies } from 'next/headers';
import { translations, type Locale } from './i18n-translations';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'EducationalOrganization'],
    '@id': `${SITE_URL}/#organization`,
    name: 'SICA',
    alternateName: 'Study in China Agency',
    description:
      'SICA is a professional study-in-China consultancy helping international students gain admission to top Chinese universities, secure scholarships, and navigate the application and visa process end-to-end.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'info@sica-edu.com',
      telephone: '+86-10-8888-9999',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Chinese'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Zhongguancun South Street',
      addressLocality: 'Beijing',
      addressRegion: 'Beijing',
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
  };
}

export async function getServiceSchema() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
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
  return [getOrganizationSchema(), getWebsiteSchema(), await getServiceSchema()];
}
