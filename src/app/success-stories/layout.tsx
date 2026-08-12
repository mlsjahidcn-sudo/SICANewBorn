import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getServerT } from '@/lib/server-t';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('successStories.title'),
    description: t('successStories.subtitle'),
    alternates: buildLanguageAlternates('/success-stories'),
    openGraph: {
      title: t('successStories.title'),
      description: t('successStories.subtitle'),
      url: '/success-stories',
      images: ['/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('successStories.title'),
      description: t('successStories.subtitle'),
      images: ['/og-default.png'],
    },
  };
}

export default function SuccessStoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
