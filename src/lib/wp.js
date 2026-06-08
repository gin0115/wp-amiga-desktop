const BASE = (import.meta.env?.VITE_WP_BASE_URL ?? '/mocks/wp-json').replace(
  /\/+$/,
  '',
);

function url(path) {
  const clean = String(path).replace(/^\/+/, '');
  return `${BASE}/${clean}`;
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
  categories: () => getJson('wp/v2/categories'),
  pages: () => getJson('wp/v2/pages'),
  page: (id) => getJson(`wp/v2/pages/${id}`),
  posts: () => getJson('wp/v2/posts'),
  post: (id) => getJson(`wp/v2/posts/${id}?_embed=1`),
  primaryMenu: () => getJson('menus/v1/menus/primary'),
};

export const _internal = { url, getJson };
