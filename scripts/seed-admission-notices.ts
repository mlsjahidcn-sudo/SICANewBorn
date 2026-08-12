/**
 * scripts/seed-admission-notices.ts
 *
 * Phase 51 one-off: seed the 10 sample admission notices into
 * Supabase. Reads PNGs from ~/Desktop/Admission Notice/, applies
 * the SICA watermark, uploads originals + watermarked to the
 * `admission-notices` storage bucket, inserts one row per notice
 * with is_published=true.
 *
 * Idempotent: each call generates fresh UUIDs so re-running creates
 * duplicates. If you re-run, the prior rows stay in the DB and
 * the new run adds new ones — clean up manually if needed.
 *
 * Run from project root:
 *   pnpm tsx scripts/seed-admission-notices.ts
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

// Re-implement the watermark pipeline inline so this script
// doesn't depend on Next.js path aliases. Mirrors
// src/lib/admission-notices/watermark.ts.

// Load the SICA brand logo SVG (same source as the production
// watermark function). Falls back to a plain "SICA" wordmark if
// the file isn't found.
function loadSicaLogoInner(): string {
  try {
    const candidates = [
      path.join(process.cwd(), 'public/sica-logo.svg'),
      path.join(process.cwd(), '..', 'public/sica-logo.svg'),
    ];
    let raw = '';
    for (const c of candidates) {
      try { raw = readFileSync(c, 'utf-8'); break; } catch { /* try next */ }
    }
    if (!raw) throw new Error('sica-logo.svg not found');
    const m = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
    return m ? m[1] : raw;
  } catch {
    return `<text x="0" y="50" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900" fill="#9B1B30">SICA</text>`;
  }
}
const SICA_LOGO_INNER = loadSicaLogoInner();

const TILE_WIDTH = 360;
const TILE_OPACITY = 0.10;
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 85;

function buildTiledWatermarkSvg(width: number, height: number): string {
  const tileW = TILE_WIDTH;
  const tileH = Math.round(TILE_WIDTH * 0.32);
  const rotate = -30;
  const diagonal = Math.ceil(Math.sqrt(width * width + height * height));
  const gridW = diagonal + tileW;
  const gridH = diagonal + tileH;
  const cols = Math.ceil(gridW / tileW) + 1;
  const rows = Math.ceil(gridH / tileH) + 1;
  const LOGO_W = 280;
  const LOGO_H = 70;
  let tiles = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles += `<use href="#sica-logo" x="${c * tileW}" y="${r * tileH}" width="${LOGO_W}" height="${LOGO_H}" opacity="${TILE_OPACITY}" />`;
    }
  }
  const gridCenterX = (cols * tileW) / 2;
  const gridCenterY = (rows * tileH) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><g id="sica-logo">${SICA_LOGO_INNER}</g></defs><g transform="rotate(${rotate} ${gridCenterX} ${gridCenterY}) translate(${(-((cols * tileW - width) / 2))}, ${(-((rows * tileH - height) / 2))})">${tiles}</g></svg>`;
}

async function applySicaWatermark(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input, { failOn: 'none' }).metadata();
  if (!meta.width || !meta.height) throw new Error('Cannot read image dimensions');
  const targetWidth = Math.min(meta.width, MAX_WIDTH);
  const scale = targetWidth / meta.width;
  const targetHeight = Math.round(meta.height * scale);
  const padding = Math.ceil(Math.max(targetWidth, targetHeight) * 0.3);
  const extendedW = targetWidth + padding * 2;
  const extendedH = targetHeight + padding * 2;
  const paddedBuffer = await sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: targetWidth, height: targetHeight, fit: 'inside', withoutEnlargement: true })
    .extend({ top: padding, bottom: padding, left: padding, right: padding, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();
  const wm = await sharp(Buffer.from(buildTiledWatermarkSvg(extendedW, extendedH)))
    .resize(extendedW, extendedH, { fit: 'fill' })
    .png()
    .toBuffer();
  const composited = await sharp(paddedBuffer).composite([{ input: wm, top: 0, left: 0 }]).toBuffer();
  return await sharp(composited)
    .extract({ left: padding, top: padding, width: targetWidth, height: targetHeight })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

// ---------------------------------------------------------------------------
// 10 admission notices — metadata extracted from each letter
// ---------------------------------------------------------------------------
interface Notice {
  file: string;
  studentName: string;
  universityName: string;
  program: string;
  degree: 'Bachelor' | 'Master' | 'PhD' | 'Language' | 'Pre-University';
  intake: string;
  scholarship: string;
  country: string | null;
  displayOrder: number;
}

const NOTICES: Notice[] = [
  {
    file: 'Weixin Image_20260711032142_551_22.png',
    studentName: 'FAROLIA SYNDI MEKUI MANDJI',
    universityName: 'Zhengzhou University',
    program: 'Pharmacy',
    degree: 'Bachelor',
    intake: 'September 2026',
    scholarship: 'Partial Scholarship (Tuition Subsidy Type A: tuition RMB 5,000 after subsidy)',
    country: null,
    displayOrder: 100,
  },
  {
    file: 'Weixin Image_20260711032143_552_22.png',
    studentName: 'HOSSAIN TANIM',
    universityName: 'Nanjing University of Aeronautics and Astronautics',
    program: 'Artificial Intelligence',
    degree: 'Bachelor',
    intake: 'September 2026',
    scholarship: 'NUAA High-Fly Scholarship (First Prize) — 100% tuition free for the first year',
    country: 'Bangladesh',
    displayOrder: 90,
  },
  {
    file: 'Weixin Image_20260711032143_553_22.png',
    studentName: 'BABU TANVIR RANA ZIM',
    universityName: 'Hubei University of Technology',
    program: 'International Economics and Trade',
    degree: 'Bachelor',
    intake: 'September 2026',
    scholarship: 'Pre-Admission Letter (final scholarship TBD)',
    country: 'Bangladesh',
    displayOrder: 80,
  },
  {
    file: 'Weixin Image_20260711032145_556_22.png',
    studentName: 'RAAFIANSAH GHANIYY',
    universityName: 'Huzhou Normal University',
    program: 'Information Engineering (Computer Science and Technology)',
    degree: 'Bachelor',
    intake: 'October 2026',
    scholarship: 'Huzhou Normal University Scholarship',
    country: null,
    displayOrder: 70,
  },
  {
    file: 'Weixin Image_20260711032145_555_22.png',
    studentName: 'RATUL MD RUBAYET AHAMMED',
    universityName: 'Nanjing Institute of Technology',
    program: 'Control Engineering',
    degree: 'Bachelor',
    intake: 'September 2026',
    scholarship: 'Freshman Scholarship (Second Level)',
    country: null,
    displayOrder: 60,
  },
  {
    file: 'Weixin Image_20260711032144_554_22.png',
    studentName: 'INDIP NEUPANE',
    universityName: 'Nanjing Tech University',
    program: 'Geological Resources and Geological Engineering (School of Transportation Engineering)',
    degree: 'Master',
    intake: 'September 2026',
    scholarship: 'Nanjing Tech University Freshman Scholarship (38,000 RMB) — tuition 22,000 RMB + insurance 800 RMB/year + accommodation 2,000 RMB/year',
    country: 'Nepal',
    displayOrder: 50,
  },
  {
    file: 'Weixin Image_20260711032147_558_22.png',
    studentName: 'AYNEKULU HAWNE TEKESTE',
    universityName: 'Hubei University of Technology',
    program: 'International Economics and Trade',
    degree: 'Bachelor',
    intake: 'September 2026',
    scholarship: 'Pre-Admission Letter (final scholarship TBD)',
    country: 'Ethiopia',
    displayOrder: 45,
  },
  {
    file: 'Weixin Image_20260711032445_562_22.png',
    studentName: 'LOMPO BANSELI ARMANDO CHERIFA',
    universityName: 'Zhejiang University of Finance and Economics',
    program: 'International Trade',
    degree: 'Master',
    intake: 'September 2026',
    scholarship: 'Freshman Scholarship I (Master)',
    country: 'Burkina Faso',
    displayOrder: 40,
  },
  {
    file: 'Weixin Image_20260711032148_560_22.png',
    studentName: 'NURA SANGO IBRAHIM',
    universityName: 'Soochow University',
    program: 'Language program (School of Overseas Education, non-degree)',
    degree: 'Language',
    intake: 'September 2026',
    scholarship: 'Self-funded',
    country: null,
    displayOrder: 30,
  },
  {
    file: 'Weixin Image_20260711032148_559_22.png',
    studentName: 'LUNGU MONICA',
    universityName: 'Wuxi University',
    program: 'International Economics and Trade',
    degree: 'Bachelor',
    intake: 'September 2026',
    scholarship: 'Self-funded (7,500 RMB/year tuition + 1,500 RMB dorm + 600 RMB insurance)',
    country: null,
    displayOrder: 20,
  },
];

// ---------------------------------------------------------------------------
// Reset (clean up existing rows + their storage files) — useful
// when re-running with a different watermark style. Each call
// generates fresh UUIDs so without this the second run would
// leave the v1 rows in place.
// ---------------------------------------------------------------------------
async function resetExistingRows(supabase: SupabaseClient) {
  console.log('--- Reset: removing existing rows + storage files ---');
  const { data: rows, error } = await supabase
    .from('admission_notices')
    .select('id, image_path, original_path');
  if (error) {
    console.error('  list failed:', error.message);
    return;
  }
  if (!rows || rows.length === 0) {
    console.log('  no existing rows');
    return;
  }
  // Collect all storage paths
  const allPaths: string[] = [];
  for (const r of rows) {
    if ((r as { image_path: string }).image_path) allPaths.push((r as { image_path: string }).image_path);
    if ((r as { original_path: string }).original_path) allPaths.push((r as { original_path: string }).original_path);
  }
  // Delete storage files in batches (Supabase allows up to 1000 per call).
  if (allPaths.length > 0) {
    const { error: delErr } = await supabase.storage.from('admission-notices').remove(allPaths);
    if (delErr) console.error('  storage delete:', delErr.message);
    else console.log(`  removed ${allPaths.length} storage files`);
  }
  // Delete rows
  const { error: rowErr } = await supabase
    .from('admission_notices')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  if (rowErr) console.error('  row delete:', rowErr.message);
  else console.log(`  removed ${rows.length} rows`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service-role env not set. Check .env');
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  // Always reset before re-seeding so the public list doesn't
  // show the v1 + v5 duplicates. Pass --keep to skip the reset
  // (e.g. for incremental additions).
  if (!process.argv.includes('--keep')) {
    await resetExistingRows(supabase);
  }

  const sourceDir = '/Users/jahidabdullah/Desktop/Admission Notice';
  const results: Array<{ ok: boolean; file: string; error?: string; noticeId?: string }> = [];

  for (const notice of NOTICES) {
    const filePath = `${sourceDir}/${notice.file}`;
    console.log(`\n→ ${notice.file}  |  ${notice.studentName} → ${notice.universityName}`);
    try {
      const original = readFileSync(filePath);
      console.log(`  read ${original.byteLength} bytes`);

      // Apply watermark
      const watermarked = await applySicaWatermark(original);
      console.log(`  watermarked → ${watermarked.byteLength} bytes`);

      // Generate storage paths
      const noticeId = randomUUID();
      const originalPath = `originals/${noticeId}.png`;
      const publicPath = `public/${noticeId}.jpg`;

      // Upload original
      const { error: origErr } = await supabase.storage
        .from('admission-notices')
        .upload(originalPath, original, { contentType: 'image/png', upsert: true });
      if (origErr) throw new Error(`original upload: ${origErr.message}`);

      // Upload watermarked
      const { error: pubErr } = await supabase.storage
        .from('admission-notices')
        .upload(publicPath, watermarked, { contentType: 'image/jpeg', upsert: true });
      if (pubErr) {
        // Roll back the original upload
        await supabase.storage.from('admission-notices').remove([originalPath]);
        throw new Error(`public upload: ${pubErr.message}`);
      }
      console.log(`  uploaded originals/${noticeId}.png + public/${noticeId}.jpg`);

      // Insert row
      const { data: row, error: insErr } = await supabase
        .from('admission_notices')
        .insert({
          student_name: notice.studentName,
          university_name: notice.universityName,
          program: notice.program,
          degree: notice.degree,
          intake: notice.intake,
          scholarship: notice.scholarship,
          country: notice.country,
          image_path: publicPath,
          original_path: originalPath,
          is_published: true,
          display_order: notice.displayOrder,
          created_by: null, // service role bypasses RLS
        })
        .select('id')
        .single();
      if (insErr) throw new Error(`insert: ${insErr.message}`);
      console.log(`  ✓ inserted row ${row.id}`);
      results.push({ ok: true, file: notice.file, noticeId: row.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      console.error(`  ✗ ${message}`);
      results.push({ ok: false, file: notice.file, error: message });
    }
  }

  console.log('\n=== Summary ===');
  const ok = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`  ${ok} succeeded, ${failed} failed (of ${results.length})`);
  if (failed > 0) {
    console.log('\nFailed:');
    results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.file}: ${r.error}`));
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
