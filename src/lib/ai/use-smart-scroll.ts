'use client';
/**
 * useSmartScroll — keeps the chat pinned to the latest message
 * unless the visitor has scrolled up to read history.
 *
 * Phase 81 fix: the previous version scrolled on every render (every
 * streaming chunk), which yanked visitors back to the bottom while they
 * were reading prior messages. This hook tracks the user's scroll
 * position; if they're within 40px of the bottom, follow the tail.
 * Otherwise, leave them alone.
 *
 * The hook returns a ref for the scroll container + the imperative
 * scroll-to-bottom function the New Chat button calls.
 *
 * Usage:
 *   const { ref, scrollToBottom } = useSmartScroll();
 *   useEffect(() => { scrollToBottom(); }, [messages.length]);
 */
import { useCallback, useEffect, useRef, useState } from 'react';

const NEAR_BOTTOM_PX = 40;

export function useSmartScroll() {
  const ref = useRef<HTMLDivElement | null>(null);
  // True when the user is at (or near) the bottom of the scroll
  // container. Drives the "should follow tail" decision in the
  // effect below.
  const [followTail, setFollowTail] = useState(true);
  // Imperative handle so callers can force-scroll-to-bottom (e.g.
  // the "New chat" button, or when hydrating server history).
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
    setFollowTail(true);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      const isNearBottom = distance < NEAR_BOTTOM_PX;
      // Only update state when the value actually changes — avoids
      // re-renders on every scroll-tick when the visitor is reading.
      setFollowTail((prev) => (prev === isNearBottom ? prev : isNearBottom));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return { ref, followTail, scrollToBottom };
}