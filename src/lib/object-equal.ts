/**
 * object-equal.ts
 *
 * Phase 111d: tiny structural-equality helper for form dirty
 * checks. Replaces the `JSON.stringify(a) === JSON.stringify(b)`
 * pattern that was used on the student + application edit pages.
 * The JSON approach is fragile — order-dependent in V8 (works
 * only because object literal keys serialize in declaration
 * order, which silently breaks on any refactor that reorders
 * keys) and silently misses `undefined` properties that are rolled
 * up to `null` on the wire.
 *
 * Use this for shallow structural comparison of two POJOs. Not
 * designed for arrays-of-objects, Date, Map, Set, etc — the
 * partner-portal use cases are flat form shapes.
 */
export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const aKeys = Object.keys(a as Record<string, unknown>);
  const bKeys = Object.keys(b as Record<string, unknown>);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isDeepEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key],
    )) return false;
  }
  return true;
}