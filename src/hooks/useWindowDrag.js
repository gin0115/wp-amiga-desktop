import { useEffect, useRef } from 'react';
import { useStore } from '../store.js';

/**
 * Imperative drag/resize helper for AmigaWindow. Attaches pointer handlers
 * to the supplied DOM element and dispatches store updates as the pointer
 * moves. Movement updates write directly via getState() so React doesn't
 * re-render during the drag — the window's transform/size are CSS values
 * driven by the ref's inline style for smoothness.
 *
 * mode: 'move' | 'resize'
 *
 * For 'move', the start offset is `(clientX - window.x, clientY - window.y)`.
 * For 'resize', it's `(clientX - (window.x + window.w), clientY - (window.y + window.h))`.
 */
export default function useWindowDrag(handleRef, id, mode) {
  const stateRef = useRef(null);

  useEffect(() => {
    const el = handleRef.current;
    if (!el) return;

    function onDown(e) {
      const store = useStore.getState();
      const win = store.windows.get(id);
      if (!win) return;
      e.preventDefault();
      e.stopPropagation();
      el.setPointerCapture?.(e.pointerId);
      stateRef.current =
        mode === 'move'
          ? { startX: e.clientX - win.x, startY: e.clientY - win.y }
          : { startW: win.w, startH: win.h, startX: e.clientX, startY: e.clientY };
      store.focusWindow(id);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp, { once: true });
      window.addEventListener('pointercancel', onUp, { once: true });
    }

    function onMove(e) {
      const s = stateRef.current;
      if (!s) return;
      const store = useStore.getState();
      if (mode === 'move') {
        store.moveWindow(id, e.clientX - s.startX, e.clientY - s.startY);
      } else {
        const dx = e.clientX - s.startX;
        const dy = e.clientY - s.startY;
        const w = Math.max(180, s.startW + dx);
        const h = Math.max(120, s.startH + dy);
        store.resizeWindow(id, w, h);
      }
    }

    function onUp() {
      stateRef.current = null;
      window.removeEventListener('pointermove', onMove);
    }

    el.addEventListener('pointerdown', onDown);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
    };
  }, [handleRef, id, mode]);
}
