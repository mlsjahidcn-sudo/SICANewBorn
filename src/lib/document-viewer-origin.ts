/**
 * Pure helpers for the admin document viewer.
 *
 * Everything here is deliberately side-effect free and unit-tested
 * (see `src/lib/__tests__/document-viewer-origin.test.ts`) because
 * all of it sits on a path where a mistake is user-visible:
 *
 *  - `encodeOrigin` / `parseOrigin` decide where the admin's "back"
 *    button sends them after they open a document. A bug here means
 *    an admin gets stranded on the wrong page.
 *  - `classifyFile` decides which renderer the viewer uses. Guessing
 *    "PDF" for a DOCX produces a broken preview.
 *  - `clampZoom` / `formatFileSize` are display-only but appear on
 *    every open.
 */

/** Where an admin was when they opened a document. */
export type DocumentOriginKind = 'student' | 'partner' | 'application' | 'queue';

export interface DocumentOrigin {
  kind: DocumentOriginKind;
  /** null for the 'queue' origin (the global review queue). */
  id: string | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ORIGIN_KINDS: readonly DocumentOriginKind[] = [
  'student',
  'partner',
  'application',
  'queue',
];

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Serialise an origin into the `?from=` query param.
 *
 * Shape: `student:<uuid>` | `partner:<uuid>` | `application:<uuid>`
 * | `queue`. The queue origin has no id.
 */
export function encodeOrigin(origin: DocumentOrigin): string {
  if (origin.kind === 'queue') return 'queue';
  return `${origin.kind}:${origin.id ?? ''}`;
}

/**
 * Parse the `?from=` query param.
 *
 * Returns null for anything unexpected — the param is user-editable
 * and must never be trusted to build a URL. The caller falls back to
 * the global review queue when this returns null.
 */
export function parseOrigin(raw: string | null | undefined): DocumentOrigin | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed === 'queue') return { kind: 'queue', id: null };

  const sep = trimmed.indexOf(':');
  if (sep <= 0) return null;

  const kind = trimmed.slice(0, sep);
  const id = trimmed.slice(sep + 1);

  if (!(ORIGIN_KINDS as readonly string[]).includes(kind)) return null;
  if (kind === 'queue') return { kind: 'queue', id: null };
  if (!isUuid(id)) return null;

  return { kind: kind as DocumentOriginKind, id };
}

/**
 * Build the href an admin's "back" button should point at.
 *
 * The partner-student and student detail pages both open their
 * Documents tab via `?tab=documents` so the back link restores the
 * exact tab the admin came from (not the default Overview tab).
 */
export function originHref(origin: DocumentOrigin | null): string {
  if (!origin) return '/admin/documents';
  switch (origin.kind) {
    case 'student':
      return origin.id
        ? `/admin/students/${origin.id}?tab=documents`
        : '/admin/documents';
    case 'partner':
      return origin.id
        ? `/admin/partner-students/${origin.id}?tab=documents`
        : '/admin/documents';
    case 'application':
      return origin.id
        ? `/admin/applications/${origin.id}?tab=documents`
        : '/admin/documents';
    case 'queue':
    default:
      return '/admin/documents';
  }
}

/** How the viewer should render a file. */
export type DocumentFileKind = 'pdf' | 'image' | 'office' | 'unknown';

const PDF_EXT = /\.pdf$/i;
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|bmp|avif)$/i;
const OFFICE_EXT = /\.(docx?|odt|rtf)$/i;

/**
 * Classify a file for the viewer.
 *
 * `file_type` (the MIME type stored on the row) is authoritative when
 * present — a row whose name ends in `.pdf` but whose stored MIME
 * says `image/png` is an image (the extension on the stored file name
 * is the *original* upload name, which admins rename freely). When
 * the MIME type is missing or empty we fall back to the extension —
 * older rows were uploaded before the MIME column was populated.
 */
export function classifyFile(
  fileType: string | null | undefined,
  fileName: string | null | undefined,
): DocumentFileKind {
  const mime = (fileType || '').trim().toLowerCase();
  const name = (fileName || '').trim();

  if (mime) {
    if (mime === 'application/pdf') return 'pdf';
    if (mime.startsWith('image/')) return 'image';
    if (
      mime === 'application/msword' ||
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/vnd.oasis.opendocument.text' ||
      mime === 'application/rtf'
    ) {
      return 'office';
    }
    // A recognised-but-unrenderable MIME (e.g. application/zip) is
    // still "office-ish" — never assume it is a PDF.
    return 'unknown';
  }

  if (PDF_EXT.test(name)) return 'pdf';
  if (IMAGE_EXT.test(name)) return 'image';
  if (OFFICE_EXT.test(name)) return 'office';
  return 'unknown';
}

/** Minimum / maximum zoom the viewer allows. */
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 4;
export const DEFAULT_ZOOM = 1;

/** Zoom steps used by the toolbar's +/− buttons. */
export const ZOOM_STEP = 0.25;

/**
 * Clamp a zoom factor into the allowed range.
 *
 * NaN / non-finite input falls back to 100% rather than producing an
 * unrenderable canvas.
 */
export function clampZoom(scale: number): number {
  if (!Number.isFinite(scale)) return DEFAULT_ZOOM;
  if (scale < MIN_ZOOM) return MIN_ZOOM;
  if (scale > MAX_ZOOM) return MAX_ZOOM;
  // Two decimals keeps the "125%" readout clean.
  return Math.round(scale * 100) / 100;
}

/**
 * Format a byte count for display.
 *
 * Returns an em dash for unknown sizes so the UI never renders
 * "undefined KB".
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return '—';
  }
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Build the `?from=` query string for a "full details" link.
 *
 * The standalone page uses it to render an origin-aware back button
 * ("Back to Amara Diallo's documents" / "Back to the review queue").
 */
export function originQuery(origin: DocumentOrigin | null): string {
  if (!origin) return '';
  return `?from=${encodeURIComponent(encodeOrigin(origin))}`;
}
