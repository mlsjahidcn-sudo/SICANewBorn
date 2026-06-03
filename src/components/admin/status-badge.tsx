'use client';

type StatusType = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'full' | 'partial';

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<StatusType, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  full: 'bg-[#9B1B3015] text-[#9B1B30]',
  partial: 'bg-[#1B2A4A15] text-[#1B2A4A]',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase() as StatusType;
  const style = statusStyles[normalized] || 'bg-gray-100 text-gray-800';
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold uppercase ${style}`} style={{ borderRadius: 0 }}>
      {status}
    </span>
  );
}
