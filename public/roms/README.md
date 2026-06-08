# ROMs (gitignored)

This directory is gitignored — drop your own ROM/disk files here. The repo ships without binaries so anyone can fork without inheriting third-party assets.

The default `.env.local` (also gitignored) references:

```
VITE_KICKSTART_URL=./roms/aros-rom.bin
VITE_KICKSTART_EXT_URL=./roms/aros-ext.bin
VITE_BOOT_FLOPPY_URL=./roms/aros-bootdisk.adf
```

## Free AROS m68k assets

All GPL, redistributable. Grab the latest nightly from `https://sourceforge.net/projects/aros/files/nightly2/` and pick the m68k builds:

- `AROS-<date>-amiga-m68k-boot-iso.zip` — extract the iso, then extract `boot/amiga/aros-rom.bin` + `boot/amiga/aros-ext.bin`.
- `AROS-<date>-amiga-m68k-boot-floppy.lha` — extract `bootdisk-amiga-m68k.adf`.

Drop the three files in here renamed to:
- `aros-rom.bin`
- `aros-ext.bin`
- `aros-bootdisk.adf`

Rebuild (`npm run build`) and the emulator boots AROS Workbench to the "insert CD" prompt. A full Workbench HDF (Phase 2) replaces the "insert CD" state with the actual desktop.
