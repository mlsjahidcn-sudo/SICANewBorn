import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import type { Guide, LocalizedGuide } from '@/lib/guides/types';
import { buildChinaStudentVisaCountryGuide } from '@/lib/guides/china-student-visa-country-factory';

const VERIFY_RE = /\[verify/i;
const GUIDE_DIR = join(process.cwd(), 'src/lib/guides');

function isGuide(value: unknown): value is Guide {
  if (!value || typeof value !== 'object') return false;
  const g = value as Record<string, unknown>;
  return typeof g.slug === 'string' && Array.isArray(g.faqs) && Array.isArray(g.sections);
}

function isLocalizedGuide(value: unknown): value is LocalizedGuide {
  if (!value || typeof value !== 'object') return false;
  const g = value as Record<string, unknown>;
  return isGuide(g.en) && isGuide(g.zh);
}

/** Collect every string that GuidePage / FAQPage JSON-LD can render. */
function collectRenderedStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectRenderedStrings(item, out);
    return;
  }
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) collectRenderedStrings(child, out);
  }
}

async function loadAllGuides(): Promise<Array<{ source: string; guide: Guide }>> {
  const files = readdirSync(GUIDE_DIR).filter(
    (name) =>
      name.endsWith('.ts') &&
      name !== 'types.ts' &&
      name !== 'hub-types.ts' &&
      name !== 'hub-data.ts' &&
      name !== 'china-student-visa-country-factory.ts',
  );

  const guides: Array<{ source: string; guide: Guide }> = [];

  for (const file of files) {
    const mod = (await import(`@/lib/guides/${file.replace(/\.ts$/, '')}`)) as Record<string, unknown>;
    for (const [exportName, value] of Object.entries(mod)) {
      if (!isLocalizedGuide(value)) continue;
      guides.push({ source: `${file}:${exportName}.en`, guide: value.en });
      guides.push({ source: `${file}:${exportName}.zh`, guide: value.zh });
    }
  }

  for (const id of ['pakistan', 'bangladesh', 'nigeria'] as const) {
    const localized = buildChinaStudentVisaCountryGuide(id);
    guides.push({ source: `china-student-visa-country-factory.ts:${id}.en`, guide: localized.en });
    guides.push({ source: `china-student-visa-country-factory.ts:${id}.zh`, guide: localized.zh });
  }

  return guides;
}

describe('guide content has no [verify] markers in rendered strings', () => {
  it('fails if any guide string or FAQ answer still contains [verify', async () => {
    const guides = await loadAllGuides();
    expect(guides.length).toBeGreaterThan(50);

    const offenders: string[] = [];
    for (const { source, guide } of guides) {
      const strings: string[] = [];
      collectRenderedStrings(guide, strings);
      for (const text of strings) {
        if (VERIFY_RE.test(text)) {
          offenders.push(`${source}: ${text.slice(0, 120)}`);
        }
      }
      for (const faq of guide.faqs) {
        if (VERIFY_RE.test(faq.q) || VERIFY_RE.test(faq.a)) {
          offenders.push(`${source} FAQ: ${faq.q.slice(0, 80)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
