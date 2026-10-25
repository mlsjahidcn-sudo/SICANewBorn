'use client';

import { DetailError } from '@/components/public-detail/detail-error';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <DetailError reset={reset} href="/universities" />; }
