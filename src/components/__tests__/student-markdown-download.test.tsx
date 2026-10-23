import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api-client', () => ({ apiFetch: mocks.api }));
vi.mock('@/lib/i18n', () => ({ useI18n: () => ({ t: (key: string) => ({ 'studentMarkdown.download': 'Download student info (.md)', 'studentMarkdown.downloading': 'Preparing download…', 'studentMarkdown.error': 'Download failed. Retry.' })[key] ?? key }) }));
import { StudentMarkdownDownload } from '@/components/admin/student-markdown-download';

let click: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('URL', class extends URL { static createObjectURL = vi.fn(() => 'blob:student'); static revokeObjectURL = vi.fn(); });
  click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function success(): Response {
  return new Response('# Student information', { headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Content-Disposition': 'attachment; filename="student-info-amina.md"' } });
}

describe('student Markdown download action', () => {
  it('downloads on demand via the authenticated API wrapper and uses the server filename', async () => {
    mocks.api.mockResolvedValue(success());
    render(<StudentMarkdownDownload kind="partner-student" id="student-1" />);
    expect(mocks.api).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Download student info (.md)' }));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(mocks.api).toHaveBeenCalledWith('/api/admin/student-info/export?kind=partner-student&id=student-1', { cache: 'no-store' });
    const anchor = click.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe('student-info-amina.md');
    expect(anchor.href).toBe('blob:student');
    expect(document.querySelector('a[download]')).toBeNull();
  });
  it('disables duplicate clicks while preparing the file', async () => {
    let finish: ((response: Response) => void) | undefined;
    mocks.api.mockReturnValue(new Promise<Response>(resolve => { finish = resolve; }));
    render(<StudentMarkdownDownload kind="student-application" id="application-1" />);
    fireEvent.click(screen.getByRole('button'));
    const pending = screen.getByRole('button', { name: 'Preparing download…' });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(pending);
    expect(mocks.api).toHaveBeenCalledOnce();
    finish?.(success());
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
  });
  it.each([
    () => new Response('{"error":"Denied"}', { status: 403 }),
    () => new Response('<html>Login</html>', { headers: { 'Content-Type': 'text/html' } }),
  ])('shows a retryable error without downloading error responses or login HTML', async response => {
    mocks.api.mockResolvedValue(response());
    render(<StudentMarkdownDownload kind="student" id="student-1" />);
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Download failed. Retry.');
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole('button')).toBeEnabled();
    mocks.api.mockResolvedValue(success());
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
