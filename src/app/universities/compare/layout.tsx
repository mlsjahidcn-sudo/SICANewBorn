/**
 * Server layout for /universities/compare — sets the canonical URL.
 *
 * The page is a 'use client' component. See src/app/universities/layout.tsx
 * for the same pattern.
 */
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/universities/compare` },
};

export default function UniversitiesCompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
