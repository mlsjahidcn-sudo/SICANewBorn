'use client';

import type { ReactElement } from 'react';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { WHATSAPP_PHONE } from '@/lib/contact';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { detailLink } from './detail-ui';
import { scrollToBooking } from './booking-anchor';
import { track } from '@/lib/analytics';

/**
 * Sticky mobile bar for the university and program detail pages.
 *
 * The primary button mirrors the hero CTA, so it points wherever that page
 * sends the visitor. The Help dialog is the one place on mobile that offers
 * the free consultation booking directly: the booking card lives in the
 * sidebar, which stacks below the page content on a phone, so the dialog
 * closes first and then scrolls to the form.
 */
export function DetailActionBar({ href, name, slug, assessmentHref }: { href: string; name: string; slug: string; assessmentHref: string }): ReactElement | null {
  const { t, locale } = useI18n();
  const [visible, setVisible] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  useEffect(() => {
    const primary = document.querySelector('[data-detail-primary]');
    if (!primary || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 64), { rootMargin: '-64px 0px 0px' });
    observer.observe(primary);
    return () => observer.disconnect();
  }, [slug]);
  if (!visible) return null;
  return <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-sm lg:hidden">
    <div className="mx-auto flex max-w-lg gap-2">
      <Link href={href} onClick={() => track('apply_click', { location: 'detail_mobile_bar', slug, locale })} className={`${detailLink} min-w-0 flex-1`}>{t('consultationCta.ctaPrimary')}</Link>
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogTrigger asChild><button className="inline-flex min-h-11 shrink-0 items-center gap-2 border border-gray-300 px-3 text-sm font-semibold text-[#1B2A4A] focus-visible:ring-2 focus-visible:ring-[#9B1B30]"><MessageCircle className="h-4 w-4" />{t('detail.help')}</button></DialogTrigger>
        <DialogContent closeLabel={t('common.close')} className="rounded-none">
          <DialogTitle>{t('detail.planApplication')}</DialogTitle>
          <DialogDescription className="break-words">{name}</DialogDescription>
          <button
            type="button"
            onClick={() => {
              setHelpOpen(false);
              track('apply_click', { location: 'detail_mobile_booking', slug, locale });
              scrollToBooking();
            }}
            className={`${detailLink} w-full`}
          >
            {t('consultationBooking.title')}
          </button>
          <Link href={assessmentHref} className="flex min-h-11 items-center justify-center text-sm font-semibold text-[#9B1B30] hover:underline">{t('consultationCta.ctaPrimary')}</Link>
          <a href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`${t('detail.whatsappIntro')} ${name}`)}`} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-center text-sm font-semibold text-[#1B2A4A] hover:underline">{t('detail.askWhatsapp')}</a>
        </DialogContent>
      </Dialog>
    </div>
  </div>;
}
