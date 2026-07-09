/**
 * Server layout for /scholarships/[slug] — sets the canonical URL.
 *
 * Page is 'use client', so canonical can only be set server-side.
 * See src/app/universities/[slug]/layout.tsx for the same pattern.
 */
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-url';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: { canonical: `${SITE_URL}/scholarships/${slug}` },
  };
}

export default function ScholarshipSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
