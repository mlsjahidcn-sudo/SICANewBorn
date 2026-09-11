import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSmartScroll } from '@/lib/ai/use-smart-scroll';

/**
 * useSmartScroll — focus on the parts that don't depend on jsdom
 * ref timing (which is finicky in test envs). We exercise the
 * public surface: initial followTail=true + scrollToBottom is safe
 * to call before the ref is attached.
 *
 * Full integration (scroll event → followTail state flip) is covered
 * by a manual QA checklist in AGENTS.md since jsdom's scrollHeight
 * clientHeight read path doesn't match real browser behavior.
 */
describe('useSmartScroll', () => {
  it('initializes with followTail=true so new messages scroll into view', () => {
    const { result } = renderHook(() => useSmartScroll());
    expect(result.current.followTail).toBe(true);
  });

  it('returns a ref + scrollToBottom function', () => {
    const { result } = renderHook(() => useSmartScroll());
    expect(result.current).toHaveProperty('ref');
    expect(result.current).toHaveProperty('followTail');
    expect(result.current).toHaveProperty('scrollToBottom');
    expect(typeof result.current.scrollToBottom).toBe('function');
  });

  it('scrollToBottom is a no-op when ref is unattached (SSR-safe)', () => {
    const { result } = renderHook(() => useSmartScroll());
    expect(() => {
      act(() => {
        result.current.scrollToBottom();
      });
    }).not.toThrow();
    // followTail stays true even when the ref is missing — keeps
    // the chat in a sane default state during hydration.
    expect(result.current.followTail).toBe(true);
  });
});