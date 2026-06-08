import { useStore } from '../store.js';

/**
 * Amiga front-panel LED strip. Renders a small bar with a green power LED,
 * four red floppy LEDs (DF0-DF3) and a yellow HDD LED. The FPS readout is
 * shown to the right. Position is fixed bottom-left of the back screen.
 *
 * Values come from `leds` slice which is updated by SAE's cfg.hook.led.*
 * callbacks wired in src/lib/sae-loader.js.
 */
export default function LedPanel() {
  const leds = useStore((s) => s.leds);
  const status = useStore((s) => s.saeStatus);
  if (status === 'off') return null;
  return (
    <div className="led-panel" data-testid="led-panel">
      <Led
        label="PWR"
        on={leds.power}
        kind="power"
        testId="led-power"
      />
      {leds.df.map((on, i) => (
        <Led
          key={`df${i}`}
          label={`DF${i}`}
          on={on}
          kind="floppy"
          testId={`led-df${i}`}
        />
      ))}
      <Led label="HD" on={leds.hd} kind="hdd" testId="led-hd" />
      <span className="led-fps" data-testid="led-fps">
        {leds.fps} fps
      </span>
    </div>
  );
}

function Led({ label, on, kind, testId }) {
  return (
    <span className={`led led-${kind} ${on ? 'is-on' : ''}`} data-testid={testId}>
      <span className="led-dot" data-on={on || undefined} />
      <span className="led-label">{label}</span>
    </span>
  );
}
