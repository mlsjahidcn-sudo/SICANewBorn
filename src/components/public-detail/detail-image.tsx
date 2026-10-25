'use client';

import type { ReactElement } from 'react';

import Image from 'next/image';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

export function DetailImage({ src, alt, sizes, className, priority = false }: { src: string; alt: string; sizes: string; className?: string; priority?: boolean }): ReactElement {
  const [failedSource, setFailedSource] = useState('');
  const { t } = useI18n();
  if (failedSource === src || !src) return <span role="img" aria-label={alt || t('detail.imageUnavailable')} className="absolute inset-0 flex items-center justify-center bg-[#1B2A4A] p-4 text-center text-xs text-white">{t('detail.imageUnavailable')}</span>;
  return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} onError={() => setFailedSource(src)} />;
}
