import { describe, it, expect } from 'vitest';
import { MENU_CONFIG, shortcutMap } from '../lib/menu-config.js';

describe('MENU_CONFIG', () => {
  it('exposes the three Phase 1 static menus', () => {
    const ids = MENU_CONFIG.map((m) => m.id);
    expect(ids).toEqual(['workbench', 'window', 'icons']);
  });

  it('every non-separator item has a label', () => {
    for (const menu of MENU_CONFIG) {
      for (const item of menu.items) {
        if (item.separator) continue;
        expect(item.label).toBeTruthy();
      }
    }
  });
});

describe('shortcutMap', () => {
  it('maps each shortcut letter to a single item (first wins on dup)', () => {
    const map = shortcutMap();
    expect(map.get('Q').label).toBe('Quit');
    expect(map.get('K').label).toBe('Close');
    expect(map.get('I').label).toBe('Information');
  });
});
