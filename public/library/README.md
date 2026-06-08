# Disk library

`manifest.json` lists ADF/HDF/ROM items that show up in the Games & Demos drawer on the Workbench desktop. Clicking an item fetches it and mounts it in the appropriate drive slot.

## Adding items

Drop the file under `public/library/` (or host externally) and append to `manifest.json`:

```json
{
  "id": "state-of-the-art",
  "title": "State of the Art / Spaceballs",
  "category": "Demos",
  "kind": "adf",
  "slot": "df0",
  "url": "./library/state-of-the-art.adf",
  "description": "The 1992 Spaceballs demo. Freely distributable."
}
```

Required fields:
- `id` — unique slug
- `title` — display name
- `category` — `"Games"`, `"Demos"`, `"Tools"`, or any string (used as drawer grouping)
- `kind` — `"adf"`, `"hdf"`, or `"rom"`
- `slot` — target drive (`"df0"`, `"df1"`, `"dh0"` etc.). Floppies hot-swap; hardfiles need a power-cycle.
- `url` — relative or absolute. Same-origin paths under `./library/` ship in the build.

Optional:
- `description` — shown on hover / in the disk's tooltip.

## Bundling vs CDN

For "let others play" deployments, either:
- Drop the file in `public/library/` and `npm run build` — ships in the bundle.
- Or host externally (Cloudflare R2, Backblaze, archive.org) and use the absolute URL — but expect CORS to bite for some hosts.

PD/freeware sources worth checking: Aminet, the Internet Archive's Amiga collection, Pouet.net (demos). Confirm each item is freely distributable before shipping it publicly.
