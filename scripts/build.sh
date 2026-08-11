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

echo "Building the Next.js project..."
npx next build

echo "Bundling server with tsup..."
npx tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

echo "Build completed successfully!"
