/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// Vitest config for SICA — Next 16 + React 19 + Turbopack.
//
// Key choices:
// - `environment: 'jsdom'` because most of our code touches the DOM (Next
//   pages, React components, browser-only libs). For pure server-side
//   helpers (e.g. `getServerEnv`) we can still use this env — jsdom is
//   a superset of node, so it Just Works.
// - `@vitejs/plugin-react` lets vitest transform .tsx with the same JSX
//   runtime Next uses (automatic, no React import needed in files).
// - `vite-tsconfig-paths` reads the `@/*` alias from tsconfig.json so
//   we never need to duplicate path mappings in two places.
// - `setupFiles` registers jest-dom matchers (`toBeInTheDocument` etc.)
//   and globally mocks the @/lib/supabase-browser module so component
//   tests don't try to reach the real network.
// - `pool: 'threads'` is the vitest default and works for our use case.
//   Switch to `vmThreads` if we ever hit cross-test pollution.
// - `exclude` includes `node_modules`, `.next`, `dist`, and the `coverage`
//   folder (added by `pnpm test:coverage`).
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules',
        '.next',
        'dist',
        'coverage',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.d.ts',
      ],
    },
  },
});
