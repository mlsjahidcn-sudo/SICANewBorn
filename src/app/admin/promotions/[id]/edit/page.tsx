'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ToastProvider } from '@/components/admin/toast';
import { PromotionForm } from '../../_components/promotion-form';

export default function EditPromotionPage() {
  const params = useParams();
  const [id, setId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const raw = params?.id;
    if (typeof raw === 'string') setId(raw);
  }, [params]);

  return (
    <ToastProvider>
      {id ? <PromotionForm promotionId={id} /> : <div className="text-gray-500">Loading...</div>}
    </ToastProvider>
  );
}
