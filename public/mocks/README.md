# Mock WordPress REST fixtures

The dev server (and Playwright `vite preview`) serve these static JSON files at `/mocks/wp-json/...`. The directory layout mirrors the real WP REST URL shape so the client code in `src/lib/wp.js` doesn't know whether it's hitting mock or live data — only the base URL differs.

Default in `.env.example`: `VITE_WP_BASE_URL=/mocks/wp-json`. Override in `.env.local` with a real WP site URL when you want live data.

## What's here

- `wp/v2/categories.json` — 6 categories.
- `wp/v2/pages.json` + `wp/v2/pages/{id}.json` — 3 pages (About, Colophon, Contact).
- `wp/v2/posts.json` + `wp/v2/posts/{id}.json` — 6 posts across Workbench, Demos, Hardware, AROS categories. IDs 101–106.
- `wp/v2/media/1.json` — one featured-media record.
- `menus/v1/menus/primary.json` — primary nav menu in WP-REST-API V2 Menus plugin shape.

Posts that have a featured image inline a `_embedded` block so the same JSON file works whether the client sends `?_embed` or not (static servers ignore query strings).

## Updating

Edit the JSON by hand. Keep the response shape aligned with WordPress core REST (and the V2 Menus plugin for `menus/v1/`). Real WP responses include many extra fields; the fixtures keep only the ones this app reads.
