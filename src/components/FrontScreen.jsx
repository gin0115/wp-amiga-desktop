import { useStore } from '../store.js';
import ScreenTitleBar from './ScreenTitleBar.jsx';
import Desktop from './Desktop.jsx';

export default function FrontScreen() {
  const offsetY = useStore((s) => s.offsetY);
  const isDragging = useStore((s) => s.isDragging);
  return (
    <div
      className="front-screen"
      data-testid="front-screen"
      data-dragging={isDragging || undefined}
      style={{ transform: `translate3d(0, ${offsetY}px, 0)` }}
    >
      <ScreenTitleBar />
      <Desktop />
    </div>
  );
}
