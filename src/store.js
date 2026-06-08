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

  // SAE instance reference so other slices (drives) can call sae.insert(n)
  // and sae.eject(n) for live floppy swapping.
  saeRef: null,
  setSaeRef(ref) {
    set({ saeRef: ref });
  },

  // ────────────────────────────────────────────────────────────────
  // backModal — which gadget on the emulator panel is showing its
  // control modal. Slot id string ('df0'..'dh1' | 'power') or null.
  // Modal lives entirely inside BackScreen (NOT the front-screen
  // WindowManager) — emulator UI never touches the blog.
  // ────────────────────────────────────────────────────────────────
  backModalSlot: null,
  openBackModal(slot) {
    set({ backModalSlot: slot });
  },
  closeBackModal() {
    set({ backModalSlot: null });
  },

  // ────────────────────────────────────────────────────────────────
  // ledsSlice — Amiga front-panel indicators wired to SAE's hook.led.*
  // power: lit while the emulator's CPU is running
  // df:    one boolean per floppy drive (DF0..DF3) — true when reading
  // hd:    hardfile activity
  // fps:   frames/sec readout
  // ────────────────────────────────────────────────────────────────
  leds: {
    power: false,
    df: [false, false, false, false],
    hd: false,
    fps: 0,
  },
  setLed(key, value, index) {
    set((s) => {
      const next = { ...s.leds };
      if (key === 'df') {
        next.df = [...s.leds.df];
        next.df[index] = !!value;
      } else if (key === 'power') {
        next.power = !!value;
      } else if (key === 'hd') {
        next.hd = !!value;
      } else if (key === 'fps') {
        next.fps = Number(value) || 0;
      }
      return { leds: next };
    });
  },

  // ────────────────────────────────────────────────────────────────
  // drivesSlice — visible drive bay state. Each slot holds the currently
  // mounted image's filename + a dirty flag (true once SAE has written
  // to it). The actual byte buffer lives in SAE's config; we just track
  // metadata here so UI can render it.
  // ────────────────────────────────────────────────────────────────
  // Each slot: name (display), source (URL used to load — null for uploads
  // or blank-created — keys IDB shadow), dirty (true once writes happened
  // since last snapshot).
  drives: {
    df0: { name: null, source: null, dirty: false },
    df1: { name: null, source: null, dirty: false },
    df2: { name: null, source: null, dirty: false },
    df3: { name: null, source: null, dirty: false },
    dh0: { name: null, source: null, dirty: false },
    dh1: { name: null, source: null, dirty: false },
  },
  setDriveName(slot, name, source = null) {
    set((s) => ({
      drives: {
        ...s.drives,
        [slot]: { name, source, dirty: false },
      },
    }));
  },
  setDriveDirty(slot, dirty = true) {
    set((s) => ({
      drives: {
        ...s.drives,
        [slot]: { ...s.drives[slot], dirty: !!dirty },
      },
    }));
  },

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
