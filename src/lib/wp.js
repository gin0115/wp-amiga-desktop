// Mock fixtures live as static .json files on disk; real WP REST URLs
// don't carry an extension. We detect mock mode by the base URL containing
// "/mocks/" and append .json (before any query-string) in that case.
//
// Default base is a relative path so the app works at any deploy sub-path
// (e.g. /amiga/) — fetch resolves it against window.location.
const RAW_BASE = import.meta.env?.VITE_WP_BASE_URL ?? './mocks/wp-json';
const BASE = String(RAW_BASE).replace(/\/+$/, '');
const IS_MOCK = /\/mocks(\/|$)/.test(BASE);

function url(path) {
  const clean = String(path).replace(/^\/+/, '');
  const [p, q] = clean.split('?');
  const withExt = IS_MOCK && !/\.[a-z0-9]+$/i.test(p) ? `${p}.json` : p;
  return q ? `${BASE}/${withExt}?${q}` : `${BASE}/${withExt}`;
}

async function getJson(path) {
  const res = await fetch(url(path), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const err = new Error(`WP REST ${res.status} on ${path}`);
    err.status = res.status;
    err.path = path;
    throw err;
  }
  return res.json();
}

export const wp = {
  baseUrl: BASE,
  isMock: IS_MOCK,
  categories: () => getJson('wp/v2/categories'),
  pages: () => getJson('wp/v2/pages'),
  page: (id) => getJson(`wp/v2/pages/${id}`),
  posts: () => getJson('wp/v2/posts'),
  post: (id) => getJson(`wp/v2/posts/${id}?_embed=1`),
  primaryMenu: () => getJson('menus/v1/menus/primary'),
};

export const _internal = { url, getJson };
