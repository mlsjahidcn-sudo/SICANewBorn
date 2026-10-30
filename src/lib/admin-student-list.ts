import type { SupabaseClient } from '@supabase/supabase-js';
import { collectRows } from '@/lib/admin-application-query';
import { mapStudentFromDb, parseSource, parseStatus } from '@/lib/student-mapper';
import { parsePartnerStudentStatus } from '@/lib/partner-student-mapper';
import { sanitizeOrTerm } from '@/lib/postgrest';
import type { AdminStudentListRow } from '@/lib/admin-student-list-types';

/** Profile-linked CRM students already have a row in the profile list.
 * Unlinked CRM students need no auth account to be visible to staff. */
export async function loadAdminStudentList(service: SupabaseClient, params: URLSearchParams): Promise<AdminStudentListRow[]> {
  const surface = params.get('surface');
  const source = parseSource(params.get('source'));
  const profileStatus = parseStatus(params.get('status'));
  const partnerStatus = parsePartnerStudentStatus(params.get('status'));
  const offline = params.get('isOffline');
  const paid = params.get('servicePaid');
  const search = params.get('search')?.trim() || '';
  const safe = sanitizeOrTerm(search);
  const [profiles, partners] = await Promise.all([
    partnerStatus || surface === 'partner' ? [] : collectRows<Record<string, unknown>>((from, to) => {
      let query = service.from('student_profiles').select('*').order('id');
      if (source) query = query.eq('source', source);
      if (profileStatus) query = query.eq('status', profileStatus);
      if (offline === 'true') query = query.eq('source', 'Admin');
      if (offline === 'false') query = query.neq('source', 'Admin');
      if (paid === 'true' || paid === 'false') query = query.eq('service_paid', paid === 'true');
      if (search) query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%,nationality.ilike.%${safe}%,target_degree.ilike.%${safe}%,target_field.ilike.%${safe}%`);
      return query.range(from, to);
    }),
    surface === 'student' || (source && source !== 'Partner') || profileStatus || offline === 'true' || paid === 'true' || paid === 'false'
      ? [] : collectRows<Record<string, unknown>>((from, to) => {
        let query = service.from('partner_students').select('*')
          .is('linked_student_profile_id', null).is('archived_at', null).order('id');
        if (partnerStatus) query = query.eq('status', partnerStatus);
        if (search) query = query.or(`student_name.ilike.%${safe}%,student_email.ilike.%${safe}%,student_phone.ilike.%${safe}%,nationality.ilike.%${safe}%,target_program.ilike.%${safe}%`);
        return query.range(from, to);
      }),
  ]);
  const rows: AdminStudentListRow[] = [
    ...profiles.map((row): AdminStudentListRow => ({ ...mapStudentFromDb(row), surface: 'student' })),
    ...partners.map((row): AdminStudentListRow => {
      const name = String(row.student_name || '').trim().split(/\s+/);
      return {
        ...mapStudentFromDb({
          ...row, first_name: name[0] || '', last_name: name.slice(1).join(' '),
          email: row.student_email, phone: row.student_phone, source: 'Partner',
          target_field: row.target_program,
          preferred_universities: row.target_university ? [row.target_university] : [],
        }),
        surface: 'partner', status: parsePartnerStudentStatus(row.status) ?? 'New',
      };
    }),
  ];
  const direction = params.get('order') === 'asc' ? 1 : -1;
  const value = (row: AdminStudentListRow): string => {
    switch (params.get('sort')) {
      case 'first_name': return row.firstName;
      case 'last_name': return row.lastName;
      case 'updated_at': return row.updatedAt;
      default: return row.createdAt;
    }
  };
  return rows.sort((a, b) => value(a).toLowerCase().localeCompare(value(b).toLowerCase()) * direction
    || `${a.surface}:${a.id}`.localeCompare(`${b.surface}:${b.id}`));
}

/** Counts use the partner student's FK for CRM rows, the bridge for profiles. */
export async function loadAdminStudentApplicationCounts(service: SupabaseClient, students: AdminStudentListRow[]): Promise<Map<string, number>> {
  const profiles = students.filter(s => s.surface !== 'partner').map(s => s.id);
  const partners = students.filter(s => s.surface === 'partner').map(s => s.id);
  const [studentApps, linkedApps, partnerApps] = await Promise.all([
    profiles.length ? collectRows<{ student_id: string }>((from, to) => service.from('student_applications').select('id, student_id').in('student_id', profiles).is('archived_at', null).order('id').range(from, to)) : [],
    profiles.length ? collectRows<{ linked_student_profile_id: string }>((from, to) => service.from('partner_applications').select('id, linked_student_profile_id').in('linked_student_profile_id', profiles).is('archived_at', null).order('id').range(from, to)) : [],
    partners.length ? collectRows<{ student_id: string }>((from, to) => service.from('partner_applications').select('id, student_id').in('student_id', partners).is('archived_at', null).order('id').range(from, to)) : [],
  ]);
  const counts = new Map<string, number>();
  const add = (key: string): void => { counts.set(key, (counts.get(key) || 0) + 1); };
  studentApps.forEach(row => add(`student:${row.student_id}`));
  linkedApps.forEach(row => add(`student:${row.linked_student_profile_id}`));
  partnerApps.forEach(row => add(`partner:${row.student_id}`));
  return counts;
}
