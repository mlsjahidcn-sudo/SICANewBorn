/**
 * Server layout for /scholarships — sets the canonical URL.
 *
 * The page is a 'use client' component. See src/app/universities/layout.tsx
 * for the same pattern.
 */
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  alternates: { canonical: `${SITE_URL}/scholarships` },
};

export default function ScholarshipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
