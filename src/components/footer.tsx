'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Footer() {
  const { t, locale } = useI18n();
  const [year, setYear] = useState<number>(2025);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-[#1B2A4A] text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-none bg-[#C41E3A] text-white font-bold text-sm">
                S
              </div>
              <span className="text-lg font-bold text-white">SICA</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              {t('footer.mission')}
            </p>
          </div>

          {/* Explore */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.explore')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="/universities" className="text-sm text-gray-400 hover:text-white transition-colors">{t('nav.universities')}</Link></li>
              <li><Link href="/universities" className="text-sm text-gray-400 hover:text-white transition-colors">{t('nav.programs')}</Link></li>
              <li><Link href="/universities" className="text-sm text-gray-400 hover:text-white transition-colors">{t('nav.scholarships')}</Link></li>
              <li><Link href="/universities" className="text-sm text-gray-400 hover:text-white transition-colors">{t('nav.admissions')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.support')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('footer.howToApply')}</Link></li>
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('footer.visaGuide')}</Link></li>
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('footer.scholarshipGuide')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.resources')}
            </h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('footer.livingGuide')}</Link></li>
              <li><Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t('footer.careerSupport')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 shrink-0" />
                info@sica-edu.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 shrink-0" />
                +86 10 8888 6666
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                {locale === 'en' ? 'Haidian District, Beijing, China' : '中国北京市海淀区'}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {year} SICA. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
