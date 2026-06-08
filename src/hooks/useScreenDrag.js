import { useEffect, useRef } from 'react';
import { useStore } from '../store.js';

const TITLE_BAR_PX = 24; // keep the title bar always grabbable

/**
 * Free-form, no-snap front-screen pull-down. Attaches pointer handlers to
 * the supplied element (the ScreenTitleBar). Writes `offsetY` to the store
 * via getState() to keep React out of the per-move path, and sets the
 * `--front-offset` CSS variable on the FrontScreen so the transform
 * tracks the pointer 1:1.
 *
 * Drag refuses to start if:
 *   - the pointer-down originated inside an Amiga window
 *     (`data-amiga-window`); the user is moving a window, not the screen.
 *   - a pulldown menu is open; closing it first feels right.
 */
export default function useScreenDrag(handleRef) {
  const stateRef = useRef(null);

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;

    function onDown(e) {
      const store = useStore.getState();
      // Don't fight the menu's own click toggle — refuse drag while open.
      if (store.openMenuId != null) return;
      // Don't intercept clicks on menu titles either (toggles + hover-switch
      // are MenuBar's job).
      if (e.target?.closest?.('[data-testid^="menu-title-"]')) return;
      // And not inside an open Amiga window.
      if (e.target?.closest?.('[data-amiga-window]')) return;
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      stateRef.current = { startY: e.clientY, startOffset: store.offsetY };
      store.setDragging(true);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
      window.addEventListener('pointercancel', onUp, { once: true });
    }

    function onMove(e) {
      const s = stateRef.current;
      if (!s) return;
      const max = window.innerHeight - TITLE_BAR_PX;
      const next = Math.max(0, Math.min(max, s.startOffset + (e.clientY - s.startY)));
      useStore.getState().setOffset(next);
    }

    function onUp() {
      stateRef.current = null;
      useStore.getState().setDragging(false);
      window.removeEventListener('pointermove', onMove);
    }

    el.addEventListener('pointerdown', onDown);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
    };
  }, [handleRef]);
}
