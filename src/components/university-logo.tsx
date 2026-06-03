'use client';

import { useState } from 'react';
import Image from 'next/image';

interface UniversityLogoProps {
  src: string;
  variant?: 'card' | 'detail';
  className?: string;
}

export default function UniversityLogo({ src, variant = 'card', className = '' }: UniversityLogoProps) {
  const [hasError, setHasError] = useState(false);

  // No logo URL — don't render anything
  if (!src || !src.startsWith('http')) {
    return null;
  }

  // Image failed to load — don't render anything
  if (hasError) {
    return null;
  }

  const isCard = variant === 'card';
  // Card logos render as a 64x64 image inside the card overlay; detail page logos
  // are 88x88 round avatars. next.config.ts allows all remote hostnames.
  const size = isCard ? 48 : 88;

  return (
    <div
      className={[
        isCard
          ? 'absolute bg-white border-2 border-white shadow-2xl flex items-center justify-center z-50 left-4 -bottom-8 h-16 w-16'
          : 'bg-white border-2 border-gray-200 shadow-lg flex items-center justify-center shrink-0 h-[88px] w-[88px] rounded-full',
        className,
      ].join(' ')}
    >
      <Image
        src={src}
        alt="University logo"
        width={size}
        height={size}
        className={isCard ? 'h-12 w-12 object-contain' : 'h-[64px] w-[64px] object-contain rounded-full'}
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}
