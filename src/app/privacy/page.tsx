import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getServerT } from '@/lib/server-t';
import { LegalPage } from '@/components/legal-page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('footer.privacy'),
    description: t('legal.privacy.description'),
    alternates: await buildLanguageAlternates('/privacy'),
    openGraph: {
      title: t('footer.privacy'),
      description: t('legal.privacy.description'),
      url: '/privacy',
      images: ['/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('footer.privacy'),
      description: t('legal.privacy.description'),
      images: ['/og-default.png'],
    },
  };
}

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
