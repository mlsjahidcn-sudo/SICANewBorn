/**
 * Server layout for /programs — sets the canonical URL.
 *
 * The page is a 'use client' component. See src/app/universities/layout.tsx
 * for the same pattern.
 */
import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';

export const metadata: Metadata = {
  alternates: buildLanguageAlternates('/programs'),
};

export default function ProgramsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
