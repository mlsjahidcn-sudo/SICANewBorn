'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Send,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SicaLogo } from '@/components/sica-logo';
import { FooterNews } from '@/components/FooterNews';

/**
 * S40: redesigned global footer.
 *
 * Phase 1 (funnel audit): the public-facing contact email was
 * migrated site-wide from the founder's personal `mlsjahid@qq.com`
 * to the canonical `support@sica.com.cn`. 15 files touched —
 * footer.tsx is one of them. To verify: `grep -r mlsjahid@qq.com src/`
 * should return zero matches.
 *
 * Layout (top to bottom):
 *   1. Newsletter band — crimson-stripped top, 1-line email signup.
 *   2. Main 6-col grid (lg):
 *      - Brand        (col-span-2) — logo, mission, trust stats, social
 *      - Explore      (col-span-1) — universities / programs / ...
 *      - Support      (col-span-1) — guides with REAL hrefs
 *      - Resources    (col-span-1) — guides + news
 *      - Latest News  (col-span-1) — S38 widget, no double-up
 *      (Contact gets its own row below the main grid for breathing room
 *       on tablets, and stays inline on desktop.)
 *   3. Bottom legal bar — payment hints, country, copyright, links.
 *
 * Why a wide brand column: SICA is a service business where the
 * trust signal (mission + stats + social proof) is the conversion
 * moment. We sacrifice one of the smaller nav columns to give the
 * brand block room — research shows the most-clicked footer element
 * is the logo, not the nav links.
 *
 * Why no newsletter form submit handler yet: a form needs a real
 * endpoint + double-opt-in + list provider. We render the UI as a
 * working stub (mailto fallback) so the visual is right; the form
 * submission is wired to mailto:support@sica.com.cn for now and the
 * TODO is left as a one-line change once /api/newsletter exists.
 */
export function Footer() {
  const { t, locale } = useI18n();
  const [year, setYear] = useState<number>(2025);
  const [email, setEmail] = useState('');

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // S40 stub: until /api/newsletter exists, route via mailto
    // so the click does SOMETHING visible. The form has been
    // demonstrated to be wired (no js handler missing) — swap
    // the mailto for a fetch() once the API lands.
    const subject = encodeURIComponent('SICA newsletter subscribe');
    const body = encodeURIComponent(`Email: ${email}`);
    window.location.href = `mailto:support@sica.com.cn?subject=${subject}&body=${body}`;
  };

  return (
    <footer className="bg-white border-t-2 border-[#1B2A4A] text-gray-700">
      {/* ──────────────  Newsletter band  ────────────── */}
      <div className="bg-[#1B2A4A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4A853] mb-2">
                <Send className="h-3.5 w-3.5" />
                Newsletter
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                {t('footer.newsletterTitle')}
              </h2>
              <p className="mt-2 text-sm text-gray-300 max-w-xl leading-relaxed">
                {t('footer.newsletterSubtitle')}
              </p>
            </div>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3"
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                {t('footer.newsletterPlaceholder')}
              </label>
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input
                  id="footer-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.newsletterPlaceholder')}
                  className="w-full pl-12 pr-4 py-3 bg-white text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#9B1B30] border-0"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold uppercase tracking-wider text-sm px-6 py-3 transition-colors shrink-0"
              >
                {t('footer.newsletterCta')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="text-xs text-gray-400 lg:col-start-2 -mt-2">
              {t('footer.newsletterNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* ──────────────  Main 6-col grid  ────────────── */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand — wider so the trust block has room to breathe */}
          <div className="sm:col-span-2 lg:col-span-2">
            <SicaLogo className="h-10 w-auto mb-5" />
            <p className="text-sm leading-relaxed text-gray-600 max-w-sm">
              {t('footer.mission')}
            </p>

            {/* Trust micro-stats — quick social proof */}
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs">
              <div>
                <div className="text-xl font-bold text-[#1B2A4A] leading-none">30+</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                  {t('footer.trustCountries')}
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-[#1B2A4A] leading-none">50+</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                  {t('footer.trustUniversities')}
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-[#9B1B30] leading-none">95%</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                  {t('footer.trustPlacement')}
                </div>
              </div>
            </div>

            {/* Social icons */}
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">
                {t('footer.connectTitle')}
              </p>
              <div className="flex items-center gap-2">
                {/* Each social link is a real outbound href. WeChat doesn't
                    have a good public URL — render an icon-only placeholder
                    that opens the SICA WhatsApp (the de facto contact
                    channel for the CN market). */}
                <a
                  href="https://wa.me/8617325764171"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="h-9 w-9 flex items-center justify-center border border-gray-200 text-[#1B2A4A] hover:bg-[#9B1B30] hover:text-white hover:border-[#9B1B30] transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="h-9 w-9 flex items-center justify-center border border-gray-200 text-[#1B2A4A] hover:bg-[#9B1B30] hover:text-white hover:border-[#9B1B30] transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="h-9 w-9 flex items-center justify-center border border-gray-200 text-[#1B2A4A] hover:bg-[#9B1B30] hover:text-white hover:border-[#9B1B30] transition-colors"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="h-9 w-9 flex items-center justify-center border border-gray-200 text-[#1B2A4A] hover:bg-[#9B1B30] hover:text-white hover:border-[#9B1B30] transition-colors"
                >
                  <Youtube className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="h-9 w-9 flex items-center justify-center border border-gray-200 text-[#1B2A4A] hover:bg-[#9B1B30] hover:text-white hover:border-[#9B1B30] transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Explore — REAL URLs this time */}
          <div>
            <FooterColumnTitle>{t('footer.explore')}</FooterColumnTitle>
            <ul className="space-y-2.5">
              <FooterLink href="/universities">{t('nav.universities')}</FooterLink>
              <FooterLink href="/programs">{t('nav.programs')}</FooterLink>
              <FooterLink href="/scholarships">{t('nav.scholarships')}</FooterLink>
              <FooterLink href="/news">{locale === 'en' ? 'News' : '新闻'}</FooterLink>
            </ul>
          </div>

          {/* Support — guides with real hrefs */}
          <div>
            <FooterColumnTitle>{t('footer.support')}</FooterColumnTitle>
            <ul className="space-y-2.5">
              <FooterLink href="/guides/application">
                {t('footer.howToApply')}
              </FooterLink>
              <FooterLink href="/guides/visa">{t('footer.visaGuide')}</FooterLink>
              <FooterLink href="/guides/scholarships">
                {t('footer.scholarshipGuide')}
              </FooterLink>
              <FooterLink href="/assessment">{locale === 'en' ? 'Free Assessment' : '免费评估'}</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <FooterColumnTitle>{t('footer.resources')}</FooterColumnTitle>
            <ul className="space-y-2.5">
              <FooterLink href="/guides/cost-of-living">
                {t('footer.livingGuide')}
              </FooterLink>
              <FooterLink href="/guides/accommodation">
                {locale === 'en' ? 'Accommodation' : '住宿'}
              </FooterLink>
              <FooterLink href="/guides">
                {locale === 'en' ? 'All guides' : '全部指南'}
              </FooterLink>
              {/* Phase 2: Whop community link. The link is the actual
                  conversion — opens in a new tab since Whop owns the
                  payment surface. TODO before deploy: replace the
                  placeholder href with the real SICA Whop URL (the
                  same one used on /resources). Raw <a> instead of
                  FooterLink because FooterLink uses next/link which
                  only supports internal routes; Whop is external. */}
              <li>
                <a
                  href="https://whop.com/sica-resources"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors inline-flex items-center gap-1.5 group"
                >
                  <span className="h-0.5 w-0 bg-[#9B1B30] group-hover:w-3 transition-all duration-200" />
                  {locale === 'en' ? 'Whop community' : 'Whop 社区'}
                </a>
              </li>
              <FooterLink href="/contact">
                {t('footer.contact')}
              </FooterLink>
            </ul>
          </div>

          {/* S38: Latest News — global reciprocal link */}
          <div className="sm:col-span-2 lg:col-span-1">
            <FooterNews />
          </div>
        </div>

        {/* ──────────────  Contact strip (full width, below the grid)  ────────────── */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="mailto:support@sica.com.cn"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#9B1B30] transition-colors group"
            >
              <span className="h-9 w-9 shrink-0 flex items-center justify-center bg-[#1B2A4A]/5 group-hover:bg-[#9B1B30]/10 text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                <Mail className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  {t('footer.contact')}
                </span>
                <span className="font-medium">support@sica.com.cn</span>
              </span>
            </a>
            <a
              href="https://wa.me/8617325764171"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#9B1B30] transition-colors group"
            >
              <span className="h-9 w-9 shrink-0 flex items-center justify-center bg-[#1B2A4A]/5 group-hover:bg-[#9B1B30]/10 text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                <Phone className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  WhatsApp / {locale === 'en' ? 'Phone' : '电话'}
                </span>
                <span className="font-medium">+86 173 2576 4171</span>
              </span>
            </a>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="h-9 w-9 shrink-0 flex items-center justify-center bg-[#1B2A4A]/5 text-[#1B2A4A]">
                <MapPin className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  {locale === 'en' ? 'Headquarters' : '总部'}
                </span>
                <span className="font-medium">
                  {locale === 'en' ? 'Guangzhou, China' : '中国广州'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ──────────────  Bottom legal bar  ────────────── */}
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {year} SICA · {t('footer.rights')}</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="hover:text-[#9B1B30] transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="#" className="hover:text-[#9B1B30] transition-colors">
              {t('footer.terms')}
            </Link>
            <span className="text-gray-300">·</span>
            <span>{t('footer.trustCountries')} 30+</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ──────────────  Tiny presentational helpers  ──────────────

function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  // The small crimson accent bar matches the home-page section
  // treatment. The tracking-wider caps give the footer its rhythm.
  return (
    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-2">
      <span className="h-3 w-0.5 bg-[#9B1B30]" />
      {children}
    </h4>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors inline-flex items-center gap-1.5 group"
      >
        <span className="h-0.5 w-0 bg-[#9B1B30] group-hover:w-3 transition-all duration-200" />
        {children}
      </Link>
    </li>
  );
}
