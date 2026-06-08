// Classic Amiga display modes. Maps a stable id to SAE's video config
// triplet (hresolution, vresolution, ntsc) + the canvas size the OS
// expects to draw into. The host canvas runs `image-rendering: pixelated`
// so integer multiples stay sharp on HiDPI screens.
//
// SAE constants (from public/vendor/sae/sae/config.js):
//   HResolution: LoRes=0, HiRes=1, SuperHiRes=2
//   VResolution: NonDouble=0, Double=1 (interlace doubling)

export const HRES_LORES = 0;
export const HRES_HIRES = 1;
export const HRES_SUPERHIRES = 2;
export const VRES_NONDOUBLE = 0;
export const VRES_DOUBLE = 1;

export const SCREEN_MODES = [
  // ─── Standard / Gaming (15 kHz) ─────────────────────────────────
  {
    id: 'lores-ntsc',
    group: 'Standard',
    label: 'Low-Res NTSC',
    width: 320,
    height: 200,
    hres: HRES_LORES,
    vres: VRES_NONDOUBLE,
    ntsc: true,
  },
  {
    id: 'lores-pal',
    group: 'Standard',
    label: 'Low-Res PAL',
    width: 320,
    height: 256,
    hres: HRES_LORES,
    vres: VRES_NONDOUBLE,
    ntsc: false,
  },
  {
    id: 'hires-ntsc',
    group: 'Standard',
    label: 'High-Res NTSC',
    width: 640,
    height: 200,
    hres: HRES_HIRES,
    vres: VRES_NONDOUBLE,
    ntsc: true,
  },
  {
    id: 'hires-pal',
    group: 'Standard',
    label: 'High-Res PAL',
    width: 640,
    height: 256,
    hres: HRES_HIRES,
    vres: VRES_NONDOUBLE,
    ntsc: false,
  },
  // ─── Productivity / Workbench ───────────────────────────────────
  {
    id: 'hires-laced-ntsc',
    group: 'Productivity',
    label: 'High-Res Laced NTSC',
    width: 640,
    height: 400,
    hres: HRES_HIRES,
    vres: VRES_DOUBLE,
    ntsc: true,
  },
  {
    id: 'hires-laced-pal',
    group: 'Productivity',
    label: 'High-Res Laced PAL',
    width: 640,
    height: 512,
    hres: HRES_HIRES,
    vres: VRES_DOUBLE,
    ntsc: false,
  },
  {
    id: 'super-hires',
    group: 'Productivity',
    label: 'Super High-Res',
    width: 1280,
    height: 256,
    hres: HRES_SUPERHIRES,
    vres: VRES_NONDOUBLE,
    ntsc: false,
  },
  {
    id: 'super-hires-laced',
    group: 'Productivity',
    label: 'Super High-Res Laced',
    width: 1280,
    height: 512,
    hres: HRES_SUPERHIRES,
    vres: VRES_DOUBLE,
    ntsc: false,
  },
];

export const SCREEN_MODE_BY_ID = new Map(SCREEN_MODES.map((m) => [m.id, m]));

export function getScreenMode(id) {
  return SCREEN_MODE_BY_ID.get(id) ?? SCREEN_MODE_BY_ID.get('hires-laced-pal');
}
