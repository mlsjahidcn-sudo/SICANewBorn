// One-off node script to batch-replace the "S" letter badges in
// auth pages with the new SicaLogo component. The S letter
// placeholder was a `w-14 h-14` crimson square with the letter "S"
// in white. We swap it for a centered SicaLogo at h-10 (40px) which
// renders the full mark + wordmark at ~160px wide — fits centered
// in the typical 400-500px auth card.
//
// Run with: node scripts/oneoff/sica-logo-auth.mjs
// Idempotent — skips files that already have the SicaLogo.

import { readFileSync, writeFileSync } from 'node:fs';

const TARGETS = [
  'src/app/admin/register/page.tsx',
  'src/app/student/login/page.tsx',
  'src/app/student/register/page.tsx',
];

const OLD_BLOCK = `<div className="inline-flex items-center justify-center w-14 h-14 bg-[#9B1B30] mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>`;

const NEW_BLOCK = `<div className="mb-4">
            <SicaLogo className="h-10 w-auto mx-auto" />
          </div>`;

const IMPORT = "import { SicaLogo } from '@/components/sica-logo';";

for (const file of TARGETS) {
  let content = readFileSync(file, 'utf8');

  if (!content.includes(OLD_BLOCK)) {
    console.log(`SKIP  ${file} (block not found — already migrated?)`);
    continue;
  }
  content = content.replace(OLD_BLOCK, NEW_BLOCK);

  if (!content.includes('SicaLogo')) {
    // Add the import after the last existing import line.
    const lines = content.split('\n');
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) lastImport = i;
    }
    if (lastImport >= 0) {
      lines.splice(lastImport + 1, 0, IMPORT);
      content = lines.join('\n');
    }
  }

  writeFileSync(file, content);
  console.log(`OK    ${file}`);
}
