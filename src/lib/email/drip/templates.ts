/**
 * Drip email templates for new leads.
 *
 * 4-step sequence sent over 7 days after a high-intent capture
 * (assessment form, contact form). Each email is personalized
 * with the recipient's first name, country, and field of interest.
 *
 * Every email includes a working unsubscribe link. We don't add
 * tracking pixels or open-tracking (Resend can do that, but we
 * keep the surface small to avoid leaking PII to third parties).
 *
 * Brand colors: navy #1B2A4A, crimson #9B1B30, gold #D4A853.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sica.com.cn';
const BRAND_NAVY = '#1B2A4A';
const BRAND_CRIMSON = '#9B1B30';

interface DripContext {
  firstName: string;
  email: string;
  country?: string;
  intendedMajor?: string;
  /** Used in unsubscribe URL — base64 of email. */
  unsubToken: string;
  sourceKind: 'assessment' | 'contact';
  sourceId: string;
}

const wrap = (inner: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1F2937">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF8;padding:24px 0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #E5E7EB">
          <tr>
            <td style="background:${BRAND_NAVY};padding:20px 32px">
              <a href="${SITE_URL}" style="color:#fff;text-decoration:none;font-weight:800;font-size:18px;letter-spacing:0.05em">SICA</a>
              <span style="color:#fff;opacity:0.6;font-size:12px;margin-left:8px">Study in China Agency</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:15px;line-height:1.6;color:#374151">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#FAFAF8;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280">
              <p style="margin:0 0 4px 0">
                SICA · Guangzhou, China · <a href="mailto:mlsjahid@qq.com" style="color:${BRAND_CRIMSON};text-decoration:none">mlsjahid@qq.com</a>
              </p>
              <p style="margin:0">
                You're receiving this because you submitted an inquiry on
                <a href="${SITE_URL}" style="color:${BRAND_CRIMSON};text-decoration:none">sica.com.cn</a>.
                <a href="${SITE_URL}/api/email/unsubscribe?token={TOKEN}" style="color:#6B7280;text-decoration:underline">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.replace('{TOKEN}', 'PLACEHOLDER_TOKEN');

const cta = (label: string, href: string): string => `
  <p style="margin:24px 0 0 0">
    <a href="${href}" style="background:${BRAND_CRIMSON};color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">${label}</a>
  </p>
`;

const greet = (name: string): string => `<p style="margin:0 0 16px 0">Hi ${name},</p>`;

function withUnsubToken(html: string, token: string): string {
  return html.replaceAll('PLACEHOLDER_TOKEN', token);
}

// ────────────────────────────────────────────────────────────────
// STEP 0: Welcome (sent immediately on lead capture)
// ────────────────────────────────────────────────────────────────
function welcome(ctx: DripContext): { subject: string; html: string; text: string } {
  const firstName = ctx.firstName;
  const major = ctx.intendedMajor?.trim();
  const subject = `Welcome to SICA — your study-in-China journey starts here`;
  const html = wrap(`
    ${greet(firstName)}
    <p style="margin:0 0 16px 0">
      Thanks for submitting your ${ctx.sourceKind === 'assessment' ? 'academic assessment' : 'inquiry'} on SICA.
      We've received your details and our education consulting team is reviewing your profile now.
    </p>
    <p style="margin:0 0 16px 0">
      <strong>What happens next:</strong>
    </p>
    <ol style="margin:0 0 16px 0;padding-left:20px">
      <li style="margin-bottom:8px">A senior consultant will review your academic background${major ? ` and your interest in <strong>${escapeHtml(major)}</strong>` : ''}.</li>
      <li style="margin-bottom:8px">Within <strong>48 hours</strong>, we'll send you a detailed assessment via WhatsApp or email — including which Chinese universities and scholarships you qualify for.</li>
      <li style="margin-bottom:8px">You'll have a free 30-minute call with your advisor to discuss the next steps.</li>
    </ol>
    <p style="margin:0 0 16px 0">
      In the meantime, here are some resources to get you up to speed on studying in China:
    </p>
    <ul style="margin:0 0 16px 0;padding-left:20px">
      <li style="margin-bottom:4px"><a href="${SITE_URL}/guides/study-in-china" style="color:${BRAND_CRIMSON};text-decoration:none">How to study in China: complete guide</a></li>
      <li style="margin-bottom:4px"><a href="${SITE_URL}/scholarships" style="color:${BRAND_CRIMSON};text-decoration:none">Scholarships available to international students</a></li>
      <li style="margin-bottom:4px"><a href="${SITE_URL}/universities" style="color:${BRAND_CRIMSON};text-decoration:none">Browse 50+ partner universities</a></li>
    </ul>
    <p style="margin:0 0 16px 0">
      Reply to this email or message us on
      <a href="https://wa.me/8617325764171" style="color:${BRAND_CRIMSON};text-decoration:none">WhatsApp +86 173 2576 4171</a>
      if you have any questions — we typically respond within 2 hours during business days.
    </p>
    <p style="margin:0 0 0 0">Welcome aboard,<br/><strong style="color:${BRAND_NAVY}">The SICA Team</strong></p>
  `);
  const text = [
    `Hi ${firstName},`,
    ``,
    `Thanks for submitting your ${ctx.sourceKind === 'assessment' ? 'academic assessment' : 'inquiry'} on SICA. We've received your details and our education consulting team is reviewing your profile now.`,
    ``,
    `What happens next:`,
    `1. A senior consultant will review your academic background${major ? ` and your interest in ${major}` : ''}.`,
    `2. Within 48 hours, we'll send you a detailed assessment via WhatsApp or email.`,
    `3. You'll have a free 30-minute call with your advisor.`,
    ``,
    `Resources to get you up to speed:`,
    `- How to study in China: ${SITE_URL}/guides/study-in-china`,
    `- Scholarships: ${SITE_URL}/scholarships`,
    `- Browse universities: ${SITE_URL}/universities`,
    ``,
    `Reply to this email or message us on WhatsApp +86 173 2576 4171 if you have any questions.`,
    ``,
    `Welcome aboard,`,
    `The SICA Team`,
    ``,
    `Unsubscribe: ${SITE_URL}/api/email/unsubscribe?token=PLACEHOLDER_TOKEN`,
  ].join('\n');
  return { subject, html: withUnsubToken(html, ctx.unsubToken), text: text.replaceAll('PLACEHOLDER_TOKEN', ctx.unsubToken) };
}

// ────────────────────────────────────────────────────────────────
// STEP 1: Day 1 — How to choose the right program
// ────────────────────────────────────────────────────────────────
function day1(ctx: DripContext): { subject: string; html: string; text: string } {
  const firstName = ctx.firstName;
  const major = ctx.intendedMajor?.trim();
  const subject = `How to choose the right Chinese university (5 things to consider)`;
  const html = wrap(`
    ${greet(firstName)}
    <p style="margin:0 0 16px 0">
      While you wait for your advisor's assessment, here's a quick framework for picking
      the right Chinese university${major ? ` for <strong>${escapeHtml(major)}</strong>` : ''}.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">1. Match the university's strength to your field</p>
    <p style="margin:0 0 16px 0">
      China has 3,000+ universities, but only ~30 are widely known internationally. For
      ${major ? escapeHtml(major) : 'your field'}, the top schools to consider are usually in the
      C9 League, Project 985, or Project 211 lists. We've curated the most popular
      choices for international students on our universities page.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">2. Check the language of instruction</p>
    <p style="margin:0 0 16px 0">
      Most Chinese-taught programs are fully funded (CSC scholarship). English-taught
      programs are growing but have higher tuition. Bilingual tracks are a middle path.
      We can match you with programs based on your language proficiency.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">3. Look at location, not just ranking</p>
    <p style="margin:0 0 16px 0">
      Beijing, Shanghai, Hangzhou, and Shenzhen are the four biggest student hubs. Each
      has its own character — Beijing is political/cultural, Shanghai is
      financial/international, Hangzhou is tech/startup, Shenzhen is hardware/tech.
      Your day-to-day life in China will be shaped by the city as much as the school.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">4. Apply to 3–5 universities, not just one</p>
    <p style="margin:0 0 16px 0">
      Most students apply to multiple universities in parallel. We'll help you build
      a balanced shortlist: 1 reach, 2 targets, 1 safety. This maximizes your odds
      without doubling your workload.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">5. Budget for the total cost, not just tuition</p>
    <p style="margin:0 0 16px 0">
      Tuition is the visible cost. Add accommodation (¥800–3,000/month), living
      expenses (¥2,000–3,500/month), insurance, visa fees, and one-time costs
      (flights, deposit). The full cost of attendance in a tier-1 city runs
      ¥80,000–120,000 per year. With scholarships, this can drop to near zero.
    </p>
    <p style="margin:0 0 16px 0">
      Our team will walk you through each of these in your assessment. In the meantime,
      here are the most popular programs at top Chinese universities:
    </p>
    ${cta(`Browse ${major ? escapeHtml(major) + ' programs' : 'all programs'}`, `${SITE_URL}/programs`)}
  `);
  const text = [
    `Hi ${firstName},`,
    ``,
    `While you wait for your advisor's assessment, here's how to pick the right Chinese university${major ? ` for ${major}` : ''}.`,
    ``,
    `1. Match the university's strength to your field — top schools are usually C9 League, 985, or 211.`,
    `2. Check the language of instruction — Chinese-taught programs are usually fully funded.`,
    `3. Look at location, not just ranking — Beijing (political), Shanghai (financial), Hangzhou (tech), Shenzhen (hardware).`,
    `4. Apply to 3-5 universities, not just one — we help you build a balanced shortlist.`,
    `5. Budget for the total cost, not just tuition — full cost of attendance in tier-1 cities is ¥80,000-120,000/yr.`,
    ``,
    `Browse programs: ${SITE_URL}/programs`,
    ``,
    `Unsubscribe: ${SITE_URL}/api/email/unsubscribe?token=PLACEHOLDER_TOKEN`,
  ].join('\n');
  return { subject, html: withUnsubToken(html, ctx.unsubToken), text: text.replaceAll('PLACEHOLDER_TOKEN', ctx.unsubToken) };
}

// ────────────────────────────────────────────────────────────────
// STEP 2: Day 3 — Scholarships you might qualify for
// ────────────────────────────────────────────────────────────────
function day3(ctx: DripContext): { subject: string; html: string; text: string } {
  const firstName = ctx.firstName;
  const country = ctx.country?.trim();
  const subject = `Scholarships you can apply for as a student from ${country || 'your country'}`;
  const html = wrap(`
    ${greet(firstName)}
    <p style="margin:0 0 16px 0">
      One of the biggest questions international students have is
      <em>"Can I actually afford to study in China?"</em>
      The good news: there are dozens of scholarships that cover full tuition,
      accommodation, and a monthly stipend.
    </p>
    <p style="margin:0 0 16px 0">
      Here are the most common scholarships your peers from ${country || 'your region'} apply for:
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">Chinese Government Scholarship (CSC)</p>
    <p style="margin:0 0 16px 0">
      Fully funded by the Chinese Ministry of Education. Covers tuition,
      accommodation, insurance, and a monthly stipend (¥2,500–3,500).
      Open to all nationalities. Apply through your home country's
      Chinese embassy or directly to a Chinese university.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">Confucius Institute Scholarship</p>
    <p style="margin:0 0 16px 0">
      For students who have studied Chinese language or want to enroll in
      Chinese-taught programs. Full funding including a one-time settlement
      allowance. Application usually opens in March.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">Belt and Road Scholarship</p>
    <p style="margin:0 0 16px 0">
      For students from Belt and Road partner countries${country ? ` (including ${escapeHtml(country)})` : ''}.
      Covers tuition and provides a living stipend.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">University-specific scholarships</p>
    <p style="margin:0 0 16px 0">
      Most SICA partner universities have their own scholarship programs —
      Tsinghua, Peking, Fudan, and others each award full or partial
      scholarships to top international applicants.
    </p>
    <p style="margin:0 0 16px 0">
      Our team will identify which scholarships you qualify for as part of
      your free assessment. We'll also help you prepare the application
      materials so you don't miss any deadlines.
    </p>
    ${cta(`Browse all scholarships`, `${SITE_URL}/scholarships`)}
  `);
  const text = [
    `Hi ${firstName},`,
    ``,
    `One of the biggest questions international students have is "Can I actually afford to study in China?" The good news: there are dozens of scholarships that cover full tuition, accommodation, and a monthly stipend.`,
    ``,
    `Most common scholarships your peers from ${country || 'your region'} apply for:`,
    ``,
    `- Chinese Government Scholarship (CSC): fully funded, all nationalities.`,
    `- Confucius Institute Scholarship: for Chinese-taught programs.`,
    `- Belt and Road Scholarship: for B&R partner countries${country ? ` (including ${country})` : ''}.`,
    `- University-specific scholarships: Tsinghua, Peking, Fudan each have their own.`,
    ``,
    `Browse all scholarships: ${SITE_URL}/scholarships`,
    ``,
    `Unsubscribe: ${SITE_URL}/api/email/unsubscribe?token=PLACEHOLDER_TOKEN`,
  ].join('\n');
  return { subject, html: withUnsubToken(html, ctx.unsubToken), text: text.replaceAll('PLACEHOLDER_TOKEN', ctx.unsubToken) };
}

// ────────────────────────────────────────────────────────────────
// STEP 3: Day 7 — Ready to apply? Here's what to send
// ────────────────────────────────────────────────────────────────
function day7(ctx: DripContext): { subject: string; html: string; text: string } {
  const firstName = ctx.firstName;
  const subject = `Ready to apply? Here's what to send to start your SICA application`;
  const html = wrap(`
    ${greet(firstName)}
    <p style="margin:0 0 16px 0">
      It's been a week since you submitted your assessment. If you're ready to
      take the next step, here's exactly what to send to start a formal application
      with SICA:
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">1. Your latest academic transcript</p>
    <p style="margin:0 0 16px 0">
      Official or unofficial copy in PDF. If you submitted one with the
      assessment form, you're already set — no need to send again.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">2. Your CV / resume</p>
    <p style="margin:0 0 16px 0">
      One page is fine. Include your education, any work experience,
      extracurriculars, awards, and language test scores if you have them.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">3. A short statement of purpose (3-5 paragraphs)</p>
    <p style="margin:0 0 16px 0">
      Why China, why this program, and what you plan to do after you graduate.
      Don't overthink it — your SICA advisor will help you refine it.
    </p>
    <p style="margin:0 0 8px 0;font-weight:600;color:${BRAND_NAVY}">4. Two recommendation letters (optional at this stage)</p>
    <p style="margin:0 0 16px 0">
      From professors or employers. You can send these later if you don't
      have them yet — most deadlines are 3+ months out.
    </p>
    <p style="margin:0 0 16px 0">
      Once you have these ready, the next step is a free 30-minute call with
      your advisor to confirm your shortlist, set your target universities, and
      finalize the application timeline.
    </p>
    <p style="margin:0 0 16px 0">
      The fastest way to start: reply to this email, message us on
      <a href="https://wa.me/8617325764171" style="color:${BRAND_CRIMSON};text-decoration:none">WhatsApp +86 173 2576 4171</a>,
      or use the form below to confirm you'd like to proceed.
    </p>
    ${cta(`Start your application`, `${SITE_URL}/contact?subject=Application+next+steps`)}
    <p style="margin:24px 0 0 0;font-size:13px;color:#6B7280">
      If now isn't the right time, no problem — we keep your file and will
      follow up at the 30-day mark. You can also unsubscribe at the bottom
      of this email.
    </p>
  `);
  const text = [
    `Hi ${firstName},`,
    ``,
    `It's been a week since you submitted your assessment. If you're ready to take the next step, here's exactly what to send to start a formal application with SICA:`,
    ``,
    `1. Your latest academic transcript (PDF).`,
    `2. Your CV / resume (one page is fine).`,
    `3. A short statement of purpose (3-5 paragraphs).`,
    `4. Two recommendation letters (optional at this stage).`,
    ``,
    `Once you have these ready, the next step is a free 30-minute call with your advisor.`,
    ``,
    `The fastest way to start: reply to this email, message us on WhatsApp +86 173 2576 4171, or use the form at:`,
    `${SITE_URL}/contact?subject=Application+next+steps`,
    ``,
    `If now isn't the right time, we keep your file and will follow up at the 30-day mark.`,
    ``,
    `Unsubscribe: ${SITE_URL}/api/email/unsubscribe?token=PLACEHOLDER_TOKEN`,
  ].join('\n');
  return { subject, html: withUnsubToken(html, ctx.unsubToken), text: text.replaceAll('PLACEHOLDER_TOKEN', ctx.unsubToken) };
}

// ────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────

export type DripStepKey = 'welcome' | 'day1' | 'day3' | 'day7';

export interface DripStep {
  key: DripStepKey;
  index: number;
  /** Delay from lead-capture time, in milliseconds. */
  delayMs: number;
  render: (ctx: DripContext) => { subject: string; html: string; text: string };
}

export const DRIP_SEQUENCE: DripStep[] = [
  { key: 'welcome', index: 0, delayMs: 0, render: welcome },
  { key: 'day1', index: 1, delayMs: 1 * 24 * 60 * 60 * 1000, render: day1 },
  { key: 'day3', index: 2, delayMs: 3 * 24 * 60 * 60 * 1000, render: day3 },
  { key: 'day7', index: 3, delayMs: 7 * 24 * 60 * 60 * 1000, render: day7 },
];

/** Encode an email for the unsubscribe URL. Base64 of the email
 *  is not cryptographically secret, but it prevents trivial
 *  scraping and matches common drip-system patterns. */
export function makeUnsubToken(email: string): string {
  return Buffer.from(email, 'utf-8').toString('base64url');
}

export function decodeUnsubToken(token: string): string | null {
  try {
    return Buffer.from(token, 'base64url').toString('utf-8');
  } catch {
    return null;
  }
}

// Minimal HTML escape for user-supplied data interpolated into
// email bodies. Resend's API takes raw HTML, so we sanitize here
// rather than relying on a templating engine.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
