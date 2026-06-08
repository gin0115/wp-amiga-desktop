import { useRef } from 'react';
import { useStore } from '../store.js';
import {
  fileToUint8Array,
  createBlankAdf,
  createBlankHdf,
  downloadBuffer,
  configFileForSlot,
  mountSlot,
  ejectSlot,
} from '../lib/disk-tools.js';

const FLOPPY_SLOTS = ['df0', 'df1', 'df2', 'df3'];
const HARDFILE_SLOTS = ['dh0', 'dh1'];

/**
 * The 'Disks' window: a row per drive slot, each with current image name,
 * insert (file picker), eject, save-as-download, and slot-appropriate
 * blank-image creation. Reads the SAE instance ref out of the store so
 * floppy swaps go through sae.insert(n) live.
 */
export default function DriveSelector() {
  const drives = useStore((s) => s.drives);
  const sae = useStore((s) => s.saeRef);

  return (
    <div className="drive-selector" data-testid="drive-selector">
      <p className="drive-note">
        Floppy swaps take effect immediately. Hardfile swaps need a power-cycle
        (click Power off then Power on) to remount.
      </p>
      <h3>Floppies</h3>
      {FLOPPY_SLOTS.map((slot) => (
        <DriveRow
          key={slot}
          slot={slot}
          kind="floppy"
          drive={drives[slot]}
          sae={sae}
        />
      ))}
      <h3>Hardfiles</h3>
      {HARDFILE_SLOTS.map((slot) => (
        <DriveRow
          key={slot}
          slot={slot}
          kind="hdf"
          drive={drives[slot]}
          sae={sae}
        />
      ))}
    </div>
  );
}

function DriveRow({ slot, kind, drive, sae }) {
  const setDriveName = useStore((s) => s.setDriveName);
  const fileRef = useRef(null);

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await fileToUint8Array(file);
    if (mountSlot(sae, slot, file.name, data)) {
      setDriveName(slot, file.name);
    }
    e.target.value = '';
  };

  const onEject = () => {
    if (ejectSlot(sae, slot)) setDriveName(slot, null);
  };

  const onBlank = () => {
    const data = kind === 'floppy' ? createBlankAdf() : createBlankHdf(100);
    const name = kind === 'floppy' ? 'blank.adf' : 'blank.hdf';
    if (mountSlot(sae, slot, name, data)) setDriveName(slot, name);
  };

  const onSave = () => {
    const target = configFileForSlot(sae, slot);
    if (!target?.data) return;
    downloadBuffer(target.data, target.name || `${slot}.bin`);
  };

  const accept = kind === 'floppy' ? '.adf,.dms' : '.hdf,.hda,.img';

  return (
    <div className="drive-row" data-testid={`drive-row-${slot}`}>
      <span className="drive-row-slot">{slot.toUpperCase()}:</span>
      <span className="drive-row-name">
        {drive?.name ?? <em>empty</em>}
        {drive?.dirty && (
          <span className="drive-row-dirty" title="Modified since insert">
            *
          </span>
        )}
      </span>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={onFileChange}
        style={{ display: 'none' }}
        data-testid={`drive-file-input-${slot}`}
      />
      <button
        type="button"
        onClick={onPickFile}
        disabled={!sae}
        data-testid={`drive-insert-${slot}`}
      >
        Insert…
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
    </div>
  );
}

export const DRIVES_WINDOW = {
  id: 'drives',
  kind: 'drives',
  title: 'Disks',
  x: 220,
  y: 120,
  w: 540,
  h: 420,
};
