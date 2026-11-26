/**
 * /success-stories — server entry. Renders the first page of published
 * admission notices into the HTML (previously the page was client-only
 * and shipped "Loading…" until the browser fetched the list). Filters and
 * "load more" stay in the client component, which calls
 * `/api/admission-notices` for everything after the first page.
 */
import { listPublishedAdmissionNotices } from '@/lib/admission-notices/public-list';
import { SuccessStoriesClient } from './success-stories-client';

export const revalidate = 600;

export default async function SuccessStoriesPage() {
  let initial = null;
  try {
    const result = await listPublishedAdmissionNotices({ page: 1, limit: 20 });
    initial = result.ok ? result.data : null;
  } catch (err) {
    console.error('[success-stories] initial load failed:', err);
  }
  return <SuccessStoriesClient initial={initial} />;
}
