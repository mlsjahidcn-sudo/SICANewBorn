import type { Metadata } from 'next';
import { buildLanguageAlternates } from '@/lib/alternates';
import { getServerT } from '@/lib/server-t';
import { ApplyForm } from './apply-form';

/**
 * Phase 75: Public application submission form.
 *
 * No auth, no token. Anyone with the URL can submit a student
 * application. Submissions go to `partner_applications` with
 * `source='public_form'`, attributed to the sentinel "Direct /
 * Unassigned" partner by default (or to a real partner if the
 * student picked one from the optional dropdown).
 *
 * Admin sees the new row in /admin/partner-applications; the
 * existing badge/filter surface gets a "Public form" indicator
 * added in a follow-up phase. Partner sees nothing (the sentinel
 * partner_id is theirs to ignore).
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('apply.metaTitle'),
    description: t('apply.metaDescription'),
    alternates: buildLanguageAlternates('/apply'),
    openGraph: {
      title: t('apply.metaTitle'),
      description: t('apply.metaDescription'),
      url: '/apply',
      images: ['/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('apply.metaTitle'),
      description: t('apply.metaDescription'),
      images: ['/og-default.png'],
    },
  };
}

export default function ApplyPage() {
  return <ApplyForm />;
}
