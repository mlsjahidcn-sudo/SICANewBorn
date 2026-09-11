/**
 * Per-session AbortController registry for the public chat.
 *
 * Phase 81: when the visitor clicks "Stop" mid-stream, ChatWindow calls
 * `abortStream(sessionId)` which aborts the in-flight fetch. The
 * partial response already received stays in the message list with
 * a "(stopped)" suffix so the visitor keeps any partial answer.
 *
 * One controller per active stream, keyed by session token. If a new
 * stream starts for the same session (e.g. the visitor sends another
 * message while one was already in flight) the existing controller is
 * aborted and replaced — same pattern as chat-abort's sibling in
 * partner-portal's note composer.
 *
 * Singleton — survives across React re-renders but reset on
 * process restart. Module-local Map so it doesn't leak into other
 * routes' state.
 */

const controllers = new Map<string, AbortController>();

/**
 * Register a new AbortController for the given session. If one was
 * already active, abort it first (so a previously in-flight stream
 * can't deliver chunks after the new message took over).
 *
 * Returns the controller so the caller can pass `.signal` to fetch.
 */
export function registerAbort(sessionId: string): AbortController {
  const existing = controllers.get(sessionId);
  if (existing) {
    try {
      existing.abort();
    } catch {
      // ignore — some runtimes throw if already aborted
    }
  }
  const ctrl = new AbortController();
  controllers.set(sessionId, ctrl);
  return ctrl;
}

/** Abort the stream for the given session, if any. No-op otherwise. */
export function abortStream(sessionId: string): void {
  const ctrl = controllers.get(sessionId);
  if (!ctrl) return;
  try {
    ctrl.abort();
  } catch {
    // ignore
  }
}

/** Drop the controller entry — call after the stream resolves / rejects. */
export function clearAbort(sessionId: string): void {
  controllers.delete(sessionId);
}

/** Test-only — wipe the registry between tests. */
export function _resetAbortsForTests(): void {
  controllers.clear();
}