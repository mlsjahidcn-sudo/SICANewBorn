'use client';

import dynamic from 'next/dynamic';

/**
 * Dev-only React Inspector that lets you click any element in the
 * browser to jump to its source file in VSCode. Mounted by the
 * root layout only when `COZE_PROJECT_ENV === 'DEV'`.
 *
 * Phase 67: dynamic-imported so the inspector's 60KB chunk + its
 * dependencies (Sentry client SDK transitively, source-map magic
 * string handling) don't ship to production. The dynamic import
 * is gated on the dev flag at the layout level, so production
 * bundles never see this component at all.
 *
 * Using a wrapper component (rather than calling `next/dynamic`
 * directly inside the server-component layout) because `next/dynamic`
 * with `ssr: false` requires a client component scope.
 */
export const DevInspector = dynamic(
  () => import('react-dev-inspector').then((m) => m.Inspector),
  { ssr: false, loading: () => null },
);