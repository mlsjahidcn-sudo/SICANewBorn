/**
 * Server layout for /universities — sets the canonical URL.
 *
 * The page is a 'use client' component. In Next.js App Router, a
 * client component cannot export `metadata` — the build fails with:
 *   "You are attempting to export 'metadata' from a component
 *    marked with 'use client', which is disallowed."
 * The canonical URL must live in a sibling server `layout.tsx`.
 */
import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';

export const metadata: Metadata = {
  alternates: buildLanguageAlternates('/universities'),
};

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
