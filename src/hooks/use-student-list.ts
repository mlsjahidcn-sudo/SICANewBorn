/**
 * useStudentList — fetches the admin-visible list of students for use
 * in dropdowns, filters, and pickers. The list is a small subset
 * (id + name + email) so we cap the page size.
 *
 * Used by: admin/fees, admin/applications, admin/applications/new —
 * anywhere we need a student picker.
 */
'use client';

import { useEffect, useState } from 'react';
import { apiFetchJson } from '@/lib/api-client';
import type { AdminStudent } from '@/lib/student-mapper';

export function useStudentList(): {
  students: AdminStudent[];
  isLoading: boolean;
  error: string | null;
} {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    apiFetchJson<{ students: AdminStudent[] }>('/api/admin/students?limit=100', {
      signal: controller.signal,
    })
      .then((d) => setStudents(d.students))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Failed to load students');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { students, isLoading, error };
}
