import { useEffect } from 'react';
import { useStore } from '../store.js';
import DriveControl from './DriveControl.jsx';

const SLOT_TITLES = {
  df0: 'DF0:  (Floppy)',
  df1: 'DF1:  (Floppy)',
  df2: 'DF2:  (Floppy)',
  df3: 'DF3:  (Floppy)',
  dh0: 'DH0:  (Hardfile)',
  dh1: 'DH1:  (Hardfile)',
};

/**
 * The control modal for the emulator panel. Rendered as a child of
 * BackScreen so it sits over the emulator output and is bounded by the
 * back screen — NEVER routes through the front-screen WindowManager.
 * Closes on Esc and on a click on the dimmed backdrop.
 */
export default function BackScreenModal() {
  const slot = useStore((s) => s.backModalSlot);
  const closeBackModal = useStore((s) => s.closeBackModal);

  useEffect(() => {
    if (!slot) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') closeBackModal();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [slot, closeBackModal]);

  if (!slot) return null;
  if (slot === 'power') return null; // PWR gadget acts directly, no modal

  return (
    <div
      className="back-modal-backdrop"
      data-testid="back-modal"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeBackModal();
      }}
    >
      <div className="back-modal" data-testid={`back-modal-${slot}`}>
        <div className="back-modal-titlebar">
          <span className="back-modal-title">
            {SLOT_TITLES[slot] ?? slot}
          </span>
          <button
            type="button"
            className="back-modal-close"
            data-testid="back-modal-close"
            aria-label="Close"
            onClick={closeBackModal}
          >
            ×
          </button>
        </div>
        <div className="back-modal-body">
          <DriveControl slot={slot} />
        </div>
      </div>
    </div>
  );
}
