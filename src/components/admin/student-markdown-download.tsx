'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiFetch } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { StudentExportKind } from '@/lib/student-markdown';

export function StudentMarkdownDownload({ kind, id }: { kind: StudentExportKind; id: string }): React.ReactNode {
  const { t } = useI18n();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function download(): Promise<void> {
    setPending(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/admin/student-info/export?${new URLSearchParams({ kind, id })}`, { cache: 'no-store' });
      if (!response.ok || !response.headers.get('Content-Type')?.startsWith('text/markdown')) throw new Error('Export failed');
      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.match(/filename="([a-z0-9-]+\.md)"/i)?.[1] ?? 'student-information.md';
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(t('studentMarkdown.error'));
    } finally {
      setPending(false);
    }
  }
  return <div className="flex min-w-0 max-w-full flex-col items-start gap-2">
    <Button type="button" variant="outline" className="rounded-none" disabled={pending} aria-busy={pending} onClick={() => void download()}>
    {pending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Download data-icon="inline-start" />}
    {t(pending ? 'studentMarkdown.downloading' : 'studentMarkdown.download')}
    </Button>
    {error && <Alert variant="destructive" className="max-w-xs rounded-none"><AlertDescription>{error}</AlertDescription></Alert>}
  </div>;
}
