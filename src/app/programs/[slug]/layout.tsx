/**
 * Server layout for /programs/[slug] — sets the canonical URL.
 *
 * Page is 'use client', so canonical can only be set server-side.
 * See src/app/universities/[slug]/layout.tsx for the same pattern.
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
    alternates: buildLanguageAlternates(`/programs/${slug}`),
  };
}

export default function ProgramSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
