# AGENTS.md

## 项目概览
SICA (Study in China Academy) - 面向国际学生的中国高校及项目信息查询平台。作为教育机构SICA的官方平台，提供大学目录、大学详情、奖学金信息、招生要求等功能，并突出SICA的申请支持服务。

**目标用户**：计划赴中国留学的国际学生（中国大陆以外）。当前为单租户生产站点（Supabase 项目 ref: `wbzdwwvtbaftjxecgdxk`，ap-northeast-1 区域，2026-06-02 从 Volcengine 迁移到官方 supabase.com）。

## 版本技术栈
- **Framework**: Next.js 16.1.1 (App Router) + Turbopack (SWC)
- **Core**: React 19.2.3
- **Language**: TypeScript 5.9 (target ES2022, strict)
- **UI 组件**: shadcn/ui (Radix UI) + lucide-react (图标，统一深蓝 `#1B2A4A`)
- **Styling**: Tailwind CSS 4 + tw-animate-css
- **包管理**: pnpm 9+ (严禁 npm/yarn，`preinstall` 钩子强制)
- **后端**: Supabase (Postgres 17, RLS) + Drizzle ORM 在 `storage-server/`（已废弃，仅供历史参考）
- **AI**: 火山引擎豆包 Ark (`@supabase/supabase-js` 2.95+)
- **字体**: Inter (next/font/google 自托管，**已不再**用 fonts.googleapis.cn)
- **认证**: Supabase Auth + `src/lib/supabase-auth.ts` (Bearer token 模式，admin/partner/role helpers)
- **部署**: Railway (`pnpm start`)，Coze 平台开发 (Node 24)

## 目录结构
```
├── public/                      # 静态资源 (hero-bg.jpg, why-study-china.jpg)
├── src/
│   ├── app/                     # 页面路由 + API
│   │   ├── layout.tsx           # 根布局 (metadata + Inter font + ClientLayout)
│   │   ├── page.tsx             # 首页 (RSC)
│   │   ├── globals.css          # 全局样式 (SICA 品牌色 + Tailwind 4)
│   │   ├── fonts.ts             # next/font/google 配置 (Inter)
│   │   ├── sitemap.ts           # SEO sitemap
│   │   ├── robots.ts            # SEO robots
│   │   ├── about/               # 关于 (RSC)
│   │   ├── contact/             # 联系 (RSC + ContactForm client island)
│   │   ├── assessment/          # 学术评估 (RSC + AssessmentForm client island)
│   │   ├── universities/        # 大学模块
│   │   │   ├── page.tsx         # 大学目录 (client, 搜索/筛选/分页; data on-mount fetch)
│   │   │   └── [slug]/page.tsx  # 大学详情 (client, tabs/gallery; data on-mount fetch)
│   │   ├── programs/            # 项目 (client, filters; data on-mount fetch)
│   │   ├── scholarships/        # 奖学金 (client, filters; data on-mount fetch)
│   │   ├── admin/               # 🔒 Admin 门户 (auth-gated, RSC + client islands)
│   │   │   ├── login/, register/ (后者用 ADMIN_INVITE_TOKEN 门控)
│   │   │   ├── dashboard/, students/, applications/, programs/
│   │   │   ├── universities/, scholarships/, fees/, leads/, assessments/
│   │   ├── partner/             # 🔒 Partner 门户 (auth-gated, 真实 Supabase auth)
│   │   ├── student/             # 🔒 Student 门户 (auth-gated, RSC + client islands)
│   │   └── api/                 # 17 API route groups:
│   │       ├── universities/, programs/, scholarships/   (public-ish)
│   │       ├── student/         (Bearer auth + requireUser)
│   │       ├── partner/         (requirePartner, partnerId 从 session 派生)
│   │       ├── admin/           (requireAdmin)
│   │       ├── ai/, applications/, assessments/, leads/, seed/, stats/
│   ├── components/              # 组件
│   │   ├── ui/                  # shadcn/ui 组件库
│   │   ├── client-layout.tsx    # 客户端布局 (I18nProvider + Header + Footer)
│   │   ├── header.tsx           # 顶部导航
│   │   ├── footer.tsx           # 页脚
│   │   └── university-logo.tsx  # 大学 logo (next/image)
│   ├── hooks/                   # use-mobile, use-student-api
│   └── lib/                     # 工具库
│       ├── data.ts              # 静态 fallback 大学/项目/奖学金 (9+17+10) + filter dropdowns
│       ├── i18n.tsx             # 客户端 i18n Context (cookie sync)
│       ├── i18n-translations.ts # 翻译表 (server-safe, 无 'use client')
│       ├── server-t.ts          # getServerT() - RSC 翻译 helper
│       ├── supabase-browser.ts  # 浏览器端 Supabase client (anon key)
│       ├── supabase-server.ts   # 服务端 Supabase client (service role)
│       ├── supabase-auth.ts     # getRequestAuth, requireAdmin, requirePartner
│       ├── api-client.ts        # apiFetch (浏览器) - 自动加 Bearer token
│       ├── auth-context.tsx     # AuthProvider + useAuth (admin/student/partner)
│       ├── student-data.ts      # 旧 mock 数据 (注意: 含 password 字段, S5 待清理)
│       └── utils.ts             # 通用工具
├── database/
│   ├── student-tables.sql      # 学生门户表 + RLS policies
│   ├── migration-supabase-cloud.sql  # 完整 schema 迁移 (94KB)
│   └── fix-rls-recursion.sql   # SECURITY DEFINER is_admin() 修复
├── scripts/
│   ├── build.sh, dev.sh, start.sh, prepare.sh, validate.sh
│   └── bootstrap-auth.sh       # 迁移后用 admin API 引导 auth.users
├── .env / .env.volcengine      # Volcengine 配置 (rollback 用，保留 7 天)
├── .env.example                # 环境变量模板
├── next.config.ts              # Turbopack + 远程图片 hostname: '*' + AVIF/WebP
├── tailwind.config / postcss.config / eslint.config / tsconfig
└── components.json             # shadcn 配置
```

## 构建和测试命令
- **开发**: `pnpm dev` (脚本启动 `pnpm tsx watch src/server.ts`，端口 5000，**Mac 上会被 ControlCe 占用**，改用 `pnpm next dev -p 5050`)
- **构建**: `pnpm build`
- **类型检查**: `pnpm ts-check` (0 errors 是硬性要求)
- **Lint**: `pnpm lint` / `pnpm lint:build`
- **生产启动**: `pnpm start` (走 `src/server.ts` 自定义服务器)
- **数据库迁移**: 在新 Supabase 项目 SQL 编辑器跑 `database/migration-supabase-cloud.sql`
- **引导 auth.users**: 迁移后跑 `bash scripts/bootstrap-auth.sh`

## 设计规范
- **品牌色**: Deep Crimson `#9B1B30`, Deep Dark Blue `#1B2A4A`, Gold `#D4A853` (仅排名徽章)
- **图标色**: 统一深蓝 `#1B2A4A`，**禁止多色图标**
- **背景色**: Warm White `#FAFAF8`
- **字体**: Inter, 自托管 via `next/font/google` (src/app/fonts.ts)
- **圆角**: 0px (直角)，按钮和卡片**禁止**使用圆角 (`rounded-none`)
- **详见**: DESIGN.md

## 国际化 (i18n)
- 支持 `en` (English) 和 `zh` (中文)
- Server: `await getServerT()` (从 `sica-locale` cookie 读 locale) - 用在 RSC
- Client: `useI18n()` Hook 提供 `t()`, `locale`, `setLocale()` - 用在 `'use client'` 组件
- 翻译表定义在 `src/lib/i18n-translations.ts` (server-safe)
- Client provider 在 `src/lib/i18n.tsx` 写 cookie (`sica-locale=...; max-age=31536000; SameSite=Lax`)
- 大学/项目/奖学金数据中英文字段分别存储 (如 `name`/`nameCn`)

## 数据层
- 静态 fallback 在 `src/lib/data.ts` (9 universidades, 17 programs, 10 scholarships, filter dropdowns)
- **运行时数据** 来自 Supabase (Postgres 17 + RLS)
- 11 业务表 + 1 sequence + 33 RLS policies + 11 updated_at 触发器 + 1 学生注册触发器
- `src/lib/supabase-server.ts` 返回 service-role client (用于 admin/seed 场景)
- `src/lib/supabase-auth.ts` 提供 per-request session-bound client (用 anon key + Bearer JWT)

## API 认证模式
**关键**: 任何 `/api/student/*`, `/api/partner*`, `/api/admin/*` 都通过 `src/lib/supabase-auth.ts` 校验

```ts
import { getRequestAuth, requireAdmin, requirePartner } from '@/lib/supabase-auth';

// 任何登录用户都能调用
const auth = await getRequestAuth(request);
if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
const { supabase, user } = auth;  // session-bound client + verified user

// 仅 admin/super_admin
const auth = await requireAdmin(request);

// 仅 partner
const auth = await requirePartner(request);
// auth.partnerId 从 auth.users.id → partners.user_id 派生, 不可伪造
```

`/api/admin/create-user` 支持创建 admin/partner 角色; partnerId 永远从 session 派生, 不可从 query 传入

## 编码规范
- TypeScript strict 模式 (`pnpm ts-check` 必须 0 errors)
- **禁止** 隐式 `any` / `as any` (admin 表单里有 17 处遗留, S5 计划清理)
- 动态内容 (`Date`, `Math.random`) 必须 `useState + useEffect` 避免 hydration mismatch
- 页面组件如使用 hooks 需标记 `'use client'`
- 公共静态页面优先用 RSC, 客户端 island 只放交互部分
- 所有函数参数和返回值需明确类型
- 用 `next/image` + `sizes` 不用 raw `<img>` (老代码还有遗留, 已大部分修复)
- 列表/详情页 **不要** import `src/lib/data.ts` 里的完整数组 (会全部 bundle 到 client); 用 API fetch on-mount

## Hydration 注意事项
- Footer 中的年份使用 `useState + useEffect` 而非直接 `new Date().getFullYear()`
- 禁止 JSX 中直接使用 `typeof window`、`Date.now()`、`Math.random()`
- Cookie-based locale: server 和 client 必须用同一个 `sica-locale` cookie, 避免 hydration 警告
- `next/font` 自动加 `font-display: swap`, 不需要手动处理
- `suppressHydrationWarning` 在 `<body>` 上 (因为 cookie-based locale 切换时的微小差异)

## 已知遗留 (S5+ 计划)
- **M11**: 17 处 `as any` 在 admin 表单 (用 drizzle-zod 重构)
- **M3**: `src/app/student/page.tsx` 仍用 mock 数据 (`mockStudentStats`)
- **M2**: partner 页面 mock 数据 (布局已修, 页面数据未接 API)
- **L1**: `src/lib/student-data.ts` 仍含 `password: string` 字段
- **L8**: 0 测试 (需要 bootstrap vitest)
- **L10**: `application_number` 用 `Date.now()` 而非 `generate_application_number()` SQL 函数
- **L11**: partner/admin 门户 UI 字符串硬编码英文 (useI18n 覆盖率不完整)
- **L15**: `/api/proxy-image` 仍存在 (H6 未完全清理, 目前用 `unoptimized` next/image 替代)
- **S16** (2026-06-05): Student Portal Phase 1 — Save-as-Draft (POST accepts status='Draft' with looser validation; wizard has button on every step; resumes via `/student/applications/new?resume=<id>` using PUT), Withdraw (PUT allows `Draft/Submitted → Withdrawn` + confirmation dialog), Resubmit (PUT allows `Documents Requested → Under Review` and `Rejected → Submitted` + auto-stamps `submitted_at` + timeline note), adminNotes surfaced in detail-page banner, `StudentApplication.adminNotes` field added. PUT allows editing university/program/degree/intake while row is in `Draft` state.
- **S17** (2026-06-05): Student Portal Phase 2 — sidebar notification badge on Applications item (red for `Documents Requested`, gold for `Draft`, hidden if zero), refetches on route change and window focus. In-page action banner on dashboard + applications list, with per-filter counts on the Docs Needed / Draft filter chips.
- **S18** (2026-06-05): Partner Applications enhancement — DB migration adds 7 columns (`student_email`, `student_phone`, `intake`, `degree`, `nationality`, `priority`, `application_number`) + per-partner counter table + `next_partner_app_number()` RPC that mints `PA-YYYY-NNNN` IDs. New/edit forms capture the new fields and auto-fill contact info when picking from `partner_students`. Detail page shows student contact card (email/phone/nationality) and a Quick Status Update panel with the partner-allowed transitions (Draft↔Submitted, →In Review, →Accepted/Rejected, Withdrawn, Reopen). Each transition opens an `AlertDialog` confirmation with per-(from,to) copy: destructive ones (Rejected/Withdrawn) get a red confirm button + explicit "this signals X" wording, routine ones stay calm. List page adds a Priority column + Urgent/High stat card + priority filter + new columns surfaced under Student (email, intake·degree, application #). Export button wired up: new `/api/partner/applications/export` returns RFC 4180 CSV with UTF-8 BOM, 17 columns, scoped to partner's team. **Security hardening (S18b)**: PATCH route now enforces `PARTNER_STATUS_TRANSITIONS` server-side (the allow-list lives in `partner-application-mapper.ts`, imported by both the UI and the API so there's a single source of truth). Disallowed transitions return HTTP 400 with the list of valid next states. Same→same is a no-op short-circuit. Auto-stamps `submitted_at` on the first move to Submitted / In Review.
- **S19** (2026-06-05): Public filter system overhaul — `/universities` and `/programs` get URL-synced filter state via new `useUrlState` hook (`src/hooks/use-url-state.ts`). Refresh-survives filters, shareable `?city=Beijing&tag=985&rating=4.8` links, browser back/forward. Both pages render active filter pills with X-to-remove + a "Clear all" link. New filters: `tag` (985/211/DFC) + `type` (Public/Private) + `minRating` (4.5★+ / 4.7★+ / 4.8★+ / 4.9★) on universities; `university` (specific school) + `scholarship` boolean toggle on programs (14 of 32 programs are scholarshipAvailable — this is the #1 student question). New "Rating" sort on universities, "Name" sort on programs. Fixed the "popularity" no-op sort on programs — renamed to "Default" (preserves API insertion order). Removed the dead "Search" button on universities (filters already fire on every keystroke). Empty state rewritten with reset CTA + suggestion copy. New i18n keys in `filter.*` namespace.
- **S20** (2026-06-05): Student portal + partner new-app data quality — (1) student profile was hardcoded "John Smith"; rewrote to fetch + PUT `/api/student/profile` with the real DB columns (passport, GPA, target intake, target field, etc.). (2) New `SearchableSelect` component (Popover + Command) used in the application wizard + partner new-app for type-to-search university/program pickers. (3) The student application wizard used to import `universities` + `programs` from the static 2,300-line `data.ts` fallback — admin-added universities and programs were invisible. Replaced with live `/api/universities` + `/api/programs` fetches so admin changes appear in the wizard immediately. (4) Fixed a doc-shape bug where the initial mount of the wizard read `d.documents` from `/api/student/documents` while the API returns `{ data: [...] }` — the wizard started with zero docs even when the student had uploaded some. (5) Documents uploaded in the wizard step 2 are now linked to the new application via a follow-up PATCH to each doc's `application_id` (previously they were orphans). (6) `/api/student/documents/[id]` PATCH now maps `applicationId` (camelCase) → `application_id` (snake_case); explicit null unlinks. (7) Student `/student/documents` page now shows a "Linked to" badge per doc + a "Link to" dropdown for retroactively attaching orphan docs to an application. (8) Partner new application replaces plain text university + program inputs with the same SearchableSelect pickers (so partners can't mistype "Tsingha University" and lose the row).
- **S21** (2026-06-05): Student profile → wizard prefill — student applications are no longer a blank-form re-typing exercise. On wizard mount, fetch `/api/student/profile` in parallel with the university + program lists. If the profile has a target_degree / target_intake / gpa / english_score / highest_education, auto-fill the matching wizard fields (degree level, intake, personal statement). Render a small "from your profile" badge next to each prefilled field + a step-1 banner that counts how many fields were pre-filled + an "Edit your profile →" link. The personal statement is seeded as a 2–3 sentence draft from the profile (GPA + education + English score + goal) with an explicit "[Edit this draft — ...]" footer, so the student sees it's a draft not a finished statement. The badge disappears the moment the student types in the field (we track prefilledFields in a Set).
- **公开 admin 注册**: `/admin/register` 仍开放 (需 `ADMIN_INVITE_TOKEN` env)

## S1-S3 重要决策记录
- **S1** (2026-06-02): Bearer-token auth 模式, 不是 cookie-based. Supabase service-role client 无法 `getUser()`, 必须用 anon key + per-request JWT
- **S2** (2026-06-02): 删 `storage-server/` + 7 个 dead deps (-97MB). Admin 注册用 `ADMIN_INVITE_TOKEN` env 门控. Partner login 改真实 Supabase auth
- **S3** (2026-06-02): 4 个公共页全转 RSC (home/about/contact/assessment), 4 个 filter 页去掉 `data.ts` 完整数组 import 改 on-mount fetch. i18n 重构: 翻译表提到 server-safe 文件 + cookie locale 同步
- **Migrate** (2026-06-02): 从 Volcengine 迁到官方 supabase.com. RLS 出现无限递归, 改用 `SECURITY DEFINER public.is_admin()` 函数解决
