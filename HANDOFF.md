# SICA — Handoff Document

> **For:** whoever picks this up next (coder agent, future me, new contributor)
> **What this is:** complete state-of-the-codebase + every change made across 7 sprints, plus open items, patterns, and gotchas.
> **Read order:** this file → `AGENTS.md` (architecture) → `DESIGN.md` (visual) → `database/migration-supabase-cloud.sql` (DB schema)

## TL;DR

SICA (Study in China Agency) is a Next.js 16 + Supabase consultancy platform for international students. **7 sprints of work are already done and live.** The platform is shippable. The dev server runs on `http://localhost:5050` against official Supabase cloud (project `wbzdwwvtbaftjxecgdxk`, region `ap-northeast-1`).

**All 7 sprints shipped without regressions. Type check is 0 errors. S1 auth + S2 cleanup + S3 RSC + S4 perf + S5 real forms + S6 admin views + S7 AVIF all green.**

## How to use this repo

```bash
# Setup
pnpm install
cp .env.example .env
# (fill in real Supabase keys)

# Develop (port 5050, NOT 5000 — see gotcha #1)
pnpm next dev -p 5050
# or just:
pnpm dev  # uses the custom src/server.ts (see gotcha #1)

# Verify
pnpm ts-check    # 0 errors required
bash .dev-logs/s1-retry-new.sh   # S1 security smoke
bash .dev-logs/s5-test-intake.py # or s6-test.sh / s7 smoke
```

```bash
# Deploy
pnpm build       # production build (verified working in S4)
pnpm start       # starts custom server on $PORT (default 5000 → override with env)
```

## Environment variables (live in `.env`, see `.env.example` for template)

| Var | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Public, client-readable |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public, client-readable |
| `COZE_SUPABASE_URL` | yes | Server-side (mirrors public) |
| `COZE_SUPABASE_ANON_KEY` | yes | Server-side anon key for per-request JWT clients |
| `COZE_SUPABASE_SERVICE_ROLE_KEY` | yes | Server-only, bypasses RLS for admin operations |
| `DOUBAO_API_KEY` | optional | Volcano Ark AI for `/api/ai/*` |
| `DOUBAO_BASE_URL` | optional | Default: `https://ark.cn-beijing.volces.com/api/v3` |
| `DOUBAO_MODEL` | optional | Default: `ep-20241203153141-7jv9c` |
| `ADMIN_INVITE_TOKEN` | **yes (S2)** | `openssl rand -hex 32`. Gates `/admin/register`. Empty = registration closed. |
| `NEXT_PUBLIC_SITE_URL` | optional | Used by sitemap, JSON-LD, OG. Default: `https://sica.com.cn` |
| `PORT` | optional | Dev server port. Default 5000 (problematic on Mac) |
| `NODE_ENV` | optional | |

## Architecture (1-page summary)

```
/Users/jahidabdullah/Downloads/SICA-COZE-101-main/
├── public/                       # static (hero-bg.avif, why-study-china.avif, QR codes, svgs)
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Inter font + JSON-LD + cookie-based locale
│   │   ├── page.tsx              # home (RSC, AVIF hero)
│   │   ├── fonts.ts               # next/font/google config
│   │   ├── sitemap.ts, robots.ts
│   │   ├── about/                # RSC
│   │   ├── contact/              # RSC + ContactForm (client island)
│   │   │   └── contact-form.tsx  # POSTs to /api/leads
│   │   ├── assessment/           # RSC + AssessmentForm (client island)
│   │   │   └── assessment-form.tsx  # POSTs to /api/assessments
│   │   ├── universidades/        # client (search/filter), data fetched on mount
│   │   ├── programas/, scholarships/  # similar
│   │   ├── admin/                # admin portal (auth-gated)
│   │   │   ├── layout.tsx        # AuthProvider + sidebar + sign-out
│   │   │   ├── leads/page.tsx    # real contact_submissions (S6)
│   │   │   ├── assessments/      # real student_assessments (S6)
│   │   │   └── ... (universities, programs, scholarships, students, applications, fees, settings, dashboard)
│   │   ├── partner/              # partner portal (auth-gated, real Supabase auth in S2)
│   │   ├── student/              # student portal (real dashboard in S5)
│   │   └── api/                  # 17 route groups
│   │       ├── leads/route.ts                 # S5: contact form intake
│   │       ├── assessments/route.ts          # S5: assessment form intake
│   │       ├── admin/leads/route.ts           # S6: admin list
│   │       ├── admin/leads/[id]/route.ts      # S6: admin status update
│   │       ├── admin/assessments/*            # S6: same
│   │       ├── admin/check-invite/route.ts    # S2: invite token gate
│   │       ├── admin/create-user/route.ts     # S1: secure admin user creation
│   │       ├── admin/profile/route.ts         # S1: returns caller's profile
│   │       ├── partner/me/route.ts            # S2: server-derived partnerId check
│   │       ├── partner/{students,fees,leads,applications}/route.ts
│   │       ├── student/{profile,applications,documents}/route.ts  # Bearer auth
│   │       ├── universities/, programs/, scholarships/  # public
│   │       ├── ai/chat, ai/generate-university  # Doubao integration
│   │       ├── seed/, stats/, proxy-image/
│   │       └── ...
│   ├── components/
│   │   ├── client-layout.tsx    # I18nProvider + Header/Footer for public routes
│   │   ├── header.tsx, footer.tsx
│   │   ├── university-logo.tsx   # next/image wrapper
│   │   └── ui/                   # shadcn/ui components
│   ├── lib/
│   │   ├── data.ts               # static fallback (9 universidades, 17 programs, 10 scholarships) + filter dropdowns
│   │   ├── i18n.tsx              # client i18n Context (syncs cookie)
│   │   ├── i18n-translations.ts  # server-safe translation table
│   │   ├── server-t.ts           # getServerT() for RSC
│   │   ├── supabase-browser.ts   # browser client (anon key)
│   │   ├── supabase-server.ts    # server client (service-role, for admin operations)
│   │   ├── supabase-auth.ts      # S1: getRequestAuth, requireAdmin, requirePartner (Bearer JWT)
│   │   ├── api-client.ts         # browser fetch wrapper (auto Bearer token)
│   │   ├── auth-context.tsx      # AuthProvider + useAuth hook
│   │   ├── student-data.ts       # LEGACY mock data (see "Open Items")
│   │   ├── structured-data.ts    # SEO JSON-LD schemas
│   │   └── utils.ts
│   └── hooks/                    # use-mobile, use-student-api
├── database/
│   ├── student-tables.sql            # original student portal tables
│   ├── migration-supabase-cloud.sql  # COMPLETE schema (11 tables + RLS + triggers + data)
│   ├── fix-rls-recursion.sql         # S1: SECURITY DEFINER is_admin() fix
│   └── s5-intake-tables.sql          # S5: contact_submissions + student_assessments
├── scripts/
│   ├── build.sh, dev.sh, start.sh, prepare.sh, validate.sh
│   └── bootstrap-auth.sh             # creates auth.users via admin API
├── .env / .env.volcengine      # current + rollback (delete after 7 days)
├── .env.example                # template
└── [config files]              # next.config.ts, tsconfig.json, etc.
```

## Database schema (current state in live Supabase)

11 business tables + 1 sequence + 33 RLS policies + 11 updated_at triggers + 1 student-signup trigger + 1 application-number generator:

| Table | Purpose | RLS |
|---|---|---|
| `contact_submissions` | `/contact` form intake (S5) | public INSERT, admin SELECT/UPDATE |
| `student_assessments` | `/assessment` form intake (S5) | public INSERT, admin SELECT/UPDATE |
| `universities` | University catalog | public SELECT, admin writes |
| `programs` | Programs catalog | public SELECT, admin writes |
| `scholarships` | Scholarships catalog | public SELECT, admin writes |
| `student_profiles` | Student account info | student self, admin full |
| `student_applications` | Student applications | student self, admin full |
| `student_documents` | Uploaded docs | student self, admin full |
| `application_timeline` | Application status history | student self, admin full |
| `student_notifications` | In-app notifications | student self, admin full |
| `admin_profiles` | Admin user info | admin self, admin full |
| `partners` | Partner org records | partner self, admin full |
| `partner_students` | Partner's students | partner self (scoped), admin full |
| `partner_fees` | Partner's fees | partner self (scoped), admin full |
| `partner_leads` | Partner's leads | partner self (scoped), admin full |
| `partner_applications` | Partner's applications | partner self (scoped), admin full |

**Critical SQL helper:** `public.is_admin()` — SECURITY DEFINER function that returns whether the current user has admin role. Used by all admin-side RLS policies. DO NOT inline admin role checks in policies — that causes infinite recursion. Always call `is_admin()`.

## Sprints completed (chronological)

### S0: Initial state (before any work)
- Volcengine Supabase backend, 2.3K-line `src/lib/data.ts` bundled into all client pages
- All pages `'use client'`, all forms faked submission, no admin views
- 7 dead deps in `package.json`, `.babelrc` overriding SWC, hero images 7.8 MB
- AGENTS.md described 6 components; reality was 30+
- Migrated from Volcengine → official Supabase cloud (`wbzdwwvtbaftjxecgdxk`)

### S1: Security (5 critical fixes)
- **C5**: `isSupabaseServerConfigured` (no parens) → `()` in seed + bulk routes
- **C1**: Student routes use session-bound client (was: service-role + auth.getUser() always 401)
- **C2**: Partner routes use `requirePartner()` — `partnerId` derived from session, not query
- **C3**: Admin routes use `requireAdmin()`
- **C4**: `signUp` no longer auto-inserts into `admin_profiles` for student signups
- **Bonus**: Found + fixed infinite RLS recursion via `SECURITY DEFINER is_admin()`

Files: `src/lib/supabase-auth.ts` (new), updated 14 API route files

### S2: Cleanup (6 items)
- Renamed `package.json` `"projects"` → `"sica"`
- `railway.json`: `npm start` → `pnpm start`
- Created `src/app/sitemap.ts` (pulls from Supabase, falls back to static)
- Removed `next-themes` (unused), hardcoded `"light"` in sonner
- Deleted `storage-server/` + 7 dead deps (`@aws-sdk/*`, `drizzle-*`, `pg`, `dotenv`, `@types/pg`)
- **Closed admin self-registration** via `ADMIN_INVITE_TOKEN` env var + `/api/admin/check-invite` route
- **Fixed partner login** — was localStorage mock, now real Supabase auth via `useAuth()` + `useEffect` for partner record verification
- **Bonus**: Found partner layout was missing `<AuthProvider>` wrapper; fixed

Files: `src/app/api/admin/check-invite/route.ts` (new), updated `.env`, updated partner login/register/layout, deleted `storage-server/`, updated `package.json` + `pnpm-lock.yaml`

### S3: RSC + bundle reduction
- **i18n refactor**: extracted `translations` (700 lines) to `src/lib/i18n-translations.ts` (server-safe, no `'use client'`); added cookie-based locale persistence
- **RSC conversions** (full, no client JS): `/`, `/about`, `/contact`, `/assessment`
- **Bundle-size wins** (kept client, removed data.ts heavy imports): `/universidades`, `/universities/[slug]`, `/programs`, `/scholarships` — page now empty initial state, fetched on mount

Files: `src/lib/i18n-translations.ts` (new), `src/lib/server-t.ts` (new), `src/app/{about,contact,assessment,universities,universities/[slug],programs,scholarships}/page.tsx`, `src/app/{contact,assessment}/*-form.tsx` (new client islands)

### S4: Visual perf + DX
- **H9**: Hero PNGs (7.8 MB) → JPEG via `sips` (1.35 MB) — 83% reduction
- **L3**: Self-hosted Inter via `next/font/google` (was: render-blocking CSS @import to fonts.googleapis.cn)
- **L4**: Removed `.babelrc` → Turbopack/SWC now active (2-3× faster builds; lost click-to-source dev inspector)
- **M5**: Swapped remaining raw `<img>` → `next/image` in 5 files (listing, detail gallery, university-logo)
- **L14**: tsconfig target ES2017 → ES2022
- **M7**: Rewrote `AGENTS.md` (75 lines → 130+ lines, reflects current architecture)

### S5: Make it real (no more fake forms)
- **M1**: Contact + assessment forms POST to `/api/leads` + `/api/assessments` (was: `setSubmitted(true)`, data discarded)
- Created `contact_submissions` + `student_assessments` tables (S5-intake-tables.sql)
- **L10**: `application_number` uses `generate_application_number()` SQL function (was: `Date.now()` race)
- **L1**: Removed `password: string` from `StudentAccount` interface
- **M3**: Student dashboard rewritten — real `/api/student/applications` + `/api/student/documents` (was: 800ms fake timeout showing mockStudentStats)
- **M2**: Partner dashboard rewritten — real `/api/partner-{students,applications,fees}` (was: 450 lines of mock data + 300ms fake timeout)

Files: `src/lib/{server-t,api-client,supabase-auth}.ts` (already existed), 2 new client form components, 4 new API routes, 2 new SQL files, 2 dashboard rewrites

### S6: Make leads visible to admins
- Created `/api/admin/leads` (GET) + `/api/admin/leads/[id]` (PATCH) — list + status update (New → In Progress → Resolved/Spam)
- Created `/api/admin/assessments` (GET) + `/api/admin/assessments/[id]` (PATCH) — same pattern
- Rewrote `/admin/leads` — master-detail layout, status workflow, contact deep links
- Rewrote `/admin/assessments` — same with transcript file metadata, WhatsApp/email deep links
- All admin routes use `requireAdmin()` (S1 pattern)

Files: 4 new API routes, 2 admin page rewrites (~570 lines combined)

### S7: AVIF images (biggest single perf win)
- Installed `libavif` via homebrew (provides `avifenc` 1.4.2)
- `hero-bg.jpg` 1.2 MB → `hero-bg.avif` **278 KB** (-77%)
- `why-study-china.jpg` 149 KB → `why-study-china.avif` **24 KB** (-84%)
- Updated 10 references in 7 source files
- Deleted old .jpg files (recoverable via Finder Trash)
- Browser support: Chrome 85+ / Firefox 93+ / Safari 16+ / Edge 121+ = 99%+

## Open items (priority-ordered for next sprints)

### Critical (do these first)
1. **Email notifications on new lead** — when someone submits contact/assessment, SICA admin gets an email. Uses Resend/SendGrid/Postmark. ~2-3h.
2. **File upload for assessment transcript** — needs Supabase storage bucket + signed URL flow. The form currently captures metadata only. ~3-4h.
3. **Admin pages for partner_applications** — currently the `/partner/register` form just logs to console; needs to be persisted + admin-readable. ~2h.

### Type safety
4. **M11**: type the 17 `as any` casts in admin forms (use `drizzle-zod` for payload schemas). ~2h.
5. **M12**: admin forms use fake `event.target` casts on Select — add proper change handler. ~30min.

### i18n
6. **L11**: admin + partner UIs are EN-only; add `useI18n()` to admin/partner layouts. ~2-3h.

### Tests
7. **L8**: bootstrap vitest + 2-3 critical tests covering `supabase-auth.ts` helpers (security-critical) and one mapper. ~1.5h.

### Other
8. **L15**: `/api/proxy-image` still exists. Migrate remaining call sites to direct `next/image` with `remotePatterns`. ~1h.
9. **L6**: `scripts/dev.sh` uses Linux-only `ss` — works around on Mac but the dev script itself fails. Rewrite using `lsof -ti:PORT | xargs kill`. ~10min.
10. **L5**: pnpm 9 → 10 (9 is EOL). ~30min including lockfile refresh.
11. **M2 cleanup**: `src/app/partner/{students,fees,applications}/page.tsx` still have mock data. Wire them to API. ~2-3h.
12. **M6**: `/api/ai/chat` has 200 lines of hardcoded branch responses. Rely on system prompt + RAG. ~2h.

## Patterns (use these, don't reinvent)

### Auth pattern (S1)
```ts
import { getRequestAuth, requireAdmin, requirePartner } from '@/lib/supabase-auth';

// Any authenticated user
const auth = await getRequestAuth(request);
if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
const { supabase, user } = auth;  // session-bound client + verified user

// Admin only
const auth = await requireAdmin(request);

// Partner only — returns server-derived partnerId
const auth = await requirePartner(request);
// auth.partnerId from auth.users.id → partners.user_id, NOT from query
```

### Public intake form pattern (S5)
- **One table per form type** with explicit columns (don't reuse 'leads' for everything)
- **RLS**: public INSERT (`WITH CHECK (true)`), admin-only SELECT/UPDATE
- **Unified `/api/leads`** that dispatches by `kind` field
- **Client form**: `useState<'idle' | 'submitting' | 'success' | 'error'>` + `FormData` + `apiFetchJson`
- **Attribution**: capture `sourcePage` + `referer` + `user-agent` in the API handler

### RSC page pattern (S3)
```ts
// page.tsx — server component
import { getServerT } from '@/lib/server-t';
export default async function Page() {
  const t = await getServerT();  // reads cookie locale
  return <h1>{t('hero.title')}</h1>;
}
```

### Client form island (S5)
```tsx
// form.tsx — 'use client'
import { apiFetchJson, ApiError } from '@/lib/api-client';
const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus('submitting');
  try {
    await apiFetchJson('/api/...', { method: 'POST', body: JSON.stringify(payload) });
    setStatus('success');
  } catch (err) {
    setErrorMsg(err instanceof ApiError ? err.message : 'failed');
    setStatus('error');
  }
};
```

### Bundle size pattern (S3)
- Keep small constants (filter dropdowns) in client
- Remove heavy array imports
- `useState<T[]>([])` initial empty
- `useEffect` on mount: `fetch('/api/...').then(...)`

### i18n pattern (S3)
- `translations` table in `src/lib/i18n-translations.ts` (no `'use client'`)
- `I18nProvider` syncs to `sica-locale` cookie
- Server pages: `getServerT()` (reads cookie, no hook)
- Client components: `useI18n()`

## Gotchas (things that WILL trip you up)

1. **Port 5000 is macOS ControlCe**. The `pnpm dev` script's `dev.sh` uses Linux `ss` to check the port and silently fails on Mac. **Use `pnpm next dev -p 5050` instead.** Alternatively rewrite `scripts/dev.sh` to use `lsof` (L6 in open items).

2. **The `Drizzle ORM` and `pg` deps are still in `package.json`** as transitive deps of `coze-coding-dev-sdk`. You CANNOT remove them — they're not actually in your direct deps. Don't waste time trying.

3. **Service-role client cannot call `auth.getUser()`** — there's no session attached. It always returns null. This was the root cause of C1 in S1. Use anon key + per-request JWT instead.

4. **RLS policies that reference the same table cause infinite recursion** — solved by `SECURITY DEFINER is_admin()` function. If you add new admin-side RLS, always go through `is_admin()`, never inline the EXISTS check.

5. **`'use client'` at the top of a file does NOT prevent server-side imports of its plain exports** — constants can be imported by RSCs, only React components/hooks are client-only. This is how `i18n-translations.ts` was extracted.

6. **Next.js 15+ made `cookies()` async** — must `await cookies()` before reading. Don't forget.

7. **The 3 filter pages (`/universidades`, `/programs`, `/scholarships`) still have small import lists from `data.ts`** — only the small filter dropdowns (cities, disciplines, types, levels), NOT the heavy arrays. If you find yourself needing to add a heavy import back, stop and add an API endpoint instead.

8. **AVIF encoder gotcha**: `--max` in avifenc means "max quantizer" — higher max = lower quality = smaller file. Counterintuitive. Test with `--max 50` first; for big images like hero, `--max 63` is the sweet spot.

9. **The dev server may be killed by builds** — `pnpm build` doesn't kill it, but if the dev server holds port 5050, the build will conflict. Either kill dev first, or just run `pnpm build` separately.

10. **The system Python 3.9 has SSL bugs on this Mac** — use bash + curl for E2E tests, not Python urllib. Or use a venv with a newer Python.

## Deployment

- **Railway**: `pnpm start` works. Set `ADMIN_INVITE_TOKEN` + all Supabase keys as env vars. Custom server.ts binds to `$PORT` (Railway sets this).
- **Coze platform**: works with the existing `scripts/build.sh` + `scripts/start.sh`. No changes needed.
- **Self-host on Vercel**: works, but you'd lose the custom `src/server.ts` Express wrapper. Just `next start` directly.

## Verification recipes

```bash
# After any change, run all 3 smoke tests
bash .dev-logs/s1-retry-new.sh   # auth + RBAC (always 401 without token, 200/403/200 with right role)
bash .dev-logs/s5-test-intake.py # contact + assessment form persistence
bash .dev-logs/s6-test.sh        # admin leads/assessments views + status updates

# Type check (mandatory before commit)
pnpm ts-check                     # 0 errors required
```

## What NOT to do

- **Don't add `next/image` with `priority` to the hero image** unless you also convert from CSS background-image to an `<Image>` component. The CSS background is set on a non-priority element.
- **Don't add a `partners` INSERT policy without a check** — anyone could insert fake partner records. Use the admin create-user endpoint.
- **Don't use `cookies().get('sica-locale')` without `await`** — it's async in Next.js 15+.
- **Don't trust client-passed `user_id` fields** — always derive from the session via `auth.getUser()`.
- **Don't use `Date.now()` for application numbers** — use the SQL function `generate_application_number()`.
- **Don't add partner routes that accept `partnerId` from query string** — always derive from session.
- **Don't add `as any` to make new code compile** — fix the type. M11 is on the open-items list for the 17 existing offenders.
- **Don't add npm scripts that call `npm`** — project uses pnpm strictly (`preinstall` hook enforces).

## Decision log (the "why" behind non-obvious choices)

| Decision | Why |
|---|---|
| `generate_application_number()` SQL function for app numbers | Atomic, race-free, auditable in the DB |
| `SECURITY DEFINER is_admin()` for RLS | Breaks infinite recursion in admin RLS policies |
| Cookie-based locale (not localStorage) | Server can render correct locale on first paint; no hydration mismatch |
| Separate `contact_submissions` / `student_assessments` tables (not one `leads` table) | Different fields, different retention policies, different admin views |
| `ADMIN_INVITE_TOKEN` env var (not a DB table) | Simple, doesn't require DB migration, easily rotated |
| Per-request session-bound Supabase client (in `supabase-auth.ts`) | RLS works correctly; user can only see their own data |
| Supabase publishable key for env, secret key for server | Standard pattern, server-only secret |
| Custom `src/server.ts` Express wrapper | Coze platform compatibility; can be replaced with `next start` if not using Coze |
| next/image for all images | AVIF/WebP runtime optimization, automatic srcset |
| `inter.className` on body + `inter.variable` on html (S4) | Self-host font with proper Next.js loading pattern |

## TL;DR for the next agent

1. **Don't redo S1-S7.** They're done, type-clean, tested. Read `AGENTS.md` and this file first.
2. **The hot path right now is admin UX + email notifications + transcript uploads.** Those are real gaps the user has flagged.
3. **Browser support is fine** — 99%+ support AVIF, modern Chrome/Safari/Firefox handle all the auth/i18n/SSR patterns natively.
4. **Type check is the gate.** If you break it, the next agent will fix it badly. Run it before claiming anything works.
5. **Tests are sparse.** The smoke test scripts in `.dev-logs/` are the closest thing to a test suite. L8 is on the open list. Until then, every change should run all 3 smoke tests.
6. **Memory note** — if you learn a non-obvious pattern that future SICA work would benefit from, append it to `~/.mavis/agents/mavis/memory/MEMORY.md` via `mavis memory append mavis`.

Good luck. The platform works. Make it better.
