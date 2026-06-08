import { describe, it, expect, beforeEach } from 'vitest';
import { useStore, selectBackVisible, selectFocusedWindow } from '../store.js';

const reset = () => {
  useStore.setState({
    offsetY: 0,
    isDragging: false,
    windows: new Map(),
    focusedWindowId: null,
    nextZ: 1,
    openMenuId: null,
    saeStatus: 'off',
    bootToken: 0,
    saeProgress: 0,
    saeError: null,
  });
};

describe('screenSlice', () => {
  beforeEach(reset);

  it('setOffset clamps to >= 0', () => {
    useStore.getState().setOffset(-50);
    expect(useStore.getState().offsetY).toBe(0);
    useStore.getState().setOffset(250);
    expect(useStore.getState().offsetY).toBe(250);
  });

  it('resetToClosed zeroes offset and clears dragging', () => {
    useStore.setState({ offsetY: 400, isDragging: true });
    useStore.getState().resetToClosed();
    expect(useStore.getState().offsetY).toBe(0);
    expect(useStore.getState().isDragging).toBe(false);
  });

  it('selectBackVisible toggles with offset', () => {
    expect(selectBackVisible(useStore.getState())).toBe(false);
    useStore.getState().setOffset(1);
    expect(selectBackVisible(useStore.getState())).toBe(true);
  });
});

describe('windowSlice', () => {
  beforeEach(reset);

  it('openWindow assigns increasing z and focuses', () => {
    useStore.getState().openWindow({ id: 'a', x: 0, y: 0, w: 200, h: 200 });
    useStore.getState().openWindow({ id: 'b', x: 0, y: 0, w: 200, h: 200 });
    const s = useStore.getState();
    expect(s.windows.get('a').z).toBe(1);
    expect(s.windows.get('b').z).toBe(2);
    expect(s.focusedWindowId).toBe('b');
  });

  it('focusWindow raises the z to the top', () => {
    useStore.getState().openWindow({ id: 'a', x: 0, y: 0, w: 200, h: 200 });
    useStore.getState().openWindow({ id: 'b', x: 0, y: 0, w: 200, h: 200 });
    useStore.getState().focusWindow('a');
    const focused = selectFocusedWindow(useStore.getState());
    expect(focused.id).toBe('a');
    expect(focused.z).toBe(3);
  });

  it('closeWindow refocuses the next-highest window', () => {
    useStore.getState().openWindow({ id: 'a', x: 0, y: 0, w: 200, h: 200 });
    useStore.getState().openWindow({ id: 'b', x: 0, y: 0, w: 200, h: 200 });
    useStore.getState().openWindow({ id: 'c', x: 0, y: 0, w: 200, h: 200 });
    useStore.getState().closeWindow('c');
    expect(useStore.getState().focusedWindowId).toBe('b');
  });

  it('moveWindow / resizeWindow update geometry', () => {
    useStore.getState().openWindow({ id: 'a', x: 10, y: 10, w: 200, h: 200 });
    useStore.getState().moveWindow('a', 50, 60);
    useStore.getState().resizeWindow('a', 400, 300);
    const w = useStore.getState().windows.get('a');
    expect(w).toMatchObject({ x: 50, y: 60, w: 400, h: 300 });
  });
});

describe('menuSlice', () => {
  beforeEach(reset);

  it('open / close swaps id', () => {
    useStore.getState().openMenu('workbench');
    expect(useStore.getState().openMenuId).toBe('workbench');
    useStore.getState().closeMenu();
    expect(useStore.getState().openMenuId).toBe(null);
  });
});

describe('emulatorSlice', () => {
  beforeEach(reset);

  it('powerOn bumps bootToken and enters loading', () => {
    expect(useStore.getState().saeStatus).toBe('off');
    useStore.getState().powerOn();
    const s = useStore.getState();
    expect(s.saeStatus).toBe('loading');
    expect(s.bootToken).toBe(1);
  });

  it('setSaeProgress clamps 0..1', () => {
    useStore.getState().setSaeProgress(-1);
    expect(useStore.getState().saeProgress).toBe(0);
    useStore.getState().setSaeProgress(2);
    expect(useStore.getState().saeProgress).toBe(1);
    useStore.getState().setSaeProgress(0.5);
    expect(useStore.getState().saeProgress).toBe(0.5);
  });

  it('setSaeError transitions to error state', () => {
    useStore.getState().setSaeError(new Error('boom'));
    expect(useStore.getState().saeStatus).toBe('error');
    expect(useStore.getState().saeError.message).toBe('boom');
  });

  it('powerOff resets cleanly', () => {
    useStore.getState().powerOn();
    useStore.getState().setSaeStatus('running');
    useStore.getState().powerOff();
    const s = useStore.getState();
    expect(s.saeStatus).toBe('off');
    expect(s.saeProgress).toBe(0);
  });
});
