import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useStore } from '../store.js';

/**
 * Pulldown panel for a single top-level menu. Rendered via portal so it can
 * overflow the title bar. Positioned absolutely against `anchor` (the menu
 * title element). Closes on click-away and on Escape.
 */
export default function Pulldown({ menuId, items, anchor }) {
  const ref = useRef(null);
  const closeMenu = useStore((s) => s.closeMenu);

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      // Clicking the same menu title should toggle, not double-close;
      // MenuBar handles its own click. Only ignore clicks on other menu
      // titles (so hover-switch in MenuBar still works).
      if (e.target.closest('[data-testid^="menu-title-"]')) return;
      closeMenu();
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [closeMenu]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeMenu();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const style = {
    position: 'fixed',
    top: rect.bottom,
    left: rect.left,
    minWidth: rect.width,
  };

  return createPortal(
    <div
      ref={ref}
      className="pulldown"
      data-testid={`pulldown-${menuId}`}
      style={style}
      role="menu"
    >
      {items.map((item, i) =>
        item.separator ? (
          <div key={`sep-${i}`} className="pulldown-separator" role="separator" />
        ) : (
          <PulldownItem key={item.label} item={item} closeMenu={closeMenu} />
        ),
      )}
    </div>,
    document.body,
  );
}

function PulldownItem({ item, closeMenu }) {
  return (
    <button
      type="button"
      className="pulldown-item"
      role="menuitem"
      data-testid={`pulldown-item-${slug(item.label)}`}
      onClick={() => {
        item.action?.(useStore.getState());
        closeMenu();
      }}
    >
      <span className="pulldown-item-label">{item.label}</span>
      {item.shortcut && (
        <span className="pulldown-item-shortcut">A-{item.shortcut}</span>
      )}
    </button>
  );
}

function slug(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
