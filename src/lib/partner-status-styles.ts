/**
 * partner-status-styles.ts
 *
 * Badge class maps + label-key bridges for the partner portal.
 *
 * These maps were previously duplicated inline on two partner pages
 * (`partner/applications/page.tsx` and `partner/applications/[id]/page.tsx`)
 * and had already drifted — the `Low` priority used `text-gray-600` on the
 * list page and `text-gray-700` on the detail page. One source of truth
 * here removes that class of bug for good.
 *
 * Labels live separately in `partner-enum-labels.ts` (which returns a
 * translated string only). Classes and labels are different concerns:
 * a label is what the partner reads, a class is how the chip looks.
 */

import type {
  PartnerApplicationPriority,
  PartnerApplicationStatus,
} from '@/lib/partner-application-mapper';
import type {
  PartnerDocCategory,
  PartnerDocStatus,
} from '@/lib/partner-doc-mapper';

/** Badge variant for each application status (shadcn `Badge` variant). */
export const STATUS_VARIANTS: Record<
  PartnerApplicationStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  Draft: 'secondary',
  Submitted: 'outline',
  'In Review': 'outline',
  Accepted: 'default',
  Rejected: 'destructive',
  Withdrawn: 'outline',
};

/** Tailwind classes for each application priority chip. */
export const PRIORITY_VARIANTS: Record<PartnerApplicationPriority, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Normal: 'bg-blue-50 text-blue-700',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-[#9B1B30] text-white',
};

/** Tailwind classes for each document review status chip. */
export const DOC_STATUS_STYLES: Record<PartnerDocStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Verified: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

/**
 * Categories SICA admin can ask for (Phase 76 `documents_requested`).
 * Snake-case — this is the stored vocabulary, not the upload one.
 */
export const DOC_REQUEST_CATEGORIES = [
  'passport',
  'transcript',
  'english_test',
  'photo',
  'other',
] as const;

export type DocRequestCategory = (typeof DOC_REQUEST_CATEGORIES)[number];

/**
 * i18n key suffix for each request category, so the label is translated
 * rather than derived from the raw enum. Admin's version derives the key
 * inline with a regex over the snake-case value; this map is explicit.
 */
export const DOC_REQUEST_CATEGORY_LABEL_KEY: Record<DocRequestCategory, string> = {
  passport: 'Passport',
  transcript: 'Transcript',
  english_test: 'EnglishTest',
  photo: 'Photo',
  other: 'Other',
};

/**
 * Bridge between the admin request vocabulary (snake-case) and the partner
 * upload vocabulary (Title-case). A `photo` or `other` request has no
 * matching upload category — `null` means "no automatic evidence", so the
 * UI shows no count rather than a misleading zero.
 */
export const DOC_REQUEST_TO_PARTNER_DOC_CATEGORY: Record<
  DocRequestCategory,
  PartnerDocCategory | null
> = {
  passport: 'Identity',
  transcript: 'Academic',
  english_test: 'Language',
  photo: null,
  other: null,
};

/** Ingestion surface of an application (Phase 75). */
export const APPLICATION_SOURCES = [
  'partner_portal',
  'public_form',
  'admin_manual',
] as const;

export type ApplicationSource = (typeof APPLICATION_SOURCES)[number];

/** i18n key suffix for each application source. */
export const SOURCE_LABEL_KEY: Record<ApplicationSource, string> = {
  partner_portal: 'PartnerPortal',
  public_form: 'PublicForm',
  admin_manual: 'AdminManual',
};

/**
 * How many uploaded documents match a request, as evidence that the
 * partner responded. A document counts when its category maps from the
 * request AND it was uploaded after the request was raised.
 *
 * Returns `null` when the request category has no upload counterpart —
 * the caller then shows no evidence line instead of "0 documents".
 */
export function countDocumentsForRequest(
  requestCategory: string,
  requestedAt: string,
  docs: Array<{ category?: string | null; uploadedAt?: string | null }>,
): number | null {
  const bridge =
    DOC_REQUEST_TO_PARTNER_DOC_CATEGORY[
      requestCategory as DocRequestCategory
    ] ?? null;
  if (!bridge) return null;

  const requestedMs = Date.parse(requestedAt);
  if (Number.isNaN(requestedMs)) return null;

  return docs.filter((doc) => {
    if (doc.category !== bridge) return false;
    const uploadedMs = doc.uploadedAt ? Date.parse(doc.uploadedAt) : NaN;
    if (Number.isNaN(uploadedMs)) return false;
    return uploadedMs >= requestedMs;
  }).length;
}
