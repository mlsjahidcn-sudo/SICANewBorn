import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { SITE_URL } from '@/lib/site-url';
import { ChinaAdmissionKitClient } from './ChinaAdmissionKitClient';

const GUMROAD_URL = 'https://ednexgroup.gumroad.com/l/sicakit';
const COVER_IMAGE = '/images/china-admission-kit-cover.png';
const TITLE = 'China Admission Complete Kit 2027 | Study In China Academy';
const DESCRIPTION =
  'Step-by-step guides, templates and a 1,000+ university database to apply to Chinese universities and CSC scholarships for 2027.';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: await buildLanguageAlternates('/china-admission-kit'),
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url: '/china-admission-kit',
      type: 'website',
      images: [
        {
          url: COVER_IMAGE,
          alt: 'China Admission Complete Kit 2027 cover',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: [COVER_IMAGE],
    },
  };
}

export default function ChinaAdmissionKitPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'China Admission Complete Kit 2027',
    description: DESCRIPTION,
    image: `${SITE_URL}${COVER_IMAGE}`,
    brand: {
      '@type': 'Brand',
      name: 'Study In China Academy',
    },
    offers: {
      '@type': 'Offer',
      price: '49',
      priceCurrency: 'USD',
      url: GUMROAD_URL,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ChinaAdmissionKitClient />
    </>
  );
}
