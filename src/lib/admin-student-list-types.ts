import type { AdminStudent } from '@/lib/student-mapper';
import type { PartnerStudentStatus } from '@/lib/partner-student-mapper';

/** List identity determines the detail route and available mutations. */
export interface AdminStudentListRow extends Omit<AdminStudent, 'status'> {
  surface?: 'student' | 'partner';
  status: AdminStudent['status'] | PartnerStudentStatus;
}

export function adminStudentDetailHref(student: Pick<AdminStudentListRow, 'id' | 'surface'>): string {
  return `/admin/${student.surface === 'partner' ? 'partner-students' : 'students'}/${student.id}`;
}
