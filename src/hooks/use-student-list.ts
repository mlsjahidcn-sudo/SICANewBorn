/**
 * useStudentList — fetches the admin-visible list of students for use
 * in dropdowns, filters, and pickers. The list is a small subset
 * (id + name + email + nationality) so we cap the page size.
 *
 * Used by: admin/fees, admin/applications, admin/applications/new —
 * anywhere we need a student picker.
 *
 * Phase 21: cap raised from 100 → 500. The picker in
 * /admin/applications/new was a plain <Select> (the previous
 * typeahead didn't exist there), and 100 rows silently truncated
 * the visible list — for a 200+ student org, anyone whose name
 * sorted below the 100th row was unreachable. The picker is now
 * a SearchableSelect that filters the options client-side via
 * cmdk, so we can raise the cap without the dropdown becoming
 * unusable. 500 is a pragmatic ceiling: covers the realistic
 * 200+ case, still keeps the response payload small, and any
 * real production org at 500+ should move to a server-side
 * search endpoint (out of scope for now).
 */
'use client';

import { useEffect, useState } from 'react';
import { apiFetchJson } from '@/lib/api-client';
import type { AdminStudent } from '@/lib/student-mapper';

const STUDENT_LIST_LIMIT = 500;

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
    apiFetchJson<{ students: AdminStudent[] }>(
      `/api/admin/students?limit=${STUDENT_LIST_LIMIT}`,
      { signal: controller.signal },
    )
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
