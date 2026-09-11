import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerAbort,
  abortStream,
  clearAbort,
  _resetAbortsForTests,
} from '@/lib/ai/chat-abort';

describe('chat-abort', () => {
  beforeEach(() => {
    _resetAbortsForTests();
  });

  it('registerAbort returns a fresh controller', () => {
    const ctrl = registerAbort('sess-1');
    expect(ctrl).toBeInstanceOf(AbortController);
    expect(ctrl.signal.aborted).toBe(false);
  });

  it('abortStream fires the registered controller', () => {
    const ctrl = registerAbort('sess-1');
    abortStream('sess-1');
    expect(ctrl.signal.aborted).toBe(true);
  });

  it('abortStream is a no-op when no controller is registered', () => {
    // Should not throw.
    abortStream('never-registered');
    expect(true).toBe(true);
  });

  it('registerAbort for the same session aborts the previous one', () => {
    const ctrl1 = registerAbort('sess-1');
    const ctrl2 = registerAbort('sess-1');
    expect(ctrl1.signal.aborted).toBe(true);
    expect(ctrl2.signal.aborted).toBe(false);
  });

  it('clearAbort drops the entry so abortStream becomes a no-op', () => {
    const ctrl = registerAbort('sess-1');
    clearAbort('sess-1');
    abortStream('sess-1');
    expect(ctrl.signal.aborted).toBe(false);
  });

  it('two sessions stay isolated', () => {
    const a = registerAbort('sess-a');
    const b = registerAbort('sess-b');
    abortStream('sess-a');
    expect(a.signal.aborted).toBe(true);
    expect(b.signal.aborted).toBe(false);
  });
});