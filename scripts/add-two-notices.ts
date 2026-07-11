/**
 * scripts/add-two-notices.ts
 *
 * One-off: add the 2 extra admission notices the user provided
 * (557_22.png = NDOSIMAU at ZUST, 561_22.png = OGHOGHO at Soochow).
 * Doesn't reset existing data — just inserts the 2 new rows.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

const TILE_WIDTH = 360;
const TILE_OPACITY = 0.10;
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 85;

function loadSicaLogoInner(): string {
  try {
    const fs = require('fs') as typeof import('fs');
    const path = require('path') as typeof import('path');
    const candidates = [
      path.join(process.cwd(), 'public/sica-logo.svg'),
      path.join(process.cwd(), '..', 'public/sica-logo.svg'),
    ];
    let raw = '';
    for (const c of candidates) {
      try { raw = fs.readFileSync(c, 'utf-8'); break; } catch { /* try next */ }
    }
    if (!raw) throw new Error('sica-logo.svg not found');
    const m = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>\s*$/);
    return m ? m[1] : raw;
  } catch {
    return `<text x="0" y="50" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900" fill="#9B1B30">SICA</text>`;
  }
}
const SICA_LOGO_INNER = loadSicaLogoInner();

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

const NEW_NOTICES: Notice[] = [
  {
    file: 'Weixin Image_20260711032149_561_22.png',
    studentName: 'OGHOGHO FERDINAND OKPEGBEKE',
    universityName: 'Soochow University',
    program: 'Language program (School of Overseas Education, non-degree)',
    degree: 'Language',
    intake: 'September 2026',
    scholarship: 'Self-funded (8,500 RMB tuition + 500 RMB/semester application fee + 500 RMB physical exam)',
    country: null,
    displayOrder: 25,
  },
  {
    file: 'Weixin Image_20260711032146_557_22.png',
    studentName: 'NDOSIMAU AZIA MAKIADI',
    universityName: 'Zhejiang University of Science and Technology',
    program: 'Chinese Language Program: Robotics (one year)',
    degree: 'Language',
    intake: 'October 2026',
    scholarship: 'Self-funded (17,000 RMB/year tuition)',
    country: null,
    displayOrder: 35,
  },
];

async function main() {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error('Supabase env not set');
  const supabase: SupabaseClient = createClient(supabaseUrl, serviceKey);
  const sourceDir = '/Users/jahidabdullah/Desktop/Admission Notice';

  for (const notice of NEW_NOTICES) {
    const filePath = `${sourceDir}/${notice.file}`;
    console.log(`\n→ ${notice.file}  |  ${notice.studentName} → ${notice.universityName}`);
    try {
      const original = readFileSync(filePath);
      const watermarked = await applySicaWatermark(original);
      const noticeId = randomUUID();
      const originalPath = `originals/${noticeId}.png`;
      const publicPath = `public/${noticeId}.jpg`;
      const { error: origErr } = await supabase.storage
        .from('admission-notices')
        .upload(originalPath, original, { contentType: 'image/png', upsert: true });
      if (origErr) throw new Error(`original: ${origErr.message}`);
      const { error: pubErr } = await supabase.storage
        .from('admission-notices')
        .upload(publicPath, watermarked, { contentType: 'image/jpeg', upsert: true });
      if (pubErr) {
        await supabase.storage.from('admission-notices').remove([originalPath]);
        throw new Error(`public: ${pubErr.message}`);
      }
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
          created_by: null,
        })
        .select('id')
        .single();
      if (insErr) throw new Error(`insert: ${insErr.message}`);
      console.log(`  ✓ row ${row.id} (displayOrder=${notice.displayOrder})`);
    } catch (err) {
      console.error(`  ✗ ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log('\n=== Done ===');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
