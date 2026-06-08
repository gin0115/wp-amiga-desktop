import { renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import useScreenDrag from '../hooks/useScreenDrag.js';
import { useStore } from '../store.js';

beforeEach(() => {
  useStore.setState({
    offsetY: 0,
    isDragging: false,
    openMenuId: null,
    windows: new Map(),
    focusedWindowId: null,
    nextZ: 1,
  });
});

function setup() {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const hook = renderHook(() => {
    const ref = useRef(el);
    useScreenDrag(ref);
    return ref;
  });
  return { el, hook };
}

function pointerEvent(type, init = {}) {
  const e = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, { clientY: 0, pointerId: 1, ...init });
  return e;
}

describe('useScreenDrag', () => {
  it('refuses to start a drag while a pulldown menu is open', () => {
    const { el } = setup();
    useStore.getState().openMenu('workbench');
    act(() => el.dispatchEvent(pointerEvent('pointerdown', { clientY: 30 })));
    // Menu stays open; drag does not start; offset stays at 0.
    expect(useStore.getState().openMenuId).toBe('workbench');
    expect(useStore.getState().isDragging).toBe(false);
    expect(useStore.getState().offsetY).toBe(0);
  });

  it('refuses to start a drag when pointer-down is on a menu title', () => {
    const { el } = setup();
    const title = document.createElement('button');
    title.setAttribute('data-testid', 'menu-title-workbench');
    el.appendChild(title);
    act(() =>
      title.dispatchEvent(pointerEvent('pointerdown', { clientY: 30 })),
    );
    expect(useStore.getState().isDragging).toBe(false);
  });

  it('refuses to start if pointer-down originated inside an amiga window', () => {
    const { el } = setup();
    const inner = document.createElement('div');
    inner.setAttribute('data-amiga-window', '');
    el.appendChild(inner);
    act(() =>
      inner.dispatchEvent(pointerEvent('pointerdown', { clientY: 30 })),
    );
    expect(useStore.getState().isDragging).toBe(false);
  });

  it('drag move updates offsetY and clamps to [0, viewport - 24]', () => {
    const { el } = setup();
    // jsdom innerHeight defaults to 768
    const max = window.innerHeight - 24;
    act(() => el.dispatchEvent(pointerEvent('pointerdown', { clientY: 10 })));
    expect(useStore.getState().isDragging).toBe(true);

    act(() =>
      window.dispatchEvent(pointerEvent('pointermove', { clientY: 200 })),
    );
    expect(useStore.getState().offsetY).toBe(190);

    // Try to drag far past max
    act(() =>
      window.dispatchEvent(pointerEvent('pointermove', { clientY: 100000 })),
    );
    expect(useStore.getState().offsetY).toBe(max);

    // And try to drag negative
    act(() =>
      window.dispatchEvent(pointerEvent('pointermove', { clientY: -100000 })),
    );
    expect(useStore.getState().offsetY).toBe(0);

    act(() => window.dispatchEvent(pointerEvent('pointerup')));
    expect(useStore.getState().isDragging).toBe(false);
  });

  it('release leaves the offset wherever it was (no snap, no animation)', () => {
    const { el } = setup();
    act(() => el.dispatchEvent(pointerEvent('pointerdown', { clientY: 0 })));
    act(() =>
      window.dispatchEvent(pointerEvent('pointermove', { clientY: 217 })),
    );
    act(() => window.dispatchEvent(pointerEvent('pointerup')));
    expect(useStore.getState().offsetY).toBe(217);
  });

  it('pointercancel behaves like pointerup (offset stays where it was)', () => {
    const { el } = setup();
    act(() => el.dispatchEvent(pointerEvent('pointerdown', { clientY: 0 })));
    act(() =>
      window.dispatchEvent(pointerEvent('pointermove', { clientY: 88 })),
    );
    act(() => window.dispatchEvent(pointerEvent('pointercancel')));
    expect(useStore.getState().offsetY).toBe(88);
    expect(useStore.getState().isDragging).toBe(false);
  });
});
