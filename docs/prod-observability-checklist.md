# SICA — Production Observability Wiring Checklist

**One-time, ~2 hours of total work.** Closes the "site is live but no one can see what's happening" gap that has been open since launch. Code is already wired (Phase 34); this is the operational enablement.

---

## TL;DR

| System | Status before this doc | Status after you finish |
| --- | --- | --- |
| Sentry errors | zero visibility | 10% perf + 100% errors captured |
| GA4 traffic | `NEXT_PUBLIC_GA_MEASUREMENT_ID` set, but never verified | events landing in GA4 in real time |
| News cron | runner exists, never scheduled | 5 drafts/day auto-generated |
| Uptime monitor | `/api/health` exposed, no one watching it | paged if site is down >5 min |
| Email DNS | `sica.com.cn` deliverability unverified | SPF + DKIM + DMARC all green |

---

## 1. Sentry error monitoring (env-gated, ~15 min)

The Sentry SDK is already wired (`src/instrumentation.ts` + `src/instrumentation-client.ts` + `src/sentry.{server,edge}.config.ts`). Setting `SENTRY_DSN` lights it up.

### Step 1 — Create Sentry project

1. Sign up / sign in at https://sentry.io
2. **Projects → Create Project** → Platform: **Next.js** → Name: `sica-prod`
3. Skip the "Configure your SDK" wizard — you'll wire it via env vars, not the wizard.
4. **Settings → Projects → sica-prod → Client Keys (DSN)**
5. Copy the DSN. Looks like:
   ```
   https://abcdef1234567890@o1234567.ingest.sentry.io/1234567890
   ```

### Step 2 — Set env vars on Railway

Railway dashboard → **Variables** → add:

```
SENTRY_DSN=https://abcdef...@o1234567.ingest.sentry.io/1234567890
SENTRY_ORG=your-sentry-org-slug     # Settings → Org Settings → Slug
SENTRY_PROJECT=sica-prod             # project slug from the URL bar
SENTRY_TRACES_SAMPLE_RATE=0.1       # 10% perf — errors are 100%
```

`SENTRY_DSN` is the only required one for the runtime. `SENTRY_ORG` + `SENTRY_PROJECT` enable the `withSentryConfig` build wrapper to upload source maps on each deploy (optional but recommended).

### Step 3 — Deploy + verify

1. Push to `main` → Railway auto-deploys
2. The build log will mention **"Sentry: Successfully uploaded source maps"** if you set `SENTRY_ORG` + `SENTRY_PROJECT`
3. Hit any API route to trigger a request → check Sentry → Issues. The request should appear (no errors expected on a fresh deploy).
4. To test the error path: `curl http://localhost:3000/api/intentionally-broken-route` (or any 404) — Sentry captures 5xx, not 4xx, so trigger a 500 by e.g. running a SQL migration first.

---

## 2. GA4 — verify it's actually firing (~5 min)

`NEXT_PUBLIC_GA_MEASUREMENT_ID=G-LJBV8BF5Q8` is in `.env` (this is the live property; previous build was wired to `G-E1BZFW6LLH` which was a different, unused property). Let's verify it's the right one and producing real events.

### Step 1 — Confirm property ownership

1. Go to https://analytics.google.com
2. **Admin → Property column → Property Settings**
3. The Measurement ID should be `G-LJBV8BF5Q8`. If not, swap to whatever your real property is.
4. (Re-set the env var on Railway if needed, redeploy.)

### Step 2 — Real-time check

1. Open https://studyinchina.academy in an incognito window
2. In GA4 → **Reports → Realtime**
3. Within ~30s you should see yourself as 1 active user
4. Click around a few pages → you should see `page_view` events stream in
5. If zero events: confirm `<GoogleAnalytics gaId="...">` is in the rendered HTML (`view-source:https://studyinchina.academy` → search for `googletagmanager`). If absent, the env var didn't make it to the build.

### Step 3 — Enable enhanced measurement (one-off)

GA4 → Admin → Property Settings → **Enhanced Measurement → toggle ON**. This auto-captures scrolls, outbound clicks, site search, video engagement — no extra code needed.

---

## 3. Schedule the news cron (~10 min)

Code is wired (Phase 41). The endpoint just needs an external ping once a day.

### Free option — cron-job.org

1. Sign up at https://cron-job.org (free tier covers this)
2. **Cronjobs → Create cronjob**
   - **Title**: `SICA — News automation`
   - **URL**: `https://studyinchina.academy/api/cron/generate-news`
   - **Method**: `POST`
   - **Request headers** (one entry, key+value):
     - Header name: `x-cron-secret`
     - Header value: `<NEWS_CRON_SECRET from your .env>`
   - **Request body**:
     ```
     {"count": 5, "length": "short"}
     ```
   - **Schedule**: Daily, `0 3 * * *` (03:00 UTC = 11:00 Asia/Shanghai — quiet hours, post-deploy-friendly)
   - **Timeout**: `300` (5 min — the cron can take ~3 min for 5 drafts)
3. Enable → wait for first run → check `/admin/news` for 5 new drafts

### Alternative — Railway Cron (if you're already on Railway)

Railway → New Service → Cron Job → same URL + same header → same 03:00 UTC schedule. Free for low-frequency jobs.

---

## 4. Uptime monitoring (~10 min)

`/api/health` is already public, no auth needed. Wire it to a free uptime monitor.

### Step 1 — Free Better Uptime or UptimeRobot

Pick one:

- **Better Uptime** (https://betterstack.com/better-uptime) — free tier 10 monitors, 3-min checks, status page included. Recommended for SICA.
- **UptimeRobot** (https://uptimerobot.com) — free tier 50 monitors, 5-min checks. Fallback.

### Step 2 — Create the monitor

1. **Monitor type**: HTTPS
2. **URL**: `https://studyinchina.academy/api/health`
3. **Check interval**: 5 minutes
4. **Expected status code**: `200`
5. **Contact**: your email (or Slack/Discord webhook via Better Uptime)
6. **Alert threshold**: 2 failures in a row (avoid pager-spam on flaky networks)

### Step 3 — Status page (free, optional)

Better Uptime → Status Pages → create a public one with the same monitor → publish at `https://sica.betteruptime.com` or similar. Embed in the footer (optional).

---

## 5. Email deliverability (DNS, ~30 min)

Until you do this, contact-form submissions + drip emails land in spam (or bounce outright if the sender domain isn't aligned). The sender is `noreply@sica.com.cn` (Resend; auto-publishes DKIM).

### Step 1 — Verify in Resend

Resend dashboard → **Domains → sica.com.cn** → status should be "Verified". If not, the DKIM CNAME records are still propagating.

### Step 2 — Add SPF record

DNS provider for `sica.com.cn` → **TXT record** at apex (`@`):

- **Name / Host**: `@` (or blank, depending on provider)
- **Type**: `TXT`
- **Value**:
  ```
  v=spf1 include:resend.com ~all
  ```
- **TTL**: 3600 (1 hour)

Notes:
- Only one SPF record per domain. If you already have one (e.g. from Google Workspace), EDIT it to add `include:resend.com` rather than creating a second.
- `~all` = softfail (mail that doesn't match SPF is suspicious but accepted). For SICA's low-volume outbound, this is fine. Hard-fail (`-all`) is more aggressive but more likely to break legit forwarded mail.

### Step 3 — Add DMARC record

DNS → **TXT record** at `_dmarc.sica.com.cn`:

- **Name / Host**: `_dmarc.sica.com.cn`
- **Type**: `TXT`
- **Value**:
  ```
  v=DMARC1; p=none; rua=mailto:admin@sica.cn
  ```
- **TTL**: 3600

Start with `p=none` (monitor only — won't reject anything). After 30 days of clean reports, escalate to `p=quarantine` then `p=reject`. The `rua` collects aggregate reports at your admin inbox.

### Step 4 — Verify

Use https://mxtoolbox.com/spf.aspx and https://mxtoolbox.com/dmarc.aspx:

- SPF: should show `v=spf1 include:resend.com ~all` and report no errors
- DMARC: should show `v=DMARC1; p=none`
- DKIM: the Resend dashboard will show "Verified" once DKIM is propagating (usually <1 hour)

### Step 5 — Send a test email

From your Gmail → send a test to `test@resend.com` after setting up Resend → check the Activity log for delivery + inbox placement.

Or just submit the contact form on `https://studyinchina.academy/contact` → check the admin inbox for the notification.

---

## 6. Backups (worth a 2-min check)

1. Supabase dashboard → **Database → Backups**
2. **Point-in-Time Recovery (PITR)**: enabled by default on paid plans. Confirm it's ON. Free tier: daily logical backup, 7-day retention.
3. **Schedule**: daily is fine.

If you need to restore: Supabase dashboard → Backups → pick a snapshot → restore.

---

## 7. Verification — final end-to-end smoke

After everything is wired (give DNS ~24h, give cron first run ~24h):

```bash
# 1. Health endpoint OK
curl -sS https://studyinchina.academy/api/health | jq .
# → expect status:"ok", db:"ok", all envs except maybe GA show true

# 2. News cron reachable
curl -X POST https://studyinchina.academy/api/cron/generate-news \
  -H "x-cron-secret: $NEWS_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"count": 1}' | jq .
# → expect ok:true, 1 draft created

# 3. Drip cron reachable (sliding window)
curl -H "x-cron-secret: $DRIP_CRON_SECRET" \
  https://studyinchina.academy/api/email/drip-cron | jq .
# → expect ok:true, count of processed drips

# 4. GA real-time shows 1 active user (open incognito → visit home)

# 5. Uptime monitor shows green for last 24h

# 6. Sentry — Issues page — zero unhandled errors in last 24h

# 7. MXToolbox SPF + DMARC pass

# 8. Contact-form submission → email arrives in admin inbox (not spam)
```

---

## 8. Rollback plan

If Sentry, the news cron, or the uptime monitor causes issues after enablement:

| Symptom | Action |
| --- | --- |
| Sentry errors / spam | Railway → unset `SENTRY_DSN` → redeploy. SDK no-ops. |
| News cron overuses API quota | cron-job.org → disable. News drafts stop generating (existing drafts unaffected). |
| Uptime false alarms | Better Uptime → raise alert threshold to 3 failures / 15 min. |
| DNS broke email | DNS provider → revert to the previous TXT records. No code change needed. |

---

## Estimated total time

| Step | Time |
| --- | --- |
| 1. Sentry | 15 min |
| 2. GA verify | 5 min |
| 3. News cron | 10 min |
| 4. Uptime monitor | 10 min |
| 5. Email DNS | 30 min |
| 6. Backup check | 2 min |
| 7. E2E smoke | 15 min |
| **Total** | **~1.5 hours** |

All free tiers (Sentry 5K errors/mo + cron-job.org 5 jobs free + Better Uptime 10 monitors free + GA4 free + MXToolbox free). The only paid cost is Resend if you exceed their free 100 emails/day (current SICA volume: nowhere near).
