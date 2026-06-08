// Phase 1 menu definitions. Each top-level menu has an id (used as the
// data-testid suffix and for openMenuId state) and a list of items.
//
// Item shape:
//   { label, shortcut?, separator?, action?(store) }
//
// `shortcut` is the single letter shown right-aligned in the pulldown and
// fired by Ctrl+<letter> globally. Use null/undefined for items without one.
//
// `action(store)` receives the zustand store's getState/setState API
// (the whole store) — pass it through dispatchMenuAction in this module
// so menu items can stay declarative.

const reload = () => window.location.reload();

const todoWindows = (label) => () => {
  // Real window-opening lands in step6. Until then the action just logs
  // so the menu wiring is observable in the console / Playwright traces.
  // eslint-disable-next-line no-console
  console.log(`[menu] todo step6: open window for "${label}"`);
};

export const MENU_CONFIG = [
  {
    id: 'workbench',
    title: 'Workbench',
    items: [
      { label: 'About...', action: todoWindows('About Workbench') },
      { separator: true },
      { label: 'Backdrop', action: todoWindows('Backdrop toggle') },
      { label: 'Execute Command...', action: todoWindows('Execute Command') },
      { separator: true },
      { label: 'Quit', shortcut: 'Q', action: reload },
    ],
  },
  {
    id: 'window',
    title: 'Window',
    items: [
      { label: 'New Drawer', shortcut: 'N', action: todoWindows('New Drawer') },
      { label: 'Open Parent', action: todoWindows('Open Parent') },
      { label: 'Close', shortcut: 'K', action: todoWindows('Close window') },
      { separator: true },
      { label: 'Update', action: todoWindows('Update') },
      { label: 'Snapshot', action: todoWindows('Snapshot') },
      { label: 'Clean Up', action: todoWindows('Clean Up') },
    ],
  },
  {
    id: 'icons',
    title: 'Icons',
    items: [
      { label: 'Open', shortcut: 'O', action: todoWindows('Open icon') },
      { label: 'Copy', shortcut: 'C', action: todoWindows('Copy icon') },
      { label: 'Rename', shortcut: 'R', action: todoWindows('Rename icon') },
      { label: 'Information', shortcut: 'I', action: todoWindows('Icon info') },
      { separator: true },
      { label: 'Empty Trash', action: todoWindows('Empty trash') },
      { label: 'Delete', action: todoWindows('Delete icon') },
    ],
  },
];

// Flat list of [shortcutLetter, action] pairs for the global keyboard handler.
// First match wins if two menus accidentally claim the same letter.
export function shortcutMap() {
  const out = new Map();
  for (const menu of MENU_CONFIG) {
    for (const item of menu.items) {
      if (item.shortcut && !out.has(item.shortcut)) {
        out.set(item.shortcut, item);
      }
    }
  }
  return out;
}
