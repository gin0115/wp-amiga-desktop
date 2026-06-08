import { useRef, useCallback } from 'react';
import { usePrimaryMenu } from '../hooks/useWpQuery.js';
import { useStore } from '../store.js';
import { MENU_CONFIG } from '../lib/menu-config.js';
import Pulldown from './Pulldown.jsx';

export default function MenuBar() {
  const { data: menu } = usePrimaryMenu();
  const wpItems = menu?.items ?? [];

  const openMenuId = useStore((s) => s.openMenuId);
  const openMenu = useStore((s) => s.openMenu);
  const closeMenu = useStore((s) => s.closeMenu);

  const anchorRefs = useRef(new Map());

  const handleClick = useCallback(
    (id) => {
      if (openMenuId === id) closeMenu();
      else openMenu(id);
    },
    [openMenuId, openMenu, closeMenu],
  );

  const handleEnter = useCallback(
    (id) => {
      // Classic WB behaviour: while one menu is open, hovering another
      // top-level title switches to it.
      if (openMenuId != null && openMenuId !== id) openMenu(id);
    },
    [openMenuId, openMenu],
  );

  const setAnchor = (id) => (el) => {
    if (el) anchorRefs.current.set(id, el);
    else anchorRefs.current.delete(id);
  };

  const openConfig =
    MENU_CONFIG.find((m) => m.id === openMenuId) ?? null;

  return (
    <>
      <nav className="menu-bar" data-testid="menu-bar">
        {MENU_CONFIG.map((m) => (
          <MenuTitle
            key={m.id}
            id={m.id}
            title={m.title}
            open={openMenuId === m.id}
            anchorRef={setAnchor(m.id)}
            onClick={() => handleClick(m.id)}
            onMouseEnter={() => handleEnter(m.id)}
          />
        ))}
        {wpItems.map((item) => {
          const id = `wp-${item.id}`;
          return (
            <MenuTitle
              key={id}
              id={id}
              title={item.title}
              open={openMenuId === id}
              anchorRef={setAnchor(id)}
              onClick={() => handleClick(id)}
              onMouseEnter={() => handleEnter(id)}
            />
          );
        })}
      </nav>

      {openConfig && (
        <Pulldown
          menuId={openConfig.id}
          items={openConfig.items}
          anchor={anchorRefs.current.get(openConfig.id) ?? null}
        />
      )}
    </>
  );
}

function MenuTitle({ id, title, open, anchorRef, onClick, onMouseEnter }) {
  return (
    <button
      type="button"
      ref={anchorRef}
      className="menu-title"
      data-testid={`menu-title-${id}`}
      data-open={open || undefined}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {title}
    </button>
  );
}
