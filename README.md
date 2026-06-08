# wp-amiga-desktop

A React webapp that frames a remote WordPress site inside an Amiga 1200 Workbench 3.1-styled desktop. Drag the front-screen title bar down to reveal a second screen running SAE (Scripted Amiga Emulator) booted into AROS Workbench.

## Status

Phase 1 — in progress. Tracking by numbered steps; see `docs/screenshots/` for visual progress.

## Toolchain

Node 22 (pinned in `.nvmrc`). Everything else is in `package.json`.

```
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` and adjust:

- `VITE_WP_BASE_URL` — REST base. Defaults to `/mocks/wp-json` (bundled fixtures) so dev works offline. Point at `https://example.com/wp-json` for live WP data.
- `VITE_KICKSTART_URL` — URL of a Kickstart ROM (use a free AROS replacement). Required for the SAE emulator to boot. Without it, clicking the Power gadget on the back screen shows a clear "ROM not configured" Software Failure.
- `VITE_HDF_URL` — URL of an AROS Workbench hardfile (optional). Mounts as DH0:. Skip to boot Kickstart-only.

WP-side requirement for live data: add `Access-Control-Allow-Origin: <app-origin>` headers to `/wp-json/` (a sample mu-plugin will ship later in this repo).

## Tests

```
npm run test       # Vitest component / hook tests
npm run test:e2e   # Playwright e2e + screenshot regeneration
```

E2E specs write screenshots to `docs/screenshots/stepN-<letter>.png`; the index is in `docs/README-screenshots.md`.

## Layout

See `/home/glynn/.claude/plans/squishy-meandering-eclipse.md` for the full Phase 1 plan and architecture.
