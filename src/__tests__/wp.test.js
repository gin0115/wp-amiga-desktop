import { describe, it, expect, vi, beforeEach } from 'vitest';
import { wp, _internal } from '../lib/wp.js';

const { url, getJson } = _internal;

describe('wp.js URL building', () => {
  it('strips trailing slashes from base and leading slashes from path', () => {
    expect(url('wp/v2/posts')).toBe('/mocks/wp-json/wp/v2/posts');
    expect(url('/wp/v2/posts')).toBe('/mocks/wp-json/wp/v2/posts');
  });

  it('exposes the resolved baseUrl', () => {
    expect(wp.baseUrl).toBe('/mocks/wp-json');
  });
});

describe('wp.js error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws with status + path on non-2xx', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      }),
    );
    await expect(getJson('wp/v2/posts')).rejects.toMatchObject({
      status: 503,
      path: 'wp/v2/posts',
    });
  });

  it('returns parsed JSON on success', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([{ id: 1, name: 'Workbench' }]),
      }),
    );
    const data = await getJson('wp/v2/categories');
    expect(data).toEqual([{ id: 1, name: 'Workbench' }]);
  });
});
