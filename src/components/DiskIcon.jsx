import { useStore } from '../store.js';

/**
 * One Workbench-style desktop icon. Renders a glyph + label and opens the
 * supplied window descriptor on double-click. Single-click is the future
 * "select" affordance (no-op for now).
 *
 * Glyph variants:
 *   - 'page'      | a folded sheet of paper (for WP pages)
 *   - 'drawer'    | a closed file drawer (for WP categories)
 *   - 'disk'      | a 3.5" disk (used by special icons like Workbench/Ram Disk)
 */
export default function DiskIcon({ glyph, label, window: win, testId }) {
  const openWindow = useStore((s) => s.openWindow);
  const handleDouble = () => openWindow(win);

  return (
    <button
      type="button"
      className="disk-icon"
      data-testid={testId}
      onDoubleClick={handleDouble}
    >
      <Glyph kind={glyph} />
      <span className="disk-icon-label">{label}</span>
    </button>
  );
}

function Glyph({ kind }) {
  if (kind === 'drawer') {
    return (
      <svg
        viewBox="0 0 40 32"
        className="disk-glyph"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="1" y="6" width="38" height="22" fill="#ffd277" stroke="#000" />
        <rect x="1" y="6" width="38" height="4" fill="#aa7700" stroke="#000" />
        <rect x="14" y="2" width="12" height="6" fill="#ffd277" stroke="#000" />
      </svg>
    );
  }
  if (kind === 'disk') {
    return (
      <svg
        viewBox="0 0 40 32"
        className="disk-glyph"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="2" y="2" width="36" height="28" fill="#fff" stroke="#000" />
        <rect x="10" y="2" width="20" height="10" fill="#aaa" stroke="#000" />
        <rect x="14" y="3" width="2" height="8" fill="#000" />
      </svg>
    );
  }
  // 'page' default
  return (
    <svg
      viewBox="0 0 40 32"
      className="disk-glyph"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 1 H28 L34 7 V31 H6 Z" fill="#fff" stroke="#000" />
      <path d="M28 1 V7 H34" fill="none" stroke="#000" />
      <line x1="10" y1="14" x2="28" y2="14" stroke="#000" />
      <line x1="10" y1="19" x2="28" y2="19" stroke="#000" />
      <line x1="10" y1="24" x2="22" y2="24" stroke="#000" />
    </svg>
  );
}
