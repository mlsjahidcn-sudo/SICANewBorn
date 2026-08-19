/**
 * CORS helper tests (Phase 73 / C-6).
 *
 * Locks down the per-key allowlist semantics: exact-match beats no-match,
 * '*' is wildcard (sandbox-only, flagged in admin UI), and the preflight
 * helper requires a valid Origin header.
 */
import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  CORS_MAX_AGE_SECONDS,
  corsHeadersFor,
  corsPreflightHeaders,
  isValidCorsOrigin,
  originAllowedForKey,
} from '../v1-cors';
import type { NextRequest } from 'next/server';

function makeRequest(origin: string | null, method = 'GET'): NextRequest {
  const headers = new Headers();
  if (origin !== null) headers.set('origin', origin);
  return new Request('https://studyinchina.academy/v1/catalog/universities', {
    method,
    headers,
  }) as unknown as NextRequest;
}

describe('isValidCorsOrigin', () => {
  test('accepts https:// origins', () => {
    expect(isValidCorsOrigin('https://acme.com')).toBe(true);
    expect(isValidCorsOrigin('https://acme.com:443/path')).toBe(true);
  });
  test('accepts http://localhost for dev', () => {
    expect(isValidCorsOrigin('http://localhost:3000')).toBe(true);
    expect(isValidCorsOrigin('http://127.0.0.1:8080')).toBe(true);
  });
  test('rejects http:// on non-localhost', () => {
    expect(isValidCorsOrigin('http://acme.com')).toBe(false);
    expect(isValidCorsOrigin('http://example.org')).toBe(false);
  });
  test('rejects garbage and missing protocol', () => {
    expect(isValidCorsOrigin('not-a-url')).toBe(false);
    expect(isValidCorsOrigin('javascript:alert(1)')).toBe(false);
    expect(isValidCorsOrigin('')).toBe(false);
    expect(isValidCorsOrigin(null)).toBe(false);
  });
  test('accepts the * wildcard (sandbox)', () => {
    expect(isValidCorsOrigin('*')).toBe(true);
  });
});

describe('originAllowedForKey', () => {
  test('null when request has no Origin', () => {
    expect(originAllowedForKey(null, ['https://acme.com'])).toBeNull();
  });
  test('null when key has empty allowlist (default)', () => {
    expect(originAllowedForKey('https://acme.com', [])).toBeNull();
    expect(originAllowedForKey('https://acme.com', null)).toBeNull();
    expect(originAllowedForKey('https://acme.com', undefined)).toBeNull();
  });
  test('returns the origin when it is in the allowlist (exact match)', () => {
    expect(originAllowedForKey('https://acme.com', ['https://acme.com'])).toBe(
      'https://acme.com',
    );
  });
  test('null when origin not in allowlist (the security gate)', () => {
    expect(originAllowedForKey('https://attacker.com', ['https://acme.com'])).toBeNull();
  });
  test("returns '*' when the key is wildcard", () => {
    expect(originAllowedForKey('https://anything.com', ['*'])).toBe('*');
  });
  test("wildcard beats any other allowlist entry — returns '*'", () => {
    expect(originAllowedForKey('https://acme.com', ['*', 'https://specific.com'])).toBe('*');
  });
  test('case-sensitive — https://ACME.com is NOT a match for https://acme.com', () => {
    expect(originAllowedForKey('https://ACME.com', ['https://acme.com'])).toBeNull();
  });
  test('partial-match is rejected (https://acme.com.evil is not https://acme.com)', () => {
    expect(
      originAllowedForKey('https://acme.com.evil', ['https://acme.com']),
    ).toBeNull();
  });
});

describe('corsHeadersFor', () => {
  test('returns {} when origin is not in allowlist (no CORS attached)', () => {
    const req = makeRequest('https://attacker.com');
    const headers = corsHeadersFor(req, ['https://acme.com']);
    expect(headers).toEqual({});
  });
  test('returns full set when origin matches', () => {
    const req = makeRequest('https://acme.com');
    const headers = corsHeadersFor(req, ['https://acme.com']);
    expect(headers['Access-Control-Allow-Origin']).toBe('https://acme.com');
    expect(headers['Access-Control-Allow-Methods']).toBe(CORS_ALLOWED_METHODS);
    expect(headers['Access-Control-Allow-Headers']).toBe(CORS_ALLOWED_HEADERS);
    expect(headers['Vary']).toBe('Origin');
  });
  test("returns '*' for wildcard keys (sandbox)", () => {
    const req = makeRequest('https://anything.com');
    const headers = corsHeadersFor(req, ['*']);
    expect(headers['Access-Control-Allow-Origin']).toBe('*');
  });
  test('returns {} when the request has no Origin (server-to-server / curl)', () => {
    const req = makeRequest(null);
    const headers = corsHeadersFor(req, ['https://acme.com']);
    expect(headers).toEqual({});
  });
});

describe('corsPreflightHeaders', () => {
  test('returns the preflight set when Origin is a valid https URL', () => {
    const req = makeRequest('https://acme.com', 'OPTIONS');
    const headers = corsPreflightHeaders(req);
    expect(headers).not.toBeNull();
    expect(headers!['Access-Control-Allow-Origin']).toBe('https://acme.com');
    expect(headers!['Access-Control-Allow-Methods']).toBe(CORS_ALLOWED_METHODS);
    expect(headers!['Access-Control-Allow-Headers']).toBe(CORS_ALLOWED_HEADERS);
    expect(headers!['Access-Control-Max-Age']).toBe(CORS_MAX_AGE_SECONDS);
  });
  test('returns null for a missing Origin header (route returns 403)', () => {
    const req = makeRequest(null, 'OPTIONS');
    expect(corsPreflightHeaders(req)).toBeNull();
  });
  test('returns null for an invalid Origin (http://attacker.com)', () => {
    const req = makeRequest('http://attacker.com', 'OPTIONS');
    expect(corsPreflightHeaders(req)).toBeNull();
  });
  test('preflight does NOT require the key (no auth on OPTIONS)', () => {
    // This test documents the design: preflight echoes the Origin
    // back if it looks valid, without knowing which key is calling.
    // The actual request is what enforces the per-key allowlist.
    const req = makeRequest('https://unknown-consumer.com', 'OPTIONS');
    const headers = corsPreflightHeaders(req);
    expect(headers).not.toBeNull();
    expect(headers!['Access-Control-Allow-Origin']).toBe('https://unknown-consumer.com');
  });
});
