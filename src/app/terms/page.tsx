import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getServerT } from '@/lib/server-t';
import { LegalPage } from '@/components/legal-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('footer.terms'),
    description: t('legal.terms.description'),
    alternates: await buildLanguageAlternates('/terms'),
    openGraph: {
      title: t('footer.terms'),
      description: t('legal.terms.description'),
      url: '/terms',
      images: ['/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('footer.terms'),
      description: t('legal.terms.description'),
      images: ['/og-default.png'],
    },
  };
}

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
