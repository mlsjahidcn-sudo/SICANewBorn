#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

# Phase 131: fail fast with an actionable message when the build
# machine runs an unsupported Node. Next.js 16 requires >= 20.9
# (mirrors "engines" in package.json); on an older Node the build
# doesn't fail cleanly — it dies deep inside Turbopack with a
# cryptic child-process crash during PostCSS/CSS loading, which
# looks like a CSS bug but is really the runtime. Print the
# detected version on EVERY build so the deploy log always shows
# what ran.
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
NODE_MINOR=$(node -p 'process.versions.node.split(".")[1]')
if [ "$NODE_MAJOR" -lt 20 ] || { [ "$NODE_MAJOR" -eq 20 ] && [ "$NODE_MINOR" -lt 9 ]; }; then
  echo "ERROR: Node $(node --version) is not supported. This project requires Node >= 20.9.0 (Next.js 16 — see \"engines\" in package.json)."
  echo "Hostinger fix: hPanel -> Website -> Node.js app settings -> Node version -> pick 22 LTS, then redeploy."
  exit 1
fi
echo "Node $(node --version) detected (requirement: >= 20.9.0)"

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
#
# Phase 134: NEXT_TURBOPACK_USE_WORKER=0 forces Turbopack to run
# its compilation in-process instead of forking a child Node worker
# for each phase. Next 16.3.6 spawns that child worker to handle the
# CSS pipeline (PostCSS via the PostCssTransformedAsset path), and
# on sandboxed Linux build containers (Hostinger) the bundled Node
# fork fails to start — exits 0 before Turbopack can connect to its
# stdio, killing the build with "node process exited before we
# could connect to it with exit status: 0". In-process compilation
# bypasses the broken child fork entirely. Local builds work fine
# either way; this is purely a deploy-time sandbox workaround.
export NEXT_TURBOPACK_USE_WORKER=0
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
