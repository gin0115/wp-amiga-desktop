import { useStore, selectBackVisible } from '../store.js';
import SAECanvasHost from './SAECanvasHost.jsx';
import LedPanel from './LedPanel.jsx';
import BackScreenModal from './BackScreenModal.jsx';

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
// Fixed layout constants — restored to the working step14 values. The
// canvas inside renders at SAE's native mode size; we don't try to stretch
// it via CSS.
const EMU_H = 568;
const GAP = 10;
const LED_BAR_H = 36;
const STACK_TOTAL_H = EMU_H + GAP + LED_BAR_H;

export default function BackScreen() {
  const status = useStore((s) => s.saeStatus);
  const progress = useStore((s) => s.saeProgress);
  const error = useStore((s) => s.saeError);
  const bootToken = useStore((s) => s.bootToken);
  const powerOn = useStore((s) => s.powerOn);
  const powerOff = useStore((s) => s.powerOff);
  const visible = useStore(selectBackVisible);
  const offsetY = useStore((s) => s.offsetY);

  const hasSae = status === 'loading' || status === 'running';

  // Layout decision (back to step14 behaviour):
  //   - "stacked": controls under the emulator when the visible strip is
  //     tall enough to fit emulator + gap + LED bar vertically.
  //   - "side":    controls to the right of the emulator otherwise.
  const stagedLayout = offsetY >= STACK_TOTAL_H ? 'stacked' : 'side';
  const stackHeight = stagedLayout === 'stacked' ? STACK_TOTAL_H : EMU_H;
  const stageOffset = Math.max(0, (offsetY - stackHeight) / 2);

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
        {status === 'error' && (
          <SoftwareFailure error={error} onRetry={powerOn} onCancel={powerOff} />
        )}
      </div>
      {hasSae && (
        <div
          className="back-stage"
          data-testid="back-stage"
          data-layout={stagedLayout}
          style={{
            // Constrain the stage to the actual visible strip so the
            // LED panel can't slide behind the front-screen title bar.
            height: offsetY > 0 ? `${offsetY}px` : '100%',
            paddingTop: `${stageOffset}px`,
          }}
        >
          <div className="sae-mount" data-testid="sae-mount">
            <SAECanvasHost bootToken={bootToken} />
          </div>
          <LedPanel />
        </div>
      )}
      <BackScreenModal />
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
