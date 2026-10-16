/**
 * Server layout for /universities/compare — sets the canonical URL.
 *
 * The page is a 'use client' component. See src/app/universities/layout.tsx
 * for the same pattern.
 */
import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';

export async function generateMetadata(): Promise<Metadata> {
  return {
  alternates: await buildLanguageAlternates('/universities/compare'),
  };
}

export default function UniversitiesCompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
