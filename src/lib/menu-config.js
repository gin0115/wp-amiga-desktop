// Front-screen (blog) menu definitions. Each top-level menu has an id (used
// as the data-testid suffix and for openMenuId state) and a list of items.
//
// Item shape:
//   { label, shortcut?, separator?, action?(store) }
//
// `shortcut` is the single letter shown right-aligned in the pulldown and
// fired by Ctrl+<letter> globally.
//
// IMPORTANT: this is the BLOG menu. No emulator controls live here.
// Drive/disk/library UI lives on the back screen (BackScreen.jsx) as
// LED-gadgets that open in-place modals — never as front-screen windows.

import { ABOUT_WINDOW } from '../components/AmigaWindow.jsx';

const reload = () => window.location.reload();
const openAbout = (store) => store.openWindow(ABOUT_WINDOW);

const todoWindows = (label) => () => {
  // eslint-disable-next-line no-console
  console.log(`[menu] todo: real action for "${label}"`);
};

export const MENU_CONFIG = [
  {
    id: 'workbench',
    title: 'Workbench',
    items: [
      { label: 'About...', action: openAbout },
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
