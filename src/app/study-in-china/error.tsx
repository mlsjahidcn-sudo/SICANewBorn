'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
export default function CityCatalogError({ retry }: { error: Error & { digest?: string }; retry: () => void }): React.JSX.Element {
  const { t } = useI18n();
  return <section className="mx-auto max-w-3xl px-4 py-16"><h1 className="text-2xl font-semibold text-[#1B2A4A]">{t('cityFinder.errorTitle')}</h1><p className="mt-3 text-gray-600">{t('cityFinder.errorDescription')}</p><div className="mt-6 flex flex-wrap gap-3"><Button onClick={retry}>{t('cityFinder.retry')}</Button><Button variant="outline" asChild><Link href="/study-in-china">{t('cityFinder.allCities')}</Link></Button></div></section>;
}
