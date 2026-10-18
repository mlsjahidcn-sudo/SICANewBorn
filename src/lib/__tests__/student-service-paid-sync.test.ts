/**
 * student-service-paid-sync.test.ts
 *
 * Phase 182 — one-way sync helper. The async maybeSetStudentServicePaidFromOfflineFee
 * needs a live Supabase client; we unit-test the pure channel gate that callers
 * use before fire-and-forget.
 */
import { describe, it, expect } from 'vitest';
import { isOfflinePaymentChannel } from '../student-service-paid-sync';

describe('isOfflinePaymentChannel', () => {
  it('returns true only for the literal offline channel', () => {
    expect(isOfflinePaymentChannel('offline')).toBe(true);
  });

  it('returns false for every other known channel + empty/nullish', () => {
    expect(isOfflinePaymentChannel('online')).toBe(false);
    expect(isOfflinePaymentChannel('bank_transfer')).toBe(false);
    expect(isOfflinePaymentChannel('cash')).toBe(false);
    expect(isOfflinePaymentChannel('wechat')).toBe(false);
    expect(isOfflinePaymentChannel('alipay')).toBe(false);
    expect(isOfflinePaymentChannel('other')).toBe(false);
    expect(isOfflinePaymentChannel('unspecified')).toBe(false);
    expect(isOfflinePaymentChannel('')).toBe(false);
    expect(isOfflinePaymentChannel(null)).toBe(false);
    expect(isOfflinePaymentChannel(undefined)).toBe(false);
    expect(isOfflinePaymentChannel('Offline')).toBe(false); // case-sensitive
  });
});
