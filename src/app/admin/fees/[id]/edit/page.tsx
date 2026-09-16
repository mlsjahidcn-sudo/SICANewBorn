'use client';

import { use } from 'react';
import { FeeForm } from '../../_components/fee-form';

export default function AdminFeeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <FeeForm feeId={id} />;
}