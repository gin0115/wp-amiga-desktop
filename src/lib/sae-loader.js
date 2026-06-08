// Imperative bootstrap for SAE (Scripted Amiga Emulator) — vendored under
// /public/vendor/sae/. Loads the 28 source files in order, fetches the
// Kickstart ROM (and optionally the HDF), and starts the emulator into the
// supplied DOM container.
//
// Phase 1 ships the wiring but expects the user to supply ROM + HDF URLs
// via VITE_KICKSTART_URL and VITE_HDF_URL env vars. Without those URLs
// SAE-load is skipped and the back screen surfaces a clear message.

// Relative so it resolves against the deployed sub-path (e.g. /amiga/)
// against the document base URL — same trick as wp.js and Vite's `base`.
const SAE_BASE = './vendor/sae';
const SAE_FILES = [
  'prototypes',
  'utils',
  'dms',
  'config',
  'roms',
  'memory',
  'autoconf',
  'expansion',
  'events',
  'gayle',
  'ide',
  'filesys',
  'hardfile',
  'dongle',
  'input',
  'serpar',
  'custom',
  'blitter',
  'copper',
  'playfield',
  'video',
  'audio',
  'cia',
  'disk',
  'rtc',
  'm68k',
  'cpu',
  'amiga',
];

let saeLoadPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-sae-src="${src}"]`);
    if (existing) return resolve();
    const tag = document.createElement('script');
    tag.src = src;
    tag.async = false; // preserve declared order
    tag.dataset.saeSrc = src;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error(`SAE script failed: ${src}`));
    document.head.appendChild(tag);
  });
}

export function loadSaeScripts() {
  if (saeLoadPromise) return saeLoadPromise;
  saeLoadPromise = (async () => {
    for (const f of SAE_FILES) {
      await loadScript(`${SAE_BASE}/sae/${f}.js`);
    }
  })().catch((e) => {
    saeLoadPromise = null;
    throw e;
  });
  return saeLoadPromise;
}

async function fetchAsUint8(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  const total = Number(res.headers.get('content-length')) || 0;
  if (!total || !res.body?.getReader) {
    const buf = new Uint8Array(await res.arrayBuffer());
    onProgress?.(1);
    return buf;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress?.(received / total);
  }
  const out = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

export async function startSae({
  container,
  kickstartUrl,
  kickstartExtUrl,
  bootFloppyUrl,
  hdfUrl,
  onProgress,
}) {
  if (!kickstartUrl) {
    throw Object.assign(
      new Error(
        'No VITE_KICKSTART_URL configured. Drop an AROS Kickstart ROM URL in .env.local to boot the emulator.',
      ),
      { code: 'NO_KICKSTART' },
    );
  }
  await loadSaeScripts();
  // ScriptedAmigaEmulator is a top-level `function` so it lands on
  // globalThis. The SAEC_* constants are declared `const` and DON'T —
  // they stay script-scoped. Use literal numeric values from
  // public/vendor/sae/sae/config.js: SAEC_Model_A1200 = 5,
  // SAEC_Config_Video_API_Canvas = 0, _HiRes = 1, _Double = 1.
  const { ScriptedAmigaEmulator } = globalThis;
  if (typeof ScriptedAmigaEmulator !== 'function') {
    throw new Error('SAE scripts did not register ScriptedAmigaEmulator');
  }
  const SAE_MODEL_A1200 = 5;
  const SAE_VIDEO_API_CANVAS = 0;
  const SAE_HRES_HIRES = 1;
  const SAE_VRES_DOUBLE = 1;
  const SAE_ERR_NONE = 0;

  const onSubProgress = (slice, base) =>
    onProgress
      ? (p) => onProgress(base + slice * p)
      : undefined;

  // Allocate ROM (small), extension ROM (small, AROS-specific), and
  // optional HDF (large) in parallel; progress is fed back as 0..1.
  const romP = fetchAsUint8(kickstartUrl, onSubProgress(0.15, 0));
  const extP = kickstartExtUrl
    ? fetchAsUint8(kickstartExtUrl, onSubProgress(0.15, 0.15))
    : Promise.resolve(null);
  const floppyP = bootFloppyUrl
    ? fetchAsUint8(bootFloppyUrl, onSubProgress(0.2, 0.3))
    : Promise.resolve(null);
  const hdfP = hdfUrl
    ? fetchAsUint8(hdfUrl, onSubProgress(0.5, 0.5))
    : Promise.resolve(null);
  const [rom, ext, floppy, hdf] = await Promise.all([romP, extP, floppyP, hdfP]);

  // Ensure the container has a stable DOM id SAE can target.
  if (!container.id) container.id = 'sae-host';

  const sae = new ScriptedAmigaEmulator();
  const cfg = sae.getConfig();
  sae.setModel(SAE_MODEL_A1200, null);
  // SAE identifies ROMs by CRC32. Use its own SAEF_crc32 helper (top-level
  // function declaration so it's available on globalThis).
  const computeCrc = (buf) => {
    const fn = globalThis.SAEF_crc32;
    if (typeof fn !== 'function') return 0;
    return fn(buf, 0, buf.byteLength) >>> 0;
  };
  cfg.memory.rom.name = 'kickstart.rom';
  cfg.memory.rom.data = rom;
  cfg.memory.rom.size = rom.byteLength;
  cfg.memory.rom.crc32 = computeCrc(rom);
  if (ext && cfg.memory?.extRom) {
    cfg.memory.extRom.name = 'kickstart-ext.rom';
    cfg.memory.extRom.data = ext;
    cfg.memory.extRom.size = ext.byteLength;
    cfg.memory.extRom.crc32 = computeCrc(ext);
  }
  if (floppy && cfg.floppy?.drive?.[0]) {
    cfg.floppy.drive[0].file.name = 'bootdisk.adf';
    cfg.floppy.drive[0].file.data = floppy;
    cfg.floppy.drive[0].file.size = floppy.byteLength;
  }
  // Explicit small video config — without this SAE picks up the user's
  // (potentially 4K HiDPI) screen and tries to allocate 3840x2160 buffers,
  // gets clamped, and produces zero frames.
  cfg.video.id = container.id;
  cfg.video.enabled = true;
  cfg.video.api = SAE_VIDEO_API_CANVAS;
  cfg.video.hresolution = SAE_HRES_HIRES;
  cfg.video.vresolution = SAE_VRES_DOUBLE;
  cfg.video.size_win.width = 720;
  cfg.video.size_win.height = 568;
  if (cfg.video.size_fs) {
    cfg.video.size_fs.width = 720;
    cfg.video.size_fs.height = 568;
  }
  cfg.memory.z2FastSize = 2 << 20;

  // Wire SAE's error + lifecycle hooks so silent failures (post-start
  // crashes, ROM mismatch, video element lookup failure) actually surface.
  if (cfg.hook?.log) {
    cfg.hook.log.error = (err, msg) => {
      // eslint-disable-next-line no-console
      console.error('[SAE]', err, msg);
    };
  }
  if (cfg.hook?.event) {
    cfg.hook.event.started = () =>
      console.log('[SAE] started');
    cfg.hook.event.stopped = () =>
      console.log('[SAE] stopped');
  }
  if (cfg.hook?.led) {
    let frames = 0;
    cfg.hook.led.fps = (v) => {
      if (frames++ % 60 === 0) console.log(`[SAE] fps=${v}`);
    };
    cfg.hook.led.power = (v) =>
      console.log(`[SAE] power LED=${v}`);
    cfg.hook.led.df = (n, v) =>
      console.log(`[SAE] DF${n} LED=${v}`);
  }

  if (hdf && cfg.hardfile?.drive?.[0]) {
    cfg.hardfile.drive[0].file.name = 'dh0.hdf';
    cfg.hardfile.drive[0].file.data = hdf;
    cfg.hardfile.drive[0].file.size = hdf.byteLength;
  }

  const err = sae.start();
  if (err !== SAE_ERR_NONE && err !== undefined) {
    throw new Error(`SAE start failed with code ${err}`);
  }
  return sae;
}

export function stopSae(sae) {
  try {
    sae?.stop?.();
  } catch {
    /* ignore */
  }
}
