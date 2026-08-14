#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Installing dependencies..."
# S59: switched from pnpm to npm because the Hostinger Cloud build
# env doesn't include pnpm in PATH. npm is bundled with Node.js
# so the build is self-contained. `npm ci` is the lockfile-locked
# equivalent of pnpm's `--prefer-frozen-lockfile` — fails the build
# if package-lock.json doesn't match package.json (catch drift).
npm ci --no-audit --no-fund

# Phase 67: bundle analysis opt-in. Set ANALYZE=true to generate
# interactive treemaps + sunbursts of every chunk in the bundle —
# useful for finding tree-shaking misses. Off by default because
# the analyzer adds ~30s to the build and emits ~50MB of HTML.
if [ "${ANALYZE:-false}" = "true" ]; then
  echo "Building with bundle analyzer..."
  ANALYZE=true npx next build
else
  echo "Building the Next.js project..."
  npx next build
fi

echo "Bundling server with tsup..."
npx tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

echo "Build completed successfully!"
