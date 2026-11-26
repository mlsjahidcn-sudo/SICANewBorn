import { describe, expect, it } from 'vitest';
import {
  applyAutoFulfillment,
  requestIsSatisfied,
  setRequestFulfillment,
} from '@/lib/document-request-fulfillment';

const NOW = '2026-11-26T10:00:00.000Z';
const req = (id: string, categories: string[], extra: Record<string, unknown> = {}) => ({
  id,
  categories,
  message: null,
  requested_at: '2026-11-20T00:00:00.000Z',
  requested_by: 'admin-1',
  fulfilled_at: null,
  fulfilled_by: null,
  ...extra,
});
const after = '2026-11-21T00:00:00.000Z';
const before = '2026-11-19T00:00:00.000Z';

describe('requestIsSatisfied', () => {
  it('needs a matching upload for every category', () => {
    const r = req('a', ['passport', 'transcript']);
    expect(requestIsSatisfied(r, [{ category: 'Identity', uploadedAt: after }])).toBe(false);
    expect(
      requestIsSatisfied(r, [
        { category: 'Identity', uploadedAt: after },
        { category: 'Academic', uploadedAt: after },
      ]),
    ).toBe(true);
  });

  it('ignores files uploaded before the request', () => {
    expect(requestIsSatisfied(req('a', ['passport']), [{ category: 'Identity', uploadedAt: before }])).toBe(false);
  });

  it('never auto-closes photo or other requests', () => {
    const docs = [{ category: 'Identity', uploadedAt: after }, { category: 'Other', uploadedAt: after }];
    expect(requestIsSatisfied(req('a', ['passport', 'photo']), docs)).toBe(false);
    expect(requestIsSatisfied(req('a', ['other']), docs)).toBe(false);
  });
});

describe('applyAutoFulfillment', () => {
  it('closes only satisfied open requests and keeps other entries intact', () => {
    const legacy = { id: 'legacy', junk: true };
    const raw = [
      req('open', ['english_test']),
      req('done', ['passport'], { fulfilled_at: '2026-11-22T00:00:00.000Z', fulfilled_by: 'x' }),
      req('photo', ['photo']),
      legacy,
    ];
    const { requests, changedIds } = applyAutoFulfillment(
      raw,
      [{ category: 'Language', uploadedAt: after }, { category: 'Identity', uploadedAt: after }],
      NOW,
      'partner-user',
    );
    expect(changedIds).toEqual(['open']);
    expect(requests[0]).toMatchObject({ fulfilled_at: NOW, fulfilled_by: 'partner-user' });
    expect(requests[1]).toMatchObject({ fulfilled_at: '2026-11-22T00:00:00.000Z', fulfilled_by: 'x' });
    expect(requests[2]).toMatchObject({ fulfilled_at: null });
    expect(requests[3]).toBe(legacy);
  });

  it('reports no change when nothing is satisfied', () => {
    expect(applyAutoFulfillment([req('a', ['passport'])], [], NOW, null).changedIds).toEqual([]);
    expect(applyAutoFulfillment(null, [], NOW, null)).toEqual({ requests: [], changedIds: [] });
  });
});

describe('setRequestFulfillment', () => {
  it('marks a request done and reopens it', () => {
    const raw = [req('a', ['photo']), req('b', ['other'])];
    const done = setRequestFulfillment(raw, 'a', true, NOW, 'admin-2');
    expect(done?.[0]).toMatchObject({ fulfilled_at: NOW, fulfilled_by: 'admin-2' });
    expect(done?.[1]).toBe(raw[1]);
    const reopened = setRequestFulfillment(done, 'a', false, NOW, 'admin-2');
    expect(reopened?.[0]).toMatchObject({ fulfilled_at: null, fulfilled_by: null });
  });

  it('returns null for an unknown request id', () => {
    expect(setRequestFulfillment([req('a', ['photo'])], 'missing', true, NOW, null)).toBeNull();
  });
});
