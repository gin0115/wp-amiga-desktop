import { memo, useEffect, useRef } from 'react';
import { useStore } from '../store.js';
import { startSae, stopSae } from '../lib/sae-loader.js';

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
    const setProgress = useStore.getState().setSaeProgress;
    const setStatus = useStore.getState().setSaeStatus;
    const setError = useStore.getState().setSaeError;

    (async () => {
      try {
        sae = await startSae({
          container,
          kickstartUrl: import.meta.env.VITE_KICKSTART_URL,
          kickstartExtUrl: import.meta.env.VITE_KICKSTART_EXT_URL,
          bootFloppyUrl: import.meta.env.VITE_BOOT_FLOPPY_URL,
          hdfUrl: import.meta.env.VITE_HDF_URL,
          onProgress: (p) => {
            if (!cancelled) setProgress(p);
          },
        });
        if (cancelled) {
          stopSae(sae);
          return;
        }
        setStatus('running');
      } catch (err) {
        if (cancelled) return;
        setError(err);
      }
    })();

    return () => {
      cancelled = true;
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
