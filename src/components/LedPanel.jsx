import { useStore } from '../store.js';
import DriveGadget from './DriveGadget.jsx';

const FLOPPY_SLOTS = [
  { slot: 'df0', label: 'DF0', idx: 0 },
  { slot: 'df1', label: 'DF1', idx: 1 },
  { slot: 'df2', label: 'DF2', idx: 2 },
  { slot: 'df3', label: 'DF3', idx: 3 },
];
const HARDFILE_SLOTS = [
  { slot: 'dh0', label: 'DH0' },
  { slot: 'dh1', label: 'DH1' },
];

/**
 * The back-screen control strip — every drive is a DriveGadget. Click any
 * disk gadget to open its modal (insert/eject/save/blank/reset/library).
 * The power gadget click powers SAE off. FPS is a passive readout on the
 * right. No CD slot — the SAE engine doesn't emulate one.
 */
export default function LedPanel() {
  const status = useStore((s) => s.saeStatus);
  const leds = useStore((s) => s.leds);
  const drives = useStore((s) => s.drives);
  // PWR click opens the System modal — power off + Kickstart/floppy/HDF
  // picker live in there. Drive gadgets open their own per-slot modals
  // via DriveGadget's default openBackModal(slot).
  if (status === 'off') return null;

  return (
    <div className="gadget-panel" data-testid="led-panel">
      <DriveGadget
        slot="power"
        kind="power"
        label="PWR"
        mounted
        active={leds.power}
      />
      {FLOPPY_SLOTS.map(({ slot, label, idx }) => (
        <DriveGadget
          key={slot}
          slot={slot}
          kind="floppy"
          label={label}
          mounted={!!drives[slot]?.name}
          name={drives[slot]?.name}
          active={leds.df[idx]}
        />
      ))}
      {HARDFILE_SLOTS.map(({ slot, label }) => (
        <DriveGadget
          key={slot}
          slot={slot}
          kind="hardfile"
          label={label}
          mounted={!!drives[slot]?.name}
          name={drives[slot]?.name}
          active={leds.hd}
        />
      ))}
      <span className="gadget-fps" data-testid="led-fps">
        {Math.round(leds.fps)} fps
      </span>
    </div>
  );
}
