import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guards for the 2026-10-17 SEO/AEO audit findings.
 *
 * Each of these corresponds to a defect that was LIVE on
 * studyinchina.academy and confirmed by fetching the deployed pages.
 * They are regression guards, not a re-statement of intent: every one
 * of them fails against the code as it stood before the fix.
 */

const SRC = join(process.cwd(), 'src');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')
    .replace(/\s\/\/.*$/gm, ' ');
}

describe('F1 — robots.txt sitemap line must be a single slash', () => {
  it('builds the sitemap URL from the normalized SITE_URL', () => {
    const robots = readFileSync(join(SRC, 'app/robots.ts'), 'utf-8');
    const code = stripComments(robots);
    // The raw env var bypasses SITE_URL's `.replace(/\/+$/, '')` and
    // produced "https://studyinchina.academy//sitemap.xml" in production.
    expect(code).not.toMatch(/sitemap:[^;]*process\.env\.NEXT_PUBLIC_SITE_URL/);
    expect(code).toMatch(/sitemap:\s*`\$\{SITE_URL\}\/sitemap\.xml`/);
  });

  it('never joins a URL that could end in a double slash', () => {
    const offenders = sourceFiles.filter((f) => {
      if (f.includes('__tests__')) return false;
      const code = stripComments(readFileSync(f, 'utf-8'));
      return /process\.env\.NEXT_PUBLIC_SITE_URL\s*\|\|\s*SITE_URL/.test(code);
    });
    expect(offenders).toEqual([]);
  });
});

describe('F4 — no unconfirmed stat leaks into public copy', () => {
  it('has no "27+ partner universities" claim anywhere', () => {
    const offenders = sourceFiles.filter((f) => {
      if (f.includes('__tests__')) return false;
      const code = stripComments(readFileSync(f, 'utf-8'));
      if (!/27\+/.test(code)) return false;
      // The thank-you proof stats are now EMPTY (the value lives in
      // i18n, not here), so a hit here is a live claim.
      return /27\+\s*(partner|所合作)/i.test(code);
    });
    expect(offenders).toEqual([]);
  });

  it('has no unverified partner count left in the i18n copy', () => {
    const i18n = stripComments(
      readFileSync(join(SRC, 'lib/i18n-translations.ts'), 'utf-8')
    );
    // "27+ partner universities" and "92% placement rate" are both
    // unverified. The i18n values are now empty strings, which makes
    // the tiles hide themselves.
    expect(i18n).not.toMatch(/'27\+'\s*,\s*\n\s*'thankYou\.proofStat3Label'/);
    expect(i18n).not.toMatch(/'92%'\s*,\s*\n\s*'thankYou\.proofStat2Label'/);
    // The values themselves now live in site-stats.ts, where an empty
    // string means "hide this tile" — the established mechanism.
    const siteStats = readFileSync(join(SRC, 'lib/site-stats.ts'), 'utf-8');
    expect(siteStats).toMatch(/partnerUniversities:\s*''/);
    expect(siteStats).toMatch(/admissionRate:\s*''/);
  });

  it('states the two confirmed entity facts in the public copy', () => {
    const i18n = readFileSync(join(SRC, 'lib/i18n-translations.ts'), 'utf-8');
    expect(i18n).toContain('10 years of experience in study-in-China admissions');
    expect(i18n).toContain('Ednex Group LTD');
  });

  it('publishes the confirmed facts in llms.txt and on the homepage', () => {
    const llms = readFileSync(join(process.cwd(), 'public/llms.txt'), 'utf-8');
    expect(llms).toContain('10 years of experience in study-in-China admissions');
    expect(llms).toContain('Ednex Group LTD');

    const home = readFileSync(join(SRC, 'app/page.tsx'), 'utf-8');
    expect(home).toContain("t('why.trustLine')");
  });
});

describe('F6 — the Organization entity must reach the raw HTML', () => {
  it('does not use next/script for the global JSON-LD', () => {
    // `<Script strategy="beforeInteractive">` ships JSON-LD inside the
    // RSC flight payload, not as a literal <script type="application/ld+json">
    // element. Everything that does not execute JavaScript — which is
    // most AI crawlers and every social scraper — then never sees the
    // Organization node at all.
    const layout = readFileSync(join(SRC, 'app/layout.tsx'), 'utf-8');
    const code = stripComments(layout);
    expect(code).not.toMatch(/<Script[\s\S]{0,200}application\/ld\+json/);
    expect(code).toMatch(/<script\s+type="application\/ld\+json"/);
  });

  it('emits three literal JSON-LD script tags in the layout', () => {
    const layout = stripComments(readFileSync(join(SRC, 'app/layout.tsx'), 'utf-8'));
    const tags = layout.match(/<script\s+type="application\/ld\+json"/g) ?? [];
    expect(tags.length).toBeGreaterThanOrEqual(3);
  });

  it('defines the #organization node that pages reference by @id', () => {
    const sd = readFileSync(join(SRC, 'lib/structured-data.ts'), 'utf-8');
    expect(sd).toContain("'@id': `${SITE_URL}/#organization`");
    expect(sd).toContain('Ednex Group LTD');
  });
});

describe('F7 — llms.txt must not leak internal build notes', () => {
  const llms = readFileSync(join(process.cwd(), 'public/llms.txt'), 'utf-8');

  it('contains no HTML comments', () => {
    expect(llms).not.toContain('<!--');
  });

  it('contains no internal phase markers', () => {
    expect(llms).not.toMatch(/Phase\s+\d+/i);
  });

  it('contains no internal owner names', () => {
    expect(llms).not.toMatch(/Jahid/i);
  });
});

describe('F2 — /counselling must not claim "no open slots" before asking', () => {
  const wizard = readFileSync(join(SRC, 'app/counselling/booking-wizard.tsx'), 'utf-8');

  it('tracks whether a slot fetch has resolved', () => {
    // "We have not asked yet" and "we asked and there is nothing" are
    // different states. Collapsing them made the server-rendered HTML
    // of the primary conversion page say "No open slots on this day"
    // before any request had been made.
    expect(wizard).toContain('slotsFetched');
  });

  it('only renders the empty state once a fetch has resolved', () => {
    const code = stripComments(wizard);
    // The empty state must be gated on a RESOLVED fetch, not merely on
    // `slots.length === 0` (which is true before any request).
    expect(code).toMatch(/slotsFetched\s*&&\s*selectedDate\s*\?/);
    expect(code).not.toMatch(/slots\.length === 0\s*\?\s*\(/);
  });
});

describe('F10 — /get-started must render exactly one H1', () => {
  const page = readFileSync(join(SRC, 'app/get-started/page.tsx'), 'utf-8');
  const client = readFileSync(join(SRC, 'app/get-started/GetStartedClient.tsx'), 'utf-8');

  it('uses a content-free skeleton as the Suspense fallback', () => {
    // The fallback used to be the whole page, so SSR streamed the page
    // twice: two identical <h1>s and every byte transmitted twice.
    expect(page).toContain('<GetStartedSkeleton />');
    expect(page).not.toMatch(/fallback=\{<GetStartedClient/);
  });

  it('keeps the skeleton free of headings and copy', () => {
    const skeleton = page.slice(page.indexOf('function GetStartedSkeleton'));
    expect(skeleton).not.toMatch(/<h1/);
    expect(skeleton).not.toMatch(/sales\.heroTitle/);
  });

  it('has exactly one h1 in the client component', () => {
    const count = (client.match(/<h1/g) ?? []).length;
    expect(count).toBe(1);
  });
});

describe('F3 — the sitemap must not stamp build time as lastmod', () => {
  const sitemap = readFileSync(join(SRC, 'app/sitemap.ts'), 'utf-8');
  const code = stripComments(sitemap);

  it('never uses `lastModified: now`', () => {
    // 395 URLs sharing one build timestamp makes Google discount
    // lastmod for the whole sitemap — including the DB-driven URLs
    // that carry a real updated_at.
    expect(code).not.toMatch(/lastModified:\s*now/);
  });

  it('uses the row updated_at when there is one', () => {
    expect(code).toMatch(/updated_at \? \{ lastModified: new Date\(entry\.updated_at\) \} : \{\}/);
  });
});

describe('F5 — guide metadata must fit the SERP budget', () => {
  const guideDir = join(SRC, 'lib/guides');

  it('every guide entry with a seoTitle is within the limit', () => {
    const files = readdirSync(guideDir).filter((f) => f.endsWith('.ts'));
    const offenders: string[] = [];

    for (const f of files) {
      const src = readFileSync(join(guideDir, f), 'utf-8');
      // Each guide ENTRY: slug → eyebrow → title → description → [seo*].
      // Anchoring on slug+eyebrow matters: the files also contain
      // section-level `title:` / `description:` pairs, and scanning
      // those would test copy that never reaches the <head>.
      const re =
        /slug:\s*'[^']+',[\s\S]{0,300}?eyebrow:\s*(?:'[^']*'|`[^`]*`),[\s\S]{0,300}?title:\s*'((?:[^'\\]|\\.)*)',[\s\S]{0,600}?description:\s*'((?:[^'\\]|\\.)*)',([\s\S]{0,600}?)subtitle:/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(src))) {
        const title = m[1].replace(/\\'/g, "'");
        const desc = m[2].replace(/\\'/g, "'");
        const seg = m[3];
        const st = (seg.match(/seoTitle:\s*'((?:[^'\\]|\\.)*)'/) ?? [])[1];
        const sd = (seg.match(/seoDescription:\s*'((?:[^'\\]|\\.)*)'/) ?? [])[1];
        const effT = st ? st.replace(/\\'/g, "'") : title;
        const effD = sd ? sd.replace(/\\'/g, "'") : desc;
        const isZh = /[一-鿿]/.test(title);
        // Latin: 60 - len(" | SICA") = 53.  CJK is double-width, so the
        // budget in characters is roughly half.
        const maxT = isZh ? 30 : 53;
        const maxD = isZh ? 78 : 155;
        if (effT.length > maxT || effD.length > maxD) {
          offenders.push(`${f}: title ${effT.length}/${maxT} desc ${effD.length}/${maxD}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('the guide metadata pages prefer the seo title when present', () => {
    const offenders = sourceFiles.filter((f) =>
      /title:\s*guide\.title/.test(stripComments(readFileSync(f, 'utf-8')))
    );
    expect(offenders).toEqual([]);
  });
});

describe('F9 — the homepage links its money pages in-body', () => {
  const home = readFileSync(join(SRC, 'app/page.tsx'), 'utf-8');

  it('links the CSC scholarship guide in-body', () => {
    expect(home).toContain('/chinese-government-scholarship-csc');
  });

  it('links the application deadlines guide in-body', () => {
    expect(home).toContain('/china-university-application-deadlines');
  });
});

/**
 * G4–G6 — SEO/AEO structure follow-up (2026-10-18).
 *
 * G4: Organization.sameAs stays empty until real profile URLs exist;
 *     footer must not reintroduce bare social-platform homepages.
 * G5: /success-stories is an RSC shell + client island (Phase 92
 *     pattern); scholarships/[slug] + universities/compare stay RSC.
 * G6: cookie-locale crawler behavior is documented; no /zh/ path
 *     routing; Phase 184 self-canonical for zh is preserved.
 */

describe('G4 — Organization.sameAs stays empty without verified profiles', () => {
  const structured = readFileSync(join(SRC, 'lib/structured-data.ts'), 'utf-8');
  const footer = readFileSync(join(SRC, 'components/footer.tsx'), 'utf-8');

  it('emits an empty sameAs array (no fabricated social profiles)', () => {
    // After comments are stripped, the Organization schema must still
    // declare `sameAs: []` — never a populated list of platform
    // homepages. A non-empty array here without real handles is the
    // exact E-E-A-T regression Phase 145 / G4 exist to prevent.
    const code = stripComments(structured);
    expect(code).toMatch(/sameAs:\s*\[\s*\]/);
  });

  it('does not put bare social-platform homepages in footer hrefs', () => {
    // Comments may mention the removed URLs; only live href= attributes
    // count. WhatsApp wa.me is fine — it is a verified contact channel.
    const code = stripComments(footer);
    const bareHomepages = [
      /href=["']https?:\/\/(www\.)?instagram\.com\/?["']/,
      /href=["']https?:\/\/(www\.)?facebook\.com\/?["']/,
      /href=["']https?:\/\/(www\.)?youtube\.com\/?["']/,
      /href=["']https?:\/\/(www\.)?linkedin\.com\/?["']/,
      /href=["']https?:\/\/(www\.)?twitter\.com\/?["']/,
      /href=["']https?:\/\/(www\.)?x\.com\/?["']/,
    ];
    for (const pattern of bareHomepages) {
      expect(code).not.toMatch(pattern);
    }
  });

  it('does not put bare social-platform homepages in sameAs values', () => {
    const code = stripComments(structured);
    expect(code).not.toMatch(/instagram\.com\/?['"]/);
    expect(code).not.toMatch(/facebook\.com\/?['"]/);
    expect(code).not.toMatch(/youtube\.com\/?['"]/);
    expect(code).not.toMatch(/linkedin\.com\/?['"]/);
  });
});

describe('G5 — public catalog/detail surfaces ship as RSC + client island', () => {
  it('/success-stories page.tsx is an async RSC shell (no use client)', () => {
    const page = readFileSync(join(SRC, 'app/success-stories/page.tsx'), 'utf-8');
    const code = stripComments(page);
    expect(code).not.toMatch(/['"]use client['"]/);
    expect(code).toMatch(/export\s+default\s+async\s+function\s+SuccessStoriesPage/);
    expect(code).toContain("from './success-stories-client'");
    expect(code).toContain('initialNotices');
    expect(code).toContain('loadInitialNotices');
  });

  it('/success-stories client island owns interactivity', () => {
    const client = readFileSync(
      join(SRC, 'app/success-stories/success-stories-client.tsx'),
      'utf-8'
    );
    expect(client).toMatch(/^['"]use client['"]/);
    expect(client).toContain('initialNotices');
    expect(client).toContain('skipInitialFetch');
  });

  it('/scholarships/[slug] stays RSC + ScholarshipDetailClient island', () => {
    const page = readFileSync(join(SRC, 'app/scholarships/[slug]/page.tsx'), 'utf-8');
    const code = stripComments(page);
    expect(code).not.toMatch(/['"]use client['"]/);
    expect(code).toContain('ScholarshipDetailClient');
    expect(code).toContain('getScholarshipBySlug');
  });

  it('/universities/compare stays RSC + ComparePicker island', () => {
    const page = readFileSync(join(SRC, 'app/universities/compare/page.tsx'), 'utf-8');
    const code = stripComments(page);
    expect(code).not.toMatch(/['"]use client['"]/);
    expect(code).toContain('ComparePicker');
    expect(code).toContain('getAllUniversities');
  });
});

describe('G6 — cookie-locale crawler behavior stays documented; no /zh/ routes', () => {
  const alternates = readFileSync(join(SRC, 'lib/alternates.ts'), 'utf-8');

  it('documents that crawlers do not persist the locale cookie', () => {
    // The G6 block exists so a future "fix" that invents /zh/ paths
    // has to delete this warning first. Assert the key claims stay.
    expect(alternates).toMatch(/G6/);
    // Phrase may wrap across JSDoc lines (`do NOT persist\n * cookies`).
    expect(alternates).toMatch(/do NOT persist[\s\S]*?cookies/i);
    expect(alternates).toMatch(/\?lang=zh/);
    expect(alternates).toMatch(/Do NOT invent[\s\S]*?\/zh\//i);
  });

  it('keeps Phase 184 self-canonical for zh (no English-canonical trap)', () => {
    const code = stripComments(alternates);
    // zh canonical must be the zhUrl, not the bare absolute path.
    expect(code).toMatch(/canonical:\s*locale\s*===\s*['"]zh['"]\s*\?\s*zhUrl\s*:\s*absolute/);
    expect(code).toMatch(/zh:\s*zhUrl/);
    expect(code).toMatch(/['"]x-default['"]\s*:\s*absolute/);
  });

  it('does not introduce /zh/ path-prefix locale routing in app routes', () => {
    // A /zh/... App Router segment would fight the cookie + ?lang=
    // contract. Guard the filesystem, not just the docs.
    const appDir = join(SRC, 'app');
    const zhDirs = readdirSync(appDir).filter((entry) => {
      const full = join(appDir, entry);
      return statSync(full).isDirectory() && /^(zh|en)$/i.test(entry);
    });
    expect(zhDirs).toEqual([]);
  });
});
