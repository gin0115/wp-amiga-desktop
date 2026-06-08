import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts.js';
import { useStore } from '../store.js';

beforeEach(() => useStore.getState().closeMenu());
afterEach(() => vi.restoreAllMocks());

describe('useKeyboardShortcuts', () => {
  it('fires the matching menu item action on Ctrl+<letter>', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderHook(() => useKeyboardShortcuts());
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'i', ctrlKey: true }),
      );
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Icon info'));
  });

  it('closes the open menu on Escape', () => {
    useStore.getState().openMenu('workbench');
    renderHook(() => useKeyboardShortcuts());
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(useStore.getState().openMenuId).toBe(null);
  });
});
