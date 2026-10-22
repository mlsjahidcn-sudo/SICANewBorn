import type { SupabaseClient } from '@supabase/supabase-js';
import {
  parseReportRange,
  readReportRows,
  ReportInputError,
  type ReportRange,
} from './admin-reporting';
import {
  isWebinarStatus,
  parseWebinarFilters,
  summarizeWebinar,
  webinarMatches,
  type WebinarSignup,
  type WebinarReport,
  type WebinarStatus,
} from './webinar-report';
import { trackServer } from './analytics';

export async function loadWebinarSignups(
  client: SupabaseClient,
  range: ReportRange,
): Promise<WebinarSignup[]> {
  const rows = await readReportRows((fromPage) =>
    client
      .from('webinar_signups')
      .select(
        'id,first_name,last_name,email,whatsapp,country,program_interests,notes,source_page,utm_source,utm_campaign,status,created_at',
      )
      .gte('created_at', range.start)
      .lt('created_at', range.endExclusive)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .range(fromPage, fromPage + 499),
  );
  return rows.map((row) => {
    if (!isWebinarStatus(row.status))
      throw new Error('Unknown webinar status in reporting data.');
    return {
      id: row.id as string,
      firstName: row.first_name || '',
      lastName: row.last_name || '',
      email: row.email || '',
      whatsapp: row.whatsapp || '',
      country: row.country || null,
      programInterests: row.program_interests || [],
      notes: row.notes || null,
      sourcePage: row.source_page || null,
      utmSource: row.utm_source?.trim() || null,
      utmCampaign: row.utm_campaign || null,
      status: row.status,
      createdAt: row.created_at as string,
    };
  });
}
export async function buildWebinarReport(
  client: SupabaseClient,
  params: URLSearchParams,
): Promise<{ report: WebinarReport; matching: WebinarSignup[] }> {
  const range = parseReportRange(params);
  const filters = parseWebinarFilters(params);
  const rows = await loadWebinarSignups(client, range);
  const cohort = rows.filter((row) => webinarMatches(row, filters, false));
  const matching = cohort.filter((row) => webinarMatches(row, filters));
  const limit = Math.min(
    200,
    Math.max(1, Math.trunc(Number(params.get('limit')) || 25)),
  );
  const totalPages = Math.max(1, Math.ceil(matching.length / limit));
  const page = Math.min(
    totalPages,
    Math.max(1, Math.trunc(Number(params.get('page')) || 1)),
  );
  const unique = (values: string[]): string[] =>
    [...new Set(values)].sort((a, b) => a.localeCompare(b));
  return {
    matching,
    report: {
      range,
      filters,
      generatedAt: new Date().toISOString(),
      stats: summarizeWebinar(cohort, range),
      signups: matching.slice((page - 1) * limit, page * limit),
      total: matching.length,
      page,
      limit,
      totalPages,
      facets: {
        countries: unique(rows.map((row) => row.country || '__missing')),
        sources: unique(rows.map((row) => row.utmSource || '__missing')),
        interests: unique(rows.flatMap((row) => row.programInterests)),
      },
    },
  };
}
export function parseWebinarIds(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > 200 ||
    value.some(
      (id) =>
        typeof id !== 'string' ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          id,
        ),
    )
  ) {
    throw new ReportInputError('Select between 1 and 200 valid registrations.');
  }
  return [...new Set(value as string[])];
}
export async function updateWebinarStatus(
  client: SupabaseClient,
  id: string,
  status: WebinarStatus,
  adminId: string,
): Promise<void> {
  const existing = await client
    .from('webinar_signups')
    .select('id,status')
    .eq('id', id)
    .maybeSingle();
  if (existing.error) throw new Error('Could not read registration.');
  if (!existing.data) throw new ReportInputError('Registration not found.');
  if (existing.data.status === status) return;
  const updated = await client
    .from('webinar_signups')
    .update({ status })
    .eq('id', id)
    .eq('status', existing.data.status)
    .select('id')
    .maybeSingle();
  if (updated.error) throw new Error('Could not update registration.');
  if (!updated.data)
    throw new Error('This registration changed. Refresh and try again.');
  // A failed ancillary history/analytics write must not report a saved status as failed.
  try {
    const history = await client
      .from('lead_history')
      .insert({
        lead_type: 'webinar_signup',
        lead_id: id,
        admin_id: adminId,
        action: 'status_changed',
        from_value: existing.data.status,
        to_value: status,
      });
    if (history.error)
      console.warn(
        '[webinar] status saved; history unavailable:',
        history.error.message,
      );
  } catch {
    console.warn('[webinar] status saved; history request failed.');
  }
  try {
    trackServer('webinar_signup_status_changed', {
      locale: 'en',
      signup_id: id,
      old_status: existing.data.status,
      new_status: status,
    });
  } catch {
    console.warn('[webinar] status saved; analytics unavailable.');
  }
}
