/**
 * usePartnerList — fetches the admin-visible list of partners for use
 * in dropdowns, filters, and pickers. Returns id + company_name + email.
 */
'use client';

import { useEffect, useState } from 'react';
import { apiFetchJson } from '@/lib/api-client';

export interface PartnerListItem {
  id: string;
  company_name?: string | null;
  email?: string | null;
  contact_person?: string | null;
}

export function usePartnerList(): {
  partners: PartnerListItem[];
  isLoading: boolean;
  error: string | null;
} {
  const [partners, setPartners] = useState<PartnerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetchJson<{ partners?: PartnerListItem[] }>(`/api/admin/partners?status=all`, {
      signal: controller.signal,
    })
      .then((d) => setPartners(d.partners || []))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Failed to load partners');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { partners, isLoading, error };
}
