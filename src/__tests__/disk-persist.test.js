import { describe, it, expect, beforeEach } from 'vitest';
import {
  shadowKey,
  putShadow,
  getShadow,
  deleteShadow,
  listShadows,
  _resetDb,
} from '../lib/disk-persist.js';

// Close any open db connection, then drop the database so the next test
// starts clean.
beforeEach(async () => {
  await _resetDb();
  await new Promise((resolve) => {
    const req = indexedDB.deleteDatabase('amiga-disk-shadows');
    req.onsuccess = req.onerror = req.onblocked = () => resolve();
  });
});

describe('disk-persist', () => {
  it('shadowKey is deterministic and slot-aware', () => {
    expect(shadowKey('df0', './foo.adf')).toBe('df0|./foo.adf');
    expect(shadowKey('dh0', null)).toBe('dh0|');
  });

  it('put then get round-trips the data', async () => {
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    await putShadow('df0', './a.adf', 'a.adf', data);
    const out = await getShadow('df0', './a.adf');
    expect(out.name).toBe('a.adf');
    expect(out.savedAt).toBeTypeOf('number');
    expect(out.data).toBeInstanceOf(Uint8Array);
    expect(Array.from(out.data)).toEqual([1, 2, 3, 4, 5]);
  });

  it('getShadow returns null when nothing is stored', async () => {
    expect(await getShadow('df0', './nope')).toBe(null);
  });

  it('deleteShadow removes the entry', async () => {
    const data = new Uint8Array([9]);
    await putShadow('df1', 's', 'd', data);
    expect(await getShadow('df1', 's')).not.toBe(null);
    await deleteShadow('df1', 's');
    expect(await getShadow('df1', 's')).toBe(null);
  });

  it('put overwrites by key', async () => {
    await putShadow('df0', 's', 'v1', new Uint8Array([1]));
    await putShadow('df0', 's', 'v2', new Uint8Array([2, 2]));
    const out = await getShadow('df0', 's');
    expect(out.name).toBe('v2');
    expect(out.data.byteLength).toBe(2);
  });

  it('listShadows returns metadata for all stored entries', async () => {
    await putShadow('df0', 'a', 'a.adf', new Uint8Array(3));
    await putShadow('df1', 'b', 'b.adf', new Uint8Array(5));
    const list = await listShadows();
    expect(list.length).toBe(2);
    expect(list.map((e) => e.size).sort()).toEqual([3, 5]);
  });
});
