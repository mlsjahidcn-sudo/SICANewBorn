import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SRC = join(process.cwd(), 'src');

/**
 * Strip comments so the guard only ever inspects real code.
 *
 * A naive `startsWith('//')` check is not enough: an explanatory block
 * comment has its continuation lines indented with spaces, so prefix
 * matching misses them and the guard ends up flagging the very
 * comments that document the removal. Strip block and line comments
 * properly, then match only what is left.
 */
function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // block comments
    .replace(/^\s*\/\/.*$/gm, ' ') // // line comments
    .replace(/\s\/\/.*$/gm, ' '); // trailing // comments
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

describe('no fabricated review aggregates (Phase 185)', () => {
  // The incident: `universities.rating` is a seeded EDITORIAL value
  // (4.9 Tsinghua, 4.7 SJTU) but was emitted as an AggregateRating with
  // an invented `reviewCount: 1`. That is review-snippet abuse and risks
  // a site-wide structured-data manual action.
  //
  // This is a repo-wide guard, not a spot check, so a future page
  // cannot quietly reintroduce it.

  const sourceFiles = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));

  it('emits AggregateRating nowhere in the app', () => {
    const offenders = sourceFiles.filter((f) => {
      // This suite names the type on purpose.
      if (f.includes('__tests__')) return false;
      return /aggregateRating|AggregateRating/.test(stripComments(readFileSync(f, 'utf-8')));
    });
    expect(offenders).toEqual([]);
  });

  it('emits no reviewCount anywhere in the app', () => {
    const offenders = sourceFiles.filter((f) => {
      if (f.includes('__tests__')) return false;
      return /reviewCount/.test(stripComments(readFileSync(f, 'utf-8')));
    });
    expect(offenders).toEqual([]);
  });
});

describe('no fabricated publication dates (Phase 185)', () => {
  const sourceFiles = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));

  it('has no hardcoded default datePublished', () => {
    const offenders = sourceFiles.filter((f) => {
      if (f.includes('__tests__')) return false;
      return /datePublished:\s*'\d{4}-\d{2}-\d{2}'/.test(
        stripComments(readFileSync(f, 'utf-8'))
      );
    });
    expect(offenders).toEqual([]);
  });

  it('does not derive dateModified from the current date', () => {
    // `dateModified: new Date()` re-renders as "today" on every build,
    // so every guide claims to have just been edited.
    const offenders = sourceFiles.filter((f) => {
      if (f.includes('__tests__')) return false;
      return /dateModified:[^,\n]*new Date\(\)/.test(
        stripComments(readFileSync(f, 'utf-8'))
      );
    });
    expect(offenders).toEqual([]);
  });
});
