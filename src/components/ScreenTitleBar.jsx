import MenuBar from './MenuBar.jsx';

// 24px tall classic Workbench screen title bar. Drag handle for step8;
// houses the MenuBar on the left and screen info on the right.
export default function ScreenTitleBar() {
  return (
    <div
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
      <span className="screen-info-mem">2,031,616 graphics mem 4,194,304 other mem</span>
    </div>
  );
}
