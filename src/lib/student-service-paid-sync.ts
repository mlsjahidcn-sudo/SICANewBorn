/**
 * student-service-paid-sync.ts
 *
 * Phase 182 — one-way sync from offline fee payment → student Paid flag.
 *
 * When a fee is created/updated/marked-paid with payment_channel='offline',
 * if the linked student's service_paid is still false, set it true and stamp
 * service_paid_at. Clearing a fee or changing channel does NOT auto-clear
 * the student flag — admin clears Paid manually on /admin/students.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Best-effort: set student_profiles.service_paid=true when still false.
 * Never throws — callers fire-and-forget after a successful fee write.
 * Returns true when the flag was flipped (or already true after a race).
 */
export async function maybeSetStudentServicePaidFromOfflineFee(
  service: SupabaseClient,
  studentId: string | null | undefined,
): Promise<boolean> {
  if (!studentId || typeof studentId !== 'string' || !studentId.trim()) {
    return false;
  }
  const id = studentId.trim();
  try {
    const { data: row, error: readErr } = await service
      .from('student_profiles')
      .select('id, service_paid')
      .eq('id', id)
      .maybeSingle();
    if (readErr || !row) return false;
    if (row.service_paid === true) return true;

    const { error: writeErr } = await service
      .from('student_profiles')
      .update({
        service_paid: true,
        service_paid_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('service_paid', false);
    if (writeErr) {
      console.warn(
        '[service-paid-sync] failed to set service_paid for',
        id,
        writeErr.message,
      );
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[service-paid-sync] unexpected error', err);
    return false;
  }
}

/** True when a channel value should trigger the one-way student Paid sync. */
export function isOfflinePaymentChannel(channel: unknown): boolean {
  return channel === 'offline';
}
