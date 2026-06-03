/**
 * student-data.ts
 *
 * Type definitions and reference data used by the student portal. Only
 * exports that are still consumed by live code live here. (Previously
 * this file also held mockStudentAccounts, mockStudentApplications,
 * mockStudentDocuments, and mockStudentStats — all deleted in S15 once
 * the partner/admin/student rewires were complete.)
 *
 * The student portal pages do NOT fetch from this file at runtime; they
 * call /api/student/* which returns real DB rows. The types defined
 * here are the camelCase shape those endpoints produce.
 */

// ---------------------------------------------------------------------------
// Domain enums (kept in sync with DB CHECK constraints)
// ---------------------------------------------------------------------------

export type DocumentCategory =
  | 'Identity'
  | 'Academic'
  | 'Language'
  | 'Financial'
  | 'Recommendation'
  | 'Other';

export type DocumentStatus = 'Pending' | 'Uploaded' | 'Verified' | 'Rejected';

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'In Review'
  | 'Documents Requested'
  | 'Interview Scheduled'
  | 'Accepted'
  | 'Rejected'
  | 'Waitlisted'
  | 'Withdrawn';

export type Priority = 'Low' | 'Medium' | 'High';

export type Decision = 'Accepted' | 'Rejected' | 'Waitlisted' | 'Deferred';

// ---------------------------------------------------------------------------
// Enum value arrays (for Select dropdowns etc.)
// ---------------------------------------------------------------------------

export const applicationStatuses: ApplicationStatus[] = [
  'Draft',
  'Submitted',
  'In Review',
  'Documents Requested',
  'Interview Scheduled',
  'Accepted',
  'Rejected',
  'Waitlisted',
  'Withdrawn',
];

export const documentStatuses: DocumentStatus[] = [
  'Pending',
  'Uploaded',
  'Verified',
  'Rejected',
];

export const documentCategories: DocumentCategory[] = [
  'Identity',
  'Academic',
  'Language',
  'Financial',
  'Recommendation',
  'Other',
];

// ---------------------------------------------------------------------------
// Document type reference (read-only enum for the UI; not in DB)
// ---------------------------------------------------------------------------

export const documentTypes = [
  { id: 'passport-copy', name: 'Passport Copy', category: 'Identity' as DocumentCategory, requiredFor: ['Bachelor', 'Master', 'PhD'] },
  { id: 'passport-photo', name: 'Passport Photo', category: 'Identity' as DocumentCategory, requiredFor: ['Bachelor', 'Master', 'PhD'] },
  { id: 'high-school-diploma', name: 'High School Diploma', category: 'Academic' as DocumentCategory, requiredFor: ['Bachelor'] },
  { id: 'high-school-transcript', name: 'High School Transcript', category: 'Academic' as DocumentCategory, requiredFor: ['Bachelor'] },
  { id: 'bachelor-degree', name: "Bachelor's Degree", category: 'Academic' as DocumentCategory, requiredFor: ['Master', 'PhD'] },
  { id: 'bachelor-transcript', name: "Bachelor's Transcript", category: 'Academic' as DocumentCategory, requiredFor: ['Master', 'PhD'] },
  { id: 'master-degree', name: "Master's Degree", category: 'Academic' as DocumentCategory, requiredFor: ['PhD'] },
  { id: 'master-transcript', name: "Master's Transcript", category: 'Academic' as DocumentCategory, requiredFor: ['PhD'] },
  { id: 'ielts', name: 'IELTS Score', category: 'Language' as DocumentCategory, requiredFor: ['Bachelor', 'Master', 'PhD'] },
  { id: 'toefl', name: 'TOEFL Score', category: 'Language' as DocumentCategory, requiredFor: ['Bachelor', 'Master', 'PhD'] },
  { id: 'hsk', name: 'HSK Certificate', category: 'Language' as DocumentCategory, requiredFor: ['Bachelor', 'Master', 'PhD'] },
  { id: 'bank-statement', name: 'Bank Statement', category: 'Financial' as DocumentCategory, requiredFor: ['Bachelor', 'Master', 'PhD'] },
  { id: 'financial-guarantee', name: 'Financial Guarantee Letter', category: 'Financial' as DocumentCategory, requiredFor: ['Bachelor', 'Master', 'PhD'] },
  { id: 'recommendation-letter-1', name: 'Recommendation Letter 1', category: 'Recommendation' as DocumentCategory, requiredFor: ['Master', 'PhD'] },
  { id: 'recommendation-letter-2', name: 'Recommendation Letter 2', category: 'Recommendation' as DocumentCategory, requiredFor: ['PhD'] },
  { id: 'personal-statement', name: 'Personal Statement', category: 'Academic' as DocumentCategory, requiredFor: ['Bachelor', 'Master', 'PhD'] },
  { id: 'study-plan', name: 'Study Plan / Research Proposal', category: 'Academic' as DocumentCategory, requiredFor: ['Master', 'PhD'] },
  { id: 'cv', name: 'CV / Resume', category: 'Other' as DocumentCategory, requiredFor: ['Master', 'PhD'] },
];

// ---------------------------------------------------------------------------
// Domain shapes (camelCase — what the UI consumes; mappers convert from
// the snake_case DB rows in /api/student/* endpoints)
// ---------------------------------------------------------------------------

export interface StudentDocument {
  id: string;
  studentId: string;
  documentTypeId: string;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface StudentApplication {
  id: string;
  applicationNumber: string;
  studentId: string;
  university: string;
  program: string;
  degree: 'Bachelor' | 'Master' | 'PhD' | 'Chinese Language';
  intake: string;
  status: ApplicationStatus;
  personalStatement?: string;
  additionalNotes?: string;
  submittedAt?: string;
  decisionAt?: string;
  decision?: Decision;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentTypeId: string;
  studentDocumentId?: string;
  required: boolean;
  status: DocumentStatus;
  rejectionReason?: string;
  notes?: string;
  uploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}
