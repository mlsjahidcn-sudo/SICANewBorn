/**
 * WABPO WhatsApp Business client — Phase 45a.
 *
 * Thin wrapper over the WABPO Public API:
 *   base: https://api.wabpo.com/api/v1/public
 *   auth: secret API key in `Authorization: Bearer <key>` (NOT x-api-key,
 *         not a query param — per the docs, keys are bearer-only).
 *
 * We do NOT touch WABPO from the browser. All calls go through our
 * server routes (`/api/admin/leads/[id]/send-whatsapp` for Phase 45a).
 *
 * Configuration (env):
 *   WABPO_API_KEY      — wabpo_live_… secret
 *   WABPO_PROJECT_ID   — the WABPO project/workspace id (UUID)
 *   WABPO_CAMPAIGN_ID  — the WABPO campaign id (UUID; required in the
 *                        send-template URL path)
 *
 * The campaignId-vs-projectId distinction comes straight from the docs:
 *   - `projectId` lives in the body — workspace/tenant scope
 *   - `campaignId` lives in the URL path — message-batch scope
 * Templates are scoped to a campaign in WABPO so we can pivot between
 * "intake welcome" / "doc-request followup" / "post-decision" without
 * rewriting code. For Phase 45a we only need one campaignId in env; if
 * the user later wants per-lead-type campaigns, this gets refactored
 * into a `campaigns` lookup table keyed off lead_type.
 */
import { randomUUID } from 'node:crypto';

const DEFAULT_BASE_URL = 'https://api.wabpo.com/api/v1/public';

export interface WabpoConfig {
  baseUrl: string;
  apiKey: string;
  projectId: string;
  campaignId: string;
}

/**
 * Read the WABPO config from env. Returns `null` for any missing var
 * (the call site should treat that as "WABPO not configured" and
 * short-circuit with a clear UI message — never crash).
 *
 * `process.env.WABPO_*` reads are intentionally NOT centralised into a
 * config singleton; we want per-route visibility into exactly which env
 * vars each request is gated on.
 */
export function getWabpoConfig(): WabpoConfig | null {
  const apiKey = process.env.WABPO_API_KEY;
  const projectId = process.env.WABPO_PROJECT_ID;
  const campaignId = process.env.WABPO_CAMPAIGN_ID;
  if (!apiKey || !projectId || !campaignId) return null;
  return {
    baseUrl: process.env.WABPO_BASE_URL || DEFAULT_BASE_URL,
    apiKey,
    projectId,
    campaignId,
  };
}

/**
 * Quick test for whether any vars are missing — used by the admin UI
 * to render a "WABPO not configured" tooltip instead of the Send button.
 */
export function isWabpoConfigured(): boolean {
  return getWabpoConfig() !== null;
}

// ---- Response shapes (typed against the WABPO docs) ----

export interface WabpoTemplateVariable {
  key: string;
  placeholder: string; // e.g. "{{first_name}}"
  sequence: number;
  source: 'body' | 'header' | 'button' | string;
}

export interface WabpoTemplate {
  id: string;
  templateName: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION' | string;
  templateType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'CAROUSEL' | 'LOCATION' | string;
  status: 'APPROVED' | 'DRAFT' | 'PENDING' | 'REJECTED' | string;
  metaStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | string | null;
  metaTemplateId: string | null;
  metaStatusReason: string | null;
  rejectionReason: string | null;
  variableDefinitions: WabpoTemplateVariable[];
}

export interface WabpoEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

export interface WabpoSendResult {
  batchId: string;
  totalQueued: number;
  status: 'processing' | 'processed' | 'failed';
  details: Array<{
    number: string;
    messageId: string;
    status: 'queued' | 'sent' | 'failed';
    idempotencyMatch: boolean;
  }>;
}

/**
 * Pulls only `APPROVED` templates (default) from the project.
 * Approved-only is enforced server-side per WABPO docs:
 * "If status is omitted, returns approved templates only."
 */
export async function listApprovedTemplates(
  config = getWabpoConfig(),
): Promise<WabpoTemplate[]> {
  if (!config) return [];
  const qs = new URLSearchParams({
    projectId: config.projectId,
    status: 'APPROVED',
  });
  const res = await wabpoFetch<WabpoTemplate[]>(
    `${config.baseUrl}/templates?${qs.toString()}`,
    config,
  );
  return res;
}

export interface SendTemplateArgs {
  templateId: string;
  /** Recipient phone in any format — we normalise to digits-only with leading country code. */
  recipientNumber: string;
  /** Map of WABPO template variables (e.g. `{ first_name: 'Ana', program: 'BSc CS' }`). */
  variables: Record<string, string | number>;
  /** Override the default idempotency key (typically set per-row to dedupe retries). */
  idempotencyKey?: string;
  /** External reference for cross-system tracking — usually the lead id. */
  externalReference?: string;
}

export async function sendTemplateMessage(
  args: SendTemplateArgs,
  config = getWabpoConfig(),
): Promise<WabpoSendResult> {
  if (!config) {
    throw new WabpoNotConfiguredError();
  }

  // Normalize phone: digits-only with leading country code (no '+').
  // WABPO accepts "923089049255" (Pakistan) or "+923089049255"; we send
  // digits-only because it's the canonical form in their example.
  const number = args.recipientNumber.replace(/[^0-9]/g, '');

  const url = `${config.baseUrl}/campaigns/${config.campaignId}/messages/template`;
  const body = {
    projectId: config.projectId,
    templateId: args.templateId,
    recipients: [
      {
        number,
        ...args.variables,
        externalReference: args.externalReference ?? null,
        idempotencyKey: args.idempotencyKey ?? `sica-${Date.now()}-${randomUUID()}`,
      },
    ],
  };

  // 200 OK from WABPO is documented as:
  //   { success: true, data: { batchId, totalQueued, status, details: [...] } }
  // On failure: { success: false, error: { code, message } } OR HTTP 4xx/5xx.
  const envelope = await wabpoFetch<WabpoSendResult>(url, config, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return envelope;
}

// ---- Low-level transport ----

/**
 * Distinct error class for the "WABPO env vars missing" case. Caller
 * checks `instanceof WabpoNotConfiguredError` to render the admin UI's
 * "WABPO not configured — ask the dev to set WABPO_PROJECT_ID" tooltip
 * instead of a generic 500.
 */
export class WabpoNotConfiguredError extends Error {
  readonly __wabpo = 'NOT_CONFIGURED' as const;
  constructor() {
    super(
      'WabpoNotConfiguredError: WABPO_API_KEY / WABPO_PROJECT_ID / WABPO_CAMPAIGN_ID are missing — see .env.example.',
    );
    this.name = 'WabpoNotConfiguredError';
  }
}

export class WabpoApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message || code);
    this.name = 'WabpoApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Generic WABPO fetch — bearer-auth, JSON in/out, throws typed errors.
 * 30s default timeout (template sends are queued async so the response
 * should be fast, but we leave headroom for cold campaigns).
 */
async function wabpoFetch<T>(
  url: string,
  config: WabpoConfig,
  init: RequestInit = {},
): Promise<T> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(init.headers ?? {}),
      },
      cache: 'no-store',
    });

    let parsed: WabpoEnvelope<T> | null = null;
    try {
      parsed = (await res.json()) as WabpoEnvelope<T>;
    } catch {
      // non-JSON body — treat as transport error
      throw new WabpoApiError(res.status, 'NON_JSON_RESPONSE', `WABPO returned ${res.status} with non-JSON body`);
    }

    if (!res.ok || !parsed.success) {
      const err = parsed.error ?? { code: 'UNKNOWN', message: 'unknown error' };
      throw new WabpoApiError(res.status, err.code, err.message);
    }
    if (parsed.data === undefined) {
      throw new WabpoApiError(res.status, 'MISSING_DATA', 'WABPO success envelope was missing `data`');
    }
    return parsed.data;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Strip a phone string to E.164 digits-only. Public so callers (and tests)
 * can normalize caller-supplied numbers before invoking sendTemplateMessage.
 *
 * Input formats accepted:
 *   "+86 138 0000 0000" → "861380000000"
 *   "13800000000"        → "13800000000"   (assumes already prefixed — caller is responsible)
 */
export function normalizePhone(raw: string): string {
  return raw.replace(/[^0-9]/g, '');
}
