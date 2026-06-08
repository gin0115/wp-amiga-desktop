import { useStore, selectBackVisible } from '../store.js';
import SAECanvasHost from './SAECanvasHost.jsx';
import LedPanel from './LedPanel.jsx';

/**
 * The back screen — the second 'monitor' behind the front Workbench screen.
 * In Phase 1 it has four states driven by emulatorSlice.saeStatus:
 *
 *   'off'     | dark CRT with a centred Power gadget; clicking it boots.
 *   'loading' | dark CRT + Amiga-style progress bar (powered by saeProgress).
 *   'running' | reserved for SAE canvas — step9 plugs that in. Until then a
 *               placeholder so the visual chain is observable.
 *   'error'   | "Software Failure" requester with Retry / Cancel.
 *
 * The Power click is the user-gesture that satisfies modern browser autoplay
 * policies, so the real SAE audio context can start in step9 without fuss.
 */
export default function BackScreen() {
  const status = useStore((s) => s.saeStatus);
  const progress = useStore((s) => s.saeProgress);
  const error = useStore((s) => s.saeError);
  const bootToken = useStore((s) => s.bootToken);
  const powerOn = useStore((s) => s.powerOn);
  const powerOff = useStore((s) => s.powerOff);
  const visible = useStore(selectBackVisible);

  const hasSae = status === 'loading' || status === 'running';

  return (
    <div
      className="back-screen"
      data-testid="back-screen"
      data-status={status}
      data-visible={visible || undefined}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className="crt">
        {status === 'off' && <PoweredOff onPowerOn={powerOn} />}
        {status === 'loading' && <Loading progress={progress} />}
        {status === 'running' && <RunningChrome onPowerOff={powerOff} />}
        {status === 'error' && (
          <SoftwareFailure error={error} onRetry={powerOn} onCancel={powerOff} />
        )}
      </div>
      {hasSae && (
        <div className="sae-mount" data-testid="sae-mount">
          <SAECanvasHost bootToken={bootToken} />
        </div>
      )}
      <LedPanel />
    </div>
  );
}

function PoweredOff({ onPowerOn }) {
  return (
    <div className="crt-off" data-testid="crt-off">
      <button
        type="button"
        className="power-gadget"
        data-testid="power-on"
        onClick={onPowerOn}
        aria-label="Power on AROS Workbench"
      >
        <span className="power-glyph" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle
              cx="16"
              cy="17"
              r="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="60 16"
              transform="rotate(-90 16 16)"
            />
            <line
              x1="16"
              y1="3"
              x2="16"
              y2="15"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="power-label">Power on</span>
      </button>
      <p className="crt-caption">
        AROS Workbench — click power to boot the back screen
      </p>
    </div>
  );
}

function Loading({ progress }) {
  const pct = Math.round(progress * 100);
  return (
    <div className="crt-loading" data-testid="crt-loading">
      <p className="crt-caption">Loading Kickstart… {pct}%</p>
      <div className="crt-progress" role="progressbar" aria-valuenow={pct}>
        <div className="crt-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function RunningChrome({ onPowerOff }) {
  return (
    <button
      type="button"
      className="power-off-corner"
      data-testid="power-off"
      onClick={onPowerOff}
      aria-label="Power off AROS Workbench"
    >
      ⏻ Power off
    </button>
  );
}

function SoftwareFailure({ error, onRetry, onCancel }) {
  return (
    <div className="software-failure" data-testid="software-failure">
      <div className="software-failure-box">
        <p className="software-failure-title">Software Failure</p>
        <p>{error?.message ?? 'Unknown error'}</p>
        <div className="software-failure-actions">
          <button
            type="button"
            data-testid="sf-retry"
            onClick={onRetry}
            className="amiga-button"
          >
            Retry
          </button>
          <button
            type="button"
            data-testid="sf-cancel"
            onClick={onCancel}
            className="amiga-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
