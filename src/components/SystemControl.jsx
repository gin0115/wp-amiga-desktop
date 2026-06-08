import { useStore } from '../store.js';
import { useLibrary } from '../hooks/useLibrary.js';
import { SCREEN_MODES } from '../lib/screen-modes.js';

const FIELDS = [
  {
    field: 'kickstartUrl',
    label: 'Kickstart ROM',
    kind: 'rom',
    note: 'AROS m68k or a Kickstart 1.3 / 3.1 you own. Required.',
  },
  {
    field: 'kickstartExtUrl',
    label: 'Kickstart Extension',
    kind: 'rom',
    note: 'AROS needs this. Real Commodore Kickstarts ignore it.',
  },
  {
    field: 'bootFloppyUrl',
    label: 'Boot Floppy (DF0:)',
    kind: 'adf',
    note: 'Mounted in DF0: at boot. Optional.',
  },
  {
    field: 'hdfUrl',
    label: 'Boot Hardfile (DH0:)',
    kind: 'hdf',
    note: 'Mounted in DH0:. Optional. Power-cycle to remount.',
  },
];

/**
 * Power gadget modal content. Power off + per-source picker so the user can
 * swap Kickstart / extension / boot floppy / HDF at runtime and reboot the
 * emulator. Picker draws from library/manifest.json filtered to each source's
 * compatible kind.
 */
export default function SystemControl() {
  const system = useStore((s) => s.system);
  const setSystemSource = useStore((s) => s.setSystemSource);
  const setScreenMode = useStore((s) => s.setScreenMode);
  const cyclePower = useStore((s) => s.cyclePower);
  const powerOff = useStore((s) => s.powerOff);
  const closeBackModal = useStore((s) => s.closeBackModal);
  const status = useStore((s) => s.saeStatus);

  const { data, isLoading, isError } = useLibrary();
  const allItems = data?.items ?? [];

  const onPick = (field, url) => {
    setSystemSource(field, url || null);
    if (status === 'running' || status === 'loading') {
      cyclePower();
    }
  };

  const onPickMode = (modeId) => {
    setScreenMode(modeId);
    if (status === 'running' || status === 'loading') {
      cyclePower();
    }
  };

  const groupedModes = SCREEN_MODES.reduce((acc, m) => {
    if (!acc.has(m.group)) acc.set(m.group, []);
    acc.get(m.group).push(m);
    return acc;
  }, new Map());

  const onPowerOff = () => {
    powerOff();
    closeBackModal();
  };

  return (
    <div className="system-control" data-testid="system-control">
      <p className="drive-control-note">
        Switch a source and the emulator power-cycles to boot from the new
        image. Power off to stop the emulator.
      </p>

      <div className="drive-control-actions">
        <button
          type="button"
          onClick={onPowerOff}
          data-testid="system-power-off"
        >
          Power off
        </button>
      </div>

      {isLoading && (
        <p className="drive-control-status">Loading library…</p>
      )}
      {isError && (
        <p className="drive-control-status">
          Library manifest unreachable.
        </p>
      )}

      {FIELDS.map(({ field, label, kind, note }) => (
        <SourceRow
          key={field}
          field={field}
          label={label}
          note={note}
          current={system[field]}
          options={allItems.filter(
            (item) => (item.kind ?? '').toLowerCase() === kind,
          )}
          onPick={onPick}
        />
      ))}

      <fieldset className="system-row" data-testid="system-row-screen-mode">
        <legend>Screen Mode</legend>
        <p className="system-row-note">
          Classic Amiga display modes. Switching reboots the emulator.
        </p>
        {[...groupedModes.entries()].map(([group, modes]) => (
          <div
            key={group}
            className="system-row-mode-group"
            data-testid={`system-mode-group-${group.toLowerCase()}`}
          >
            <strong>{group}</strong>
            <div className="system-row-options">
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`system-row-pick ${
                    system.screenModeId === m.id ? 'is-current' : ''
                  }`}
                  data-testid={`system-mode-${m.id}`}
                  onClick={() => onPickMode(m.id)}
                  title={`${m.width}×${m.height}`}
                >
                  {m.label}
                  <span className="system-mode-dim">
                    {' '}
                    {m.width}×{m.height}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </fieldset>
    </div>
  );
}

function SourceRow({ field, label, note, current, options, onPick }) {
  const currentLabel =
    options.find((o) => o.url === current)?.title ?? current ?? '(unset)';

  return (
    <fieldset className="system-row" data-testid={`system-row-${field}`}>
      <legend>{label}</legend>
      <p className="system-row-note">{note}</p>
      <p className="system-row-current">
        Current: <code>{shorten(currentLabel)}</code>
      </p>
      <div className="system-row-options">
        {options.length === 0 ? (
          <p className="drive-control-status">
            No matching items in library/manifest.json.
          </p>
        ) : (
          options.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`system-row-pick ${
                current === item.url ? 'is-current' : ''
              }`}
              data-testid={`system-pick-${field}-${item.id}`}
              onClick={() => onPick(field, item.url)}
              title={item.description}
            >
              {item.title}
            </button>
          ))
        )}
      </div>
    </fieldset>
  );
}

function shorten(s) {
  if (!s) return '(unset)';
  if (s.length <= 38) return s;
  return `…${s.slice(-37)}`;
}
