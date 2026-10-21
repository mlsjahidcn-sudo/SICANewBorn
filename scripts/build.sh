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
#
# Phase 176: `--include=dev` is REQUIRED on the Hostinger builder.
# The platform loads the project's `.env` into the build environment
# BEFORE running the install, and the production `.env` sets
# `NODE_ENV=production`. npm treats that as `--omit=dev`, so a plain
# `npm ci` skips devDependencies entirely — typescript, @types/react
# and @types/node all go missing. Next.js then reacts by installing
# them itself in the middle of the build:
#   "It looks like you're trying to use TypeScript but do not have
#    the required package(s) installed." → "Installing devDependencies
#    (npm): - @types/react" → a THIRD npm install, mid-build.
# That worked, but it needs registry access during the build and
# silently mutates node_modules while Next is reading it. Forcing dev
# deps keeps the build hermetic and one-shot.
npm ci --no-audit --no-fund --include=dev

# Copy the pdf.js worker into public/ so the admin document viewer
# can render PDFs without involving the bundler. Wired into
# `postinstall` too, but re-run it here in case the install ran with
# --ignore-scripts. The script is a no-op when pdfjs-dist is absent.
node scripts/copy-pdf-worker.mjs

# Phase 67: bundle analysis opt-in. Set ANALYZE=true to generate
# interactive treemaps + sunbursts of every chunk in the bundle —
# useful for finding tree-shaking misses. Off by default because
# the analyzer adds ~30s to the build and emits ~50MB of HTML.
#
# Phase 134 was NEXT_TURBOPACK_USE_WORKER=0 (no effect on the broken
# child-Node spawn — Turbopack 16.3.6 always forks for the CSS
# pipeline regardless of that flag).
#
# Phase 135: switch the build to the webpack bundler entirely
# (`next build --webpack`). The webpack path does NOT spawn a child
# Node worker for the CSS pipeline — PostCSS runs in-process via
# the legacy webpack loader chain — so the Hostinger sandbox crash
# that kills every Turbopack build is sidestepped completely.
# Discovered the option in node_modules/next/dist/lib/bundler.js
# (`parseBundlerArgs({ webpack: true })` returns Bundler.Webpack=1,
# selected at runtime by the `--webpack` CLI flag or by a
# `webpack:` config block).
#
# Tradeoff: webpack builds take longer than Turbopack (we observed
# ~20s vs ~10s locally) and Next 16 ships fewer optimizations for
# the webpack path. The Hostinger sandbox can't run Turbopack's
# child Node fork, so the build is going through the legacy path
# until a future Next patch closes the gap.
if [ "${ANALYZE:-false}" = "true" ]; then
  echo "Building with bundle analyzer (webpack)..."
  # Phase 159: invoke the locally-installed `next` binary directly
  # rather than `npx next`. `npx` resolves the package through its
  # own temp cache at `~/.npm/_npx/<id>/node_modules/...`, which is a
  # SEPARATE node_modules tree from the one `npm ci` just populated.
  # The local binary inherits the same node_modules as the
  # `npm ci` step and finds react / react-dom. Without this, the
  # Hostinger build dies with `Cannot find module 'react'` even
  # though package.json + package-lock.json are correct.
  ANALYZE=true npm run build:app
else
  echo "Building the Next.js project (webpack)..."
  npm run build:app
fi

echo "Bundling server with tsup..."
npm run build:server

echo "Build completed successfully!"
