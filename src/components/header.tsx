'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Globe, FileText, Users, UserPlus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MainNav } from '@/components/main-nav';
import { SicaLogo } from '@/components/sica-logo';

export function Header(): React.JSX.Element {
  const { t, locale, setLocale } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const switchLocale = (): void => {
    const nextLocale = locale === 'en' ? 'zh' : 'en';
    setLocale(nextLocale);
    // Keep explicit language URLs aligned with the cookie on this render.
    const url = new URL(window.location.href);
    const explicitLocale = url.searchParams.get('lang');
    if (explicitLocale === 'en' || explicitLocale === 'zh') {
      url.searchParams.set('lang', nextLocale);
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    } else {
      router.refresh();
    }
  };

  // Mobile-only flat link list. Desktop uses the full MainNav with
  // hover submenus, so this list is intentionally simpler (no submenu
  // nesting — it would crowd small viewports).
  const mobileNavLinks: { href: string; label: string }[] = [
    { href: '/', label: t('nav.home') },
    { href: '/universities', label: t('nav.universities') },
    { href: '/study-in-china', label: t('nav.universities.byCity') },
    { href: '/programs', label: t('nav.programs') },
    // Phase 149: MBBS in China promoted from "buried SEO guide" to
    // mobile nav so the medical cohort finds the pillar page in 1 tap.
    // Other English-medium tracks are covered by /programs.
    { href: '/mbbs-in-china', label: t('nav.mbbsInChina') },
    { href: '/scholarships', label: t('nav.scholarships') },
    { href: '/scholarships-for', label: t('nav.scholarships.byCountry') },
    { href: '/guides', label: t('nav.guides') },
    { href: '/counselling', label: t('nav.admissions.counselling') },
    { href: '/assessment', label: t('nav.admissions.assessment') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.about.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label={`SICA — ${t('nav.home')}`} className="flex shrink-0 items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B2A4A]">
          <SicaLogo className="h-9 w-auto" />
        </Link>

        {/* Desktop Nav with submenus */}
        <MainNav />

        {/* Right Actions */}
        <div className="hidden xl:flex items-center gap-1.5 shrink-0">
          <button
            onClick={switchLocale}
            type="button"
            lang={locale === 'en' ? 'zh' : 'en'}
            className="flex h-9 items-center gap-1.5 rounded-none px-2.5 text-sm font-medium text-[#1B2A4A] transition-colors duration-150 hover:bg-[#1B2A4A]/5 hover:text-[#9B1B30] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B2A4A] motion-reduce:transition-none"
          >
            <Globe className="size-4 text-[#1B2A4A]" aria-hidden="true" />
            {/* S42: was hardcoded inline ternary — now uses i18n key. The
                button always shows the OTHER language (中文 when current
                is en, EN when current is zh) so a Chinese reader sees
                'EN' as the click target. */}
            {locale === 'en' ? t('nav.langChinese') : t('nav.langEnglish')}
          </button>

          {/* Portal Login Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1.5 text-[#1B2A4A] hover:bg-[#1B2A4A]/5 hover:text-[#9B1B30] font-medium text-sm duration-150 motion-reduce:transition-none">
                <Users className="text-[#1B2A4A]" aria-hidden="true" />
                {t('nav.portalLogin')}
                <ChevronDown className="size-3 text-[#1B2A4A]" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-none border-[#1B2A4A]/15 p-2 duration-150 motion-reduce:animate-none">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild className="cursor-pointer rounded-none px-3 py-2.5 text-[#1B2A4A] focus:bg-[#1B2A4A]/5 focus:text-[#9B1B30]">
                  <Link href="/student/login">
                    <Users className="text-[#1B2A4A]" aria-hidden="true" />
                    <span>{t('nav.studentPortal')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-none px-3 py-2.5 text-[#1B2A4A] focus:bg-[#1B2A4A]/5 focus:text-[#9B1B30]">
                  <Link href="/partner/login">
                    <UserPlus className="text-[#1B2A4A]" aria-hidden="true" />
                    <span>{t('nav.partnerPortal')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-none px-3 py-2.5 text-[#1B2A4A] focus:bg-[#1B2A4A]/5 focus:text-[#9B1B30]">
                  <Link href="/admin/login">
                    <FileText className="text-[#1B2A4A]" aria-hidden="true" />
                    <span>{t('nav.adminPortal')}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            asChild
            className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold text-sm px-5 duration-150 motion-reduce:transition-none"
          >
            <Link href="/assessment">{t('nav.apply')}</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 text-gray-700"
          aria-label={t(mobileMenuOpen ? 'nav.menu.closeMenu' : 'nav.menu.openMenu')}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-gray-200 bg-white px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {mobileNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#9B1B30]"
              >
                {link.label}
              </Link>
            ))}
            {/* Portal Login Links */}
            <div className="space-y-1 pt-3 mt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3">
                {t('nav.portalLogin')}
              </p>
              <Link
                href="/student/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#9B1B30]"
              >
                <Users className="h-4 w-4" />
                {t('nav.studentPortal')}
              </Link>
              <Link
                href="/partner/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#9B1B30]"
              >
                <UserPlus className="h-4 w-4" />
                {t('nav.partnerPortal')}
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#9B1B30]"
              >
                <FileText className="h-4 w-4" />
                {t('nav.adminPortal')}
              </Link>
            </div>

            {/* Language & Apply */}
            <div className="flex items-center gap-3 pt-3 mt-2 border-t border-gray-100">
              <button
                onClick={switchLocale}
                className="flex items-center gap-1.5 rounded-none border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600"
              >
                <Globe className="size-4 text-[#1B2A4A]" aria-hidden="true" />
                {locale === 'en' ? t('nav.langChinese') : t('nav.langEnglish')}
              </button>
              <Button
                asChild
                className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold text-sm flex-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href="/assessment">{t('nav.apply')}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
