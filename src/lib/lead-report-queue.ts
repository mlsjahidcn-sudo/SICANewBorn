interface QueueQuery<T> {
  is(column: string, value: null): T;
  neq(column: string, value: string): T;
  in(column: string, values: string[]): T;
  or(filters: string): T;
  lt(column: string, value: string): T;
}
export function applyLeadReportQueue<T extends QueueQuery<T>>(
  query: T,
  type: 'contact' | 'chat' | 'assessment',
  queue: string,
  now: number = Date.now(),
): void {
  if (queue === 'unassigned') {
    query.is('assigned_to', null);
    const excluded =
      type === 'contact'
        ? ['Resolved', 'Spam']
        : type === 'chat'
          ? ['Unqualified']
          : ['Rejected'];
    for (const status of excluded) query.neq('status', status);
  }
  if (queue === 'followup') {
    const cutoff = new Date(now - 86_400_000).toISOString();
    query.in(
      'status',
      type === 'contact'
        ? ['New', 'In Progress']
        : type === 'chat'
          ? ['New', 'Contacted']
          : ['Pending', 'Reviewed', 'Contacted'],
    );
    query
      .or(`last_contacted_at.is.null,last_contacted_at.lt.${cutoff}`)
      .lt('created_at', cutoff);
  }
}
