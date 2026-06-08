import { create } from 'zustand';

// One store, sliced inline. Selector subscriptions let drag/render code
// pull only the bits they care about without re-rendering the whole tree.

export const useStore = create((set, get) => ({
  // ──────────────────────────────────────────────────────────────────
  // screenSlice — front-screen pull-down. Free-form, no snap.
  // offsetY is the pixel offset of the front screen from its closed
  // position (0 = fully covers; screenHeight - titleBarHeight = max).
  // ──────────────────────────────────────────────────────────────────
  offsetY: 0,
  isDragging: false,

  setOffset(next) {
    set({ offsetY: Math.max(0, next) });
  },
  setDragging(flag) {
    set({ isDragging: flag });
  },
  resetToClosed() {
    set({ offsetY: 0, isDragging: false });
  },

  // ──────────────────────────────────────────────────────────────────
  // windowSlice — open Amiga windows on the front-screen desktop.
  // windows is keyed by a string id; iteration order in JS Map is
  // insertion-order which is fine for z-ordering bottom-up. Focus uses
  // a monotonically increasing z counter assigned on focus events.
  // ──────────────────────────────────────────────────────────────────
  windows: new Map(),
  focusedWindowId: null,
  nextZ: 1,

  openWindow(window) {
    const { windows, nextZ } = get();
    const next = new Map(windows);
    const id = window.id;
    next.set(id, { ...window, z: nextZ });
    set({ windows: next, focusedWindowId: id, nextZ: nextZ + 1 });
  },
  closeWindow(id) {
    const { windows, focusedWindowId } = get();
    if (!windows.has(id)) return;
    const next = new Map(windows);
    next.delete(id);
    let newFocus = focusedWindowId === id ? null : focusedWindowId;
    if (newFocus === null) {
      let topZ = -1;
      for (const [wid, w] of next) {
        if (w.z > topZ) {
          topZ = w.z;
          newFocus = wid;
        }
      }
    }
    set({ windows: next, focusedWindowId: newFocus });
  },
  focusWindow(id) {
    const { windows, nextZ, focusedWindowId } = get();
    if (!windows.has(id)) return;
    if (focusedWindowId === id) return;
    const next = new Map(windows);
    next.set(id, { ...next.get(id), z: nextZ });
    set({ windows: next, focusedWindowId: id, nextZ: nextZ + 1 });
  },
  moveWindow(id, x, y) {
    const { windows } = get();
    if (!windows.has(id)) return;
    const next = new Map(windows);
    next.set(id, { ...next.get(id), x, y });
    set({ windows: next });
  },
  resizeWindow(id, w, h) {
    const { windows } = get();
    if (!windows.has(id)) return;
    const next = new Map(windows);
    next.set(id, { ...next.get(id), w, h });
    set({ windows: next });
  },

  // ──────────────────────────────────────────────────────────────────
  // menuSlice — pulldown menus on the screen title bar.
  // openMenuId is the top-level menu id ("workbench", "window", "icons",
  // or a WP-menu-item id). Only one at a time.
  // ──────────────────────────────────────────────────────────────────
  openMenuId: null,
  openMenu(id) {
    set({ openMenuId: id });
  },
  closeMenu() {
    set({ openMenuId: null });
  },

  // ──────────────────────────────────────────────────────────────────
  // emulatorSlice — SAE power state on the back screen.
  //   'off'     | the only allowed initial state — no canvas, no ROM
  //   'loading' | user clicked Power; ROM+HDF fetching
  //   'running' | SAE attached to canvas, AROS booting/running
  //   'error'   | load failed; shows a Software Failure requester
  // bootToken increments on every (re-)boot so SAECanvasHost's memo
  // can replace the canvas cleanly. progress is 0..1 for the loading bar.
  // ──────────────────────────────────────────────────────────────────
  saeStatus: 'off',
  bootToken: 0,
  saeProgress: 0,
  saeError: null,

  powerOn() {
    const { bootToken } = get();
    set({
      saeStatus: 'loading',
      bootToken: bootToken + 1,
      saeProgress: 0,
      saeError: null,
    });
  },
  setSaeStatus(status) {
    set({ saeStatus: status });
  },
  setSaeProgress(p) {
    set({ saeProgress: Math.max(0, Math.min(1, p)) });
  },
  setSaeError(err) {
    set({ saeStatus: 'error', saeError: err });
  },
  powerOff() {
    set({ saeStatus: 'off', saeProgress: 0, saeError: null });
  },
}));

// Convenience selectors — useful to avoid re-rendering callers when an
// unrelated slice changes.
export const selectBackVisible = (s) => s.offsetY > 0;
export const selectFocusedWindow = (s) =>
  s.focusedWindowId == null ? null : s.windows.get(s.focusedWindowId) ?? null;
