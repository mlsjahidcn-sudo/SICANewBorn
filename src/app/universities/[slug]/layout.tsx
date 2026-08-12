/**
 * Server layout for /universities/[slug] — sets the canonical URL.
 *
 * The page itself is a 'use client' component (it fetches university
 * data on the client). For client pages, canonical can only be set
 * via a server-side layout or `generateMetadata` in a server parent.
 * This layout does the latter.
 */
import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: buildLanguageAlternates(`/universities/${slug}`),
  };
}

export default function UniversitySlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
