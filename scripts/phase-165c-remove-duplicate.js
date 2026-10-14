// Phase 165c one-off: strip the duplicate FEATURED_WEBINAR_UNIVERSITIES
// declaration that lives between the `Scholarship` interface close
// (`}`) and `export const scholarships` (the second one — the
// original declaration I added before realising the const needed
// to live ABOVE the `universities` array).
//
// Run from the repo root:
//   node scripts/phase-165c-remove-duplicate.js

const fs = require('fs');
const path = require('path');

const TARGET = path.join(__dirname, '..', 'src', 'lib', 'data.ts');
const src = fs.readFileSync(TARGET, 'utf8');

// The second (duplicate) declaration is between the Scholarship
// interface close `}` and `export const scholarships` (the real
// one). It starts with the `// Phase 165b:` comment that lives
// after the `}` and ends with the closing `];` before
// `export const scholarships`.
const re =
  /(\n\nexport interface Scholarship \{[\s\S]*?\}\n)\n\/\/ Phase 165b:[\s\S]*?\];\n\nexport const scholarships/;

const before = src;
const out = src.replace(
  re,
  (_, keepInterface, idx) => `${idx}export const scholarships`,
);
// `keepInterface` is the original `export interface Scholarship { ... }`
// block; we want to keep that and drop only the `// Phase 165b: ...
// ];` block. The replace template above strips it via the capture
// group + `export const scholarships` continues directly after.

if (out === before) {
  console.error('FAIL: no duplicate block found to remove');
  process.exit(1);
}

fs.writeFileSync(TARGET, out);
console.log('OK: removed duplicate FEATURED_WEBINAR_UNIVERSITIES block');
