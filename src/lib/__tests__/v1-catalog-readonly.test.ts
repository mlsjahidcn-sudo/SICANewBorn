/**
 * Regression guard (Phase 72): the B2B API at /v1/catalog/* is
 * read-only for partners. Mutation of universities and programs
 * happens only via the admin-gated /api/universities/* and
 * /api/programs/* routes. This test fails the build if anyone
 * adds a POST / PUT / PATCH / DELETE handler under /v1/catalog/,
 * which would silently re-introduce a way for partners to mutate
 * catalog data.
 *
 * Why a test instead of a code review rule? Code review doesn't
 * catch what isn't in the diff — a refactor that "adds a quick
 * POST" silently bypasses the constraint. A failing test makes
 * the violation loud.
 */
import fs from 'node:fs';
import path from 'node:path';

const V1_CATALOG_DIR = path.join(process.cwd(), 'src', 'app', 'api', 'v1', 'catalog');

function findRouteFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...findRouteFiles(full));
    } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
      out.push(full);
    }
  }
  return out;
}

describe('B2B catalog API is read-only for partners', () => {
  const files = findRouteFiles(V1_CATALOG_DIR);

  test('has at least one route file (sanity check)', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  test.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    '%s is not exported from any /v1/catalog/* route.ts',
    (verb) => {
      const violations: string[] = [];
      // Match `export async function POST` or `export async function POST(`
      // — the canonical App Router export shape.
      const re = new RegExp(`export\\s+async\\s+function\\s+${verb}\\b`);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        if (re.test(content)) {
          violations.push(path.relative(process.cwd(), file));
        }
      }
      expect(violations, violations.join('\n')).toEqual([]);
    },
  );
});
