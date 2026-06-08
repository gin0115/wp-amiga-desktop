import { describe, it, expect, vi, beforeEach } from 'vitest';
import { wp, _internal } from '../lib/wp.js';

const { url, getJson } = _internal;

describe('wp.js URL building', () => {
  it('appends .json in mock mode (default base) and inserts before query', () => {
    expect(url('wp/v2/posts')).toBe('./mocks/wp-json/wp/v2/posts.json');
    expect(url('/wp/v2/posts')).toBe('./mocks/wp-json/wp/v2/posts.json');
    expect(url('wp/v2/posts/101?_embed=1')).toBe(
      './mocks/wp-json/wp/v2/posts/101.json?_embed=1',
    );
  });

  it('exposes the resolved baseUrl and mock flag', () => {
    expect(wp.baseUrl).toBe('./mocks/wp-json');
    expect(wp.isMock).toBe(true);
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
