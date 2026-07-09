# WABPO WhatsApp Business integration

Phase 45a — admin-initiated outbound WhatsApp template sends from `/admin/leads/[id]`.

## Overview

- **Provider**: WABPO WhatsApp Business API (`https://api.wabpo.com/api/v1/public`)
- **Activation**: admin clicks "Send WhatsApp" on a lead detail page → chooses an approved template → server fills the variables from the lead row → POSTs to WABPO → records a `lead_history` row with `action='contacted'` and the message ID in the note.
- **Scope (Phase 45a)**: outbound only. Inbound messages, delivery webhooks, and a per-lead-type campaign switcher are Phase 45b/c.

## Environment variables

Set these in Railway (and `.env` for local dev):

```bash
WABPO_API_KEY=wabpo_live_…               # from my.wabpo.com → API Keys
WABPO_PROJECT_ID=                        # blank until project is created
WABPO_CAMPAIGN_ID=                       # blank until campaign is created
```

All three are required for the button to actually fire. While `WABPO_PROJECT_ID` or `WABPO_CAMPAIGN_ID` is blank, `getWabpoConfig()` returns `null` and the UI renders the button as **disabled with a tooltip** — the Send button is visible but does nothing on click. This is intentional: we don't want the admin to think they're sending when they aren't.

### Where to find each ID

1. Sign in at https://my.wabpo.com
2. **API Key** → API Keys → Create → copy the `wabpo_live_…` token into `WABPO_API_KEY`
3. **Project** → Projects → Create → copy the project UUID into `WABPO_PROJECT_ID`
4. **Campaign** → Campaigns → Create → choose template-only campaign → copy the campaign UUID into `WABPO_CAMPAIGN_ID`

The campaign is what WABPO charges against. Templates must be created **inside the project** AND **approved by Meta** before they show up in `GET /templates?status=APPROVED`.

## Template setup (WABPO dashboard)

Templates live in the WABPO dashboard and are submitted to Meta for approval. Phase 45a expects three templates at minimum:

| Template name | Category | Use |
| --- | --- | --- |
| `lead_intro_v1` | MARKETING | First outreach to a contact / assessment / chat lead |
| `lead_followup_v1` | UTILITY | Follow-up after the lead hasn't replied |
| `lead_thanks_v1` | UTILITY | Post-call thank-you / recap |

Each template's body should reference variables by **named placeholder** that match the keys we send. Example:

```
Hi {{first_name}}, thanks for reaching out to SICA about studying in China.
We'd love to help you explore {{intended_major}} programs.
Reply here and a counselor will follow up within 24h.
```

The variable definitions WABPO returns look like:

```json
{
  "variableDefinitions": [
    { "key": "first_name", "placeholder": "{{first_name}}", "sequence": 1, "source": "header" },
    { "key": "intended_major", "placeholder": "{{intended_major}}", "sequence": 2, "source": "body" }
  ]
}
```

Our backend **auto-fills** these from the lead row at send time:

| WABPO variable | Source column (per lead type) |
| --- | --- |
| `first_name` | `first_name` (contact), `name.split(' ')[0]` (chat), first word of `name` (assessment) |
| `name` | full name |
| `country` | `country` (contact), `location` parsed (chat), `nationality` (assessment) |
| `intended_major` | `intended_major` / `target_field` / `topic` depending on lead type |
| `message` | original inquiry / message body |

If a template references a variable we don't have, the API still sends (WABPO renders the unresolved placeholder).

## Authentication

All requests carry `Authorization: Bearer <WABPO_API_KEY>`. The browser never sees the key — the admin UI calls our server routes (`/api/admin/wabpo/templates`, `/api/admin/leads/[id]/send-whatsapp`) which proxy through. `requireAdmin` gates both routes.

## API surface

| SICA route | WABPO call | Purpose |
| --- | --- | --- |
| `GET /api/admin/wabpo/templates` | `GET /templates?projectId=…&status=APPROVED` | list approved templates for the picker |
| `POST /api/admin/leads/[id]/send-whatsapp` | `POST /campaigns/:campaignId/messages/template` | send a single template message |

Both return `{ configured: boolean }` so the UI can render a "WABPO not configured" state without crashing if env is missing.

## Response shape (send)

Success:
```json
{ "success": true, "messageId": "wamid.HBgL…", "totalQueued": 1 }
```

`messageId` is stored in `lead_history.note` as `whatsapp | template=<name> | msgId=<messageId>`. The admin sees it briefly as a toast.

## Phone number handling

WABPO canonical format is **digits only** with country code (no leading `+`). Our `normalizePhone()` helper strips non-digits:

- `+86 138 0000 0000` → `8613800000000`
- `(415) 555-1234` → `4155551234`

The admin can **override** the recipient number on the send modal — useful for testing a template against the admin's own phone before sending to a real lead.

## Lead-history record

Every send inserts one `lead_history` row:

| Column | Value |
| --- | --- |
| `lead_id` | the lead's id |
| `lead_type` | `contact` / `chat` / `assessment` |
| `action` | `contacted` |
| `note` | `whatsapp \| template=<templateName> \| msgId=<messageId>` |

The existing CHECK constraint only allows `created | status_changed | notes_updated | assigned | unassigned | contacted`, so Phase 45a uses `contacted` + channel-in-note. Phase 45b will expand the constraint to add `whatsapp_sent` and split template / messageId into proper columns.

## Troubleshooting

### "WABPO not configured" badge in UI

`WABPO_API_KEY`, `WABPO_PROJECT_ID`, or `WABPO_CAMPAIGN_ID` is blank or invalid. Check `GET /api/health` → `checks.env` block — all WABPO_* vars should report `true` once Railway env is set.

### Send returns 401/403 from WABPO

The API key is wrong, expired, or revoked. Generate a new one in the WABPO dashboard and update `WABPO_API_KEY`.

### Send returns 404 (template not found)

The template was deleted, moved to a different project, or hasn't been approved by Meta yet. Refresh the template list (`GET /api/admin/wabpo/templates`) to confirm the picker shows it.

### Phone validation error from WABPO

The recipient number isn't a valid WhatsApp number (not on the platform, or wrong country code). Try the override field with a known-good number to isolate whether it's our normalization vs the recipient's actual number.

### i18n: missing keys in zh

If you add a new `adminLeadDetail.wabpo*` key, both en and zh blocks must get a translation. The drift test `pnpm test -- src/lib/i18n-translations.test.ts` catches missing keys automatically.

## Future scope (45b+)

- **45b**: `wabpo_log` table for delivery state. Webhook endpoint at `/api/webhooks/wabpo` updates `wabpo_log` on `delivered | read | failed`. Expand `lead_history.action` CHECK to include `whatsapp_sent`.
- **45c**: Inbound messages via webhook → 2-way inbox at `/admin/leads/inbox`.
- **45d**: Per-lead-type campaigns. Replace single `WABPO_CAMPAIGN_ID` env with a `wabpo_campaigns` lookup table keyed off `lead.type`.

## Reference

- WABPO docs: https://developers.wabpo.com/en/docs/template-messaging/send-template-messages-api
- Dashboard: https://my.wabpo.com
- Phase log: `AGENTS.md` → "Phase 45a (WABPO WhatsApp)"