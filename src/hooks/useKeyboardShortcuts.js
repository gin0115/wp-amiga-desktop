import { useEffect } from 'react';
import { useStore } from '../store.js';
import { shortcutMap } from '../lib/menu-config.js';

/**
 * Global keyboard handler. `Ctrl+<letter>` fires the matching menu item's
 * action (web stand-in for the Amiga's Left-Amiga + letter shortcut).
 * `Escape` closes any open pulldown (Pulldown also handles this directly
 * while open, but we cover the case where focus is elsewhere).
 */
export default function useKeyboardShortcuts() {
  useEffect(() => {
    const map = shortcutMap();
    function onKey(e) {
      if (e.key === 'Escape') {
        useStore.getState().closeMenu();
        return;
      }
      if (!e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const letter = e.key.toUpperCase();
      const item = map.get(letter);
      if (item && item.action) {
        e.preventDefault();
        item.action(useStore.getState());
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}
