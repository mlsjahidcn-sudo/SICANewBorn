'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { getStat, formatCount } from '@/lib/site-stats';
import type { CatalogCounts } from '@/lib/data-fetcher';
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Send,
  Users,
  UserPlus,
  FileText,
  Globe,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { SicaLogo } from '@/components/sica-logo';
import { FooterNewsStrip } from '@/components/FooterNewsStrip';

/**
 * SICA global footer.
 *
 * ─────────────────────────────────────────────────────────────────
 * Phase A+B (footer IA + design-system rework, 2026-10-21)
 * ─────────────────────────────────────────────────────────────────
 * WHAT CHANGED AND WHY
 *
 * 1. WHITE FOOTER BODY (owner decision, 2026-10-21).
 *    DESIGN.md:60 originally read "禁止 Footer 使用白色背景——必须用深色"
 *    (a white footer background is forbidden; the footer must be
 *    dark). A full dark-navy footer was built and reviewed, then
 *    REVERTED by the owner on the same day: the footer body is white
 *    again, with the newsletter band kept on navy above it (the
 *    original S40 arrangement). DESIGN.md:60 was amended to match.
 *
 *    The structural work below (items 2-8) is independent of the
 *    palette and was kept. Only the colours were rolled back:
 *    crimson (#9B1B30) is the accent on the white surface, the
 *    column titles are Deep Dark Blue, and the white logo variant is
 *    no longer used. Gold (#D4A853) survives only inside the navy
 *    newsletter band, where it has the contrast to work.
 *
 * 2. STABLE 5-COLUMN GRID.
 *    The old grid was 6 columns wide, one of which was a "Latest
 *    News" widget that returned `null` when the news table was empty
 *    — the row then rendered 5-of-6 cells with a visible hole next
 *    to the brand block. The grid is now ALWAYS 5 columns
 *    (Brand spans 2 + Explore + Get Started + Resources + Portals)
 *    and no column depends on database content. The news widget
 *    moved out of the grid into a full-width strip below it
 *    (`FooterNewsStrip`) — a strip that collapses to zero height is
 *    stable; a column that disappears is not.
 *
 * 3. A PORTALS COLUMN.
 *    The footer had zero links to the student / partner / admin
 *    portals. A student who lands on a public guide had no route to
 *    their own account from the footer.
 *
 * 4. CONVERSION LINKS PROMOTED.
 *    "Free Assessment" and "Free 10-min Counselling" are the two
 *    highest-value links on the site. They now render as boxed CTA
 *    items (`FooterCtaLink`) at the top of the Get Started column
 *    instead of blending into the flat link list.
 *
 * 5. IA BACKFILL.
 *    Added the high-traffic pages the footer was missing:
 *    /mbbs-in-china (pillar page), /study-in-china (hub),
 *    /scholarships-for (36-page country cluster),
 *    /success-stories (social proof), /apply (the public
 *    application form) and /about.
 *
 * 6. DEAD LINKS FIXED.
 *    Privacy Policy and Terms of Use were `href="#"` — dead links
 *    that the newsletter's own copy ("Read our privacy policy")
 *    pointed at. They now link to real pages.
 *
 * 7. COPY COLLISION FIXED.
 *    `footer.contact` ("Contact Us") was used for BOTH the /contact
 *    page link AND the eyebrow above the email address. The email
 *    eyebrow now uses its own `footer.email` key.
 *
 * 8. "FOLLOW US" WITH ONE ICON.
 *    The social row had a "Follow us" heading above a single
 *    WhatsApp icon (the other four were removed in Phase 145
 *    because they linked to bare homepages, a low-trust E-E-A-T
 *    signal). A heading over one icon reads broken, so the heading
 *    is now "Chat with us" and the icon became a labelled button.
 *
 * ─────────────────────────────────────────────────────────────────
 * Email/domain note (unchanged): the public contact address is
 * `info@studyinchina.academy` — the platform's only mail domain.
 * `grep -r 'support@\|mlsjahid\|sica\.com\.cn' src/` should return
 * zero matches.
 */
export function Footer({ counts }: { counts: CatalogCounts }) {
  const { t, locale } = useI18n();
  const [year, setYear] = useState<number>(2025);
  const [email, setEmail] = useState('');
  const [subscribeState, setSubscribeState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || subscribeState === 'loading') return;
    setSubscribeState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSubscribeState('success');
      setEmail('');
    } catch {
      setSubscribeState('error');
    }
  };

  // Trust micro-stats. Two sources, and the order matters:
  //  - the curated figures in src/lib/site-stats.ts (students helped,
  //    admission rate, countries served) win when a human has
  //    supplied a verified number;
  //  - the university count falls back to the LIVE catalogue count,
  //    because "how many universities can I browse" is a fact, not a
  //    marketing claim — and the site was previously claiming 50+
  //    while the catalogue actually held 152.
  // Each tile is hidden when its value is empty so we never show a
  // guess.
  const trustStats = [
    {
      value: getStat('partnerUniversities') || formatCount(counts.universities),
      label: t('footer.trustUniversities'),
    },
    {
      value: getStat('countriesServed'),
      label: t('footer.trustCountries'),
    },
    {
      value: getStat('admissionRate'),
      label: t('footer.trustPlacement'),
    },
  ].filter((s) => s.value && s.value.trim().length > 0);

  return (
    <footer className="bg-white text-gray-700 border-t-2 border-[#1B2A4A]">
      {/* ──────────────  Newsletter band (navy)  ────────────── */}
      <div className="bg-[#1B2A4A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4A853] mb-2">
                <Send className="h-3.5 w-3.5" />
                {t('footer.newsletterLabel')}
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
                  className="w-full pl-12 pr-4 py-3 bg-white text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D4A853] border-0"
                />
              </div>
              <button
                type="submit"
                disabled={subscribeState === 'loading'}
                aria-busy={subscribeState === 'loading'}
                className="inline-flex items-center justify-center gap-2 bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold uppercase tracking-wider text-sm px-6 py-3 transition-colors shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {subscribeState === 'loading' ? '…' : t('footer.newsletterCta')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            {subscribeState === 'success' && (
              <p className="text-xs text-emerald-400 lg:col-start-2 -mt-2" role="status">
                {t('footer.newsletterSuccess')}
              </p>
            )}
            {subscribeState === 'error' && (
              <p className="text-xs text-red-400 lg:col-start-2 -mt-2" role="alert">
                {t('footer.newsletterError')}
              </p>
            )}
            <p className="text-xs text-gray-400 lg:col-start-2 -mt-2">
              {t('footer.newsletterNote')}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* ──────────────  Main 5-col grid (Brand spans 2)  ────────────── */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-6">
          {/* Brand — wider so the trust block has room to breathe */}
          <div className="sm:col-span-2 lg:col-span-2">
            <SicaLogo className="h-10 w-auto mb-5" />
            <p className="text-sm leading-relaxed text-gray-600 max-w-sm">
              {t('footer.mission')}
            </p>

            {/* Trust micro-stats — hidden entirely until the values
                are filled in site-stats.ts. */}
            {trustStats.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs">
                {trustStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xl font-bold text-[#1B2A4A] leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Contact CTA — a labelled button rather than a lone icon
                under a "Follow us" heading. The other four social
                icons were removed in Phase 145 because they linked to
                bare homepages (a low-trust E-E-A-T signal); re-add
                them here once Jahid supplies real profile URLs. */}
            <div className="mt-6">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-3">
                {t('footer.connectTitle')}
              </p>
              <a
                href="https://wa.me/8617325764171"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2.5 text-sm font-semibold text-[#1B2A4A] hover:border-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                {t('footer.whatsappCta')}
              </a>
            </div>
          </div>

          {/* Explore — the catalogue */}
          <div>
            <FooterColumnTitle>{t('footer.explore')}</FooterColumnTitle>
            <ul className="space-y-2.5">
              <FooterLink href="/universities">{t('nav.universities')}</FooterLink>
              <FooterLink href="/programs">{t('nav.programs')}</FooterLink>
              <FooterLink href="/mbbs-in-china">{t('nav.mbbsInChina')}</FooterLink>
              <FooterLink href="/scholarships">{t('nav.scholarships')}</FooterLink>
              <FooterLink href="/scholarships-for">{t('nav.scholarships.byCountry')}</FooterLink>
              <FooterLink href="/study-in-china">{t('nav.universities.byCity')}</FooterLink>
            </ul>
          </div>

          {/* Get Started — the conversion actions */}
          <div>
            <FooterColumnTitle>{t('footer.getStarted')}</FooterColumnTitle>
            <ul className="space-y-3">
              <FooterCtaLink href="/assessment">{t('footer.freeAssessment')}</FooterCtaLink>
              <FooterCtaLink href="/counselling">{t('footer.freeCounselling')}</FooterCtaLink>
              <FooterLink href="/apply">{t('nav.apply')}</FooterLink>
              <FooterLink href="/guides/application">{t('footer.howToApply')}</FooterLink>
              <FooterLink href="/contact">{t('footer.contact')}</FooterLink>
            </ul>
          </div>

          {/* Resources — help content */}
          <div>
            <FooterColumnTitle>{t('footer.resources')}</FooterColumnTitle>
            <ul className="space-y-2.5">
              <FooterLink href="/guides">{t('footer.allGuides')}</FooterLink>
              <FooterLink href="/guides/visa">{t('footer.visaGuide')}</FooterLink>
              <FooterLink href="/guides/scholarships">{t('footer.scholarshipGuide')}</FooterLink>
              <FooterLink href="/guides/cost-of-living">{t('footer.livingGuide')}</FooterLink>
              <FooterLink href="/guides/accommodation">{t('footer.accommodation')}</FooterLink>
              <FooterLink href="/success-stories">{t('footer.successStories')}</FooterLink>
              <FooterLink href="/news">{t('footer.news')}</FooterLink>
              <FooterLink href="/about">{t('nav.about')}</FooterLink>
            </ul>
          </div>

          {/* Portals — the three logins + developer docs */}
          <div>
            <FooterColumnTitle>{t('footer.portals')}</FooterColumnTitle>
            <ul className="space-y-2.5">
              <FooterLink href="/student/login" icon={<Users className="h-3.5 w-3.5" />}>
                {t('nav.studentPortal')}
              </FooterLink>
              <FooterLink href="/partner/login" icon={<UserPlus className="h-3.5 w-3.5" />}>
                {t('nav.partnerPortal')}
              </FooterLink>
              <FooterLink href="/admin/login" icon={<FileText className="h-3.5 w-3.5" />}>
                {t('nav.adminPortal')}
              </FooterLink>
              <FooterLink href="/api-docs" icon={<Globe className="h-3.5 w-3.5" />}>
                {t('footer.apiDocs')}
              </FooterLink>
            </ul>
          </div>
        </div>

        {/* ──────────────  Latest news strip (full width)  ────────────── */}
        <FooterNewsStrip />

        {/* ──────────────  Contact strip (full width, below the grid)  ────────────── */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a
              href="mailto:info@studyinchina.academy"
              className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#9B1B30] transition-colors group"
            >
              <span className="h-9 w-9 shrink-0 flex items-center justify-center bg-[#1B2A4A]/5 group-hover:bg-[#9B1B30]/10 text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                <Mail className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  {t('footer.email')}
                </span>
                <span className="font-medium">info@studyinchina.academy</span>
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
                  WhatsApp / {t('footer.phone')}
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
                  {t('footer.headquarters')}
                </span>
                <span className="font-medium">
                  {t('footer.guangzhouChina')}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ──────────────  Bottom legal bar  ────────────── */}
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © {year} SICA · {t('footer.rights')}
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-[#9B1B30] transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="hover:text-[#9B1B30] transition-colors">
              {t('footer.terms')}
            </Link>
            {getStat('countriesServed') && (
              <span className="hidden sm:inline">
                {t('footer.trustCountries')} {getStat('countriesServed')}
              </span>
            )}
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
  // h3 (not h4) so the footer has a single heading level — the news
  // strip below the grid is also an h3.
  return (
    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-2">
      <span className="h-3 w-0.5 bg-[#9B1B30]" />
      {children}
    </h3>
  );
}

function FooterLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors inline-flex items-center gap-1.5 group"
      >
        <span className="h-0.5 w-0 bg-[#9B1B30] group-hover:w-3 transition-all duration-200" />
        {icon}
        {children}
      </Link>
    </li>
  );
}

/**
 * Boxed CTA treatment for the two highest-conversion footer links
 * (Free Assessment / Free Counselling). A solid crimson rule marks
 * them as actions rather than navigation.
 */
function FooterCtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-3 border border-gray-200 px-3 py-2.5 text-sm font-semibold text-[#1B2A4A] hover:border-[#9B1B30] hover:bg-[#9B1B30]/5 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="h-3 w-0.5 bg-[#9B1B30] transition-colors" />
          {children}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-[#9B1B30] opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    </li>
  );
}
