# News Automation

Generate 5 AI-written draft news posts per day, scheduled from any external
cron. Every generated post lands in `/admin/news` as `status='draft'` — admin
reviews, edits, and clicks **Publish** before it goes live.

## TL;DR

1. The DB has a queue of topics (`news_automation_topics`) and an audit log
   of runs (`news_automation_runs`). 14 evergreen topics are seeded.
2. Hit `GET /api/cron/generate-news?count=5` once a day from an external
   scheduler (Railway Cron, GitHub Actions, Vercel Cron, cron-job.org, …).
3. Each call picks the top-5 pending topics by priority, calls the AI, and
   inserts a draft post for each.
4. Admin reviews drafts in `/admin/news` and publishes the good ones.
5. Add new topics from `/admin/news → Automation` any time.

## Configure the secret

Set a shared secret in the server's env (Railway → Variables):

```bash
NEWS_CRON_SECRET=<long random string>
```

Any scheduler that sends it in the `x-cron-secret` header can trigger a run.
If `NEWS_CRON_SECRET` is unset, the endpoint is unauthenticated (dev-friendly
only — set it in production).

Generate a secret with:

```bash
openssl rand -hex 32
```

## Schedule it

Pick whichever scheduler you're already using. All of these work.

### Option A: Railway Cron (recommended for SICA)

SICA already runs on Railway. Add a new Cron service in the same project:

1. Railway dashboard → your project → **+ New** → **Cron Job**
2. Command: leave empty (use HTTP trigger)
3. **Schedule**: `0 2 * * *` (every day at 02:00 UTC, ~10am Beijing)
4. **HTTP Request**:
   - Method: `GET`
   - URL: `https://<your-sica-domain>/api/cron/generate-news?count=5&length=short`
   - Headers: `x-cron-secret: <NEWS_CRON_SECRET value>`

If Railway Cron doesn't have HTTP trigger support, use **Option C** with a
GitHub Actions cron in the same `SICANewBorn` repo.

### Option B: Vercel Cron (only if SICA is hosted on Vercel)

SICA is on Railway, but if you ever migrate:

`vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-news?count=5&length=short",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Vercel auto-attaches a `Authorization: Bearer <CRON_SECRET>` header if you
set `CRON_SECRET` as a project env var. To use SICA's `x-cron-secret`
header instead, set `NEWS_CRON_SECRET` to the same value and add a
`vercel.json`-level rewrite… or just add a small adapter. Easiest is to set
`NEWS_CRON_SECRET` to the same string as Vercel's `CRON_SECRET`.

### Option C: GitHub Actions (in the `SICANewBorn` repo)

`.github/workflows/news-cron.yml`:

```yaml
name: News automation
on:
  schedule:
    - cron: '0 2 * * *'   # 02:00 UTC daily
  workflow_dispatch:        # allow manual runs from the Actions tab

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger news generation
        run: |
          curl -fsS -X GET \
            "https://<your-sica-domain>/api/cron/generate-news?count=5&length=short" \
            -H "x-cron-secret: ${{ secrets.NEWS_CRON_SECRET }}"
```

Add the secret in **Repo → Settings → Secrets and variables → Actions** as
`NEWS_CRON_SECRET` (the same value as in Railway).

### Option D: cron-job.org (free, no infra)

1. Sign up at <https://cron-job.org>
2. New cron job:
   - URL: `https://<your-sica-domain>/api/cron/generate-news?count=5&length=short`
   - Method: `GET`
   - Every 24 hours (or pick a specific time)
   - Custom headers: `x-cron-secret: <NEWS_CRON_SECRET>`

## Endpoints

| Method | Path                                              | Auth                | Purpose                                      |
|--------|---------------------------------------------------|---------------------|----------------------------------------------|
| GET    | `/api/cron/generate-news?count=5&length=short`    | `x-cron-secret`     | Scheduled daily run (use this from the cron) |
| POST   | `/api/cron/generate-news`                         | `x-cron-secret`     | Same as GET but accepts a JSON body          |
| GET    | `/api/admin/news/automation`                      | Admin Bearer JWT    | Dashboard data: summary + topics + runs      |
| POST   | `/api/admin/news/automation/topics`               | Admin Bearer JWT    | Add a topic to the queue                     |
| DELETE | `/api/admin/news/automation/topics/[id]`          | Admin Bearer JWT    | Remove a topic (404 if gone, 409 if in-flight)|
| POST   | `/api/admin/news/automation/run`                  | Admin Bearer JWT    | "Run 5 now" button — manual trigger          |

## Topic queue

Topics live in `news_automation_topics`. Each row has:

- `topic` (3-200 chars, required)
- `category`: `scholarship | university | guide | event | announcement | partnership`
- `language`: `en | zh | both`
- `tone`: `informational | instructional | analytical | celebratory | urgent`
- `target_keyword` (optional, 0-200 chars)
- `priority` (int -10..10; higher picked first)
- `status`: `pending | generating | done | skipped | failed`
- `post_id` (FK to the generated `news_posts` row when done)
- `last_error` (set if the runner failed for this topic)

Picking logic: `status='pending' ORDER BY priority DESC, created_at ASC LIMIT N`.

The first run starts with 14 evergreen topics (CSC scholarships, university
profiles, application guides, events, partnership announcements). Add more
from `/admin/news → Automation → Add topic` whenever a new angle or
deadline comes up.

## Run audit log

Every cron tick creates a row in `news_automation_runs`:

- `triggered_by`: `cron | admin | seed`
- `status`: `running | success | partial | failed`
- `count_planned | count_done | count_failed`
- `topic_ids` (uuid[]) — the topics attempted in this run
- `failed_topic_ids` (uuid[]) — subset of the above that errored
- `error_log` — newline-separated per-topic error messages
- `started_at | finished_at`

If **every** topic in a run fails, an email is sent to the admin via Resend
(skipped if `RESEND_API_KEY` is not set). Partial failures stay in the
audit log only — no email spam.

## Behavior notes

- **Stale claim recovery**: if a previous run crashed mid-batch, topics
  stuck in `status='generating'` for more than 1 hour are automatically
  flipped back to `pending` on the next run.
- **Slug collisions**: if the AI returns a slug already in `news_posts`,
  the runner appends a 4-char random suffix and retries the insert (3x).
- **Retries**: each topic gets up to 3 AI attempts with 1s/2s/4s backoff
  before being marked `failed`.
- **Cost**: 5 short posts ≈ 1-2 minutes of AI provider time. The
  short-prompt body is 400-600 words; the structured fields
  (key_takeaways, at_a_glance, faq, sources) come on top. The same
  S36 SEO + AEO + GEO prompt and the same S35 third-party agency
  denylist apply — no special "automation" path bypasses those.
- **Save as draft only**: nothing auto-publishes. Admin reviews and
  clicks Publish on the Posts tab.

## Tuning

- **Want more or fewer posts per day**: pass `?count=N` (1-10).
- **Want longer posts**: pass `?length=medium` (800-1200 words) or
  `?length=long` (1500-2200 words). Each long post takes ~2-3x the
  AI time and token cost.
- **Want a different time of day**: change the cron's `schedule`.
- **Want to skip a day**: don't change anything — the queue is FIFO,
  topics that weren't picked today will be picked tomorrow (or you
  can mark them `skipped` from the admin UI if you want to pause a
  specific topic).
- **Want a totally different topic mix**: edit the seed list, add/
  remove rows in the admin UI, or `DELETE FROM news_automation_topics`
  in SQL and re-seed.

## Troubleshooting

- **Run says "AI provider not configured"**: set `DEEPSEEK_API_KEY` or
  `DOUBAO_API_KEY` in the env. Restart the service after setting it.
- **All topics fail with "Model did not return a JSON object"**: the
  AI went off-script. Look at the `error_log` in the run row, then
  re-add the failed topics to the queue (`status='pending'`) and try
  again. The runner has 3 retries built in but sometimes 3 isn't enough
  for a really stuck provider.
- **Cron says 401 Unauthorized**: `NEWS_CRON_SECRET` mismatch. The
  secret in the env must equal the `x-cron-secret` header sent by
  the scheduler.
- **No topics picked up**: `SELECT * FROM news_automation_topics
  WHERE status='pending'` should be > 0. If it's 0, the queue is
  empty — add topics from `/admin/news → Automation` or re-run the
  seed migration.
- **Want to reset everything**: `UPDATE news_automation_topics SET
  status='pending', post_id=NULL, last_error=NULL, generated_at=NULL
  WHERE status IN ('done','failed')` — re-queues everything.

## Related files

- `database/2026-06-06_news_automation.sql` — schema + seed
- `src/lib/ai/news-automation-runner.ts` — the run logic (shared by cron
  + admin endpoints)
- `src/app/api/cron/generate-news/route.ts` — cron entry point
- `src/app/api/admin/news/automation/route.ts` — admin GET (dashboard)
- `src/app/api/admin/news/automation/topics/route.ts` — admin POST (add)
- `src/app/api/admin/news/automation/topics/[id]/route.ts` — admin DELETE
- `src/app/api/admin/news/automation/run/route.ts` — admin POST (run now)
- `src/app/admin/news/automation/page.tsx` — admin UI
- `src/lib/ai/blog-prompts.ts` — shared prompt builder (extracted from
  `/api/ai/generate-blog` so the cron and the interactive admin
  generator stay in sync)
- `src/lib/ai/blog-sanitize.ts` — shared sanitization + third-party
  agency scrub
