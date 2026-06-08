import ScreenTitleBar from './ScreenTitleBar.jsx';
import Desktop from './Desktop.jsx';

// The front screen — receives the translate3d transform from the screen
// drag (step8). For now it sits fixed at offsetY=0.
export default function FrontScreen() {
  return (
    <div
      className="front-screen"
      data-testid="front-screen"
      style={{ transform: 'translate3d(0, var(--front-offset, 0px), 0)' }}
    >
      <ScreenTitleBar />
      <Desktop />
    </div>
  );
}
