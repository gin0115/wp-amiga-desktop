import { usePrimaryMenu } from '../hooks/useWpQuery.js';

// Static (non-functional) menu bar for step4 — visual only. Pulldown
// behaviour and keyboard shortcuts land in step5.
const STATIC_MENUS = [
  { id: 'workbench', title: 'Workbench' },
  { id: 'window', title: 'Window' },
  { id: 'icons', title: 'Icons' },
];

export default function MenuBar() {
  const { data: menu } = usePrimaryMenu();
  const wpItems = menu?.items ?? [];

  return (
    <nav className="menu-bar" data-testid="menu-bar">
      {STATIC_MENUS.map((m) => (
        <MenuTitle key={m.id} id={m.id} title={m.title} />
      ))}
      {wpItems.map((item) => (
        <MenuTitle
          key={`wp-${item.id}`}
          id={`wp-${item.id}`}
          title={item.title}
        />
      ))}
    </nav>
  );
}

function MenuTitle({ id, title }) {
  return (
    <span
      className="menu-title"
      data-testid={`menu-title-${id}`}
    >
      {title}
    </span>
  );
}
