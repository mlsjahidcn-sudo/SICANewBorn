'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';
import { Menu, X, Globe, FileText, Users, UserPlus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MainNav } from '@/components/main-nav';
import { SicaLogo } from '@/components/sica-logo';

export function Header() {
  const { t, locale, setLocale } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mobile-only flat link list. Desktop uses the full MainNav with
  // hover submenus, so this list is intentionally simpler (no submenu
  // nesting — it would crowd small viewports).
  const mobileNavLinks: { href: string; label: string }[] = [
    { href: '/', label: t('nav.home') },
    { href: '/universities', label: t('nav.universities') },
    { href: '/study-in-china', label: t('nav.universities.byCity') },
    { href: '/programs', label: t('nav.programs') },
    { href: '/scholarships', label: t('nav.scholarships') },
    { href: '/scholarships-for', label: t('nav.scholarships.byCountry') },
    { href: '/guides', label: t('nav.guides') },
    { href: '/assessment', label: t('nav.admissions.assessment') },
    { href: '/about', label: t('nav.about') },
    { href: '/contact', label: t('nav.about.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <SicaLogo className="h-9 w-auto" />
          <span className="hidden xl:inline text-[10px] leading-tight text-gray-500 tracking-wide border-l border-gray-200 pl-2">
            {locale === 'en' ? 'Study in China Agency' : '留学中国咨询'}
          </span>
        </Link>

        {/* Desktop Nav with submenus */}
        <MainNav />

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-1.5 rounded-none border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-[#9B1B30] hover:text-[#9B1B30]"
          >
            <Globe className="h-4 w-4" />
            {locale === 'en' ? '中文' : 'EN'}
          </button>

          {/* Portal Login Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white font-semibold text-sm">
                <Users className="mr-2 h-4 w-4" />
                {locale === 'en' ? 'Portal Login' : '门户登录'}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Link href="/student/login">
                <DropdownMenuItem className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>{locale === 'en' ? 'Student Portal' : '学生门户'}</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/partner/login">
                <DropdownMenuItem className="cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>{locale === 'en' ? 'Partner Portal' : '合作伙伴门户'}</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/admin/login">
                <DropdownMenuItem className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{locale === 'en' ? 'Admin Portal' : '管理员门户'}</span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold text-sm px-5">
            {t('nav.apply')}
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-700"
          aria-label={t('nav.menu.openMenu')}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 pb-4 pt-2">
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
                {locale === 'en' ? 'Portal Login' : '门户登录'}
              </p>
              <Link
                href="/student/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#9B1B30]"
              >
                <Users className="h-4 w-4" />
                {locale === 'en' ? 'Student Portal' : '学生门户'}
              </Link>
              <Link
                href="/partner/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#9B1B30]"
              >
                <UserPlus className="h-4 w-4" />
                {locale === 'en' ? 'Partner Portal' : '合作伙伴门户'}
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#9B1B30]"
              >
                <FileText className="h-4 w-4" />
                {locale === 'en' ? 'Admin Portal' : '管理员门户'}
              </Link>
            </div>

            {/* Language & Apply */}
            <div className="flex items-center gap-3 pt-3 mt-2 border-t border-gray-100">
              <button
                onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
                className="flex items-center gap-1.5 rounded-none border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600"
              >
                <Globe className="h-4 w-4" />
                {locale === 'en' ? '中文' : 'EN'}
              </button>
              <Button className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold text-sm flex-1">
                {t('nav.apply')}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
