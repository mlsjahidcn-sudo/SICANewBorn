#!/usr/bin/env node
/**
 * Copy the pdf.js runtime assets into `public/` so the browser can
 * load them from stable absolute paths, with no bundler involvement.
 *
 * What gets copied
 * ----------------
 *   node_modules/pdfjs-dist/build/pdf.worker.min.mjs  ->  public/pdf.worker.min.mjs
 *   node_modules/pdfjs-dist/cmaps/                   ->  public/pdfjs/cmaps/
 *   node_modules/pdfjs-dist/standard_fonts/           ->  public/pdfjs/standard_fonts/
 *
 * Why not let the bundler handle it?
 * ----------------------------------
 * The admin document viewer renders PDFs with pdf.js. pdf.js spawns
 * its worker via `GlobalWorkerOptions.workerSrc`. Two bundler-native
 * ways to ship that worker exist (`new Worker(new URL(...))` and
 * `?url` imports) and both behave differently under Next 16's
 * webpack build vs. its Turbopack dev server. Copying the files into
 * `public/` and pointing at them by absolute path sidesteps the
 * bundler entirely — one code path that works in dev, in
 * `next build`, and in the standalone `dist/server.js` output.
 *
 * Why the cmaps + standard fonts?
 * -------------------------------
 * Chinese university transcripts are frequently generated with
 * non-embedded CID fonts. Without the CMap tables those glyphs
 * render as blanks or garbage. `cMapUrl` + `standardFontDataUrl`
 * point at these copied directories so CJK PDFs render correctly.
 *
 * Wired into three places so the files can never be missing:
 *   - `package.json` → `postinstall` (covers `npm ci` / `npm install`)
 *   - `scripts/build.sh` (covers builds where postinstall was skipped)
 *   - `scripts/dev.sh`   (covers `npm run dev` on a fresh clone)
 *
 * These are build artifacts and are gitignored.
 *
 * Failure is non-fatal: the viewer detects a missing worker at
 * runtime and falls back to the browser's native PDF preview.
 */

import { copyFile, cp, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const pkg = join(projectRoot, 'node_modules', 'pdfjs-dist');

const WORKER_CANDIDATES = [
  join(pkg, 'build', 'pdf.worker.min.mjs'),
  join(pkg, 'build', 'pdf.worker.min.js'),
];

const DEST_DIR = join(projectRoot, 'public');
const DEST = join(DEST_DIR, 'pdf.worker.min.mjs');
const ASSET_DIR = join(DEST_DIR, 'pdfjs');

async function exists(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

async function findWorker() {
  for (const candidate of WORKER_CANDIDATES) {
    if (await exists(candidate)) return candidate;
  }
  return null;
}

async function main() {
  const picked = await findWorker();

  if (!picked) {
    console.warn(
      '[copy-pdf-worker] pdfjs-dist worker not found — skipping. ' +
        'The admin document viewer will fall back to the browser PDF preview.',
    );
    return;
  }

  await mkdir(DEST_DIR, { recursive: true });
  await copyFile(picked, DEST);
  console.log(
    `[copy-pdf-worker] ${picked.replace(`${projectRoot}/`, '')} -> public/pdf.worker.min.mjs`,
  );

  // cmaps + standard fonts — optional but required for correct CJK PDF rendering
  for (const dir of ['cmaps', 'standard_fonts']) {
    const from = join(pkg, dir);
    if (!(await exists(from))) {
      console.warn(`[copy-pdf-worker] ${dir} not found — skipping (CJK PDFs may render poorly)`);
      continue;
    }
    const to = join(ASSET_DIR, dir);
    await mkdir(ASSET_DIR, { recursive: true });
    await cp(from, to, { recursive: true, force: true });
    console.log(`[copy-pdf-worker] ${dir} -> public/pdfjs/${dir}`);
  }
}

main().catch((err) => {
  console.warn('[copy-pdf-worker] failed:', err instanceof Error ? err.message : err);
});
