import { memo, useEffect, useRef } from 'react';
import { useStore } from '../store.js';
import { startSae, stopSae } from '../lib/sae-loader.js';
import { configFileForSlot } from '../lib/disk-tools.js';
import { putShadow } from '../lib/disk-persist.js';

const SLOT_BY_DF = ['df0', 'df1', 'df2', 'df3'];
const SNAPSHOT_INTERVAL_MS = 10_000;

/**
 * Mounts SAE into a stable DOM container once per powerOn (keyed by
 * bootToken so the parent never has to remount us — `React.memo` with a
 * bootToken comparator handles that).
 *
 * SAE is imperative vanilla JS: it adds its own canvas into the container
 * and runs requestAnimationFrame internally. React must not re-render
 * through it; the host div has stable identity and we drop SAE on cleanup.
 */
function SAECanvasHost({ bootToken }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;
    let cancelled = false;
    let sae = null;
    const store = useStore.getState();
    const setProgress = store.setSaeProgress;
    const setStatus = store.setSaeStatus;
    const setError = store.setSaeError;
    const setLed = store.setLed;
    const setSaeRef = store.setSaeRef;
    const setDriveName = store.setDriveName;

    const setDriveDirty = store.setDriveDirty;
    function onLed(update) {
      if (cancelled) return;
      if ('power' in update) setLed('power', update.power);
      if ('hd' in update) setLed('hd', update.hd);
      if ('fps' in update) setLed('fps', update.fps);
      if (update.df) {
        setLed('df', update.df.on, update.df.index);
        // LED activation = read or write — mark slot dirty so the next
        // snapshot writes it to IDB. Over-eager (false positives on pure
        // reads) but cheap and lossless.
        if (update.df.on) setDriveDirty(SLOT_BY_DF[update.df.index], true);
      }
      if (update.hd === true) {
        setDriveDirty('dh0', true);
      }
    }

    (async () => {
      try {
        // Sources come from the systemSlice (initially seeded from VITE_*
        // env vars; settable at runtime by the System modal so a Kickstart
        // swap + cyclePower hits the new ROM on the next boot).
        const system = useStore.getState().system;
        sae = await startSae({
          container,
          kickstartUrl: system.kickstartUrl,
          kickstartExtUrl: system.kickstartExtUrl,
          bootFloppyUrl: system.bootFloppyUrl,
          hdfUrl: system.hdfUrl,
          screenModeId: system.screenModeId,
          onProgress: (p) => {
            if (!cancelled) setProgress(p);
          },
          onLed,
        });
        if (cancelled) {
          stopSae(sae);
          return;
        }
        setSaeRef(sae);
        if (system.bootFloppyUrl) {
          setDriveName('df0', 'bootdisk.adf', system.bootFloppyUrl);
        }
        setStatus('running');
      } catch (err) {
        if (cancelled) return;
        setError(err);
      }
    })();

    // Periodic snapshot: every 10s, walk dirty drives, grab their SAE
    // config buffers, write to IndexedDB shadow, clear dirty. Also runs
    // once on power-off to flush before the SAE instance dies.
    async function snapshotDirtyDrives() {
      const state = useStore.getState();
      if (!state.saeRef) return;
      for (const slot of Object.keys(state.drives)) {
        const drive = state.drives[slot];
        if (!drive.dirty || !drive.source) continue;
        const cfgFile = configFileForSlot(state.saeRef, slot);
        if (!cfgFile?.data?.byteLength) continue;
        try {
          await putShadow(slot, drive.source, drive.name, cfgFile.data);
          useStore.getState().setDriveDirty(slot, false);
        } catch {
          /* IDB unavailable / quota — keep dirty for next round */
        }
      }
    }
    const interval = setInterval(snapshotDirtyDrives, SNAPSHOT_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
      // Best-effort final snapshot before tearing down SAE.
      snapshotDirtyDrives().catch(() => {});
      useStore.getState().setSaeRef(null);
      useStore.getState().setLed('power', false);
      stopSae(sae);
      // Clear any canvas SAE injected so a fresh boot starts clean.
      while (container.firstChild) container.removeChild(container.firstChild);
    };
  }, [bootToken]);

  return (
    <div
      ref={hostRef}
      id={`sae-host-${bootToken}`}
      className="sae-canvas-host"
      data-testid="sae-canvas-host"
    />
  );
}

export default memo(
  SAECanvasHost,
  (prev, next) => prev.bootToken === next.bootToken,
);
