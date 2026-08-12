'use client';

import { ToastProvider } from '@/components/admin/toast';
import { PromotionForm } from '../_components/promotion-form';

export default function NewPromotionPage() {
  return (
    <ToastProvider>
      <PromotionForm />
    </ToastProvider>
  );
}
