/**
 * Phase 33: this page used to be the standalone Partner Pipeline
 * list. The unified `/admin/applications` list (S28) already
 * showed every partner-CRM row alongside the student-app rows,
 * with the same S31 bulk / S33 export / Phase 32 stat cards /
 * Phase 32 cross-taxonomy status filter — making this standalone
 * page a strictly worse view of the same data. We kept the
 * partner-only status / decision controls on the
 * `/admin/partner-applications/[id]` detail page (admin is the
 * only role that can flip those), so the detail route stays.
 *
 * This list route is now a 0-RTT server redirect to
 * `/admin/applications?surface=partner`, which the unified
 * list reads on mount and renders in partner-only mode (no
 * source tabs, partner-specific columns, "Partner Pipeline"
 * page title). The redirect is server-side so a browser that
 * has the old URL bookmarked still works without a flash of
 * the old page.
 */
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function AdminPartnerApplicationsListPage(): never {
  redirect('/admin/applications?surface=partner');
}
