import { describe, it, expect, vi } from 'vitest';
import {
  ADF_DD_BYTES,
  createBlankAdf,
  createBlankHdf,
  configFileForSlot,
  mountSlot,
  ejectSlot,
} from '../lib/disk-tools.js';

describe('disk-tools', () => {
  it('createBlankAdf returns 880KB zeros by default', () => {
    const adf = createBlankAdf();
    expect(adf).toBeInstanceOf(Uint8Array);
    expect(adf.byteLength).toBe(ADF_DD_BYTES);
    expect(adf[0]).toBe(0);
  });

  it('createBlankHdf scales with sizeMb', () => {
    const small = createBlankHdf(2);
    expect(small.byteLength).toBe(2 * 1024 * 1024);
  });

  function fakeSae() {
    return {
      insertCount: 0,
      ejectCount: 0,
      cfg: {
        floppy: {
          drive: [0, 1, 2, 3].map(() => ({ file: {} })),
        },
        hardfile: {
          drive: [0, 1].map(() => ({ file: {} })),
        },
      },
      getConfig() {
        return this.cfg;
      },
      insert(n) {
        this.insertCount++;
        this.lastInsert = n;
      },
      eject(n) {
        this.ejectCount++;
        this.lastEject = n;
      },
    };
  }

  it('configFileForSlot resolves the matching cfg sub-object', () => {
    const sae = fakeSae();
    expect(configFileForSlot(sae, 'df0')).toBe(sae.cfg.floppy.drive[0].file);
    expect(configFileForSlot(sae, 'df3')).toBe(sae.cfg.floppy.drive[3].file);
    expect(configFileForSlot(sae, 'dh1')).toBe(sae.cfg.hardfile.drive[1].file);
    expect(configFileForSlot(sae, 'bogus')).toBe(null);
    expect(configFileForSlot(null, 'df0')).toBe(null);
  });

  it('mountSlot writes name/data/size + calls sae.insert for floppies', () => {
    const sae = fakeSae();
    const data = new Uint8Array(880 * 1024);
    expect(mountSlot(sae, 'df1', 'game.adf', data)).toBe(true);
    const slot = sae.cfg.floppy.drive[1].file;
    expect(slot.name).toBe('game.adf');
    expect(slot.size).toBe(data.byteLength);
    expect(slot.data).toBe(data);
    expect(sae.insertCount).toBe(1);
    expect(sae.lastInsert).toBe(1);
  });

  it('mountSlot on hardfile does NOT call sae.insert (power-cycle required)', () => {
    const sae = fakeSae();
    const data = new Uint8Array(1024);
    expect(mountSlot(sae, 'dh0', 'work.hdf', data)).toBe(true);
    expect(sae.insertCount).toBe(0);
    expect(sae.cfg.hardfile.drive[0].file.name).toBe('work.hdf');
  });

  it('ejectSlot clears the slot and notifies SAE for floppies', () => {
    const sae = fakeSae();
    sae.cfg.floppy.drive[2].file = { name: 'x.adf', data: new Uint8Array(1), size: 1 };
    expect(ejectSlot(sae, 'df2')).toBe(true);
    expect(sae.cfg.floppy.drive[2].file).toMatchObject({ name: '', size: 0 });
    expect(sae.cfg.floppy.drive[2].file.data).toBe(null);
    expect(sae.ejectCount).toBe(1);
    expect(sae.lastEject).toBe(2);
  });
});
