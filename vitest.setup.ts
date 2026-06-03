/**
 * Vitest setup — runs before every test file.
 *
 * Two jobs:
 * 1. Register @testing-library/jest-dom matchers (e.g. `toBeInTheDocument`).
 * 2. Provide a safe default for `next/navigation` so component tests can
 *    call `useRouter`, `useParams`, `usePathname` without us wiring up
 *    a full App Router mock for every test.
 *
 * The real Supabase client is NEVER imported here — tests that need
 * Supabase should mock the `@/lib/supabase-*` modules at the test-file
 * level with `vi.mock()`, not depend on this setup file.
 */
import '@testing-library/jest-dom/vitest';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Reasonable default for next/navigation in tests. Override per-file as needed.
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Make sure RTL's `render` doesn't leak DOM nodes between tests.
afterEach(() => {
  cleanup();
});
