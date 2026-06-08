// Disk-image helpers: read uploaded files into Uint8Arrays, generate
// blank ADF/HDF, trigger downloads of the current in-memory buffer.

export const ADF_DD_BYTES = 880 * 1024; // 901120 standard DD floppy
export const ADF_HD_BYTES = 1760 * 1024;

export function fileToUint8Array(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(new Uint8Array(r.result));
    r.onerror = () => reject(r.error);
    r.readAsArrayBuffer(file);
  });
}

/**
 * Empty, unformatted DD ADF (~880 KB of zeros). The user is expected to
 * boot Workbench and run `Format DF1:` to make it usable. A bootblock
 * could be written here but it's noise — let the OS lay it down.
 */
export function createBlankAdf(sizeBytes = ADF_DD_BYTES) {
  return new Uint8Array(sizeBytes);
}

/**
 * Empty hardfile. SAE's autoconfig sees the geometry from the buffer's
 * length; the OS HDToolbox / WB Format make it usable.
 */
export function createBlankHdf(sizeMb = 100) {
  return new Uint8Array(sizeMb * 1024 * 1024);
}

export function downloadBuffer(buf, filename) {
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so the click chain finishes the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Slot ↔ SAE config path resolver. Returns the live config sub-object
 * for the given slot id, or null when the SAE instance isn't ready.
 *
 *   df0..df3  → cfg.floppy.drive[N].file
 *   dh0..dh1  → cfg.hardfile.drive[N].file
 */
export function configFileForSlot(sae, slot) {
  if (!sae) return null;
  const cfg = sae.getConfig?.();
  if (!cfg) return null;
  const m = /^(df|dh)(\d)$/.exec(slot);
  if (!m) return null;
  const [, kind, n] = m;
  const idx = Number(n);
  if (kind === 'df') return cfg.floppy?.drive?.[idx]?.file ?? null;
  if (kind === 'dh') return cfg.hardfile?.drive?.[idx]?.file ?? null;
  return null;
}

/**
 * Mount a Uint8Array into the given slot. For floppy drives we also notify
 * SAE of the disk change so it reads the new one immediately. Hardfile
 * mounts only take effect on power cycle — caller's responsibility to warn.
 */
export function mountSlot(sae, slot, name, data) {
  const target = configFileForSlot(sae, slot);
  if (!target) return false;
  target.name = name;
  target.data = data;
  target.size = data.byteLength;
  // Floppy live-swap
  if (slot.startsWith('df') && typeof sae.insert === 'function') {
    sae.insert(Number(slot.slice(2)));
  }
  return true;
}

export function ejectSlot(sae, slot) {
  const target = configFileForSlot(sae, slot);
  if (!target) return false;
  target.name = '';
  target.data = null;
  target.size = 0;
  if (slot.startsWith('df') && typeof sae.eject === 'function') {
    sae.eject(Number(slot.slice(2)));
  }
  return true;
}
