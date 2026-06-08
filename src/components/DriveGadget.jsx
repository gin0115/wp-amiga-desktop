import { useStore } from '../store.js';

/**
 * One clickable gadget on the back-screen control strip. Renders the drive's
 * icon (state-coloured: dimmed+mono when empty, full colour when mounted),
 * a corner LED that lights red on R/W activity, the slot label, and the
 * mounted filename. Clicking opens that slot's control modal — except for
 * the special 'power' gadget which calls onClick directly (used for power
 * off).
 *
 * Props:
 *   slot      — 'power' | 'df0'..'df3' | 'dh0' | 'dh1'
 *   kind      — 'power' | 'floppy' | 'hardfile'
 *   label     — short text ('PWR' | 'DF0' …)
 *   mounted   — boolean, drives only (power ignores)
 *   name      — mounted filename string or null
 *   active    — true when the LED dot should light (R/W in progress)
 *   onClick   — handler; defaults to openBackModal(slot)
 */
export default function DriveGadget({
  slot,
  kind,
  label,
  mounted = false,
  name,
  active = false,
  onClick,
}) {
  const openBackModal = useStore((s) => s.openBackModal);
  const handleClick = onClick ?? (() => openBackModal(slot));
  const state = mounted || kind === 'power' ? 'mounted' : 'empty';

  return (
    <button
      type="button"
      className={`drive-gadget kind-${kind} state-${state}`}
      data-testid={`gadget-${slot}`}
      data-state={state}
      data-active={active || undefined}
      onClick={handleClick}
      title={name ?? (mounted ? label : 'empty')}
    >
      <span className="drive-gadget-glyph" aria-hidden="true">
        <DriveGlyph kind={kind} />
        <span className="drive-gadget-led" data-on={active || undefined} />
      </span>
      <span className="drive-gadget-label">{label}</span>
      <span className="drive-gadget-name">
        {name ? truncate(name, 10) : 'empty'}
      </span>
    </button>
  );
}

function truncate(s, n) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

function DriveGlyph({ kind }) {
  if (kind === 'power') {
    return (
      <svg viewBox="0 0 32 32" width="28" height="28" focusable="false">
        <circle
          cx="16"
          cy="18"
          r="11"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="55 18"
          transform="rotate(-90 16 16)"
        />
        <line
          x1="16"
          y1="4"
          x2="16"
          y2="16"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === 'hardfile') {
    // Stack of platters seen edge-on
    return (
      <svg viewBox="0 0 32 32" width="28" height="28" focusable="false">
        <rect
          x="3"
          y="8"
          width="26"
          height="16"
          rx="2"
          fill="currentColor"
          opacity="0.85"
        />
        <line x1="3" y1="14" x2="29" y2="14" stroke="#000" strokeWidth="1" />
        <line x1="3" y1="18" x2="29" y2="18" stroke="#000" strokeWidth="1" />
        <line x1="3" y1="22" x2="29" y2="22" stroke="#000" strokeWidth="1" />
        <circle cx="24" cy="11" r="1.2" fill="#000" />
      </svg>
    );
  }
  // Floppy default — 3.5" disk
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" focusable="false">
      <rect x="3" y="3" width="26" height="26" rx="1" fill="currentColor" />
      <rect x="8" y="3" width="16" height="9" fill="#444" />
      <rect x="11" y="4" width="2" height="7" fill="#000" />
      <rect x="9" y="18" width="14" height="9" fill="#ddd" />
    </svg>
  );
}
