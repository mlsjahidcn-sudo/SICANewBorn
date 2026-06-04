'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SicaLogo } from '@/components/sica-logo';

export function Footer() {
  const { t, locale } = useI18n();
  const [year, setYear] = useState<number>(2025);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-white border-t-2 border-[#1B2A4A] text-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Color logo (the white variant was the right call on
                the old dark navy footer; now that the bg is light,
                the brand-color logo stands out naturally). */}
            <SicaLogo className="h-9 w-auto mb-4" />
            <p className="text-sm leading-relaxed text-gray-600">
              {t('footer.mission')}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1B2A4A]">
              {t('footer.explore')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/universities" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('nav.universities')}</Link></li>
              <li><Link href="/universities" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('nav.programs')}</Link></li>
              <li><Link href="/universities" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('nav.scholarships')}</Link></li>
              <li><Link href="/universities" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('nav.admissions')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1B2A4A]">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('footer.howToApply')}</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('footer.visaGuide')}</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('footer.scholarshipGuide')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1B2A4A]">
              {t('footer.resources')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('footer.livingGuide')}</Link></li>
              <li><Link href="#" className="text-sm text-gray-600 hover:text-[#9B1B30] transition-colors">{t('footer.careerSupport')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#1B2A4A]">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:mlsjahid@qq.com"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#9B1B30] transition-colors"
                >
                  <Mail className="h-4 w-4 shrink-0 text-[#1B2A4A]" />
                  mlsjahid@qq.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8617325764171"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#9B1B30] transition-colors"
                >
                  <Phone className="h-4 w-4 shrink-0 text-[#1B2A4A]" />
                  +86 173 2576 4171
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#1B2A4A]" />
                {locale === 'en' ? 'Guangzhou, China' : '中国广州'}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {year} SICA. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-gray-500 hover:text-[#9B1B30] transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-[#9B1B30] transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
