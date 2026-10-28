'use client';
import Image from 'next/image';
import { useState } from 'react';
import { Building2 } from 'lucide-react';
export function CityLogo({ src, name }: { src: string; name: string }): React.JSX.Element {
  const [failed, setFailed] = useState(false);
  return <span className="flex size-12 shrink-0 items-center justify-center border border-gray-200 bg-white">
    {!failed && /^(https?:\/\/|\/)/.test(src) ? <Image src={src} alt={name} width={40} height={40} sizes="40px" className="size-10 object-contain" onError={() => setFailed(true)} /> : <Building2 className="size-5 text-[#1B2A4A]" aria-hidden="true" />}
  </span>;
}
