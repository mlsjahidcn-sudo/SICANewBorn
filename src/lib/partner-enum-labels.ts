import type { PartnerApplicationStatus, PartnerApplicationPriority, PartnerApplicationDecision } from './partner-application-mapper';
import type { PartnerLeadStatus } from './partner-lead-mapper';
import type { PartnerStudentStatus } from './partner-student-mapper';

/**
 * Small helpers that centralize the translation-key mapping for the
 * partner portal's closed enums. The UI passes its `t()` function so
 * the helpers stay framework-agnostic and server-safe.
 */

function appStatusKey(status: PartnerApplicationStatus | string) {
  return `partnerAppStatus.${status.toLowerCase().replace(/\s+/g, '')}`;
}

function appPriorityKey(priority: PartnerApplicationPriority | string) {
  return `partnerAppPriority.${priority.toLowerCase()}`;
}

function appDecisionKey(decision: PartnerApplicationDecision | string) {
  return `partnerAppDecision.${decision.toLowerCase()}`;
}

function leadStatusKey(status: PartnerLeadStatus | string) {
  return `partnerLeadStatus.${status.toLowerCase()}`;
}

export function getPartnerApplicationStatusLabel(
  status: PartnerApplicationStatus | string | null | undefined,
  t: (key: string) => string,
): string {
  if (!status) return '';
  const translated = t(appStatusKey(status));
  // If the key is missing, `t()` returns the raw key; fall back to the
  // raw status value so the UI never shows a dot-notated key.
  return translated === appStatusKey(status) ? status : translated;
}

export function getPartnerApplicationPriorityLabel(
  priority: PartnerApplicationPriority | string | null | undefined,
  t: (key: string) => string,
): string {
  if (!priority) return '';
  const translated = t(appPriorityKey(priority));
  return translated === appPriorityKey(priority) ? priority : translated;
}

export function getPartnerApplicationDecisionLabel(
  decision: PartnerApplicationDecision | string | null | undefined,
  t: (key: string) => string,
): string {
  if (!decision) return '';
  const translated = t(appDecisionKey(decision));
  return translated === appDecisionKey(decision) ? decision : translated;
}

export function getPartnerLeadStatusLabel(
  status: PartnerLeadStatus | string | null | undefined,
  t: (key: string) => string,
): string {
  if (!status) return '';
  const translated = t(leadStatusKey(status));
  return translated === leadStatusKey(status) ? status : translated;
}

const STUDENT_STATUS_KEYS: Record<PartnerStudentStatus, string> = {
  New: 'partnerStudents.statusNew',
  'In Progress': 'partnerStudents.statusInProgress',
  Applied: 'partnerStudents.statusApplied',
  Accepted: 'partnerStudents.statusAccepted',
  Rejected: 'partnerStudents.statusRejected',
};

export function getPartnerStudentStatusLabel(
  status: PartnerStudentStatus | string | null | undefined,
  t: (key: string) => string,
): string {
  if (!status) return '';
  const key = STUDENT_STATUS_KEYS[status as PartnerStudentStatus];
  if (!key) return status;
  const translated = t(key);
  return translated === key ? status : translated;
}
