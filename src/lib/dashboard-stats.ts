import type { ApplicationStatus } from './application-mapper';
import type { PartnerApplicationStatus } from './partner-application-mapper';

/** Submitted applications awaiting a final outcome; drafts are counted separately. */
export const STUDENT_PENDING_STATUSES = [
  'Submitted', 'Under Review', 'Documents Requested', 'Decision Made',
] as const satisfies readonly ApplicationStatus[];

export const PARTNER_ACTIVE_STATUSES = [
  'Draft', 'Submitted', 'In Review',
] as const satisfies readonly PartnerApplicationStatus[];

export interface StudentApplicationStats {
  total: number;
  pending: number;
  accepted: number;
  documentsRequested: number;
  drafts: number;
}

export interface PartnerApplicationStats {
  active: number;
  accepted: number;
}
