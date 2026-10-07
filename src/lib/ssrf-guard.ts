/**
 * SSRF guard for outbound webhook URLs.
 *
 * The B2B webhook subscription flow lets any caller with an API key
 * point us at a URL of their choice. Without a guard, a malicious
 * caller could subscribe to `https://169.254.169.254/...` and use us
 * as a cloud-metadata proxy, or to `http://10.0.0.1/admin` and reach
 * internal network services. We reject anything that resolves (or
 * gets re-resolved after DNS) to a loopback / private / link-local
 * / cloud-metadata IP, refuse to follow redirects, and require https
 * (with http://localhost allowed in non-production for dev).
 *
 * The DNS re-check is the load-bearing part: a URL like
 * `https://attacker-controlled.example/redirect-to-10.0.0.1` would
 * pass the initial hostname string check (example is a public
 * resolver answer) and then redirect. We pin the resolved IP at
 * subscription time, then re-check on every delivery. The DNS
 * resolver we use is the platform default (Node's `dns` module) —
 * that honors the host's /etc/resolv.conf, which is what the rest
 * of the runtime uses too.
 *
 * IPv6 is treated with the same rules. ::1, fc00::/7 (ULA),
 * fe80::/10 (link-local), and the IPv4-mapped variants are all
 * blocked. IPv6 doesn't have a metadata IP equivalent, but the
 * blocking is symmetric.
 */
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

interface LookupAddress {
  address: string;
  family: number;
}

export type SafeUrlResult =
  | { ok: true }
  | { ok: false; reason: string };

/** True when the URL is acceptable for a webhook subscription +
 *  delivery. `allowLocalhost` should be true in dev, false in prod. */
export async function assertSafeWebhookUrl(
  rawUrl: string,
  allowLocalhost: boolean,
): Promise<SafeUrlResult> {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return { ok: false, reason: 'Invalid URL' };
  }
  if (!/^https?:$/.test(u.protocol)) {
    return { ok: false, reason: 'Only http(s) URLs are allowed' };
  }
  if (u.protocol === 'http:' && !(allowLocalhost && isLoopbackHost(u.hostname))) {
    return {
      ok: false,
      reason: 'Webhook URL must be https (http only allowed for localhost in dev)',
    };
  }
  if (u.protocol === 'https:' && isLoopbackHost(u.hostname) && !allowLocalhost) {
    return { ok: false, reason: 'Loopback hostnames not allowed in production' };
  }
  // Block obvious cloud-metadata hostnames too — same answer as
  // resolving them, but cheaper.
  if (u.hostname === 'metadata.google.internal' || u.hostname === 'metadata') {
    return { ok: false, reason: 'Cloud metadata hostname not allowed' };
  }

  // DNS resolution. If the hostname is an IP literal, skip lookup.
  let addresses: LookupAddress[];
  if (isIP(u.hostname)) {
    const family = isIP(u.hostname);
    addresses = [{ address: u.hostname, family: family === 6 ? 6 : 4 }];
  } else {
    try {
      addresses = await lookup(u.hostname, { all: true });
    } catch {
      return { ok: false, reason: 'DNS resolution failed' };
    }
    if (addresses.length === 0) {
      return { ok: false, reason: 'DNS returned no addresses' };
    }
  }

  for (const addr of addresses) {
    if (isBlockedAddress(addr.address, allowLocalhost)) {
      return { ok: false, reason: `Resolved IP ${addr.address} is in a blocked range` };
    }
  }

  return { ok: true };
}

/** Re-check the IP before each delivery. Used by attemptDelivery in
 *  webhook-emitter so a hostname that flips from public → private (or
 *  to 169.254.169.254) can't be used to bounce us back inside. */
export async function recheckUrlSafe(
  rawUrl: string,
  allowLocalhost: boolean,
): Promise<SafeUrlResult> {
  return assertSafeWebhookUrl(rawUrl, allowLocalhost);
}

function isLoopbackHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]';
}

/** True for any IP the gateway should never make an outbound
 *  connection to: 127/8, 10/8, 172.16/12, 192.168/16, 169.254/16,
 *  100.64/10 (carrier-grade NAT — debatable but safer), 0/8,
 *  224/4 (multicast) and 240/4 (reserved). IPv6: ::1, fc00::/7,
 *  fe80::/10, ::/128, the IPv4-mapped versions of the IPv4 ranges
 *  above (::ffff:127.0.0.1 etc). When `allowLoopback` is true,
 *  the loopback ranges (127/8, ::1, ::ffff:127.0.0.0/104) are
 *  permitted — that's the dev-mode exemption for testing webhooks
 *  against a local tunnel. */
export function isBlockedAddress(ip: string, allowLoopback = false): boolean {
  const v4Mapped = ip.match(/^::ffff:([0-9a-f:.]+)$/i);
  const v4 = v4Mapped ? v4Mapped[1] : null;

  if (v4 && isBlockedV4(v4, allowLoopback && v4Mapped !== null)) return true;
  if (isBlockedV4(ip, allowLoopback)) return true;
  if (isBlockedV6(ip, allowLoopback)) return true;
  return false;
}

function isBlockedV4(ip: string, allowLoopback: boolean): boolean {
  // Already validated as IPv4 before this point.
  const parts = ip.split('.').map((p) => Number.parseInt(p, 10));
  if (
    parts.length !== 4 ||
    parts.some((p) => !Number.isFinite(p) || p < 0 || p > 255)
  ) {
    return true; // malformed → block
  }
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 127) return allowLoopback ? false : true; // 127.0.0.0/8
  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b !== undefined && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b !== undefined && b === 168) return true; // 192.168.0.0/16
  if (a === 169 && b !== undefined && b === 254) return true; // link-local incl. 169.254.169.254
  if (a === 100 && b !== undefined && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast + reserved
  return false;
}

function isBlockedV6(ip: string, allowLoopback: boolean): boolean {
  const lc = ip.toLowerCase();
  if (lc === '::') return true; // unspecified
  if (lc === '::1') return !allowLoopback; // loopback (allow in dev)
  if (lc.startsWith('fc') || lc.startsWith('fd')) return true; // fc00::/7 unique-local
  if (
    lc.startsWith('fe8') ||
    lc.startsWith('fe9') ||
    lc.startsWith('fea') ||
    lc.startsWith('feb')
  ) {
    return true; // fe80::/10 link-local
  }
  if (lc.startsWith('ff')) return true; // multicast
  return false;
}

/** Test helper — true when the current NODE_ENV allows loopback http. */
export function shouldAllowLocalhost(): boolean {
  return process.env.NODE_ENV !== 'production';
}