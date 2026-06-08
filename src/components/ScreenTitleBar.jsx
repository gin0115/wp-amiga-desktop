import { useRef } from 'react';
import useScreenDrag from '../hooks/useScreenDrag.js';
import MenuBar from './MenuBar.jsx';

// 24px tall classic Workbench screen title bar. Doubles as the drag handle
// for the front-screen pull-down (useScreenDrag).
export default function ScreenTitleBar() {
  const dragRef = useRef(null);
  useScreenDrag(dragRef);

  return (
    <div
      ref={dragRef}
      className="screen-title-bar"
      data-testid="screen-title-bar"
      data-screen-drag-handle
    >
      <MenuBar />
      <ScreenInfo />
    </div>
  );
}

function ScreenInfo() {
  return (
    <div className="screen-info" data-testid="screen-info">
      <span>Workbench Screen</span>
      <span className="screen-info-mem">
        2,031,616 graphics mem 4,194,304 other mem
      </span>
    </div>
  );
}
