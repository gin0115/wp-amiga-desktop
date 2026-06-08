/**
 * Rewrites `/mocks/wp-json/<anything>` -> `/mocks/wp-json/<anything>.json` so
 * the WP REST client can use real-WP URL shapes (no `.json` suffix, optional
 * `?_embed` etc.) in dev and Playwright preview, with the same handler tree
 * mirroring the upstream REST shape.
 */
export default function mockWpJsonPlugin() {
  const prefix = '/mocks/wp-json/';
  const middleware = (req, _res, next) => {
    if (!req.url || !req.url.startsWith(prefix)) return next();
    const [path, query] = req.url.split('?');
    if (/\.[a-z0-9]+$/i.test(path)) return next();
    req.url = `${path}.json${query ? `?${query}` : ''}`;
    next();
  };
  return {
    name: 'mock-wp-json',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
