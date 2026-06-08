import { useRef, useState } from 'react';
import { useStore } from '../store.js';
import { useLibrary } from '../hooks/useLibrary.js';
import {
  fileToUint8Array,
  createBlankAdf,
  createBlankHdf,
  downloadBuffer,
  configFileForSlot,
  mountSlot,
  ejectSlot,
} from '../lib/disk-tools.js';
import { deleteShadow, getShadow } from '../lib/disk-persist.js';

/**
 * Per-slot drive control panel. Rendered inside a BackScreenModal — does
 * NOT live in the front-screen WindowManager. Wraps insert / new blank /
 * save / eject / reset-shadow plus a compact "From library" picker
 * filtered to the slot's compatible disk kinds.
 */
export default function DriveControl({ slot }) {
  const sae = useStore((s) => s.saeRef);
  const drive = useStore((s) => s.drives[slot]);
  const setDriveName = useStore((s) => s.setDriveName);

  const isFloppy = slot.startsWith('df');
  const expectedKind = isFloppy ? 'adf' : 'hdf';
  const accept = isFloppy ? '.adf,.dms' : '.hdf,.hda,.img';

  const fileRef = useRef(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy('insert');
    setError(null);
    try {
      const data = await fileToUint8Array(file);
      if (mountSlot(sae, slot, file.name, data)) {
        setDriveName(slot, file.name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
      e.target.value = '';
    }
  };

  const onEject = () => {
    if (ejectSlot(sae, slot)) setDriveName(slot, null);
  };

  const onBlank = () => {
    const data = isFloppy ? createBlankAdf() : createBlankHdf(100);
    const name = isFloppy ? 'blank.adf' : 'blank.hdf';
    if (mountSlot(sae, slot, name, data)) setDriveName(slot, name);
  };

  const onSave = () => {
    const target = configFileForSlot(sae, slot);
    if (!target?.data) return;
    downloadBuffer(target.data, target.name || `${slot}.bin`);
  };

  const onResetShadow = async () => {
    if (!drive?.source) return;
    await deleteShadow(slot, drive.source).catch(() => {});
  };

  async function onMountLibraryItem(item) {
    setBusy(`lib:${item.id}`);
    setError(null);
    try {
      let data = null;
      try {
        const shadow = await getShadow(slot, item.url);
        if (shadow?.data) data = shadow.data;
      } catch {
        /* IDB unavailable */
      }
      if (!data) {
        const res = await fetch(item.url);
        if (!res.ok) throw new Error(`Fetch ${item.url} → ${res.status}`);
        data = new Uint8Array(await res.arrayBuffer());
      }
      if (mountSlot(sae, slot, item.title, data)) {
        setDriveName(slot, item.title, item.url);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="drive-control" data-testid={`drive-control-${slot}`}>
      <p className="drive-control-note">
        {isFloppy
          ? 'Floppy swaps apply immediately (sae.insert).'
          : 'Hardfile swaps need a power-cycle to remount.'}
      </p>

      <div className="drive-control-row">
        <span className="drive-control-label">Mounted:</span>
        <span className="drive-control-name">{drive?.name ?? <em>empty</em>}</span>
        {drive?.dirty && (
          <span className="drive-control-dirty" title="Modified since insert">
            *
          </span>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={onFileChange}
        style={{ display: 'none' }}
        data-testid={`drive-file-input-${slot}`}
      />

      <div className="drive-control-actions">
        <button
          type="button"
          onClick={onPickFile}
          disabled={!sae || busy === 'insert'}
          data-testid={`drive-insert-${slot}`}
        >
          Insert local…
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen((v) => !v)}
          disabled={!sae}
          data-testid={`drive-library-${slot}`}
          aria-expanded={libraryOpen}
        >
          {libraryOpen ? 'Hide library' : 'From library…'}
        </button>
        <button
          type="button"
          onClick={onBlank}
          disabled={!sae}
          data-testid={`drive-blank-${slot}`}
        >
          New blank
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!sae || !drive?.name}
          data-testid={`drive-save-${slot}`}
        >
          Save…
        </button>
        <button
          type="button"
          onClick={onEject}
          disabled={!sae || !drive?.name}
          data-testid={`drive-eject-${slot}`}
        >
          Eject
        </button>
        <button
          type="button"
          onClick={onResetShadow}
          disabled={!drive?.source}
          data-testid={`drive-reset-${slot}`}
          title="Delete persisted writes for this disk so it reloads fresh next boot"
        >
          Reset shadow
        </button>
      </div>

      {libraryOpen && (
        <LibraryPicker
          slot={slot}
          expectedKind={expectedKind}
          onMount={onMountLibraryItem}
          busyKey={busy}
        />
      )}

      {error && <p className="drive-control-error">{error}</p>}
    </div>
  );
}

function LibraryPicker({ slot, expectedKind, onMount, busyKey }) {
  const { data, isLoading, isError } = useLibrary();
  if (isLoading) return <p className="drive-control-status">Loading library…</p>;
  if (isError) {
    return (
      <p className="drive-control-status">
        Library manifest unreachable.
      </p>
    );
  }
  const items = (data?.items ?? []).filter(
    (item) => (item.kind ?? '').toLowerCase() === expectedKind,
  );
  if (items.length === 0) {
    return (
      <p className="drive-control-status">
        No <code>.{expectedKind}</code> items in <code>library/manifest.json</code>.
      </p>
    );
  }
  return (
    <ul className="library-picker" data-testid={`library-picker-${slot}`}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            className="library-picker-item"
            data-testid={`library-pick-${slot}-${item.id}`}
            disabled={busyKey === `lib:${item.id}`}
            onClick={() => onMount(item)}
            title={item.description}
          >
            <span className="library-picker-title">{item.title}</span>
            <span className="library-picker-meta">
              {item.category || 'misc'}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
