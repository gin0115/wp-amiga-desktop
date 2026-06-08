// IndexedDB-backed shadow store for disk images. Lets the user keep their
// Workbench writes across reloads without bloating localStorage.
//
// Layout:
//   db = 'amiga-disk-shadows', store = 'images'
//   key = `${slot}|${source}` — e.g. "df0|./roms/aros-bootdisk.adf"
//   value = { name, data: ArrayBuffer, savedAt }
//
// Reset = delete the key. Next mount reads fresh from source.

const DB_NAME = 'amiga-disk-shadows';
const STORE = 'images';
const VERSION = 1;

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).catch((e) => {
    dbPromise = null;
    throw e;
  });
  return dbPromise;
}

export async function _resetDb() {
  if (dbPromise) {
    try {
      const db = await dbPromise;
      db.close();
    } catch {
      /* never opened */
    }
    dbPromise = null;
  }
}

export function shadowKey(slot, source) {
  return `${slot}|${source ?? ''}`;
}

export async function putShadow(slot, source, name, data) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const buf = data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    );
    store.put(
      { name, data: buf, savedAt: Date.now() },
      shadowKey(slot, source),
    );
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getShadow(slot, source) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(shadowKey(slot, source));
    req.onsuccess = () => {
      const rec = req.result;
      if (!rec) return resolve(null);
      resolve({
        name: rec.name,
        data: new Uint8Array(rec.data),
        savedAt: rec.savedAt,
      });
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteShadow(slot, source) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(shadowKey(slot, source));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listShadows() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.openCursor();
    const out = [];
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return resolve(out);
      out.push({
        key: cursor.key,
        name: cursor.value.name,
        size: cursor.value.data.byteLength,
        savedAt: cursor.value.savedAt,
      });
      cursor.continue();
    };
    req.onerror = () => reject(req.error);
  });
}
