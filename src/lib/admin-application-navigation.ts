import { ALLOWED_STUDENT_STATUSES } from '@/lib/application-status';
import { APPLICATION_PAYMENT_STATUSES } from '@/lib/payment-aggregate';

/** Only the application list can be used as an admin return destination. */
export function applicationReturnTo(value: string | null | undefined): string {
  if (value === '/admin/applications' || value?.startsWith('/admin/applications?')) return value;
  return '/admin/applications';
}

export function applicationDetailHref(id: string, surface: string, returnTo: string): string {
  const path = `/admin/${surface === 'partner' ? 'partner-applications' : 'applications'}/${encodeURIComponent(id)}`;
  return `${path}?${new URLSearchParams({ returnTo: applicationReturnTo(returnTo) })}`;
}


export interface ApplicationListLocation {
  source: 'all' | 'Online' | 'Partner' | 'Admin';
  search: string;
  status: string;
  student: string;
  archive: 'active' | 'archived';
  decision: 'all' | 'with' | 'without';
  enrolled: 'all' | 'enrolled' | 'not-enrolled';
  payment: 'all' | (typeof APPLICATION_PAYMENT_STATUSES)[number];
  channel: 'all' | 'offline';
  view: 'flat' | 'grouped';
  sort: 'createdAt' | 'updatedAt' | 'studentName' | 'status' | 'priority' | 'university';
  order: 'asc' | 'desc';
  page: number;
  expanded: string[];
}

function choice<T extends string>(value: string | null, values: readonly T[], fallback: T): T {
  return values.includes(value as T) ? value as T : fallback;
}

export function readApplicationListLocation(params: Pick<URLSearchParams, 'get' | 'getAll'>): ApplicationListLocation {
  const parsedPage = Number(params.get('page') || 1);
  return {
    source: choice(params.get('source'), ['all', 'Online', 'Partner', 'Admin'], 'all'),
    search: params.get('search') || '',
    status: choice(params.get('status'), ['all', ...ALLOWED_STUDENT_STATUSES], 'all'),
    student: params.get('student') || 'all',
    archive: choice(params.get('archive'), ['active', 'archived'], 'active'),
    decision: choice(params.get('decision'), ['all', 'with', 'without'], 'all'),
    enrolled: choice(params.get('enrolled'), ['all', 'enrolled', 'not-enrolled'], 'all'),
    payment: choice(params.get('payment'), ['all', ...APPLICATION_PAYMENT_STATUSES], 'all'),
    channel: choice(params.get('channel'), ['all', 'offline'], 'all'),
    view: choice(params.get('view'), ['flat', 'grouped'], 'grouped'),
    sort: choice(params.get('sort'), ['createdAt', 'updatedAt', 'studentName', 'status', 'priority', 'university'], 'createdAt'),
    order: choice(params.get('order'), ['asc', 'desc'], 'desc'),
    page: Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    expanded: params.getAll('expanded').slice(0, 100),
  };
}

export function applicationListHref(state: ApplicationListLocation, intake: string | null, partnerOnly: boolean): string {
  const params = new URLSearchParams();
  const defaults: Omit<ApplicationListLocation, 'expanded'> = {
    source: 'all', search: '', status: 'all', student: 'all', archive: 'active', decision: 'all', enrolled: 'all',
    payment: 'all', channel: 'all', view: 'grouped', sort: 'createdAt', order: 'desc', page: 1,
  };
  for (const key of Object.keys(defaults) as Array<keyof typeof defaults>) {
    if (state[key] !== defaults[key]) params.set(key, String(state[key]));
  }
  if (partnerOnly) { params.set('surface', 'partner'); params.delete('source'); }
  if (intake) params.set('intake', intake);
  for (const key of state.expanded.slice(0, 100)) params.append('expanded', key);
  return `/admin/applications${params.size ? `?${params}` : ''}`;
}
