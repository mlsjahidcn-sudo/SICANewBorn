import type { buildServiceClient } from '@/lib/supabase-auth';
import type { ExportRow, StudentExportKind, StudentMarkdownData } from '@/lib/student-markdown';

type Service = ReturnType<typeof buildServiceClient>;
export class StudentExportError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}
export class StudentExportReadError extends Error {
  public readonly code: string;
  constructor(public readonly resource: string, error: unknown) {
    super(`Could not read ${resource}`);
    this.code = error && typeof error === 'object' && 'code' in error && typeof error.code === 'string' ? error.code : 'UNKNOWN';
  }
}

/** Read-only, FK-based lookups. Failed related reads must never become an incomplete download. */
export async function loadStudentMarkdownData(service: Service, kind: StudentExportKind, id: string): Promise<StudentMarkdownData> {
  async function one(table: string, rowId: string, root = false): Promise<ExportRow> {
    const { data, error } = await service.from(table).select('*').eq('id', rowId).maybeSingle();
    if (error) throw new StudentExportReadError(table, error);
    if (!data) throw new StudentExportError(root ? 'Student or application not found' : 'A linked student record is unavailable', root ? 404 : 409);
    return data as ExportRow;
  }
  type Query = { range(from: number, to: number): PromiseLike<{ data: unknown; error: unknown }> };
  async function all(resource: string, query: () => Query): Promise<ExportRow[]> {
    const rows: ExportRow[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await query().range(offset, offset + 999);
      if (error) throw new StudentExportReadError(resource, error);
      const page = (data ?? []) as ExportRow[];
      rows.push(...page);
      if (page.length < 1000) return rows;
    }
  }
  const table = { student: 'student_profiles', 'partner-student': 'partner_students', 'student-application': 'student_applications', 'partner-application': 'partner_applications' }[kind];
  const root = await one(table, id, true);
  const isApplication = kind === 'student-application' || kind === 'partner-application';
  const selectedApplication = isApplication ? root : null;
  let partnerStudent: ExportRow | null = kind === 'partner-student' ? root : null;
  if (kind === 'partner-application' && root.student_id) {
    partnerStudent = await one('partner_students', String(root.student_id));
    if (root.partner_id !== partnerStudent.partner_id) throw new StudentExportError('Application and student links do not match', 409);
  }
  const linkedProfileId = kind === 'student' ? id : kind === 'student-application' ? root.student_id : root.linked_student_profile_id ?? partnerStudent?.linked_student_profile_id;
  if (kind === 'partner-application' && root.linked_student_profile_id && partnerStudent?.linked_student_profile_id && root.linked_student_profile_id !== partnerStudent.linked_student_profile_id) {
    throw new StudentExportError('Application and student profile links do not match', 409);
  }
  const profileId = typeof linkedProfileId === 'string' ? linkedProfileId : null;
  async function educationHistory(): Promise<ExportRow[] | null> {
    if (!profileId) return [];
    try {
      return await all('student_education_history', () => service.from('student_education_history').select('*').eq('student_id', profileId).order('sort_order', { ascending: true }));
    } catch (error) {
      // Older deployments store education in profile columns/extra instead.
      // Null tells the formatter to explain this fallback, rather than claim there are no qualifications.
      if (error instanceof StudentExportReadError && ['PGRST205', '42P01'].includes(error.code)) return null;
      throw error;
    }
  }
  const profile = kind === 'student' ? root : profileId ? await one('student_profiles', profileId) : null;
  const partnerStudentId = typeof partnerStudent?.id === 'string' ? partnerStudent.id : null;
  const documentFilters: string[] = [];
  if (profileId) documentFilters.push(`student_id.eq.${profileId}`, `linked_student_profile_id.eq.${profileId}`);
  if (partnerStudentId) documentFilters.push(`partner_student_id.eq.${partnerStudentId}`);
  if (isApplication) documentFilters.push(`${kind === 'student-application' ? 'application_id' : 'partner_application_id'}.eq.${id}`);

  const [education, documents, studentApps, partnerApps] = await Promise.all([
    educationHistory(),
    documentFilters.length ? all('student_documents', () => service.from('student_documents').select('id, name, category, file_name, status').or(documentFilters.join(',')).order('uploaded_at', { ascending: false })) : [],
    !isApplication && profileId ? all('student_applications', () => service.from('student_applications').select('*').eq('student_id', profileId).is('archived_at', null).order('created_at', { ascending: false })) : [],
    !isApplication && (partnerStudentId || profileId) ? all('partner_applications', () => {
      let query = service.from('partner_applications').select('*').is('archived_at', null).order('created_at', { ascending: false });
      query = partnerStudentId ? query.eq('student_id', partnerStudentId).eq('partner_id', partnerStudent?.partner_id) : query.eq('linked_student_profile_id', profileId);
      return query;
    }) : [],
  ]);
  return {
    identity: profile ?? selectedApplication ?? partnerStudent ?? root,
    partnerStudent: partnerStudent && (profile || selectedApplication) ? partnerStudent : undefined,
    education,
    documents,
    applications: selectedApplication ? [{ surface: kind === 'partner-application' ? 'partner' : 'student', record: selectedApplication }] : [
      ...studentApps.map(record => ({ surface: 'student' as const, record })),
      ...partnerApps.map(record => ({ surface: 'partner' as const, record })),
    ],
  };
}
