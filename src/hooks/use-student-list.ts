'use client';

import { useEffect, useState } from 'react';
import { apiFetchJson } from '@/lib/api-client';
import type { AdminStudent } from '@/lib/student-mapper';

const STUDENT_LIST_LIMIT = 100;

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
    (async (): Promise<void> => {
      const all: AdminStudent[] = [];
      let page = 1;
      for (;;) {
        const data = await apiFetchJson<{ students: AdminStudent[]; totalPages: number }>(`/api/admin/students?limit=${STUDENT_LIST_LIMIT}&page=${page}`, { signal: controller.signal });
        all.push(...data.students);
        if (page >= data.totalPages || !data.students.length) break;
        page++;
      }
      if (!controller.signal.aborted) setStudents(all);
    })()
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
